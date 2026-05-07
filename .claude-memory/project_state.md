---
name: Kontfeel NewKF2026-3 — état du projet
description: État de couverture du contenu, pages orphelines, et questions ouvertes sur l'architecture du site Kontfeel
type: project
originSessionId: 5837a402-8ef6-495e-bb42-c116dae1f330
---
Dernière mise à jour : 2026-05-07.

## Couverture contenu silo/enfant

93 fichiers JSON child-pages pour 93 enfants déclarés dans `silos.ts` — couverture totale.
20 produits JSON dans `src/content/products/` — tous dans le silo `plv-carton`.

**Why:** Le silo `plv-carton` est le seul à avoir des produits e-commerce actifs avec checkout Stripe. Les autres silos fonctionnent uniquement en mode devis (DevisForm → PHP endpoint).

**How to apply:** Ne pas supposer que les autres silos ont des produits. Vérifier `src/content/products/` avant d'ajouter un bloc `product_buy` hors de `plv-carton`.

## Contenu éditorial (blog + réalisations)

Système en place avec routes, schemas Zod, "En bref" box et AISummaryBanner.

- `src/content/posts/` : 1 article exemple (`totem-carton-gms.md`)
- `src/content/realisations/` : 1 réalisation exemple (`campagne-totem-gms.json`)
- Maillage : article → réalisation → `/plv-carton/totem-carton-automatique/` + `/solutions/plv-grande-distribution/`

## Pages statiques orphelines (à clarifier)

Ces pages existent dans `src/pages/` mais n'ont aucune intégration nav visible :
- `digital.astro`, `display.astro`, `mobilier.astro`, `stand.astro` — probablement legacy d'une ancienne architecture pre-cocon
- `realisations.astro` — doublon de `realisations-plv.astro` (à rediriger ou supprimer)
- `test-stripe.astro` — page de test accessible publiquement en prod

## Produit sans route silo

`src/content/products/totem-carton-180.json` existe mais aucun enfant `silos.ts` ne pointe vers un slug `totem-carton-180`. Probablement référencé directement dans un bloc `product_buy` d'une page enfant, ou orphelin.

## Questions ouvertes

- Stripe mode test ou prod dans l'env courant ?
- Sveltia CMS : utilisé en prod avec OAuth ou uniquement en local ?
- Sitemap.xml : généré côté Vercel ou plugin Astro prévu ?
- PHP endpoint devis : infrastructure Kontfeel partagée ou service externe ?
- `realisations.astro` (route `/realisations/`) : rediriger vers `/realisations-plv/` ?
