# Opérations — déploiement, env vars, troubleshooting

## Pré-requis Vercel (à faire une fois)

### 1. Connecter le repo

Vercel Dashboard → Add New → Project → Import Git Repository →
`aldokuritsu/NewKF2026-3` → branche `main`.

Configuration auto-détectée (Astro). Pas de surcharge nécessaire.

### 2. Variables d'environnement

À configurer dans **Vercel → Project → Settings → Environment Variables** :

| Variable | Type | Valeur | Source |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Server | `sk_test_...` ou `sk_live_...` | Stripe Dashboard → Developers → API keys |
| `PUBLIC_DEVIS_ENDPOINT` | Server + Client | URL de l'endpoint PHP de devis | Configuration côté serveur PHP |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Server + Client | `pk_test_...` ou `pk_live_...` | Stripe Dashboard. **Pas utilisée actuellement** mais conservée pour usages futurs (Stripe Elements custom). |

**`PUBLIC_SITE_URL`** : ne PAS la définir sauf cas particulier. Le code
dérive l'URL du site depuis `request.url`, ce qui est plus fiable. Si elle
est définie avec un typo (ex : `ttps://...`), Stripe rejette les redirects
avec "Not a valid URL".

**`BLOB_READ_WRITE_TOKEN`** : auto-injectée par Vercel quand le store Blob
est créé (étape suivante).

### 3. Créer le store Vercel Blob

Vercel Dashboard → Project → Storage → Create Database → **Blob** →
choisir un nom (ex : `kontfeel-uploads`) → Create.

Vercel ajoute automatiquement `BLOB_READ_WRITE_TOKEN` aux env vars du
projet. Sans ce store, `/api/upload` retourne une erreur 500.

### 4. Domaine personnalisé (optionnel)

Settings → Domains → Add → entrer `kontfeel.fr` (ou le domaine cible) →
suivre les instructions DNS.

## Déploiement

```
git push origin main
       │
       ▼
   GitHub webhook
       │
       ▼
  Vercel build
   ├─ npm install
   ├─ astro build (génère SSG + bundle fonctions serverless)
   └─ Deploy → CDN edge global
```

Durée typique : 1-2 minutes pour le build. Preview deployments créés
automatiquement pour chaque PR.

## Setup local

```bash
# Vérifier Node version
node --version  # doit être ≥ 22.12.0
nvm use 22      # si nvm

# Cloner et installer
git clone git@github.com:aldokuritsu/NewKF2026-3.git
cd NewKF2026-3
npm install

# Variables d'env locales (créer .env, NE PAS committer)
cat > .env <<EOF
STRIPE_SECRET_KEY=sk_test_xxx
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
PUBLIC_DEVIS_ENDPOINT=https://votre-php.example.com/api/devis
# BLOB_READ_WRITE_TOKEN à récupérer via:
#   npx vercel env pull .env.development.local
# ou copier depuis Vercel Dashboard
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
EOF

npm run dev      # http://localhost:4321
```

`vercel env pull` est la façon propre de synchroniser les env vars depuis Vercel.

## Commandes utiles

| Commande | Usage |
|---|---|
| `npm run dev` | Serveur dev, HMR, live reload |
| `npm run build` | Build de prod (sortie dans `.vercel/output/`) |
| `npm run preview` | Preview du build |
| `npm audit` | Vérifier les vulnérabilités deps |
| `npx vercel env pull` | Synchroniser env vars depuis Vercel |
| `npx vercel logs` | Voir les logs des fonctions serverless |
| `npx vercel deploy --prebuilt` | Déployer manuellement (rare) |

## Troubleshooting fréquent

### "Not a valid URL" lors du checkout Stripe

**Symptôme** : POST `/api/checkout` renvoie `{"error":"Not a valid URL"}`.

**Cause** : `success_url` ou `cancel_url` envoyés à Stripe sont malformés.
Soit `PUBLIC_SITE_URL` env var contient un typo (ex : `ttps://...` au lieu
de `https://...`), soit l'image produit a un chemin invalide.

**Fix** : 
1. Vérifier dans Vercel → Settings → Environment Variables que
   `PUBLIC_SITE_URL` (si définie) commence bien par `https://` et n'a pas
   de slash final. Recommandation : la **supprimer** complètement, le
   code dérivera l'URL de la requête.
2. Vérifier que `image` dans le JSON produit commence par `/` ou
   `https://`.

### Upload Blob bloqué sur "Upload en cours…"

**Symptôme** : le file input change, le statut passe à "Upload en cours",
mais ne passe jamais à "Fichier uploadé".

**Causes possibles** :

| Symptôme console | Cause | Fix |
|---|---|---|
| `Refused to connect to 'https://vercel.com/api/blob/...'` | CSP `connect-src` n'inclut pas `vercel.com` | Mettre à jour [vercel.json](../vercel.json), redéployer |
| `Refused to connect to 'https://....blob.vercel-storage.com'` | CSP `connect-src` n'inclut pas `*.vercel-storage.com` | Idem |
| `401 Unauthorized` sur `/api/upload` | `BLOB_READ_WRITE_TOKEN` absent | Créer le store Blob sur Vercel |
| Aucune erreur, juste timeout | Cache navigateur stale | Hard refresh (Ctrl+Shift+R) ou tester en navigation privée |
| `413 Payload Too Large` | Fichier > 4.5 MB ET upload qui passe par le serverless au lieu d'aller direct | Vérifier que le client utilise bien `@vercel/blob/client` (pas `@vercel/blob` côté serveur) |

### Erreur "applyPolyfills is not exported" au build

**Symptôme** :
```
"applyPolyfills" is not exported by "node_modules/astro/dist/core/app/entrypoints/node.js",
imported by "node_modules/@astrojs/vercel/dist/serverless/polyfill.js".
```

**Cause** : `@astrojs/vercel@<10` incompatible avec Astro 6.2 (export
retiré).

**Fix** : `npm install @astrojs/vercel@^10`. ⚠️ Ne pas accepter le
`npm audit fix --force` qui propose un downgrade vers v8.0.4.

### Mail de confirmation Stripe non reçu en mode test

**Comportement attendu**. Stripe **n'envoie jamais** d'email de reçu en
mode test, même si l'option est cochée. Les reçus existent dans le
dashboard mais ne partent pas par email. Pour tester l'envoi : sur la page
du paiement dans le dashboard test → bouton "Send receipt" manuel.

En mode live, vérifier : Stripe Dashboard → Settings → Customer emails →
"Successful payments" coché.

### CSP cassée après modif

**Symptôme** : navigateur affiche encore l'ancienne CSP en console malgré
un déploiement réussi.

**Cause** : cache navigateur local (le HTML servi a la nouvelle CSP, mais
le navigateur garde l'ancien en mémoire).

**Fix** :
1. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Si ça ne marche pas : DevTools → Network → cocher "Disable cache" et
   refresh.
3. Si ça ne marche toujours pas : F12 → Application → Storage → Clear
   site data → reload.
4. Vérifier en navigation privée pour confirmer que le serveur sert bien
   la nouvelle CSP.

Pour vérifier ce que le serveur envoie réellement :
```bash
curl -sI https://newkf2026-3.vercel.app/test-stripe | grep -i security
```

### Build local échoue avec "Node.js v20.x is not supported"

**Cause** : Astro 6.2 exige Node ≥ 22.12. La version par défaut du
système est probablement Node 20.

**Fix** : `nvm use 22` puis relancer le build. Sur Vercel, le `engines`
dans `package.json` force l'usage de Node 22.

### Sveltia CMS — fichier non sauvegardé

**Symptôme** : on édite, on clique "Publier" dans Sveltia, mais le commit
n'apparaît pas sur GitHub.

**Cause** : OAuth GitHub expiré, ou le compte connecté n'a pas push
access au repo.

**Fix** : se déconnecter (icône en haut à droite dans Sveltia) et se
reconnecter avec un compte ayant push access à `aldokuritsu/NewKF2026-3`.

### Le contenu CMS apparaît mais le build ne le voit pas

**Cause** : le content collection schéma (`src/content.config.ts`) ou le
loader glob ne match pas le nouveau fichier.

**Fix** :
- Vérifier que le fichier JSON est bien dans le bon dossier
  (`src/content/products/`, `src/content/pages/{silo}/`, etc.).
- Vérifier que les champs requis du schéma Zod sont présents (sinon le
  build échoue avec un message de validation Zod).

## Procédure de mise à jour des dépendances

```bash
# Inspection
npm outdated

# Mise à jour patches/minor (safe)
npm update

# Mise à jour majeure d'une dep critique
npm install astro@latest @astrojs/vercel@latest
npm run build  # vérifier que ça compile encore

# Vulnérabilités
npm audit
# NE PAS faire npm audit fix --force sans vérifier
# que ça ne downgrade pas une dep critique (cf. case @astrojs/vercel)
```

## Backup et historique

- **Code** : Git → GitHub. `git log` = historique complet.
- **Contenu CMS** : commits Git via Sveltia. Aucun backup séparé
  nécessaire (un commit Git par publication).
- **Visuels uploadés (Blob)** : pas de backup automatique. Pour les
  exporter : itérer via `list()` du SDK `@vercel/blob` et copier ailleurs.
- **Stripe data** : Stripe Dashboard. Export possible via API ou interface.

## Surveillance

| Aspect | Outil |
|---|---|
| Builds Vercel | Email automatique sur build failed |
| Erreurs runtime | Vercel → Project → Logs (gratuit, rétention 7 jours) |
| Stripe | Dashboard → Logs |
| Uptime | Aucun monitoring custom configuré. Pour ajouter : UptimeRobot ou Better Uptime. |
| Performance | Vercel Speed Insights (à activer si besoin, payant) |
