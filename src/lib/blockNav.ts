/**
 * blockNav — Construit la liste d'ancres affichée par <SubNav>.
 *
 * Stratégie hybride :
 *  1. Chaque type de bloc a un défaut (`anchor` + `label`). Les blocs sans
 *     défaut (cta_banner, hero_home…) sont ignorés.
 *  2. Chaque bloc peut surcharger les défauts via deux champs CMS optionnels :
 *       - `anchor`     : l'id DOM cible
 *       - `nav_label`  : le libellé court affiché dans le sub-nav
 *     Les chaînes vides sont traitées comme « non défini » (cas typique d'un
 *     champ Sveltia laissé vide), et retombent donc sur les défauts.
 */

export interface SubNavEntry {
  anchor: string
  label: string
}

interface DefaultEntry {
  anchor: string
  label: string
}

const DEFAULTS: Record<string, DefaultEntry | null> = {
  hero:             { anchor: 'hero',                label: 'Accueil' },
  products_grid:    { anchor: 'gamme',               label: 'Gamme' },
  comparison_table: { anchor: 'comparer',            label: 'Comparer' },
  eco_section:      { anchor: 'plv-eco-responsable', label: 'Éco-conception' },
  faq:              { anchor: 'faq',                 label: 'FAQ' },
  text_editorial:   { anchor: 'expert',              label: 'Expertise' },
  testimonials:     { anchor: 'temoignages',         label: 'Témoignages' },
  realizations:     { anchor: 'realisations',        label: 'Réalisations' },
  process:          { anchor: 'process',             label: 'Process' },
  client_logos:     { anchor: 'clients',             label: 'Clients' },
  solutions_grid:   { anchor: 'solutions',           label: 'Solutions' },
  product_buy:      { anchor: 'commander',           label: 'Commander' },
  // Volontairement exclus du sub-nav par défaut :
  hero_home:  null,
  cta_banner: null,
}

/**
 * Normalise le `_template` ou `__typename` du bloc vers la clé snake_case
 * utilisée par BlockRenderer (ex. `Silo_pageBlocksHero` → `hero`).
 */
function normalizeTpl(block: any): string {
  const raw: string = block?.__typename ?? block?._template ?? ''
  if (!raw) return ''
  return raw
    .replace(/^(Home_page|Silo_page|Child_page)Blocks/, '')
    .replace(/^([A-Z])/, m => m.toLowerCase())
    .replace(/([A-Z])/g, m => '_' + m.toLowerCase())
}

/**
 * Résout l'ancre DOM finale d'un bloc (utilisée par les blocks pour leur attribut id).
 * Renvoie `undefined` si le bloc n'expose aucune ancre.
 */
export function resolveAnchor(block: any): string | undefined {
  const tpl = normalizeTpl(block)
  const def = DEFAULTS[tpl] ?? null
  const override = block?.anchor
  // override explicite (string non vide gagne, '' n'efface PAS l'id de section,
  // car l'id reste utile au scrollspy même si le bloc est masqué du sub-nav)
  if (typeof override === 'string' && override.length > 0) return override
  return def?.anchor
}

/**
 * Construit le tableau d'entrées pour <SubNav>.
 * - Filtre les blocs sans mapping par défaut et sans override.
 * - Permet à un bloc d'opt-out via `anchor: ''` ou `nav_label: ''`.
 * - Déduplique par ancre (premier gagne).
 */
export function buildSubNav(blocks: any[] | undefined): SubNavEntry[] {
  if (!blocks?.length) return []

  const out: SubNavEntry[] = []
  const seen = new Set<string>()

  for (const block of blocks) {
    const tpl = normalizeTpl(block)
    const def = DEFAULTS[tpl] ?? null

    const anchorOverride = block?.anchor
    const labelOverride  = block?.nav_label

    const anchor =
      typeof anchorOverride === 'string' && anchorOverride.length > 0
        ? anchorOverride
        : def?.anchor

    const label =
      typeof labelOverride === 'string' && labelOverride.length > 0
        ? labelOverride
        : def?.label

    if (!anchor || !label) continue
    if (seen.has(anchor)) continue
    seen.add(anchor)
    out.push({ anchor, label })
  }

  return out
}
