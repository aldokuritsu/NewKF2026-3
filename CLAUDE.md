# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Framework**: Astro 6.2.0 (static site generation with Vercel adapter)
- **Styling**: Tailwind CSS 4.2.2 (via @tailwindcss/vite plugin)
- **Dynamic Components**: React 19.2.5 (loaded where needed via @astrojs/react)
- **CMS**: Sveltia CMS (Git-based, no npm package—loaded via CDN in `/admin/`)
- **E-commerce**: Stripe v22.1.0 (checkout sessions, variants, options) + a
  **functional client cart** (localStorage, no backend) → multi-item Stripe Checkout
- **Search**: home-made static index (`/search-index.json` built endpoint) + zero-dep
  client matcher in the Navbar (no Algolia/Pagefind)
- **Node**: >=22.12.0
- **Language**: TypeScript (strict mode)
- **Deployment**: Vercel (static output with 2 SSR API routes)

## Essential Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Production build to ./dist/
npm run preview   # Preview built site locally
npm run astro     # Astro CLI (astro add, astro check, etc.)
```

## Project Architecture

### Content Model & Page Structure

This is a **semantic siloing** architecture. Since the **2026 refonte** it is a
**recursive tree up to 3 levels deep** (rubrique › catégorie › sous-catégorie),
with **7 top-level rubriques**:

```
Home (/) ──┬─ /plv-carton/                (rubrique, niv. 0)
           │   ├─ /plv-carton/totems/      (catégorie, niv. 1)
           │   │   ├─ /plv-carton/totems/elliptiques/   (sous-catégorie, niv. 2)
           │   │   └─ … (cubes, triptyques, carres)
           │   └─ … (arches, cubes, podiums, frontons-publicitaires/…)
           ├─ /presentoir-comptoir/
           ├─ /presentoir-sol/
           ├─ /signaletique-et-lineaire/
           ├─ /stand-evenementiel/
           ├─ /packaging-et-coffrets/
           └─ /solutions-metiers/          (rubriques métiers : pharmacie, beauté…)
```

- **The tree is GENERATED**: `src/data/silos.ts` is produced by
  `scripts/gen-arbo-2026.mjs` (the canonical source of the arborescence).
  ⚠️ **Do not hand-edit `silos.ts`** — modify the `TREE` in the script and re-run
  `node scripts/gen-arbo-2026.mjs`. `SiloNode` is recursive (`children?: SiloNode[]`);
  helpers exported: `walkSilos()`, `getSiloBySlug()`.
- **Slug convention**: children are normalized **under their parent's slug**
  (URLs are strictly hierarchical, e.g. `/plv-carton/totems/elliptiques/`).
- **Navigation rule**: No cross-silo links; navbar/footer only link to rubrique pages.
- **Mega-menu**: the current rubrique (on any of its pages) opens inline; it renders
  all 3 levels (catégories + sous-catégories). On the home, all rubriques open.
- **No legacy redirects**: the 2026 refonte was a deliberate clean slate — old URLs
  (old 6 silos / ~95 pages) return 404; internal links still pointing to old slugs
  in `home/index.json`, posts and réalisations are dead until rewritten.

### Content Files vs. Pages

- **Home**: `src/content/home/index.json` → `src/pages/index.astro`
- **All rubrique / catégorie / sous-catégorie pages**: unified tree mirroring the
  URL, `src/content/pages/<chemin>.json` → single recursive route
  `src/pages/[...path].astro`. Examples:
  - `src/content/pages/plv-carton.json` → `/plv-carton/`
  - `src/content/pages/plv-carton/totems.json` → `/plv-carton/totems/`
  - `src/content/pages/plv-carton/totems/elliptiques.json` → `/plv-carton/totems/elliptiques/`
  - ⚠️ The old split (`src/content/silos/` for pillars + `src/pages/[silo]/index.astro`
    + `src/pages/[silo]/[slug].astro`) **no longer exists** — `src/content/silos/`
    and both old route files were deleted in the 2026 refonte.
- **Product pages (flat)**: `src/content/produits/<slug>.json` → `src/pages/p/[slug].astro`
  (route `/p/<slug>/`). Block-based like pages, **outside the silos cocon tree**.
  Each carries `title`, `siloSlug`, `parentLabel`, `parentHref` (category it belongs
  to — used for breadcrumb + to highlight the parent in the menu). Example:
  `src/content/produits/plv-arche-palette.json` → `/p/plv-arche-palette/`.
- **Search index**: `src/pages/search-index.json.ts` → static `/search-index.json`
  (prerendered). Indexes pages + product pages (`produits`) + dated posts + active réalisations.
- ⚠️ **Two distinct "product" concepts — do not confuse**:
  - `src/content/products/` = **Stripe catalog data** (Zod-typed: price, variants,
    options). No route of its own; consumed by `ProductBuyBlock` + `/api/checkout` + cart.
  - `src/content/produits/` = **editorial product *pages*** at `/p/<slug>/` (untyped
    blocks). A `/p/` page may *reference* a Stripe `products` entry via a
    `product_buy` block, but the two are separate files/dirs.
- **Blog posts**: `src/content/posts/*.md` → `src/pages/actualites-plv/[slug].astro` (route `/actualites-plv/[slug]/`)
- **Réalisations**: `src/content/realisations/[slug].json` → `src/pages/realisations-plv/[slug].astro` (route `/realisations-plv/[slug]/`)

### Block System (CMS)

Pages are built from **blocks**—typed JSON objects with a `_template` field. Each block maps to an Astro component:

- `hero` → HeroBlock.astro
- `hero_home` → HeroHomeBlock.astro (home page specific)
- `products_grid` → ProductsGridBlock.astro
- `product_buy` → ProductBuyBlock.astro (e-commerce with Stripe)
- `comparison_table` → ComparisonTableBlock.astro
- `cta_banner` → CTABannerBlock.astro
- `faq` → FAQBlock.astro
- `eco_section` → EcoBlock.astro
- `text_editorial` → TextEditorialBlock.astro
- `testimonials` → TestimonialsBlock.astro
- `realizations` → RealizationsBlock.astro
- `process` → ProcessBlock.astro
- `client_logos` → ClientLogosBlock.astro
- `solutions_grid` → SolutionsGridBlock.astro

**Block Navigation** (`src/lib/blockNav.ts`):
- Most blocks auto-generate sidebar anchors (e.g., products_grid → "Gamme")
- Blocks can override via CMS fields: `anchor` (id) and `nav_label` (label)
- Empty strings opt-out from nav (but id remains for scrollspy)

### Layout Hierarchy

1. **BaseLayout** (`src/layouts/BaseLayout.astro`)
   - Wraps all pages
   - Handles SEO, fonts (Google Fonts in `<head>`, not CSS), navbar/footer, devis modal
   - Props: `title`, `description`, `siloSlug`, `ogImage`, `productRef`, `hideDevisModal`

2. **PillarLayout** (extends BaseLayout)
   - Used by `src/pages/[...path].astro` for **depth-0 nodes** (rubriques)
   - Passes `siloSlug` (the rubrique slug) to activate its mega-menu

3. **ChildLayout** (extends BaseLayout)
   - Used by `[...path].astro` for **depth ≥ 1 nodes** (catégories / sous-catégories)
   - Takes a **`crumbs: Crumb[]`** prop (variable-depth breadcrumb, built from the
     node's ancestor chain — no longer a fixed 3-level breadcrumb)
   - Adds breadcrumb (Schema.org `BreadcrumbList`) and sub-nav (blocks with anchors)

**Routing**:
- `src/pages/[...path].astro` — single catch-all for the whole silos tree.
  `getStaticPaths()` calls `walkSilos()`, emits one path per node, reads
  `src/content/pages/<segments>.json`, picks Pillar vs Child layout by depth, and
  builds the breadcrumb from the ancestors. Being `[...rest]` it has lowest Astro
  priority — never shadows static pages, `/p/[slug]`, or `/search-index.json`.
- `src/pages/p/[slug].astro` — flat product pages. `getStaticPaths()` reads
  `src/content/produits/*.json`; renders via **ChildLayout** with a breadcrumb
  `Accueil › <parentLabel> › <title>` and `siloSlug` to keep the rubrique mega-menu
  active. ⚠️ It passes `currentPath = parentHref` (NOT the real `/p/<slug>/`) so the
  **parent category is highlighted in the menu** (see *Gotchas*).

### Key Components

- **Navbar** (`src/components/Navbar.astro`): since the 2026 refonte it is a
  **2-row header** and also owns the (ex-)Topbar content:
  - **Dark utility band** (`.topbar`, NOT sticky — scrolls away): Réalisations · Blog ·
    Contact (left) ; 🇫🇷 « Livraison partout en France » (right). The old
    `Topbar.astro` component was **deleted** and merged here (removed from BaseLayout).
  - **Brand row** (`.header-top`, the **only sticky** part — `.navbar` is
    `display:contents` so this stays pinned for the whole page): logo · search ·
    phone+accroche · cart.
  - **Nav row** (`.header-nav`, not sticky): the 7 rubriques, each with its 3-level
    mega-menu. Keyboard support (Enter/Space/Arrow/Escape). JS clamps the mega-panel
    inside the viewport (`adjustAlignment` — never overflows left nor right).
  - **Search**: functional. Lazy-fetches `/search-index.json`, client matcher
    (accent-insensitive, multi-token AND, weighted scoring), dropdown autocomplete
    on desktop + inline results in the mobile menu. ⚠️ Result items are injected via
    `innerHTML` → their CSS must be `:global(...)` (Astro scoped styles don't reach
    runtime-injected nodes).
  - **Cart**: **functional**. The cart button opens a slide-over **drawer** (lines,
    qty steppers, remove, total, "Passer commande"). Badge + total are live. State
    lives in `src/scripts/cart.ts` (localStorage `kf_cart_v1`, singleton
    `window.__kfCart`, events `kf-cart-change`/`kf-cart-open`). The Navbar `<script>`
    `import`s it → it's a real `_astro/*.js` bundle loaded on every page. ⚠️ Drawer
    line items are JS-injected → their CSS (`.cd-*`) must be `:global(...)`.
  - Header + footer width capped by the `--header-max-w` token (1250px); page
    content stays on `--max-w` (1140px).
- **DevisModal**: Global popup for quote requests. Auto-fills `productRef` if passed. 2-step form: Project details → Contact info.
- **BlockRenderer**: Maps block `_template` to components.
- **SubNav**: Sidebar anchors generated from `buildSubNav()`.
- **AISummaryBanner** (`src/components/AISummaryBanner.astro`): Encart "Résumer cet article avec" générant des liens vers ChatGPT, Mistral, Claude, Perplexity et Grok. Props: `title` (string), `url` (string — URL absolue). Les prompts demandent un résumé + articles connexes exclusivement sur kontfeel.fr. Placé sur les pages articles et réalisations.

### E-commerce Integration

**Two checkout paths, one endpoint**. `ProductBuyBlock` shows **two buttons**:
- *Commander maintenant* — direct express checkout (legacy single-product flow).
- *Ajouter au panier* — pushes the configured line into `window.__kfCart`, opens
  the drawer. The drawer's *Passer commande* then checks out the whole cart.

`/api/checkout` (`prerender = false`) accepts **either** shape and normalises:
- legacy single: `{ slug, quantity, variantId, optionIds, customAssetUrl }`
- cart: `{ items: [ {slug, quantity, variantId, optionIds, customAssetUrl}, … ] }`

Per item it re-loads the Stripe product, **recomputes price server-side** (never
trusts the client `unitPrice`), builds line items (product + per-option lines),
then: single-currency guard, shipping = intersection of products' `shippingCountries`
(fallback FR/BE/CH/LU), compact metadata, one Stripe session → redirect.
⚠️ No `checkout.session.completed` webhook / order persistence (flow ends at
`/success`, which clears the cart via `cart.ts`).

**Product Schema** (`src/content.config.ts`):
- `name`, `shortDescription`, `description`
- `price` (number), `currency` (eur|usd|gbp|chf)
- `image`, `imageAlt`
- `specs[]`: label/value pairs
- `variants[]`: id/label/price (required if variants exist)
- `options[]`: id/label/price (optional add-ons)
- `shippingCountries[]`: defaults to ['FR', 'BE', 'CH', 'LU']
- `active`: boolean

**File Upload** (`/api/upload`):
- Accepts multipart form uploads
- Stores in Vercel Blob
- Returns signed URL (valid 7 days by default)
- Used for custom asset uploads in devis/product flows

### Configuration & Environment

**astro.config.mjs**:
- `output: 'static'` (pre-rendered)
- Vercel adapter
- React integration
- Tailwind @tailwindcss/vite plugin
- Legacy redirects: `/blog-plv` → `/actualites-plv`, `/showroom-plv` → `/`

**.env.local** (not in repo, copy from .env.example):
- `PUBLIC_DEVIS_ENDPOINT`: PHP endpoint for quote submissions
- `STRIPE_SECRET_KEY`: Server-side (never exposed to client)
- `PUBLIC_STRIPE_PUBLISHABLE_KEY`: Client-side
- `PUBLIC_SITE_URL`: For Stripe redirect URLs (used in /api/checkout)

**tsconfig.json**: Strict mode, includes Astro generated types

### Styling

- **CSS variables** in global scope: `--white`, `--rose`, `--gray-*`, `--max-w`
  (1140px, page content), `--header-max-w` (1250px, header + footer width — single
  knob, used by Navbar `.topbar`/`.header-top`/`.nav-links` and Footer), `--radius`,
  `--radius-sm`
- **Global CSS**: `src/styles/global.css` (only `@import "tailwindcss"` — no other imports after, or Tailwind PostCSS breaks)
- **Component styles**: Scoped `<style>` blocks in .astro files use CSS variables
- **Tailwind**: Only for utility classes in component markup (no @layer custom utilities in this project)

**Important**: Google Fonts must go in `<head>` via `<link>` tags (see BaseLayout.astro), not in CSS. Tailwind v4's PostCSS processing rejects `@import url()` after `@import "tailwindcss"`.

### Sveltia CMS Setup

**Why no npm package?**
- Loaded via CDN: `<script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>` in `public/admin/index.html`
- Content auto-commits to GitHub when saved
- No build step needed; content is versioned in git

**Local editing** (offline):
1. `npm run dev`
2. Open http://localhost:4321/admin/ in Chrome/Edge
3. Click "Work with Local Repository" → select project root
4. Edits write directly to `src/content/`

**GitHub backend**:
- Configured in `public/admin/config.yml`
- Collections point to folders in `src/content/`
- No OAuth needed if using local editing; OAuth required for prod admin if hosted

**Collections after the 2026 refonte**:
- The `silos` collection was **removed** (no more `src/content/silos/`).
- The `pages` collection now covers the whole tree: `folder: src/content/pages`,
  `nested: { depth: 3 }`, `path: "{{slug}}"` (file path mirrors the URL).
  Editing the 3-level nested tree in the Sveltia UI should be validated in
  `/admin/`; direct JSON editing always works.
- `produits` collection (label *Fiches produits (/p/)*): `folder:
  src/content/produits`, flat, fields `title`/`parentLabel`/`parentHref`/`siloSlug`
  + blocks. Distinct from the `products` (Stripe) collection.
- `home` and `products` collections unchanged.

### Scripts (one-off utilities)

Located in `scripts/`:
- **`gen-arbo-2026.mjs`** ⭐ — **canonical source of the site arborescence**.
  Holds the `TREE` (7 rubriques + children). Regenerates `src/data/silos.ts` and
  the `src/content/pages/**.json` skeletons; prunes any page JSON not in the tree;
  **idempotent** (won't overwrite an existing JSON — preserves CMS-authored content).
  To change the menu/arborescence, edit `TREE` here then run it.
- `gen-plv-carton-products.mjs`: Generates product JSON files for PLV carton silo
- `add-product-buy-blocks.mjs`: Patches `product_buy` blocks into existing page JSON
- `use-popup-devis-plv-carton.mjs`: Modifies devis behavior (modal vs. page)
- `migrate-img-to-assets.mjs`, `link-images.mjs`: Image management utilities

Run with `node scripts/[name].mjs`

## Common Workflows

### Adding / moving a page or rubrique (arborescence change)

1. Edit the `TREE` in **`scripts/gen-arbo-2026.mjs`** (add the node anywhere in the
   recursive structure — depth 1, 2 or 3; give `slug` + `label`).
2. Run `node scripts/gen-arbo-2026.mjs` → regenerates `src/data/silos.ts`, creates
   the missing skeleton JSON(s), prunes removed ones (existing JSON is preserved).
3. Route auto-generates via `src/pages/[...path].astro`.
4. Flesh out content in Sveltia CMS at `/admin/` or directly in the page JSON.

⚠️ Never add the entry directly to `silos.ts` (it's generated and will be
overwritten). Never `mkdir` content by hand outside the tree (the script prunes it).

### Adding a New Block Type

1. Create component: `src/components/blocks/MyBlock.astro`
2. Add schema to `src/content.config.ts` (if needed for TypeScript)
3. Add import and case in `src/components/blocks/BlockRenderer.astro`
4. Add default anchor/label in `src/lib/blockNav.ts` DEFAULTS
5. Configure in Sveltia CMS (see `public/admin/config.yml`)

### Modifying the Navbar / header

- Rubrique/menu structure: edit `TREE` in `scripts/gen-arbo-2026.mjs`, then re-run it
  (NOT `silos.ts` directly).
- Header markup (dark band, brand row, nav row, search, mobile menu), styling and
  JS (mega-menu, hamburger, search matcher) all live in `src/components/Navbar.astro`.
- Search behaviour: client logic in Navbar `<script>`; index content in
  `src/pages/search-index.json.ts`.
- Header/footer width: `--header-max-w` token in `src/styles/global.css`.

### Adding a Blog Article

1. Create `src/content/posts/[slug].md` with frontmatter:
   - Required: `title`, `date` (YYYY-MM-DD)
   - Recommended: `description`, `image`, `imageAlt`, `author`, `tags[]`
   - Maillage: `relatedRealisation` (slug), `relatedLinks[]` (label + href)
   - TL;DR box: `tldr` object with `before`, `linkLabel`, `linkHref`, `after` — the link must use an anchor **different from the target page title**
2. The article appears automatically on `/actualites-plv/` (list) and gets a route at `/actualites-plv/[slug]/`
3. Only posts with a `date` field are listed and routed

### Adding a Réalisation

1. Create `src/content/realisations/[slug].json` with:
   - Required: `title`, `client`, `sector`, `date` (YYYY-MM), `description`, `challenge`, `solution`, `results[]` (value + label), `image`
   - Optional: `imageAlt`, `quote` (text + author + role)
   - Maillage: `relatedPost` (slug), `relatedLinks[]` (label + href)
   - TL;DR box: same `tldr` structure — the link (to a product page) must use an anchor **different from the product page title**
2. Set `active: true` (false hides it from list and route)
3. Appears on `/realisations-plv/` and gets a route at `/realisations-plv/[slug]/`

### Adding a product page (`/p/<slug>/`)

1. Create `src/content/produits/<slug>.json`: `title`, `seoTitle`,
   `seoDescription`, `siloSlug` (e.g. `plv-carton`), `parentLabel` +
   `parentHref` (the category it sits under, e.g. `Arches carton` /
   `/plv-carton/arches/`), then `blocks` (same block system as pages).
2. Route + breadcrumb + menu-highlight auto-generate via `src/pages/p/[slug].astro`.
3. Link it from its category page's `products_grid` (`href: "/p/<slug>/"`) — that's
   the cocon entry point (product pages are not in the menu/silos tree).
4. Optionally add a `product_buy` block referencing a Stripe `products` slug.

### Adding a Stripe product (e-commerce data)

1. Create `src/content/products/[slug].json` with schema from `src/content.config.ts`
2. Reference it via a `product_buy` block (its `productSlug`)
3. Test in Stripe test mode (test card 4242 4242 4242 4242). Works for both the
   direct *Commander maintenant* button and the cart.

## Implicit Conventions

### Three content tiers
- **Fully typed** (Zod + rendered): `posts` (Markdown) and `realisations` (JSON) — collections with rich schemas, individual routes, `AISummaryBanner`, "En bref" box
- **Typed but no route**: `products` (Stripe data) — Zod schema, used only by
  `ProductBuyBlock` + `/api/checkout` + cart
- **Untyped** (raw JSON): home + the `src/content/pages/**` tree + the
  `src/content/produits/*` product pages — `readFileSync` + cast to `any[]`. A
  misspelled field is silently ignored at build time.

### `silos.ts` is the authoritative router (and is generated)
`getStaticPaths()` in `src/pages/[...path].astro` loops exclusively over
`walkSilos()` (recursive walk of `silos.ts`). A JSON file in `src/content/pages/`
without a matching node in the tree generates **no route** (and is pruned on the
next `gen-arbo-2026.mjs` run). `silos.ts` itself is generated by that script — the
real source of truth is the `TREE` constant in `scripts/gen-arbo-2026.mjs`.

### `_template` vs `__typename` in BlockRenderer
`BlockRenderer.astro` normalises both formats via `tpl()`. The `__typename` form is a migration artifact from a previous GraphQL CMS. New blocks use only `_template`.

### URL trailing slash
All `href` values in `silos.ts` end with `/`. Static pages also use trailing slashes. Astro static mode generates directories, not files — missing slash → 404.

### SEO cocon — no cross-silo linking
- Footer (`Footer.astro`): about + legal + contact/devis/réalisations/actualités
  columns only. No rubrique-pillar links and no deep child links. (Note: it does
  **not** list the 7 rubriques — earlier doc claiming "6 pillar links" was wrong.)
- Navbar mega-menu: only the **current rubrique** opens (all 3 of its levels);
  other rubriques are flat top-level links. On the home, all rubriques open. No
  cross-rubrique deep links.
- `ObfuscatedLink` hides legal/contact URLs from crawlers via XOR encoding. The `bypass` prop on the home page allows a standard `<a href>` for PageRank transfer.

### Styling conventions
Two non-overlapping layers:
1. CSS custom properties defined in `src/styles/global.css` + `.btn-primary` / `.btn-secondary` global classes
2. Tailwind utility classes in markup

No `@layer` custom utilities, no `@apply`.

### SubNav visibility rule
`SubNav.astro` renders only when `entries.length >= 2`. A page with a single anchored block gets no SubNav.

### `productRef` prop threading
`BaseLayout` → `DevisModal` → `DevisForm`. Set on product pages to pre-fill the product reference field in the quote form.

### Internal linking rules (maillage SEO)

Three-level content chain: **Article blog → Réalisation → Produit/Solution**

- **Article → Réalisation**: link placed in the "En bref" box (`tldr` field), within the first visible lines. The `linkLabel` (anchor) must be **different from the réalisation page title** to broaden keyword coverage.
- **Réalisation → Produit**: same rule — link in the "En bref" box, anchor ≠ product page title.
- Both pages include `AISummaryBanner` (after the "En bref" box, before body content).
- Sidebar carries secondary links (same destinations, different visual weight).

The `tldr` field structure:
```yaml
tldr:
  before: "Texte avant le lien."
  linkLabel: "ancre du lien (≠ titre de la page cible)"
  linkHref: "/chemin/vers/page-cible/"
  after: "Texte après le lien (optionnel)."
```

## Known Risk Zones

1. **No Zod validation for page JSON**: A malformed `src/content/pages/**.json`
   crashes the build without a clear message. Block fields are all `any`.
2. **`silos.ts` ↔ `src/content/pages/` sync**: now handled by
   `scripts/gen-arbo-2026.mjs` (generates `silos.ts`, creates missing skeletons,
   prunes orphans). The risk shifted: forgetting to **re-run the script** after
   editing `TREE`, or hand-editing `silos.ts` (overwritten on next run).
3. **2026 refonte = no redirects**: old URLs (old 6 silos, ~95 pages) 404. SEO
   equity on old pages is lost, and internal links in `home/index.json`, posts and
   réalisations still point to old slugs → dead links until those are rewritten.
4. **`products` vs `produits`**: two near-homonym dirs. `src/content/products/` =
   Stripe data (typed); `src/content/produits/` = `/p/` editorial pages (untyped).
   Easy to mis-target. A `/p/` page only sells if it has a `product_buy` block
   pointing to a valid `products` slug.
5. **Cart is client-only**: localStorage, no backend, **no order webhook** — Stripe
   is the only record of a sale. `unitPrice` in the cart is display-only (server
   recomputes). Add-to-cart is reachable only where a `product_buy` block exists.
6. **Astro scoped styles vs `innerHTML`**: nodes injected at runtime — search
   results (`.sr-*`) and cart drawer lines (`.cd-*`) — don't get the
   `data-astro-cid` attribute → their CSS **must** use `:global(...)`. Applies to
   any future JS-injected styled markup.
7. **`test-stripe.astro` is in the production build**: Accessible at `/test-stripe/` unless explicitly excluded.
8. **Orphaned static pages**: `digital.astro`, `display.astro`, `mobilier.astro`, `stand.astro`, `realisations.astro` exist but have no visible nav integration. Their relationship to the new arborescence is unclear (and pre-2026 in origin).
9. **`realisations.astro` is an orphaned static page**: `/realisations-plv/` (list) and `/realisations-plv/[slug]/` (detail) are the canonical routes. The old `realisations.astro` at `/realisations/` still exists and should be redirected or removed.
10. **Vercel Blob URL in Stripe metadata**: The customer file URL (7-day expiry) is stored in Stripe session metadata. Deferred order processing will receive a dead link.
11. **External PHP devis endpoint**: `PUBLIC_DEVIS_ENDPOINT` has no visible fallback. Failures surface as generic error to the user.
12. **`plan-du-site.astro` and `contact.astro` are placeholders**: No sitemap.xml generated; contact page has no form. (Note: `/contact/` is now linked from the header dark band, so the empty page is more visible.)
13. **URL obfuscation key is public**: The XOR key `'kf26-x9m-q-zt'` is in source. Effective against crawlers, not against humans.

## Important Constraints & Gotchas

1. **Static output**: Only `/api/checkout` and `/api/upload` are SSR (`prerender = false`). Everything else pre-renders at build time. This means:
   - Dynamic page parameters must come from `getStaticPaths()`
   - No server-side DB queries (Astro will error at build)

2. **Tailwind v4 + PostCSS**: Never put `@import url()` after `@import "tailwindcss"` in CSS. Use `<link>` in HTML instead.

3. **Mega-menu focus trap**: If a user tabs out of the mega-menu, it closes. JS handles this via `document.click` listener.

4. **Stripe test mode**: Uses `pk_test_*` and `sk_test_*` keys from `.env.local`. Verify before deploying to prod.

5. **Redirects**: Astro `redirects` config only works for static routes (not `[...slug]` dynamic routes). See astro.config.mjs for current redirects.

6. **Vercel Blob URLs**: Signed URLs expire after 7 days. If a custom asset URL is stale, re-upload or use a permanent CDN.

7. **`silos.ts` is generated**: edit `scripts/gen-arbo-2026.mjs` `TREE` and re-run;
   never hand-edit `silos.ts` (overwritten) and never create page JSON outside the
   tree (pruned).

8. **One catch-all route**: `src/pages/[...path].astro` serves the whole tree.
   `astro check` may emit a benign “unreachable code” *Hint* on the `silos.map`
   `if(!showMega) return …; return (…)` pattern — pre-existing, ignore.

9. **`currentPath` = nav-active path, not the real URL**: it only drives the
   menu/mega `active` state (breadcrumb uses `crumbs`, OG uses `Astro.url`).
   `/p/[slug].astro` deliberately passes `parentHref` so the parent category
   lights up. Don't assume `currentPath === location.pathname`.

10. **Astro inlines small `<script>`, externalises imported ones**: a `<script>`
    with no import gets inlined into each page's HTML; adding an `import` (e.g.
    `cart.ts` in Navbar) makes Astro emit a shared `_astro/*.js` bundle instead.
    Grep both the HTML and `_astro/*.js` when verifying client code shipped.

## Debugging Tips

- **Dev server issues**: Clear `.astro/` and `dist/` folders, restart `npm run dev`
- **Type errors**: Run `astro check` to validate TypeScript
- **CMS data not appearing**: Check that JSON path matches `config.yml` collection definition
- **Stripe errors**: Check browser console (client-side) and server logs (API routes)
- **Navbar mega-menu stuck open**: Check browser console for JS errors, or test in incognito (cache/extension issues)

## Related Files to Read

- `SETUP.md`: Detailed step-by-step setup for Astro 6 + Tailwind 4 + Sveltia CMS (reference, not always current)
- `README.md`: Generic Astro starter template info (mostly outdated for this project)
- `src/content.config.ts`: Zod schemas for typed collections (posts, realisations, products)
- **`scripts/gen-arbo-2026.mjs`**: the `TREE` constant — **real source of truth** for
  the arborescence/menu (generates `silos.ts` + page skeletons)
- `src/data/silos.ts`: generated recursive tree + `walkSilos()` / `getSiloBySlug()`
- `src/pages/[...path].astro`: single recursive route for all rubrique/cat/sous-cat pages
- `src/pages/p/[slug].astro` + `src/content/produits/`: flat product pages `/p/<slug>/`
- `src/scripts/cart.ts`: client cart store (localStorage, `window.__kfCart`)
- `src/pages/api/checkout.ts`: Stripe session — accepts cart `items[]` or legacy single
- `src/pages/search-index.json.ts`: build-time static search index
- `src/components/Navbar.astro`: 2-row header (dark band + sticky brand row + nav row),
  mega-menu, search client, cart drawer
- `astro.config.mjs`: Build config, adapter, integrations, redirects
- `.env.example`: Template for environment variables
- `public/admin/config.yml`: Sveltia CMS collection definitions (must match actual folder structure)
