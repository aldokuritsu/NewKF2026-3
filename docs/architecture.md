# Architecture

## Stack

| Couche | Techno | Version | Rôle |
|---|---|---|---|
| Framework | Astro | ^6.2.0 | Génération site (SSG) + endpoints SSR |
| UI | React + Astro | React ^19.2 | Composants interactifs (peu utilisés) |
| Style | Tailwind CSS via Vite | ^4.2 | Plugin `@tailwindcss/vite` |
| Adapter | `@astrojs/vercel` | ^10.0 | Déploiement serverless Vercel |
| CMS | Sveltia CMS | 0.158.1 (pinné) | Édition de contenu, écrit sur GitHub |
| Paiement | Stripe | ^22.1 | Checkout hosted page |
| Stockage | Vercel Blob | `@vercel/blob` ^3.x | Upload de visuels client |
| Markdown | marked + isomorphic-dompurify | ^18 / ^3 | Rendu markdown CMS sanitizé |

Node ≥ 22.12 requis. Vite épinglé en ^7 via `overrides`.

## Mode de rendu

`output: 'static'` dans [astro.config.mjs](../astro.config.mjs).

- **Tout est SSG par défaut** — les pages produites au build sont des
  fichiers HTML statiques servis par le CDN Vercel.
- **Trois routes opt-in en SSR** (`prerender = false`) :
  - `POST /api/checkout` — [src/pages/api/checkout.ts](../src/pages/api/checkout.ts)
  - `POST /api/upload` — [src/pages/api/upload.ts](../src/pages/api/upload.ts)
  - `GET /success` — [src/pages/success.astro](../src/pages/success.astro)

L'adapter Vercel transforme ces routes en fonctions serverless Node, le
reste reste statique.

## Content collections

Définies dans [src/content.config.ts](../src/content.config.ts) via le
`glob` loader Astro.

| Collection | Pattern | Schéma | Localisation |
|---|---|---|---|
| `posts` | `**/*.{md,mdx}` | `{ title }` | `src/content/posts/` |
| `products` | `*.json` | name, price, currency, image, variants?, options?, shippingCountries, active | `src/content/products/` |

Les pages ne sont PAS dans une collection : elles sont lues directement par
les routes dynamiques via `readFileSync` dans `src/content/pages/` et
`src/content/silos/` (cf. plus bas).

## Routing

```
src/pages/
├── index.astro                         /
├── [silo]/
│   ├── index.astro                     /[silo]/                  (page pilier)
│   └── [slug].astro                    /[silo]/[slug]/           (page enfant)
├── api/
│   ├── checkout.ts                     POST /api/checkout
│   └── upload.ts                       POST /api/upload
├── success.astro                       /success                   (SSR)
├── cancel.astro                        /cancel
├── test-stripe.astro                   /test-stripe               (page de test interne)
├── blog-plv.astro, contact.astro, devis.astro, …  (pages plates)
```

### Routes dynamiques

Les pages piliers et enfants sont générées via `getStaticPaths` à partir de
[src/data/silos.ts](../src/data/silos.ts) qui contient l'arborescence
hard-codée (silos + leurs enfants). Pour chaque entrée, le builder lit le
JSON correspondant dans `src/content/pages/{silo.slug}/{slug}.json`.

L'arborescence des silos détermine donc :
1. Quelles URLs sont générées
2. Quelle entrée du menu navigation
3. Quels fichiers JSON sont lus

Pour ajouter une nouvelle page enfant : ajouter une entrée dans `silos.ts`
ET créer le JSON dans `src/content/pages/`.

## Système de blocs

Les pages (home, silos, enfants) sont composées d'une liste de **blocs**
sérialisés en JSON. Chaque bloc a un champ `_template` qui identifie son
type. Le composant [BlockRenderer.astro](../src/components/blocks/BlockRenderer.astro)
fait le dispatch vers le bon composant.

```jsonc
{
  "blocks": [
    { "_template": "hero", "heading": "…", "image": "…" },
    { "_template": "text_editorial", "content": "## Markdown…" },
    { "_template": "product_buy", "productSlug": "totem-carton-automatique" },
    { "_template": "cta_banner", "heading": "…", "btnLabel": "…" }
  ]
}
```

Blocs disponibles (cf. [src/components/blocks/](../src/components/blocks/)) :

| `_template` | Composant | Usage |
|---|---|---|
| `hero_home` | HeroHomeBlock | Hero d'accueil (large, avec stats) |
| `hero` | HeroBlock | Hero pilier/enfant (markdown intro sanitizé) |
| `solutions_grid` | SolutionsGridBlock | Grille de cartes solutions |
| `products_grid` | ProductsGridBlock | Grille de cartes produit |
| `client_logos` | ClientLogosBlock | Bandeau logos clients |
| `process` | ProcessBlock | Étapes numérotées |
| `eco_section` | EcoBlock | Section éco-responsabilité |
| `realizations` | RealizationsBlock | Galerie de réalisations |
| `testimonials` | TestimonialsBlock | Témoignages clients |
| `comparison_table` | ComparisonTableBlock | Tableau comparatif |
| `text_editorial` | TextEditorialBlock | Markdown long sanitizé |
| `faq` | FAQBlock | Q&R + JSON-LD FAQPage |
| `cta_banner` | CTABannerBlock | Bandeau CTA |
| `product_buy` | ProductBuyBlock | E-commerce Stripe (cf. ecommerce.md) |

### Ajouter un nouveau bloc

1. Créer `src/components/blocks/MonBloc.astro` (TypeScript + scoped styles).
2. Importer et enregistrer dans `BlockRenderer.astro` :
   ```ts
   import MonBloc from './MonBloc.astro'
   // ...
   if (template === 'mon_bloc') return <MonBloc key={i} block={block} />
   ```
3. Ajouter le schéma du bloc dans `public/admin/config.yml` sous `_blockDefs.blocks_field.types` pour qu'il soit éditable dans Sveltia.

## Sveltia CMS

- Admin : `https://<site>/admin/` (servi en `noindex`)
- Backend : GitHub OAuth → écrit directement des commits sur `main`
- Config : [public/admin/config.yml](../public/admin/config.yml)
- Script : version pinnée à `0.158.1` (cf. security.md pour SRI à venir)

Les éditions CMS = des commits Git → Vercel rebuild auto. Pas de DB. Le
versionning des contenus = `git log` sur `src/content/`.

## Variables d'environnement

| Var | Public ? | Usage |
|---|---|---|
| `STRIPE_SECRET_KEY` | ❌ serveur | Création de sessions Stripe |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ client | Pas utilisée actuellement (Stripe Checkout hosted = pas besoin) |
| `BLOB_READ_WRITE_TOKEN` | ❌ serveur | Auto-injectée par Vercel quand un store Blob est créé |
| `PUBLIC_DEVIS_ENDPOINT` | ✅ client | URL de l'endpoint PHP qui reçoit les demandes de devis |
| `PUBLIC_SITE_URL` | ✅ client | **Optionnelle**. Si absente ou malformée, dérivée de `request.url` côté serveur. À éviter sauf cas particulier. |

## Hiérarchie des sources de vérité

```
src/data/silos.ts          →  arborescence + URLs des pages enfants
src/content/silos/*.json   →  contenu des pages piliers (rendu via BlockRenderer)
src/content/pages/*/*.json →  contenu des pages enfants (rendu via BlockRenderer)
src/content/products/*.json →  catalogue produits Stripe (collection Astro)
src/content/posts/*.md     →  articles blog (collection Astro)
public/admin/config.yml    →  schéma CMS Sveltia (doit être tenu à jour avec les blocs)
public/assets/             →  images, fonts, fichiers statiques
```

## Fichiers config notables

| Fichier | Rôle |
|---|---|
| [astro.config.mjs](../astro.config.mjs) | Config Astro (output static, adapter Vercel, plugin Tailwind, intégration React) |
| [vercel.json](../vercel.json) | En-têtes HTTP de sécurité (CSP, HSTS, X-Frame-Options, etc.) |
| [package.json](../package.json) | Deps + override `vite: ^7` et `path-to-regexp: ^6.3.0` (CVE) |
| [tsconfig.json](../tsconfig.json) | Config TypeScript |
| [public/admin/config.yml](../public/admin/config.yml) | Schéma Sveltia CMS |
| [public/admin/index.html](../public/admin/index.html) | HTML wrapper du CMS |

## Dépendances clés et raisons

| Package | Pourquoi |
|---|---|
| `astro@^6.2` | Framework. v6.2 minimum (corrections SSG/Actions, Vite 7). |
| `@astrojs/vercel@^10` | v10+ requis pour compat Astro 6 (la v8 importait `applyPolyfills` retiré dans Astro 6.2). |
| `@tailwindcss/vite@^4` | Tailwind v4 = plugin Vite (pas PostCSS). |
| `marked@^18` | Parsing markdown CMS. Sortie passée par DOMPurify. |
| `isomorphic-dompurify@^3` | Sanitization XSS du markdown CMS au build. |
| `stripe@^22` | SDK Stripe Node. Utilisé côté serveur uniquement. |
| `@vercel/blob@^3` | Upload client → Blob via token signé. |
| `fs-extra@^11` | Utilisé par `[silo]/[slug].astro` pour lire les JSON de pages. |
