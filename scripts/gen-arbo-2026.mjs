/**
 * gen-arbo-2026.mjs — Génère la nouvelle arborescence 2026 (3 niveaux).
 *
 * Source unique de vérité de la structure du site :
 *   - src/data/silos.ts          (arbre récursif + helpers de navigation)
 *   - src/content/pages/**.json  (squelettes miroir des URLs)
 *
 * Rejouable : régénère silos.ts et tous les squelettes manquants.
 * NB : n'écrase PAS un JSON existant (préserve le contenu rédigé via le CMS).
 *
 * Usage : node scripts/gen-arbo-2026.mjs
 *
 * Conventions :
 *   - slugs normalisés « sous le parent » (URLs hiérarchiques cohérentes)
 *   - slugs gardés littéraux d'après la liste fournie (typos signalées, non corrigées)
 *   - labels rédigés explicitement (accents FR corrects)
 */
import { mkdirSync, writeFileSync, existsSync, rmSync, readdirSync, statSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/* ─────────────────────────────────────────────────────────────────────────
 * ARBRE CANONIQUE
 * Chaque nœud : { slug, label, children? }
 * ──────────────────────────────────────────────────────────────────────── */
const TREE = [
  {
    slug: 'plv-carton', label: 'PLV carton',
    children: [
      { slug: 'totems', label: 'Totems carton', children: [
        { slug: 'elliptiques', label: 'Totems elliptiques' },
        { slug: 'cubes',       label: 'Totems cubes' },
        { slug: 'triptyques',  label: 'Totems triptyques' },
        { slug: 'carres',      label: 'Totems carrés' },
      ]},
      { slug: 'arches',                label: 'Arches carton' },
      { slug: 'cubes',                 label: 'Cubes carton' },
      { slug: 'podiums',               label: 'Podiums carton' },
      { slug: 'urnes-de-jeux-concours',label: 'Urnes de jeux-concours' },
      { slug: 'silhouettes-decoupees', label: 'Silhouettes découpées' },
      { slug: 'vitrine',               label: 'PLV vitrine' },
      { slug: 'poubelles-de-tri',      label: 'Poubelles de tri' },
      { slug: 'panneaux-de-sol',       label: 'Panneaux de sol' },
      { slug: 'stands-de-degustation', label: 'Stands de dégustation' },
      { slug: 'factices-geants',       label: 'Factices géants' },
      { slug: 'frontons-publicitaires',label: 'Frontons publicitaires', children: [
        { slug: 'tetes-de-gondoles', label: 'Têtes de gondoles' },
        { slug: 'frontons-sur-mat',  label: 'Frontons sur mât' },
      ]},
    ],
  },
  {
    slug: 'presentoir-comptoir', label: 'Présentoir comptoir',
    children: [
      { slug: 'totem-de-comptoir',                       label: 'Totem de comptoir' },
      { slug: 'porte-document-et-brochures',             label: 'Porte-document et brochures' },
      { slug: 'panneaux-chevalets-et-cavaliers-de-table',label: 'Panneaux chevalets et cavaliers de table' },
      { slug: 'distributeurs-et-vrac',                   label: 'Distributeurs et vrac' },
      { slug: 'sabots-et-stop-piles',                    label: 'Sabots et stop-piles' },
      { slug: 'prets-a-vendre',                          label: 'Prêts à vendre' },
      { slug: 'presentoirs-escaliers',                   label: 'Présentoirs escaliers' },
      { slug: 'presentoirs-a-empreinte',                 label: 'Présentoirs à empreinte' },
    ],
  },
  {
    slug: 'presentoir-sol', label: 'Présentoir sol',
    children: [
      { slug: 'bac-a-fouille',                label: 'Bac à fouille' },
      { slug: 'box-automatique',              label: 'Box automatique' },
      { slug: 'box-barquettes-emplilables',   label: 'Box barquettes empilables' },
      { slug: 'box-canadiens',                label: 'Box canadiens' },
      { slug: 'box-palettes', label: 'Box palettes', children: [
        { slug: 'box-quart-de-palette', label: 'Box quart de palette' },
        { slug: 'box-demi-de-palette',  label: 'Box demi-palette' },
      ]},
      { slug: 'presentoirs-bouteilles',       label: 'Présentoirs bouteilles' },
      { slug: 'presentoirs-colonne-edition',  label: 'Présentoirs colonne édition' },
      { slug: 'presentoirs-metal-et-permanents', label: 'Présentoirs métal et permanents', children: [
        { slug: 'presentoirs-roulettes', label: 'Présentoirs à roulettes' },
      ]},
      { slug: 'presentoir-bois-magasin',      label: 'Présentoir bois magasin' },
      { slug: 'presentoir-plastique-plexiglas',label: 'Présentoir plastique / plexiglas' },
      { slug: 'fsdu',                         label: 'FSDU' },
    ],
  },
  {
    slug: 'signaletique-et-lineaire', label: 'Signalétique et linéaire',
    children: [
      { slug: 'rappel-de-marque',                 label: 'Rappel de marque' },
      { slug: 'stop-trottoir',                    label: 'Stop-trottoir' },
      { slug: 'fronton-et-ilv',                   label: 'Fronton et ILV' },
      { slug: 'nez-de-tablette-et-plateau',       label: 'Nez de tablette et plateau' },
      { slug: 'joue-de-lineaire-et-descente',     label: 'Joue de linéaire et descente' },
      { slug: 'tour-de-prix-et-contour-etiquette',label: 'Tour de prix et contour étiquette' },
      { slug: 'reglette-de-lineaire',             label: 'Réglette de linéaire' },
      { slug: 'habillage-tete-de-gondole',        label: 'Habillage tête de gondole' },
      { slug: 'contour-de-palette',               label: 'Contour de palette' },
      { slug: 'jupe-de-palette', label: 'Jupe de palette', children: [
        { slug: 'ondule',  label: 'Jupe ondulée' },
        { slug: 'intisse', label: 'Jupe intissé' },
      ]},
      { slug: 'stop-rayon', label: 'Stop-rayon', children: [
        { slug: 'wobller', label: 'Wobbler' },
      ]},
      { slug: 'adhesif', label: 'Adhésif', children: [
        { slug: 'sticker-vitrine',             label: 'Sticker vitrine' },
        { slug: 'sticker-de-sol-personnalise', label: 'Sticker de sol personnalisé' },
        { slug: 'vitrophanie',                 label: 'Vitrophanie' },
      ]},
      { slug: 'print-management', label: 'Print management', children: [
        { slug: 'bloc-coupons', label: 'Bloc coupons' },
        { slug: 'depliants',    label: 'Dépliants' },
        { slug: 'posters',      label: 'Posters' },
        { slug: 'brochures',    label: 'Brochures' },
      ]},
      { slug: 'theatralisation-magasin',  label: 'Théâtralisation magasin' },
      { slug: 'animations-commerciales',  label: 'Animations commerciales' },
      { slug: 'impression-grand-format',  label: 'Impression grand format' },
      { slug: 'glorifier',                label: 'Glorifier' },
      { slug: 'habillage-bac-frais',      label: 'Habillage bac frais' },
    ],
  },
  {
    slug: 'stand-evenementiel', label: 'Stand événementiel',
    children: [
      { slug: 'stands-parapluie-textile-et-photocall', label: 'Stands parapluie, textile et photocall' },
      { slug: 'tentes-publicitaires',                  label: 'Tentes publicitaires' },
      { slug: 'roll-up-et-kakemonos',                  label: 'Roll-up et kakémonos' },
      { slug: 'murs-image-scourbes',                   label: "Murs d'image courbés" },
      { slug: 'posters-suspendus-et-x-banners',        label: 'Posters suspendus et X-banners' },
      { slug: 'drapeaux-oriflammes-et-beach-flags',    label: 'Drapeaux, oriflammes et beach flags' },
      { slug: 'bache-sur-mesure-et-banderoles',        label: 'Bâche sur mesure et banderoles' },
      { slug: 'parasols-publicitaires',                label: 'Parasols publicitaires' },
      { slug: 'nappes-personnalises',                  label: 'Nappes personnalisées' },
      { slug: 'comptoirs-accueil',                     label: "Comptoirs d'accueil" },
      { slug: 'plv-digitale',                          label: 'PLV digitale' },
      { slug: 'objets-publicitaires', label: 'Objets publicitaires', children: [
        { slug: 'objets-recycles', label: 'Objets recyclés' },
      ]},
      { slug: 'bornes-digitales', label: 'Bornes digitales', children: [
        { slug: 'bornes-de-jeu', label: 'Bornes de jeu' },
      ]},
      { slug: 'plv-lumineuses', label: 'PLV lumineuses', children: [
        { slug: 'cadre-lumineux', label: 'Cadre lumineux' },
      ]},
      { slug: 'plv-ecrans', label: 'PLV écrans', children: [
        { slug: 'rollups', label: 'Roll-ups écran' },
        { slug: 'totems',  label: 'Totems écran' },
      ]},
    ],
  },
  {
    slug: 'packaging-et-coffrets', label: 'Packaging et coffrets',
    children: [
      { slug: 'valises-de-presentation',                 label: 'Valises de présentation' },
      { slug: 'emballages-personnalises-et-cartonnettes',label: 'Emballages personnalisés et cartonnettes' },
      { slug: 'coffrets-cartons',                        label: 'Coffrets cartons' },
      { slug: 'etuis-et-fourreaux-personnalises',        label: 'Étuis et fourreaux personnalisés' },
    ],
  },
]

/* ─────────────────────────────────────────────────────────────────────────
 * 1. Génération de src/data/silos.ts
 * ──────────────────────────────────────────────────────────────────────── */
function withHref(nodes, parentPath = '') {
  return nodes.map(n => {
    const href = `${parentPath}/${n.slug}/`
    const out = { slug: n.slug, label: n.label, href }
    if (n.children?.length) out.children = withHref(n.children, `${parentPath}/${n.slug}`)
    return out
  })
}
const SILOS = withHref(TREE)

const silosTs = `/**
 * silos.ts — Arborescence du site (source de vérité du routage et du menu).
 *
 * ⚠️  GÉNÉRÉ par scripts/gen-arbo-2026.mjs — ne pas éditer à la main :
 *     modifier l'arbre dans le script puis relancer \`node scripts/gen-arbo-2026.mjs\`.
 *
 * Arbre récursif jusqu'à 3 niveaux : rubrique › catégorie › sous-catégorie.
 * \`href\` = chemin absolu complet avec slash final (mode statique Astro).
 */

export interface SiloNode {
  slug: string
  label: string
  href: string
  children?: SiloNode[]
}

export const silos: SiloNode[] = ${JSON.stringify(SILOS, null, 2)}

/** Aplatissement : chaque nœud avec sa chaîne d'ancêtres (rubrique → … → parent). */
export function walkSilos(
  nodes: SiloNode[] = silos,
  ancestors: SiloNode[] = [],
): { node: SiloNode; ancestors: SiloNode[] }[] {
  const out: { node: SiloNode; ancestors: SiloNode[] }[] = []
  for (const node of nodes) {
    out.push({ node, ancestors })
    if (node.children?.length) out.push(...walkSilos(node.children, [...ancestors, node]))
  }
  return out
}

/** Rubrique de premier niveau par slug. */
export function getSiloBySlug(slug: string): SiloNode | undefined {
  return silos.find(s => s.slug === slug)
}
`
writeFileSync(resolve(ROOT, 'src/data/silos.ts'), silosTs)
console.log('✓ src/data/silos.ts')

/* ─────────────────────────────────────────────────────────────────────────
 * 2. Génération des squelettes src/content/pages/**.json
 * ──────────────────────────────────────────────────────────────────────── */
function skeleton(node, rubriqueSlug, isPillar) {
  const label = node.label
  return {
    seoTitle: `${label} | KONTFEEL`,
    seoDescription: `${label} sur mesure par KONTFEEL, fabricant français de PLV. Conception, fabrication et logistique. Devis gratuit sous 24h.`,
    siloSlug: rubriqueSlug,
    blocks: [
      {
        _template: 'hero',
        heading: label,
        subheading: isPillar
          ? `Découvrez notre gamme ${label.toLowerCase()} sur mesure`
          : `${label} personnalisable à votre image`,
        badges: [
          { text: 'Fabrication française', green: false },
          { text: 'Devis sous 24h', green: false },
        ],
        ctas: [
          { label: 'Demander un devis →', href: '#devis', variant: 'primary' },
          { label: '02 78 77 53 93', href: 'tel:0278775393', variant: 'secondary' },
        ],
      },
      {
        _template: 'cta_banner',
        heading: `Un projet ${label.toLowerCase()} ? Parlons-en.`,
        body: 'Conception, fabrication et logistique de A à Z. Devis gratuit sous 24h.',
        btnLabel: 'Demander un devis gratuit →',
        btnHref: '#devis',
      },
    ],
  }
}

// Ensemble des chemins de contenu valides (relatifs à src/content/pages, sans .json)
const VALID = new Set()
function collectValid(nodes, segments = []) {
  for (const node of nodes) {
    const path = [...segments, node.slug]
    VALID.add(path.join('/'))
    if (node.children?.length) collectValid(node.children, path)
  }
}
collectValid(TREE)

const pagesDir = resolve(ROOT, 'src/content/pages')

/* ─────────────────────────────────────────────────────────────────────────
 * 3. Nettoyage de l'ancienne structure (AVANT génération)
 *    - src/content/silos/        : entièrement obsolète (piliers désormais
 *                                  dans src/content/pages/<rubrique>.json)
 *    - src/content/pages/**.json : tout fichier hors de la nouvelle arbo
 *      (anciens silos + anciens enfants, y compris dans des dossiers dont
 *       le nom est réutilisé comme « plv-carton »).
 *    Les produits (src/content/products) NE SONT PAS touchés.
 * ──────────────────────────────────────────────────────────────────────── */
const silosDir = resolve(ROOT, 'src/content/silos')
if (existsSync(silosDir)) {
  rmSync(silosDir, { recursive: true, force: true })
  console.log('✓ supprimé src/content/silos/ (ancienne structure piliers)')
}

let removed = 0
function prune(dir, rel = '') {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      prune(full, rel ? `${rel}/${entry}` : entry)
      // supprime le dossier s'il est devenu vide
      if (readdirSync(full).length === 0) rmSync(full, { recursive: true, force: true })
    } else if (entry.endsWith('.json')) {
      const key = (rel ? `${rel}/` : '') + entry.replace(/\.json$/, '')
      if (!VALID.has(key)) {
        rmSync(full, { force: true })
        removed++
      }
    }
  }
}
prune(pagesDir)
console.log(`✓ src/content/pages : ${removed} fichier(s) obsolète(s) supprimé(s)`)

/* ─────────────────────────────────────────────────────────────────────────
 * 4. Génération des squelettes manquants (préserve les JSON existants)
 * ──────────────────────────────────────────────────────────────────────── */
let created = 0, skipped = 0
function emit(nodes, rubrique, segments = []) {
  for (const node of nodes) {
    const isPillar = segments.length === 0
    const rubriqueSlug = isPillar ? node.slug : rubrique
    const path = [...segments, node.slug]
    const file = resolve(pagesDir, `${path.join('/')}.json`)
    if (existsSync(file)) {
      skipped++
    } else {
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, JSON.stringify(skeleton(node, rubriqueSlug, isPillar), null, 2) + '\n')
      created++
    }
    if (node.children?.length) emit(node.children, rubriqueSlug, path)
  }
}
emit(TREE)
console.log(`✓ src/content/pages : ${created} créés, ${skipped} préservés (déjà présents)`)

console.log('\nTerminé.')
