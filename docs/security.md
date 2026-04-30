# Sécurité

## Modèle de menace

Architecture statique-d'abord avec 3 endpoints SSR seulement. Surface
d'attaque très réduite par rapport à un PHP/MySQL classique :
- Pas de SQL → pas d'injection SQL.
- Pas de runtime PHP/Apache à patcher → pas de RCE serveur.
- Pas d'auth sur la prod → pas de vol de session, pas de fuzzing de login.
- Admin Sveltia délègue tout à GitHub OAuth.

**Les vrais risques** sont ailleurs :
1. **Supply chain** (npm + unpkg + Sveltia + Vercel) — quiconque
   compromet une dépendance peut empoisonner le build.
2. **Compte GitHub** — accès = totalité du contrôle (code + contenu CMS + secrets via PR).
3. **Compte Vercel** — accès = lecture des env vars (Stripe key) + redéploiement.
4. **XSS au build** depuis le CMS si le markdown éditeur contient du HTML
   malveillant (mitigé, voir plus bas).

## Mesures en place

### 1. Sanitization du markdown CMS

[HeroBlock.astro](../src/components/blocks/HeroBlock.astro) et
[TextEditorialBlock.astro](../src/components/blocks/TextEditorialBlock.astro)
utilisent `marked.parse()` puis `set:html`. Avant le fix, n'importe quel
éditeur CMS pouvait injecter `<script>...</script>` dans son markdown et
le faire exécuter sur tous les visiteurs (XSS persistant).

Maintenant la sortie de `marked` passe par `DOMPurify.sanitize()` avant
`set:html`. Le HTML est nettoyé au build, le HTML statique livré aux
visiteurs est inoffensif.

```ts
import DOMPurify from 'isomorphic-dompurify'
const html = DOMPurify.sanitize(marked.parse(content, { async: false }) as string)
```

### 2. En-têtes de sécurité (vercel.json)

[vercel.json](../vercel.json) configure Vercel pour ajouter ces en-têtes
à toutes les réponses :

| En-tête | Valeur | Rôle |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS pendant 2 ans, prêt pour preload list |
| `X-Content-Type-Options` | `nosniff` | Empêche le MIME-sniffing du navigateur |
| `X-Frame-Options` | `DENY` | Pas d'iframe possible (anti-clickjacking) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limite la fuite d'URL via Referer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | Désactive APIs sensibles + FLoC |
| `Content-Security-Policy` | (cf. ci-dessous) | Restreint les sources de scripts/connexions |
| `X-Robots-Tag: noindex, nofollow` | (sur `/admin/(.*)`) | Bloque l'indexation de l'admin Sveltia |

### Content Security Policy détaillée

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://js.stripe.com https://unpkg.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: https: blob:;
connect-src 'self'
  https://api.stripe.com
  https://api.github.com
  https://*.githubusercontent.com
  https://vercel.com
  https://*.vercel-storage.com;
frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self' https://checkout.stripe.com;
object-src 'none'
```

Justifications :
- `'unsafe-inline'` sur `script-src` : nécessaire pour les `<script
  is:inline>` Astro et les scripts inline générés (success.astro, etc.).
  Pour passer en strict CSP avec `'nonce-...'`, il faudrait modifier
  Astro pour injecter un nonce — non trivial sur un site SSG.
- `connect-src` autorise spécifiquement :
  - `api.stripe.com` (création de session)
  - `api.github.com` + `*.githubusercontent.com` (Sveltia OAuth + assets)
  - `vercel.com` (Vercel Blob client SDK passe par `vercel.com/api/blob/`)
  - `*.vercel-storage.com` (PUT du fichier vers le store Blob)
- `form-action` autorise Stripe Checkout.

**Si tu vois "Refused to connect" dans la console**, ajoute le domaine à
`connect-src` dans `vercel.json` et redéploie.

### 3. Protection anti-XSS dans le code custom

Tous les rendus Astro `{variable}` sont automatiquement échappés. Aucun
`dangerouslySetInnerHTML` React. Les seuls `set:html` sont :
- Les blocs markdown sanitizés via DOMPurify (cf. ci-dessus)
- Du JSON-LD pour `application/ld+json` dans Breadcrumb et FAQBlock
  (contenu construit à partir de strings simples, pas de HTML).

### 4. Validation côté serveur

[api/checkout.ts](../src/pages/api/checkout.ts) :
- Le **prix ne vient jamais du client** : lookup de la collection
  `products` côté serveur.
- `quantity` borné à 1-99.
- `variantId` validé contre la liste réelle.
- `optionIds` filtrés contre la liste réelle.
- `customAssetUrl` doit être URL valide ET sur `*.blob.vercel-storage.com`
  (pas de smuggling d'URL externe dans la metadata Stripe).
- `PUBLIC_SITE_URL` validée comme URL `http(s)://`, fallback sur
  `request.url.origin` si malformée.

[api/upload.ts](../src/pages/api/upload.ts) :
- Type MIME limité à : `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- Taille max : 10 MB.
- `addRandomSuffix: true` empêche les collisions et le path traversal.

### 5. Honeypot anti-spam (devis)

[DevisModal.astro](../src/components/DevisModal.astro) ajoute :
- Un champ `<input name="website">` invisible hors-écran (off-screen via
  `position: absolute; left: -10000px`). Les bots remplissent ce type de
  champ ; les humains non.
- Un timing trap : si la soumission arrive en moins de 1.5s après
  l'ouverture de la modale → drop silencieux (les bots sont rapides).

Drop "silencieux" = le formulaire affiche un succès factice pour ne pas
alerter le bot, mais ne POST rien.

**Limite** : c'est une protection client-side. Un bot qui simule du
comportement humain (delay, ne remplit pas le honeypot) passe. Pour
durcir : Cloudflare Turnstile / hCaptcha côté client + validation côté
PHP de l'endpoint devis.

### 6. Sveltia CMS épinglé

[public/admin/index.html](../public/admin/index.html) charge Sveltia
depuis unpkg avec une **version pinnée** :

```html
<script src="https://unpkg.com/@sveltia/cms@0.158.1/dist/sveltia-cms.js" crossorigin="anonymous"></script>
```

Avant le fix, c'était `@latest` → une release malveillante du package
aurait été chargée automatiquement, avec accès au token GitHub OAuth.

**Encore à faire** : ajouter `integrity="sha384-..."` (SRI). Commande
pour calculer le hash :

```bash
curl -sL https://unpkg.com/@sveltia/cms@0.158.1/dist/sveltia-cms.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

À ajouter manuellement dans la balise. Sans SRI, on est protégés contre
un downgrade automatique mais pas contre une compromission rétroactive
de cette version exacte sur unpkg.

### 7. CVE path-to-regexp (npm override)

`@astrojs/vercel@^10` dépend de `@vercel/routing-utils@5` qui épinglait
`path-to-regexp@6.1.0` (vulnérable à GHSA-9wv6-86v2-598j, ReDoS via
backtracking). Override dans [package.json](../package.json) :

```json
"overrides": {
  "vite": "^7",
  "path-to-regexp": "^6.3.0"
}
```

⚠️ **Ne PAS faire `npm audit fix --force`** : cela tente de downgrader
`@astrojs/vercel` vers v8.0.4, qui est incompatible avec Astro 6.2 (la
fonction `applyPolyfills` qu'elle importe a été retirée). L'override
ci-dessus est la solution propre.

## Points en suspens

| Risque | Sévérité | Statut | Détail |
|---|---|---|---|
| Pas de SRI sur Sveltia CMS | Moyenne | À faire (action manuelle) | Calcul du hash bloqué dans l'environnement de dev sandbox. Voir commande ci-dessus. |
| Pas de rate-limit sur `/api/checkout` et `/api/upload` | Moyenne | Non implémenté | Un attaquant peut spammer les endpoints, consommer du quota Stripe / Blob. Mitigation : Vercel WAF, Upstash rate-limit, ou Cloudflare devant. |
| Pas de webhook Stripe | Faible (aujourd'hui) | À faire au moment de l'automatisation | Tant que la fulfillment est manuelle, OK. Quand on automatisera (mail, stock), il faut un endpoint avec `stripe.webhooks.constructEvent` validant la signature. |
| `'unsafe-inline'` dans `script-src` | Faible | Compromis Astro SSG | Migration vers nonce-based CSP non triviale en SSG. À reconsidérer si besoin de CSP A+ stricte. |
| Pas de WAF / DDoS protection custom | Faible | Vercel fournit une protection de base | Pour s'aller plus loin : Cloudflare devant en mode DNS-only. |
| `customAssetUrl` URL publique | Faible | Choix volontaire | L'URL Blob est non devinable mais publique. Pour du privé strict (URL signée éphémère), passer par `del()` + `head()` + ré-upload, ou utiliser une autre solution (S3 signé). |

## Audit de sécurité actuel

- ✅ `npm audit` : 0 high/critical (path-to-regexp patché via override)
- ✅ Headers de sécurité visibles via [securityheaders.com](https://securityheaders.com)
- ✅ TLS Let's Encrypt automatique via Vercel
- ✅ HSTS preload-ready

## Recommandations opérationnelles (out-of-code)

1. **2FA matériel** sur le compte GitHub `aldokuritsu` (clé hardware,
   pas SMS — SIM swap reste un risque).
2. **2FA** sur le compte Vercel.
3. Audit `npm audit` mensuel.
4. Surveiller les deploys non sollicités sur Vercel (alerte email).
5. Avant chaque mise à jour de dépendance majeure : check le changelog
   de la dep ET de ses transitives via `npm view <pkg> dependencies`.
