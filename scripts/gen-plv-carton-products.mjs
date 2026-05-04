// Génère les product JSONs pour les produits du silo PLV carton.
// Usage : node scripts/gen-plv-carton-products.mjs
// Idempotent : ne réécrit pas un fichier déjà existant.

import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const OUT_DIR = resolve(process.cwd(), 'src/content/products')
mkdirSync(OUT_DIR, { recursive: true })

// Variantes typiques pour les totems (4 hauteurs)
const TOTEM_VARIANTS_4H = [
  { id: 'h120', label: 'Hauteur 120 cm', price: 79.90 },
  { id: 'h150', label: 'Hauteur 150 cm', price: 99.90 },
  { id: 'h180', label: 'Hauteur 180 cm', price: 119.90, default: true },
  { id: 'h200', label: 'Hauteur 200 cm', price: 139.90 },
]
// Options classiques d'impression
const OPTS_PRINT = [
  { id: 'lamination', label: 'Pelliculage mat anti-rayures', price: 18.00 },
  { id: 'vernis', label: 'Vernis sélectif UV', price: 28.00 },
  { id: 'express', label: 'Délai express (5 jours ouvrés)', price: 35.00 },
]
const OPTS_FLYER = [
  { id: 'porte-flyers', label: 'Porte-flyers A5 intégré', price: 22.00 },
  { id: 'lamination', label: 'Pelliculage mat anti-rayures', price: 18.00 },
  { id: 'express', label: 'Délai express (5 jours ouvrés)', price: 35.00 },
]
const SHIPPING = ['FR', 'BE', 'CH', 'LU']

const products = [
  {
    slug: 'totem-carton',
    name: 'Totem carton',
    short: 'Totem PLV en carton recyclé personnalisable, format vertical 360°. Carton FSC, montage manuel rapide.',
    long: "Totem PLV vertical en carton micro-cannelure, 100% recyclable et certifié FSC. Hauteur configurable de 120 à 200 cm. Surface d'impression sur 4 faces pour une visibilité maximale en GMS, parapharmacie ou animation commerciale. Carton 700 g/m², 100% recyclable. Modèle test pour démonstration Stripe Checkout.",
    image: '/assets/produits/Totem-Carton-600x600-Kontfeel-1.jpg',
    specs: [
      { label: 'Section', value: '30 × 30 cm' },
      { label: 'Matière', value: 'Carton micro-cannelure FSC' },
      { label: 'Impression', value: 'Quadri HD' },
      { label: 'Montage', value: 'Manuel (notice fournie)' },
    ],
    variants: TOTEM_VARIANTS_4H,
    options: OPTS_FLYER,
  },
  {
    slug: 'totem-carton-sur-mesure',
    name: 'Totem carton sur mesure',
    short: 'Totem entièrement personnalisable : forme libre, découpe silhouette, finitions premium. Sur devis affiné après brief.',
    long: 'Totem carton sur mesure — forme libre, découpe silhouette à votre brief créatif, impression offset HD, finitions premium (vernis sélectif UV, pelliculage mat ou brillant). Cette commande lance une consultation : un BAT vous est envoyé sous 48h ouvrées avant production. Modèle test Stripe.',
    image: '/assets/produits/totem-carton-sur-mesure.jpg',
    specs: [
      { label: 'Forme', value: 'Libre, découpée à votre brief' },
      { label: 'Impression', value: 'Offset quadri ou numérique HD' },
      { label: 'Finitions', value: 'Vernis sélectif, pelliculage' },
      { label: 'Délai', value: 'BAT sous 48h, production 10-15j' },
    ],
    variants: [
      { id: 'small', label: 'Petit format (< 150 cm)', price: 189.00 },
      { id: 'medium', label: 'Format standard (150-200 cm)', price: 249.00, default: true },
      { id: 'large', label: 'Grand format (> 200 cm)', price: 349.00 },
    ],
    options: OPTS_PRINT,
  },
  {
    slug: 'totem-carton-3-faces',
    name: 'Totem carton 3 faces',
    short: 'Totem triangulaire à 3 panneaux, visibilité 360° depuis l\'allée centrale. Base auto-verrouillante.',
    long: 'Totem PLV à structure triangulaire, 3 panneaux d\'affichage à 120° pour une visibilité 360° dans une allée centrale ou un cœur de rayon. Base auto-verrouillante stable. Solution privilégiée pour les salons professionnels et les têtes de gondole. Carton FSC. Modèle test Stripe.',
    image: '/assets/produits/Totem-Carton-600x600-Kontfeel-1.jpg',
    specs: [
      { label: 'Faces', value: '3 panneaux à 120°' },
      { label: 'Visibilité', value: '360°' },
      { label: 'Base', value: 'Triangulaire auto-verrouillante' },
      { label: 'Matière', value: 'Carton micro-cannelure FSC' },
    ],
    variants: TOTEM_VARIANTS_4H,
    options: OPTS_PRINT,
  },
  {
    slug: 'totem-carton-4-faces',
    name: 'Totem carton 4 faces',
    short: 'Totem rectangulaire à 4 faces d\'affichage. Idéal pour zones à fort flux et vitrines centrales.',
    long: 'Totem PLV rectangulaire avec 4 faces d\'affichage, conçu pour les zones à fort flux et les vitrines centrales. Carton FSC certifié, structure renforcée double-cannelure. Surface d\'impression maximale, idéal pour les campagnes ambitieuses. Modèle test Stripe.',
    image: '/assets/produits/Totem-Carton-600x600-Kontfeel-1.jpg',
    specs: [
      { label: 'Faces', value: '4 panneaux d\'affichage' },
      { label: 'Forme', value: 'Rectangulaire' },
      { label: 'Matière', value: 'Double-cannelure BC' },
      { label: 'Usage', value: 'Vitrines, allées centrales' },
    ],
    variants: TOTEM_VARIANTS_4H.map(v => ({ ...v, price: v.price + 10 })),
    options: OPTS_PRINT,
  },
  {
    slug: 'totem-carton-grand-format',
    name: 'Totem carton grand format',
    short: 'Totem XXL pour campagnes événementielles ou salons : impact visuel maximal, jusqu\'à 250 cm de haut.',
    long: 'Totem PLV grand format, hauteur jusqu\'à 250 cm. Conçu pour les salons professionnels, les événements de lancement et les campagnes à fort impact visuel. Structure double-cannelure renforcée, base lestée. Modèle test Stripe.',
    image: '/assets/produits/Totem_20carton_20grand_20format.jpg',
    specs: [
      { label: 'Hauteur max', value: '250 cm' },
      { label: 'Matière', value: 'Double-cannelure BC' },
      { label: 'Base', value: 'Lestée renforcée' },
      { label: 'Usage', value: 'Événements, salons' },
    ],
    variants: [
      { id: 'h200', label: 'Hauteur 200 cm', price: 169.00, default: true },
      { id: 'h220', label: 'Hauteur 220 cm', price: 199.00 },
      { id: 'h250', label: 'Hauteur 250 cm', price: 239.00 },
    ],
    options: OPTS_PRINT,
  },
  {
    slug: 'totem-carton-publicitaire',
    name: 'Totem carton publicitaire',
    short: 'Totem publicitaire à montage rapide, format standard ou personnalisé, idéal pour les opérations de communication.',
    long: 'Totem publicitaire en carton, montage rapide pour les opérations de communication ponctuelles. Format standard ou personnalisé selon votre brief. Impression quadri haute définition. Modèle test Stripe.',
    image: '/assets/produits/Totem-Carton-600x600-Kontfeel-1.jpg',
    specs: [
      { label: 'Section', value: '30 × 30 cm' },
      { label: 'Hauteur', value: '120-200 cm' },
      { label: 'Matière', value: 'Carton micro-cannelure FSC' },
      { label: 'Montage', value: 'Manuel rapide' },
    ],
    variants: TOTEM_VARIANTS_4H,
    options: OPTS_FLYER,
  },
  {
    slug: 'totem-carton-pliable',
    name: 'Totem carton pliable',
    short: 'Totem pliable à plat, ultra-compact pour le stockage et le transport. Réutilisable plusieurs fois.',
    long: 'Totem PLV en carton pliable, conçu pour être stocké à plat et déployé rapidement sur le point de vente. Ultra-compact pour le transport, parfait pour les équipes terrain et les déploiements multi-sites. Modèle test Stripe.',
    image: '/assets/produits/Totem-Carton-600x600-Kontfeel-1.jpg',
    specs: [
      { label: 'Stockage', value: 'Plié à plat' },
      { label: 'Déploiement', value: '< 1 min' },
      { label: 'Matière', value: 'Carton micro-cannelure FSC' },
      { label: 'Réutilisable', value: 'Oui (3-5 cycles)' },
    ],
    variants: TOTEM_VARIANTS_4H,
    options: OPTS_FLYER,
  },
  {
    slug: 'totem-carton-biscotte',
    name: 'Totem carton biscotte',
    short: 'Totem compact à face plane large, idéal entrée magasin, comptoir ou îlot. Format économique.',
    long: 'Totem biscotte : face plane rectangulaire large, format compact pour entrée de magasin, comptoir ou îlot. Socle renforcé, porte-flyers + pochette intégrés en option. Solution économique pour les opérations courtes. Modèle test Stripe.',
    image: '/assets/produits/Totem-Carton-600x600-Kontfeel-1.jpg',
    specs: [
      { label: 'Face avant', value: 'Plane large' },
      { label: 'Format', value: 'Compact' },
      { label: 'Usage', value: 'Comptoir, îlot, entrée magasin' },
      { label: 'Matière', value: '100% recyclable' },
    ],
    variants: [
      { id: 'h100', label: 'Hauteur 100 cm', price: 69.90 },
      { id: 'h140', label: 'Hauteur 140 cm', price: 89.90, default: true },
      { id: 'h170', label: 'Hauteur 170 cm', price: 109.90 },
    ],
    options: OPTS_FLYER,
  },
  {
    slug: 'totem-arche',
    name: 'Totem arche',
    short: 'Arche publicitaire en carton recyclé, conçue pour marquer l\'entrée d\'un point de vente ou d\'un événement.',
    long: 'Arche PLV en carton, idéale pour marquer l\'entrée d\'un magasin, d\'un stand ou d\'un événement. Structure renforcée, montage en moins de 10 minutes. Surface d\'impression intégrale recto-verso. Modèle test Stripe.',
    image: '/assets/produits/Totem-Arche-1170x780px-Kontfeel_1.jpg',
    specs: [
      { label: 'Largeur', value: '180 à 250 cm' },
      { label: 'Hauteur', value: '220 cm' },
      { label: 'Matière', value: 'Double-cannelure BC' },
      { label: 'Montage', value: '~10 minutes' },
    ],
    variants: [
      { id: 'l180', label: 'Largeur 180 cm', price: 219.00, default: true },
      { id: 'l220', label: 'Largeur 220 cm', price: 269.00 },
      { id: 'l250', label: 'Largeur 250 cm', price: 309.00 },
    ],
    options: OPTS_PRINT,
  },
  {
    slug: 'totem-cube',
    name: 'Totem cube',
    short: 'Cube vertical empilable, modulable selon le rendu visuel souhaité. 6 faces personnalisables.',
    long: 'Totem cube empilable, modulable selon vos besoins de visibilité. 6 faces personnalisables, structure auto-portante en carton micro-cannelure. Idéal pour théâtraliser un point de vente ou un stand. Modèle test Stripe.',
    image: '/assets/produits/Totem-Cube-1170x780-Kontfeel_1.jpg',
    specs: [
      { label: 'Faces', value: '6 personnalisables' },
      { label: 'Empilable', value: 'Oui' },
      { label: 'Matière', value: 'Carton micro-cannelure FSC' },
      { label: 'Format', value: '40, 50 ou 60 cm de côté' },
    ],
    variants: [
      { id: 'c40', label: '40 × 40 × 40 cm', price: 49.90 },
      { id: 'c50', label: '50 × 50 × 50 cm', price: 69.90, default: true },
      { id: 'c60', label: '60 × 60 × 60 cm', price: 89.90 },
    ],
    options: OPTS_PRINT,
  },
  {
    slug: 'triptyque-carton',
    name: 'Triptyque carton',
    short: 'Triptyque 3 panneaux personnalisables, idéal pour comptoir, salon professionnel ou réunion d\'équipe.',
    long: 'Triptyque en carton, 3 panneaux personnalisables. Format compact, posé sur table ou comptoir. Idéal pour les salons professionnels, les présentations équipe ou les opérations comptoir. Modèle test Stripe.',
    image: '/assets/produits/Totem-Carton-600x600-Kontfeel-1.jpg',
    specs: [
      { label: 'Panneaux', value: '3 personnalisables' },
      { label: 'Format', value: 'A4, A3 ou A2' },
      { label: 'Matière', value: 'Carton micro-cannelure' },
      { label: 'Usage', value: 'Comptoir, salon, table' },
    ],
    variants: [
      { id: 'a4', label: 'Format A4 (3 × 21x30 cm)', price: 24.90 },
      { id: 'a3', label: 'Format A3 (3 × 30x42 cm)', price: 39.90, default: true },
      { id: 'a2', label: 'Format A2 (3 × 42x60 cm)', price: 59.90 },
    ],
    options: OPTS_PRINT,
  },
  {
    slug: 'presentoir-de-sol-carton',
    name: 'Présentoir de sol carton',
    short: 'Présentoir de sol robuste en carton double-cannelure, capacité d\'emport 30 à 80 produits selon format.',
    long: 'Présentoir de sol en carton double-cannelure, structure renforcée pour supporter le poids des produits. Capacité d\'emport variable (30 à 80 unités selon format). Idéal pour mettre en avant un produit phare ou une nouveauté en GMS. Modèle test Stripe.',
    image: '/assets/produits/Presentoir_20de_20sol_20en_20carton_20pour_20magasin.jpg',
    specs: [
      { label: 'Matière', value: 'Double-cannelure BC' },
      { label: 'Capacité', value: '30 à 80 produits' },
      { label: 'Hauteur', value: '140-180 cm' },
      { label: 'Niveaux', value: '3 à 5 selon format' },
    ],
    variants: [
      { id: 'p3n', label: '3 niveaux — 30 produits', price: 129.00 },
      { id: 'p4n', label: '4 niveaux — 50 produits', price: 169.00, default: true },
      { id: 'p5n', label: '5 niveaux — 80 produits', price: 219.00 },
    ],
    options: OPTS_PRINT,
  },
  {
    slug: 'cube-carton',
    name: 'Cube carton',
    short: 'Cube décoratif ou support PLV, modulable et empilable. 6 faces d\'impression personnalisées.',
    long: 'Cube en carton recyclé, utilisable comme support décoratif ou élément PLV modulaire. 6 faces personnalisables avec impression quadri. Empilable pour créer des compositions visuelles. Modèle test Stripe.',
    image: '/assets/produits/Cube-1170x780px-Kontfeel_1.jpg',
    specs: [
      { label: 'Format', value: '30, 40 ou 50 cm' },
      { label: 'Faces', value: '6 personnalisables' },
      { label: 'Matière', value: 'Carton micro-cannelure FSC' },
      { label: 'Empilable', value: 'Oui' },
    ],
    variants: [
      { id: 'c30', label: '30 × 30 × 30 cm', price: 29.90 },
      { id: 'c40', label: '40 × 40 × 40 cm', price: 44.90, default: true },
      { id: 'c50', label: '50 × 50 × 50 cm', price: 64.90 },
    ],
    options: [
      { id: 'lamination', label: 'Pelliculage mat anti-rayures', price: 14.00 },
      { id: 'express', label: 'Délai express (5 jours ouvrés)', price: 25.00 },
    ],
  },
  {
    slug: 'podium-carton',
    name: 'Podium carton',
    short: 'Podium PLV en carton renforcé, 1 à 3 marches, surface d\'exposition pour produit phare.',
    long: 'Podium en carton double-cannelure, 1 à 3 marches selon format. Surface d\'exposition pour mettre en avant un produit phare. Idéal pour les lancements et les événements de marque. Modèle test Stripe.',
    image: '/assets/produits/Podium-Carton-1170x780px-Kontfeel_1.jpg',
    specs: [
      { label: 'Marches', value: '1 à 3' },
      { label: 'Matière', value: 'Double-cannelure BC' },
      { label: 'Charge max', value: '15 à 30 kg' },
      { label: 'Usage', value: 'Lancement, exposition produit' },
    ],
    variants: [
      { id: 'p1', label: '1 marche — 80×80 cm', price: 79.00 },
      { id: 'p2', label: '2 marches — 100×100 cm', price: 119.00, default: true },
      { id: 'p3', label: '3 marches — 120×120 cm', price: 169.00 },
    ],
    options: OPTS_PRINT,
  },
  {
    slug: 'urne-en-carton',
    name: 'Urne en carton',
    short: 'Urne personnalisable pour jeu concours, tirage au sort ou collecte de coordonnées en point de vente.',
    long: 'Urne en carton recyclé, parfaite pour jeu concours, tirage au sort ou collecte de coordonnées. Fente de dépôt sur le dessus, ouverture sécurisée par bande adhésive. Personnalisation 4 faces. Modèle test Stripe.',
    image: '/assets/produits/urne-en-carton-personnalise.jpg',
    specs: [
      { label: 'Format', value: '30 × 30 × 50 cm' },
      { label: 'Fente', value: 'Sur le dessus' },
      { label: 'Faces personnalisables', value: '4' },
      { label: 'Matière', value: 'Carton recyclé' },
    ],
    variants: [
      { id: 's', label: 'Petite (25×25×40 cm)', price: 24.90 },
      { id: 'm', label: 'Standard (30×30×50 cm)', price: 34.90, default: true },
      { id: 'l', label: 'Grande (40×40×60 cm)', price: 49.90 },
    ],
    options: [
      { id: 'lamination', label: 'Pelliculage mat anti-rayures', price: 12.00 },
      { id: 'express', label: 'Délai express (5 jours ouvrés)', price: 20.00 },
    ],
  },
  {
    slug: 'silhouette-decoupee',
    name: 'Silhouette découpée',
    short: 'Silhouette grandeur nature découpée à la forme de votre choix : personnage, mascotte, produit.',
    long: 'Silhouette découpée à votre brief : personnage, mascotte de marque, produit grandeur nature. Carton double-cannelure renforcé, support arrière intégré. Effet waouh garanti pour les lancements et les vitrines. BAT sous 48h. Modèle test Stripe.',
    image: '/assets/produits/Silhouette-Decoupee-600x600px-Kontfeel.jpg',
    specs: [
      { label: 'Forme', value: 'Découpe libre à votre brief' },
      { label: 'Hauteur', value: 'Jusqu\'à 200 cm' },
      { label: 'Matière', value: 'Double-cannelure BC' },
      { label: 'Délai', value: 'BAT sous 48h, prod 10-15j' },
    ],
    variants: [
      { id: 'small', label: 'Petite (< 120 cm)', price: 119.00 },
      { id: 'medium', label: 'Standard (120-180 cm)', price: 169.00, default: true },
      { id: 'large', label: 'Grande (180-200 cm)', price: 229.00 },
    ],
    options: OPTS_PRINT,
  },
  {
    slug: 'plv-vitrine',
    name: 'PLV vitrine carton',
    short: 'PLV pour vitrine de magasin : visuel d\'impact, impression recto-verso, fixation par adhésifs.',
    long: 'PLV vitrine en carton léger, conçue pour habiller une vitrine de magasin. Impression recto-verso haute définition. Fixation par adhésifs repositionnables fournis. Idéal pour les opérations saisonnières. Modèle test Stripe.',
    image: '/assets/produits/PLV_20vitrine_20pharmacie.jpg',
    specs: [
      { label: 'Format', value: 'A2, A1 ou sur mesure' },
      { label: 'Impression', value: 'Recto-verso quadri' },
      { label: 'Fixation', value: 'Adhésifs repositionnables' },
      { label: 'Matière', value: 'Carton léger 350 g/m²' },
    ],
    variants: [
      { id: 'a2', label: 'Format A2 (42×60 cm)', price: 22.00 },
      { id: 'a1', label: 'Format A1 (60×84 cm)', price: 39.00, default: true },
      { id: 'sm', label: 'Format sur mesure', price: 89.00 },
    ],
    options: [
      { id: 'lamination', label: 'Pelliculage mat anti-rayures', price: 9.00 },
      { id: 'vernis', label: 'Vernis sélectif UV', price: 19.00 },
      { id: 'express', label: 'Délai express (5 jours ouvrés)', price: 22.00 },
    ],
  },
  {
    slug: 'poubelle-carton',
    name: 'Poubelle carton',
    short: 'Poubelle PLV personnalisable, idéale pour les événements et animations en point de vente.',
    long: 'Poubelle en carton recyclé, personnalisable sur 4 faces. Capacité 50 ou 80 L. Idéale pour les événements, animations commerciales et opérations zéro déchet. Recyclable 100%. Modèle test Stripe.',
    image: '/assets/produits/Box_20poubelle_20carton_20recyclable.jpg',
    specs: [
      { label: 'Capacité', value: '50 ou 80 L' },
      { label: 'Faces personnalisables', value: '4' },
      { label: 'Matière', value: 'Carton recyclé 100%' },
      { label: 'Usage', value: 'Événements, animations, salons' },
    ],
    variants: [
      { id: 'l50', label: '50 L', price: 29.90, default: true },
      { id: 'l80', label: '80 L', price: 44.90 },
    ],
    options: [
      { id: 'lamination', label: 'Pelliculage anti-humidité', price: 12.00 },
      { id: 'express', label: 'Délai express (5 jours ouvrés)', price: 18.00 },
    ],
  },
]

let created = 0
let skipped = 0
for (const p of products) {
  const filePath = resolve(OUT_DIR, `${p.slug}.json`)
  if (existsSync(filePath)) {
    skipped++
    continue
  }
  const data = {
    name: p.name,
    shortDescription: p.short,
    description: p.long,
    price: p.variants?.find(v => v.default)?.price ?? p.variants?.[0]?.price ?? 0,
    currency: 'eur',
    image: p.image,
    imageAlt: `${p.name} — Kontfeel`,
    specs: p.specs,
    variants: p.variants,
    options: p.options,
    shippingCountries: SHIPPING,
    active: true,
  }
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  created++
}

console.log(`✓ ${created} produit(s) créé(s), ${skipped} ignoré(s) (déjà existants).`)
