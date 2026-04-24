export interface SiloChild {
  label: string
  href: string
}

export interface Silo {
  slug: string
  label: string
  href: string
  children: SiloChild[]
}

export const silos: Silo[] = [
  {
    slug: 'plv-carton',
    label: 'PLV carton',
    href: '/plv-carton/',
    children: [
      { label: 'Totem carton',                      href: '/plv-carton/totem-carton/' },
      { label: 'Totem carton automatique',          href: '/plv-carton/totem-carton-automatique/' },
      { label: 'Totem carton sur mesure',           href: '/plv-carton/totem-carton-sur-mesure/' },
      { label: 'Totem carton 3 faces',              href: '/plv-carton/totem-carton-3-faces/' },
      { label: 'Totem carton 4 faces',              href: '/plv-carton/totem-carton-4-faces/' },
      { label: 'Totem carton grand format',         href: '/plv-carton/totem-carton-grand-format/' },
      { label: 'Totem carton publicitaire',         href: '/plv-carton/totem-carton-publicitaire/' },
      { label: 'Totem carton pliable',              href: '/plv-carton/totem-carton-pliable/' },
      { label: 'Totem carton biscotte',             href: '/plv-carton/totem-carton-biscotte/' },
      { label: 'Totem arche',               href: '/plv-carton/totem-arche/' },
      { label: 'Totem cube',                href: '/plv-carton/totem-cube/' },
      { label: 'Triptyque carton',          href: '/plv-carton/triptyque-carton/' },
      { label: 'Présentoir de sol carton',  href: '/plv-carton/presentoir-de-sol-carton/' },
      { label: 'Cube carton',               href: '/plv-carton/cube-carton/' },
      { label: 'Podium carton',             href: '/plv-carton/podium-carton/' },
      { label: 'Urne en carton',            href: '/plv-carton/urne-en-carton/' },
      { label: 'Silhouette découpée',       href: '/plv-carton/silhouette-decoupee/' },
      { label: 'PLV vitrine carton',        href: '/plv-carton/plv-vitrine/' },
      { label: 'Poubelle carton',           href: '/plv-carton/poubelle-carton/' },
    ]
  },
  {
    slug: 'presentoirs',
    label: 'Présentoirs',
    href: '/presentoirs/',
    children: [
      { label: 'Stop pile',                 href: '/presentoirs/stop-pile/' },
      { label: 'Présentoir distributeur',   href: '/presentoirs/presentoir-distributeur/' },
      { label: 'Présentoir rempli',         href: '/presentoirs/presentoir-rempli/' },
      { label: 'PLV à poser',               href: '/presentoirs/plv-a-poser/' },
      { label: 'Sabot de comptoir',         href: '/presentoirs/sabot-de-comptoir/' },
      { label: 'Cavalier de table',         href: '/presentoirs/cavalier-de-table/' },
      { label: 'Porte-documents',           href: '/presentoirs/porte-documents/' },
      { label: 'Panneau chevalet',          href: '/presentoirs/panneau-chevalet/' },
      { label: 'Porte-affiche',             href: '/presentoirs/porte-affiche/' },
      { label: 'Bac à fouille',             href: '/presentoirs/bac-a-fouille/' },
      { label: 'Box autoportant',           href: '/presentoirs/box-autoportant/' },
      { label: 'Bacs barquettes',           href: '/presentoirs/bacs-barquettes/' },
      { label: 'Box conteneur',             href: '/presentoirs/box-conteneur/' },
      { label: 'FSDU',                      href: '/presentoirs/fsdu/' },
      { label: 'Présentoir colonne',        href: '/presentoirs/presentoir-colonne/' },
      { label: 'Îlot',                      href: '/presentoirs/ilot/' },
      { label: 'Présentoir bouteilles',     href: '/presentoirs/presentoir-bouteilles/' },
      { label: 'Présentoir pharmacie',      href: '/presentoirs/presentoir-pharmacie/' },
      { label: 'Présentoir cosmétique',     href: '/presentoirs/presentoir-cosmetique/' },
      { label: 'Présentoir édition',        href: '/presentoirs/presentoir-edition/' },
      { label: 'Présentoir book',           href: '/presentoirs/presentoir-book/' },
      { label: 'Présentoir plastique',      href: '/presentoirs/presentoir-plastique/' },
    ]
  },
  {
    slug: 'signaletique',
    label: 'Signalétique',
    href: '/signaletique/',
    children: [
      { label: 'Stop rayon',                href: '/signaletique/stop-rayon/' },
      { label: 'Tour de prix',              href: '/signaletique/tour-de-prix/' },
      { label: 'Plateau linéaire',          href: '/signaletique/plateau-lineaire/' },
      { label: 'Bande de rive',             href: '/signaletique/bande-de-rive/' },
      { label: 'Réglette de linéaire',      href: '/signaletique/reglette-de-lineaire/' },
      { label: 'Habillage de tablette',     href: '/signaletique/habillage-de-tablette/' },
      { label: 'Joue de linéaire',          href: '/signaletique/joue-de-lineaire/' },
      { label: 'Fronton',                   href: '/signaletique/fronton/' },
      { label: 'Habillage palette',         href: '/signaletique/habillage-palette/' },
      { label: 'Stickers de sol',           href: '/signaletique/stickers-de-sol/' },
      { label: 'Stickers vitrine',          href: '/signaletique/stickers-vitrine/' },
      { label: 'Rappel de marque',          href: '/signaletique/rappel-de-marque/' },
      { label: 'Stop trottoir',             href: '/signaletique/stop-trottoir/' },
    ]
  },
  {
    slug: 'impression',
    label: 'Impression',
    href: '/impression/',
    children: [
      { label: 'Affichage publicitaire',    href: '/impression/affichage-publicitaire/' },
      { label: 'Flyers',                    href: '/impression/flyers/' },
      { label: 'Brochures',                 href: '/impression/brochures/' },
      { label: 'Cartonnette',               href: '/impression/cartonnette/' },
      { label: 'Étiquette en rouleaux',     href: '/impression/etiquette-en-rouleaux/' },
      { label: 'PLV factice',               href: '/impression/plv-factice/' },
      { label: 'Coffret bouteille',         href: '/impression/coffret-bouteille/' },
      { label: 'Coffret carton',            href: '/impression/coffret-carton/' },
      { label: 'Coffret de presse',         href: '/impression/coffret-de-presse/' },
      { label: 'Coffret écrin',             href: '/impression/coffret-ecrin/' },
      { label: 'Coffret présentation',      href: '/impression/coffret-presentation/' },
      { label: 'Étui coffret',              href: '/impression/etui-coffret/' },
      { label: 'Objet publicitaire',        href: '/impression/objet-publicitaire/' },
      { label: 'Nappe personnalisée',       href: '/impression/nappe-personnalisee/' },
      { label: 'Panneau publicitaire',      href: '/impression/panneau-publicitaire/' },
      { label: 'Sac personnalisé',          href: '/impression/sac-personnalise/' },
      { label: 'Voile commerciale',         href: '/impression/voile-commerciale/' },
      { label: 'Objets recyclés',           href: '/impression/objets-recycles/' },
    ]
  },
  {
    slug: 'plv-evenementielle',
    label: 'PLV événementielle',
    href: '/plv-evenementielle/',
    children: [
      { label: 'Stand expo',                href: '/plv-evenementielle/stand-expo/' },
      { label: 'Stand de dégustation',      href: '/plv-evenementielle/stand-de-degustation/' },
      { label: 'Stand animation',           href: '/plv-evenementielle/stand-animation/' },
      { label: 'Stand parapluie',           href: '/plv-evenementielle/stand-parapluie/' },
      { label: 'Tente publicitaire',        href: '/plv-evenementielle/tente-publicitaire/' },
      { label: 'Borne accueil',             href: '/plv-evenementielle/borne-accueil/' },
      { label: 'Comptoir stand',            href: '/plv-evenementielle/comptoir-stand/' },
      { label: 'Rollup',                    href: '/plv-evenementielle/rollup/' },
      { label: 'Kakémono',                  href: '/plv-evenementielle/kakemono/' },
      { label: 'Mur d\'image courbé',       href: '/plv-evenementielle/mur-image-courbe/' },
      { label: 'Poster suspendu',           href: '/plv-evenementielle/poster-suspendu/' },
      { label: 'X-banner',                  href: '/plv-evenementielle/x-banner/' },
      { label: 'Banderole publicitaire',    href: '/plv-evenementielle/banderole-publicitaire/' },
      { label: 'Drapeau publicitaire',      href: '/plv-evenementielle/drapeau-publicitaire/' },
    ]
  },
  {
    slug: 'solutions',
    label: 'Solutions',
    href: '/solutions/',
    children: [
      { label: 'PLV pharmacie',             href: '/solutions/plv-pharmacie/' },
      { label: 'PLV grande distribution',   href: '/solutions/plv-grande-distribution/' },
      { label: 'PLV cosmétique',            href: '/solutions/plv-cosmetique/' },
      { label: 'PLV agroalimentaire',       href: '/solutions/plv-agroalimentaire/' },
      { label: 'PLV écologique',            href: '/solutions/plv-ecologique/' },
      { label: 'PLV salon professionnel',   href: '/solutions/plv-salon-professionnel/' },
      { label: 'PLV responsable',           href: '/solutions/plv-responsable/' },
    ]
  },
]

/** Retrouve un silo par son slug */
export function getSiloBySlug(slug: string): Silo | undefined {
  return silos.find(s => s.slug === slug)
}
