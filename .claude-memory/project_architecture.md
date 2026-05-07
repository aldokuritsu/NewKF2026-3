---
name: Kontfeel — architecture et conventions implicites
description: Patterns architecturaux non-évidents détectés par lecture de code : système de contenu à deux vitesses, règles SEO cocon, flux de données
type: project
originSessionId: 5837a402-8ef6-495e-bb42-c116dae1f330
---
## Système contenu à deux vitesses

- **Typé (Zod)** : `products` et `posts` via `src/content.config.ts`
- **Non-typé (any)** : JSON home, silos, pages enfants — `readFileSync` + cast `any`

Un champ mal nommé dans un JSON page/silo est silencieusement ignoré au build. Pas de validation.

## `silos.ts` = source de vérité du routage

`getStaticPaths()` dans `[silo]/index.astro` et `[silo]/[slug].astro` lit uniquement `silos.ts`.
Le slug enfant est extrait par `child.href.split('/').filter(Boolean).pop()`.
Un JSON dans `src/content/pages/` sans entrée `silos.ts` = aucune route générée.

## Trace de migration CMS

`BlockRenderer.astro` normalise `_template` (JSON Sveltia) ET `__typename` (GraphQL).
Le normaliseur `tpl()` = artifact d'une migration depuis un CMS GraphQL (TinaCMS/Forestry probable).
Nouveaux blocs : utiliser uniquement `_template`.

## SEO cocon — règles strictes

- Aucun lien cross-silo dans le contenu des pages
- Footer : 6 piliers + légaux uniquement, jamais de pages enfants
- `ObfuscatedLink` : liens légaux/contact encodés XOR pour crawler-hiding
- `bypass: true` sur `ObfuscatedLink` depuis la home = lien standard pour PageRank transfer

## flux devis vs checkout

- **Checkout Stripe** : uniquement pour les produits `src/content/products/*.json` via `product_buy` block
- **Devis PHP** : formulaire DevisForm → `PUBLIC_DEVIS_ENDPOINT` (endpoint PHP externe), toutes les autres pages

## `productRef` threading

`BaseLayout.productRef` → `DevisModal.productRef` → `DevisForm.productRef`
Permet le pré-remplissage depuis n'importe quelle page produit.

**How to apply:** Si on crée une page avec un produit spécifique, passer `productRef` à `BaseLayout` (pas directement à DevisForm).
