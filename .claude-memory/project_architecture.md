---
name: Kontfeel — architecture et conventions implicites
description: Patterns architecturaux non-évidents détectés par lecture de code : système de contenu à trois vitesses, règles SEO cocon, maillage éditorial, flux de données
type: project
originSessionId: 5837a402-8ef6-495e-bb42-c116dae1f330
---
## Système contenu à trois vitesses

- **Totalement typé + routé** : `posts` (Markdown) et `realisations` (JSON) — Zod schemas, routes individuelles, "En bref" box, AISummaryBanner
- **Typé sans route** : `products` — Zod schema, utilisé uniquement par ProductBuyBlock et /api/checkout
- **Non-typé (any)** : JSON home, silos, pages enfants — `readFileSync` + cast `any`

Un champ mal nommé dans un JSON page/silo est silencieusement ignoré au build.

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

## Maillage éditorial — chaîne à 3 niveaux

**Article blog → Réalisation → Produit/Solution**

Règle : le lien fort se situe dans le bloc "En bref" (champ `tldr`), dans les premières lignes visibles.
L'ancre (`linkLabel`) doit être différente du titre de la page cible (élargissement du champ lexical).

Structure `tldr` :
```yaml
tldr:
  before: "Texte avant le lien."
  linkLabel: "ancre différente du titre cible"
  linkHref: "/chemin/"
  after: "Texte après (optionnel)."
```

Les deux types de publication incluent aussi `AISummaryBanner` (composant Astro, props: title + url).

## flux devis vs checkout

- **Checkout Stripe** : uniquement pour les produits `src/content/products/*.json` via `product_buy` block
- **Devis PHP** : formulaire DevisForm → `PUBLIC_DEVIS_ENDPOINT` (endpoint PHP externe), toutes les autres pages

## `productRef` threading

`BaseLayout.productRef` → `DevisModal.productRef` → `DevisForm.productRef`
Permet le pré-remplissage depuis n'importe quelle page produit.

**How to apply:** Si on crée une page avec un produit spécifique, passer `productRef` à `BaseLayout` (pas directement à DevisForm).
