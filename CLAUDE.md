# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Framework**: Astro 6.2.0 (static site generation with Vercel adapter)
- **Styling**: Tailwind CSS 4.2.2 (via @tailwindcss/vite plugin)
- **Dynamic Components**: React 19.2.5 (loaded where needed via @astrojs/react)
- **CMS**: Sveltia CMS (Git-based, no npm package—loaded via CDN in `/admin/`)
- **E-commerce**: Stripe v22.1.0 (checkout sessions, variants, options)
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

This is a **semantic siloing** architecture with a hierarchical information structure:

```
Home (/) ─────────────┬─ Pillar 1: /plv-carton/
                      │  └─ Child pages: /plv-carton/[slug]/
                      ├─ Pillar 2: /presentoirs/
                      │  └─ Child pages: /presentoirs/[slug]/
                      ├─ Pillar 3: /signaletique/
                      ├─ Pillar 4: /impression/
                      ├─ Pillar 5: /plv-evenementielle/
                      └─ Pillar 6: /solutions/
```

- **Silos** are defined in `src/data/silos.ts` with full child hierarchies
- **Navigation rule**: No cross-silo links; navbar/footer only link to pillar pages
- **Mega-menu**: Current silo (if on a pillar or child page) opens inline with its children

### Content Files vs. Pages

- **Home**: `src/content/home/index.json` → `src/pages/index.astro`
- **Pillar pages**: `src/content/silos/[silo-slug].json` → `src/pages/[silo]/index.astro`
- **Child pages**: `src/content/pages/[silo]/[slug].json` → `src/pages/[silo]/[slug].astro`
- **Products**: `src/content/products/[slug].json` (Stripe checkout, variants/options)
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
   - For `/[silo]/` pages
   - Passes `siloSlug` to activate mega-menu for current silo

3. **ChildLayout** (extends BaseLayout)
   - For `/[silo]/[slug]/` pages
   - Adds breadcrumb and sub-nav (blocks with anchors)

### Key Components

- **Navbar**: Mega-menu for current silo (if active), flat links for others. Keyboard support (Enter/Space/Arrow/Escape). JS adjusts right-alignment if panel overflows viewport.
- **DevisModal**: Global popup for quote requests. Auto-fills `productRef` if passed. 2-step form: Project details → Contact info.
- **BlockRenderer**: Maps block `_template` to components.
- **SubNav**: Sidebar anchors generated from `buildSubNav()`.
- **AISummaryBanner** (`src/components/AISummaryBanner.astro`): Encart "Résumer cet article avec" générant des liens vers ChatGPT, Mistral, Claude, Perplexity et Grok. Props: `title` (string), `url` (string — URL absolue). Les prompts demandent un résumé + articles connexes exclusivement sur kontfeel.fr. Placé sur les pages articles et réalisations.

### E-commerce Integration

**Stripe Checkout Flow**:
1. User selects product, variant (if any), options, quantity
2. ProductBuyBlock sends POST to `/api/checkout` with: `slug`, `quantity`, `variantId`, `optionIds`, `customAssetUrl`
3. Route creates Stripe session with line items (product + per-option lines)
4. Redirects to Stripe checkout (success/cancel URLs)

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

- **CSS variables** in global scope: `--white`, `--rose`, `--gray-*`, `--max-w`, `--radius`, `--radius-sm`
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

### Scripts (one-off utilities)

Located in `scripts/`:
- `gen-plv-carton-products.mjs`: Generates product JSON files for PLV carton silo
- `add-product-buy-blocks.mjs`: Patches `product_buy` blocks into existing page JSON
- `use-popup-devis-plv-carton.mjs`: Modifies devis behavior (modal vs. page)
- `migrate-img-to-assets.mjs`, `link-images.mjs`: Image management utilities

Run with `node scripts/[name].mjs`

## Common Workflows

### Adding a New Child Page

1. Create content file: `src/content/pages/[silo]/[slug].json`
2. Add entry to `src/data/silos.ts` under the silo's `children[]` array
3. Route auto-generates via `src/pages/[silo]/[slug].astro` (dynamic)
4. Edit in Sveltia CMS at `/admin/` or directly in JSON

### Adding a New Block Type

1. Create component: `src/components/blocks/MyBlock.astro`
2. Add schema to `src/content.config.ts` (if needed for TypeScript)
3. Add import and case in `src/components/blocks/BlockRenderer.astro`
4. Add default anchor/label in `src/lib/blockNav.ts` DEFAULTS
5. Configure in Sveltia CMS (see `public/admin/config.yml`)

### Modifying the Navbar

- Silo structure: edit `src/data/silos.ts`
- Mega-menu styling: edit `<style>` in `src/components/Navbar.astro`
- JS behavior (hover/click/keyboard): edit `<script>` in `src/components/Navbar.astro`

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

### Adding a Product for E-commerce

1. Create `src/content/products/[slug].json` with schema from `src/content.config.ts`
2. Reference in a `product_buy` block or standalone page
3. Test in Stripe test mode (use test card 4242 4242 4242 4242)

## Implicit Conventions

### Three content tiers
- **Fully typed** (Zod + rendered): `posts` (Markdown) and `realisations` (JSON) — collections with rich schemas, individual routes, `AISummaryBanner`, "En bref" box
- **Typed but no route**: `products` — Zod schema, used only by `ProductBuyBlock` and `/api/checkout`
- **Untyped** (raw JSON): home, silo pages, child pages — `readFileSync` + cast to `any[]`. A misspelled field is silently ignored at build time.

### `silos.ts` is the authoritative router
`getStaticPaths()` in both `[silo]/index.astro` and `[silo]/[slug].astro` loops exclusively over `silos.ts`. A JSON file in `src/content/pages/` without a matching entry in `silos.ts` generates **no route**. The slug is extracted from `child.href` using `.split('/').filter(Boolean).pop()`.

### `_template` vs `__typename` in BlockRenderer
`BlockRenderer.astro` normalises both formats via `tpl()`. The `__typename` form is a migration artifact from a previous GraphQL CMS. New blocks use only `_template`.

### URL trailing slash
All `href` values in `silos.ts` end with `/`. Static pages also use trailing slashes. Astro static mode generates directories, not files — missing slash → 404.

### SEO cocon — no cross-silo linking
- Footer: 6 pillar links + legal pages only. No child-page links.
- Navbar mega-menu: children of active silo only, no cross-silo links.
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

1. **No Zod validation for page/silo JSON**: A malformed JSON crashes the build without a clear message. Blocks fields are all `any`.
2. **`silos.ts` ↔ `src/content/pages/` sync is manual**: No script or test verifies consistency between declared children and actual JSON files.
3. **`test-stripe.astro` is in the production build**: Accessible at `/test-stripe/` unless explicitly excluded.
4. **Orphaned static pages**: `digital.astro`, `display.astro`, `mobilier.astro`, `stand.astro`, `realisations.astro` exist but have no visible nav integration. Their relationship to the silo architecture is unclear.
5. **`realisations.astro` is an orphaned static page**: `/realisations-plv/` (list) and `/realisations-plv/[slug]/` (detail) are the canonical routes. The old `realisations.astro` at `/realisations/` still exists and should be redirected or removed.
6. **Vercel Blob URL in Stripe metadata**: The customer file URL (7-day expiry) is stored in Stripe session metadata. Deferred order processing will receive a dead link.
7. **External PHP devis endpoint**: `PUBLIC_DEVIS_ENDPOINT` has no visible fallback. Failures surface as generic error to the user.
8. **`plan-du-site.astro` and `contact.astro` are placeholders**: No sitemap.xml generated; contact page has no form.
9. **URL obfuscation key is public**: The XOR key `'kf26-x9m-q-zt'` is in source. Effective against crawlers, not against humans.

## Important Constraints & Gotchas

1. **Static output**: Only `/api/checkout` and `/api/upload` are SSR (`prerender = false`). Everything else pre-renders at build time. This means:
   - Dynamic page parameters must come from `getStaticPaths()`
   - No server-side DB queries (Astro will error at build)

2. **Tailwind v4 + PostCSS**: Never put `@import url()` after `@import "tailwindcss"` in CSS. Use `<link>` in HTML instead.

3. **Mega-menu focus trap**: If a user tabs out of the mega-menu, it closes. JS handles this via `document.click` listener.

4. **Stripe test mode**: Uses `pk_test_*` and `sk_test_*` keys from `.env.local`. Verify before deploying to prod.

5. **Redirects**: Astro `redirects` config only works for static routes (not `[...slug]` dynamic routes). See astro.config.mjs for current redirects.

6. **Vercel Blob URLs**: Signed URLs expire after 7 days. If a custom asset URL is stale, re-upload or use a permanent CDN.

## Debugging Tips

- **Dev server issues**: Clear `.astro/` and `dist/` folders, restart `npm run dev`
- **Type errors**: Run `astro check` to validate TypeScript
- **CMS data not appearing**: Check that JSON path matches `config.yml` collection definition
- **Stripe errors**: Check browser console (client-side) and server logs (API routes)
- **Navbar mega-menu stuck open**: Check browser console for JS errors, or test in incognito (cache/extension issues)

## Related Files to Read

- `SETUP.md`: Detailed step-by-step setup for Astro 6 + Tailwind 4 + Sveltia CMS (reference, not always current)
- `README.md`: Generic Astro starter template info (mostly outdated for this project)
- `src/content.config.ts`: Zod schemas for all content types
- `src/data/silos.ts`: Silo/child hierarchy definition (source of truth for nav)
- `astro.config.mjs`: Build config, adapter, integrations, redirects
- `.env.example`: Template for environment variables
- `public/admin/config.yml`: Sveltia CMS collection definitions (must match actual folder structure)
