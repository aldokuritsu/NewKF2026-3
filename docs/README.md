# Documentation technique — NewKF2026-3

Documentation de reprise pour le site Kontfeel (refonte 2026). Stack : Astro
6.2 + Vercel + Sveltia CMS + Stripe + Vercel Blob.

## Index

| Doc | Contenu |
|---|---|
| [architecture.md](./architecture.md) | Stack, rendering, content collections, système de blocs, structure des fichiers |
| [ecommerce.md](./ecommerce.md) | Flow Stripe Checkout, ProductBuyBlock, Vercel Blob upload, /api/checkout, /api/upload, /success |
| [security.md](./security.md) | Modèle de menace, CSP, sanitization markdown, supply chain, en-têtes vercel.json, points en suspens |
| [operations.md](./operations.md) | Variables d'environnement, setup Vercel (Blob store), déploiement, troubleshooting fréquent |

## En une minute

- **Site mostly statique (SSG)** : 60+ pages générées au build, servies par
  CDN Vercel.
- **3 routes serverless** : `POST /api/checkout` (création session Stripe),
  `POST /api/upload` (token Vercel Blob), `GET /success` (récap paiement).
- **Contenu en JSON/MD** versionné dans `src/content/`, édité via Sveltia
  CMS qui commit directement sur GitHub via OAuth.
- **E-commerce** via Stripe Checkout hosted page + upload de visuels custom
  via Vercel Blob (URL passée dans `session.metadata.customAssetUrl`).
- **Pas de base de données**, pas d'authentification sur la prod (l'admin
  Sveltia délègue tout à GitHub).

## Setup local

```bash
# Node 22.12+ requis (cf. package.json engines)
nvm use 22

npm install

# Variables d'env minimales pour dev local (créer .env)
# STRIPE_SECRET_KEY=sk_test_xxx
# PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
# BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx  (récupérable depuis Vercel CLI)
# PUBLIC_DEVIS_ENDPOINT=https://votre-php.example.com/api/devis

npm run dev      # → http://localhost:4321
npm run build    # build SSG + bundling fonctions Vercel
npm run preview  # preview du build
```

## Repo

- GitHub : `aldokuritsu/NewKF2026-3` (branche `main`)
- Déploiement : Vercel auto-deploy sur push vers `main`
- Site test : https://newkf2026-3.vercel.app/

## Conventions de commit

Préfixes utilisés dans les messages : `fix(area):`, `feat(area):`,
`security:`, `docs:`. Un commit = une intention. Aucun amend.
