/**
 * silos.ts — Arborescence du site (source de vérité du routage et du menu).
 *
 * ⚠️  GÉNÉRÉ par scripts/gen-arbo-2026.mjs — ne pas éditer à la main :
 *     modifier l'arbre dans le script puis relancer `node scripts/gen-arbo-2026.mjs`.
 *
 * Arbre récursif jusqu'à 3 niveaux : rubrique › catégorie › sous-catégorie.
 * `href` = chemin absolu complet avec slash final (mode statique Astro).
 */

export interface SiloNode {
  slug: string
  label: string
  href: string
  children?: SiloNode[]
}

export const silos: SiloNode[] = [
  {
    "slug": "plv-carton",
    "label": "PLV carton",
    "href": "/plv-carton/",
    "children": [
      {
        "slug": "totems",
        "label": "Totems carton",
        "href": "/plv-carton/totems/",
        "children": [
          {
            "slug": "elliptiques",
            "label": "Totems elliptiques",
            "href": "/plv-carton/totems/elliptiques/"
          },
          {
            "slug": "cubes",
            "label": "Totems cubes",
            "href": "/plv-carton/totems/cubes/"
          },
          {
            "slug": "triptyques",
            "label": "Totems triptyques",
            "href": "/plv-carton/totems/triptyques/"
          },
          {
            "slug": "carres",
            "label": "Totems carrés",
            "href": "/plv-carton/totems/carres/"
          }
        ]
      },
      {
        "slug": "arches",
        "label": "Arches carton",
        "href": "/plv-carton/arches/"
      },
      {
        "slug": "cubes",
        "label": "Cubes carton",
        "href": "/plv-carton/cubes/"
      },
      {
        "slug": "podiums",
        "label": "Podiums carton",
        "href": "/plv-carton/podiums/"
      },
      {
        "slug": "urnes-de-jeux-concours",
        "label": "Urnes de jeux-concours",
        "href": "/plv-carton/urnes-de-jeux-concours/"
      },
      {
        "slug": "silhouettes-decoupees",
        "label": "Silhouettes découpées",
        "href": "/plv-carton/silhouettes-decoupees/"
      },
      {
        "slug": "vitrine",
        "label": "PLV vitrine",
        "href": "/plv-carton/vitrine/"
      },
      {
        "slug": "poubelles-de-tri",
        "label": "Poubelles de tri",
        "href": "/plv-carton/poubelles-de-tri/"
      },
      {
        "slug": "panneaux-de-sol",
        "label": "Panneaux de sol",
        "href": "/plv-carton/panneaux-de-sol/"
      },
      {
        "slug": "stands-de-degustation",
        "label": "Stands de dégustation",
        "href": "/plv-carton/stands-de-degustation/"
      },
      {
        "slug": "factices-geants",
        "label": "Factices géants",
        "href": "/plv-carton/factices-geants/"
      },
      {
        "slug": "frontons-publicitaires",
        "label": "Frontons publicitaires",
        "href": "/plv-carton/frontons-publicitaires/",
        "children": [
          {
            "slug": "tetes-de-gondoles",
            "label": "Têtes de gondoles",
            "href": "/plv-carton/frontons-publicitaires/tetes-de-gondoles/"
          },
          {
            "slug": "frontons-sur-mat",
            "label": "Frontons sur mât",
            "href": "/plv-carton/frontons-publicitaires/frontons-sur-mat/"
          }
        ]
      }
    ]
  },
  {
    "slug": "presentoir-comptoir",
    "label": "Présentoir comptoir",
    "href": "/presentoir-comptoir/",
    "children": [
      {
        "slug": "totem-de-comptoir",
        "label": "Totem de comptoir",
        "href": "/presentoir-comptoir/totem-de-comptoir/"
      },
      {
        "slug": "porte-document-et-brochures",
        "label": "Porte-document et brochures",
        "href": "/presentoir-comptoir/porte-document-et-brochures/"
      },
      {
        "slug": "panneaux-chevalets-et-cavaliers-de-table",
        "label": "Panneaux chevalets et cavaliers de table",
        "href": "/presentoir-comptoir/panneaux-chevalets-et-cavaliers-de-table/"
      },
      {
        "slug": "distributeurs-et-vrac",
        "label": "Distributeurs et vrac",
        "href": "/presentoir-comptoir/distributeurs-et-vrac/"
      },
      {
        "slug": "sabots-et-stop-piles",
        "label": "Sabots et stop-piles",
        "href": "/presentoir-comptoir/sabots-et-stop-piles/"
      },
      {
        "slug": "prets-a-vendre",
        "label": "Prêts à vendre",
        "href": "/presentoir-comptoir/prets-a-vendre/"
      },
      {
        "slug": "presentoirs-escaliers",
        "label": "Présentoirs escaliers",
        "href": "/presentoir-comptoir/presentoirs-escaliers/"
      },
      {
        "slug": "presentoirs-a-empreinte",
        "label": "Présentoirs à empreinte",
        "href": "/presentoir-comptoir/presentoirs-a-empreinte/"
      }
    ]
  },
  {
    "slug": "presentoir-sol",
    "label": "Présentoir sol",
    "href": "/presentoir-sol/",
    "children": [
      {
        "slug": "bac-a-fouille",
        "label": "Bac à fouille",
        "href": "/presentoir-sol/bac-a-fouille/"
      },
      {
        "slug": "box-automatique",
        "label": "Box automatique",
        "href": "/presentoir-sol/box-automatique/"
      },
      {
        "slug": "box-barquettes-emplilables",
        "label": "Box barquettes empilables",
        "href": "/presentoir-sol/box-barquettes-emplilables/"
      },
      {
        "slug": "box-canadiens",
        "label": "Box canadiens",
        "href": "/presentoir-sol/box-canadiens/"
      },
      {
        "slug": "box-palettes",
        "label": "Box palettes",
        "href": "/presentoir-sol/box-palettes/",
        "children": [
          {
            "slug": "box-quart-de-palette",
            "label": "Box quart de palette",
            "href": "/presentoir-sol/box-palettes/box-quart-de-palette/"
          },
          {
            "slug": "box-demi-de-palette",
            "label": "Box demi-palette",
            "href": "/presentoir-sol/box-palettes/box-demi-de-palette/"
          }
        ]
      },
      {
        "slug": "presentoirs-bouteilles",
        "label": "Présentoirs bouteilles",
        "href": "/presentoir-sol/presentoirs-bouteilles/"
      },
      {
        "slug": "presentoirs-colonne-edition",
        "label": "Présentoirs colonne édition",
        "href": "/presentoir-sol/presentoirs-colonne-edition/"
      },
      {
        "slug": "presentoirs-metal-et-permanents",
        "label": "Présentoirs métal et permanents",
        "href": "/presentoir-sol/presentoirs-metal-et-permanents/",
        "children": [
          {
            "slug": "presentoirs-roulettes",
            "label": "Présentoirs à roulettes",
            "href": "/presentoir-sol/presentoirs-metal-et-permanents/presentoirs-roulettes/"
          }
        ]
      },
      {
        "slug": "presentoir-bois-magasin",
        "label": "Présentoir bois magasin",
        "href": "/presentoir-sol/presentoir-bois-magasin/"
      },
      {
        "slug": "presentoir-plastique-plexiglas",
        "label": "Présentoir plastique / plexiglas",
        "href": "/presentoir-sol/presentoir-plastique-plexiglas/"
      },
      {
        "slug": "fsdu",
        "label": "FSDU",
        "href": "/presentoir-sol/fsdu/"
      }
    ]
  },
  {
    "slug": "signaletique-et-lineaire",
    "label": "Signalétique et linéaire",
    "href": "/signaletique-et-lineaire/",
    "children": [
      {
        "slug": "rappel-de-marque",
        "label": "Rappel de marque",
        "href": "/signaletique-et-lineaire/rappel-de-marque/"
      },
      {
        "slug": "stop-trottoir",
        "label": "Stop-trottoir",
        "href": "/signaletique-et-lineaire/stop-trottoir/"
      },
      {
        "slug": "fronton-et-ilv",
        "label": "Fronton et ILV",
        "href": "/signaletique-et-lineaire/fronton-et-ilv/"
      },
      {
        "slug": "nez-de-tablette-et-plateau",
        "label": "Nez de tablette et plateau",
        "href": "/signaletique-et-lineaire/nez-de-tablette-et-plateau/"
      },
      {
        "slug": "joue-de-lineaire-et-descente",
        "label": "Joue de linéaire et descente",
        "href": "/signaletique-et-lineaire/joue-de-lineaire-et-descente/"
      },
      {
        "slug": "tour-de-prix-et-contour-etiquette",
        "label": "Tour de prix et contour étiquette",
        "href": "/signaletique-et-lineaire/tour-de-prix-et-contour-etiquette/"
      },
      {
        "slug": "reglette-de-lineaire",
        "label": "Réglette de linéaire",
        "href": "/signaletique-et-lineaire/reglette-de-lineaire/"
      },
      {
        "slug": "habillage-tete-de-gondole",
        "label": "Habillage tête de gondole",
        "href": "/signaletique-et-lineaire/habillage-tete-de-gondole/"
      },
      {
        "slug": "contour-de-palette",
        "label": "Contour de palette",
        "href": "/signaletique-et-lineaire/contour-de-palette/"
      },
      {
        "slug": "jupe-de-palette",
        "label": "Jupe de palette",
        "href": "/signaletique-et-lineaire/jupe-de-palette/",
        "children": [
          {
            "slug": "ondule",
            "label": "Jupe ondulée",
            "href": "/signaletique-et-lineaire/jupe-de-palette/ondule/"
          },
          {
            "slug": "intisse",
            "label": "Jupe intissé",
            "href": "/signaletique-et-lineaire/jupe-de-palette/intisse/"
          }
        ]
      },
      {
        "slug": "stop-rayon",
        "label": "Stop-rayon",
        "href": "/signaletique-et-lineaire/stop-rayon/",
        "children": [
          {
            "slug": "wobller",
            "label": "Wobbler",
            "href": "/signaletique-et-lineaire/stop-rayon/wobller/"
          }
        ]
      },
      {
        "slug": "adhesif",
        "label": "Adhésif",
        "href": "/signaletique-et-lineaire/adhesif/",
        "children": [
          {
            "slug": "sticker-vitrine",
            "label": "Sticker vitrine",
            "href": "/signaletique-et-lineaire/adhesif/sticker-vitrine/"
          },
          {
            "slug": "sticker-de-sol-personnalise",
            "label": "Sticker de sol personnalisé",
            "href": "/signaletique-et-lineaire/adhesif/sticker-de-sol-personnalise/"
          },
          {
            "slug": "vitrophanie",
            "label": "Vitrophanie",
            "href": "/signaletique-et-lineaire/adhesif/vitrophanie/"
          }
        ]
      },
      {
        "slug": "print-management",
        "label": "Print management",
        "href": "/signaletique-et-lineaire/print-management/",
        "children": [
          {
            "slug": "bloc-coupons",
            "label": "Bloc coupons",
            "href": "/signaletique-et-lineaire/print-management/bloc-coupons/"
          },
          {
            "slug": "depliants",
            "label": "Dépliants",
            "href": "/signaletique-et-lineaire/print-management/depliants/"
          },
          {
            "slug": "posters",
            "label": "Posters",
            "href": "/signaletique-et-lineaire/print-management/posters/"
          },
          {
            "slug": "brochures",
            "label": "Brochures",
            "href": "/signaletique-et-lineaire/print-management/brochures/"
          }
        ]
      },
      {
        "slug": "theatralisation-magasin",
        "label": "Théâtralisation magasin",
        "href": "/signaletique-et-lineaire/theatralisation-magasin/"
      },
      {
        "slug": "animations-commerciales",
        "label": "Animations commerciales",
        "href": "/signaletique-et-lineaire/animations-commerciales/"
      },
      {
        "slug": "impression-grand-format",
        "label": "Impression grand format",
        "href": "/signaletique-et-lineaire/impression-grand-format/"
      },
      {
        "slug": "glorifier",
        "label": "Glorifier",
        "href": "/signaletique-et-lineaire/glorifier/"
      },
      {
        "slug": "habillage-bac-frais",
        "label": "Habillage bac frais",
        "href": "/signaletique-et-lineaire/habillage-bac-frais/"
      }
    ]
  },
  {
    "slug": "stand-evenementiel",
    "label": "Stand événementiel",
    "href": "/stand-evenementiel/",
    "children": [
      {
        "slug": "stands-parapluie-textile-et-photocall",
        "label": "Stands parapluie, textile et photocall",
        "href": "/stand-evenementiel/stands-parapluie-textile-et-photocall/"
      },
      {
        "slug": "tentes-publicitaires",
        "label": "Tentes publicitaires",
        "href": "/stand-evenementiel/tentes-publicitaires/"
      },
      {
        "slug": "roll-up-et-kakemonos",
        "label": "Roll-up et kakémonos",
        "href": "/stand-evenementiel/roll-up-et-kakemonos/"
      },
      {
        "slug": "murs-image-scourbes",
        "label": "Murs d'image courbés",
        "href": "/stand-evenementiel/murs-image-scourbes/"
      },
      {
        "slug": "posters-suspendus-et-x-banners",
        "label": "Posters suspendus et X-banners",
        "href": "/stand-evenementiel/posters-suspendus-et-x-banners/"
      },
      {
        "slug": "drapeaux-oriflammes-et-beach-flags",
        "label": "Drapeaux, oriflammes et beach flags",
        "href": "/stand-evenementiel/drapeaux-oriflammes-et-beach-flags/"
      },
      {
        "slug": "bache-sur-mesure-et-banderoles",
        "label": "Bâche sur mesure et banderoles",
        "href": "/stand-evenementiel/bache-sur-mesure-et-banderoles/"
      },
      {
        "slug": "parasols-publicitaires",
        "label": "Parasols publicitaires",
        "href": "/stand-evenementiel/parasols-publicitaires/"
      },
      {
        "slug": "nappes-personnalises",
        "label": "Nappes personnalisées",
        "href": "/stand-evenementiel/nappes-personnalises/"
      },
      {
        "slug": "comptoirs-accueil",
        "label": "Comptoirs d'accueil",
        "href": "/stand-evenementiel/comptoirs-accueil/"
      },
      {
        "slug": "plv-digitale",
        "label": "PLV digitale",
        "href": "/stand-evenementiel/plv-digitale/"
      },
      {
        "slug": "objets-publicitaires",
        "label": "Objets publicitaires",
        "href": "/stand-evenementiel/objets-publicitaires/",
        "children": [
          {
            "slug": "objets-recycles",
            "label": "Objets recyclés",
            "href": "/stand-evenementiel/objets-publicitaires/objets-recycles/"
          }
        ]
      },
      {
        "slug": "bornes-digitales",
        "label": "Bornes digitales",
        "href": "/stand-evenementiel/bornes-digitales/",
        "children": [
          {
            "slug": "bornes-de-jeu",
            "label": "Bornes de jeu",
            "href": "/stand-evenementiel/bornes-digitales/bornes-de-jeu/"
          }
        ]
      },
      {
        "slug": "plv-lumineuses",
        "label": "PLV lumineuses",
        "href": "/stand-evenementiel/plv-lumineuses/",
        "children": [
          {
            "slug": "cadre-lumineux",
            "label": "Cadre lumineux",
            "href": "/stand-evenementiel/plv-lumineuses/cadre-lumineux/"
          }
        ]
      },
      {
        "slug": "plv-ecrans",
        "label": "PLV écrans",
        "href": "/stand-evenementiel/plv-ecrans/",
        "children": [
          {
            "slug": "rollups",
            "label": "Roll-ups écran",
            "href": "/stand-evenementiel/plv-ecrans/rollups/"
          },
          {
            "slug": "totems",
            "label": "Totems écran",
            "href": "/stand-evenementiel/plv-ecrans/totems/"
          }
        ]
      }
    ]
  },
  {
    "slug": "packaging-et-coffrets",
    "label": "Packaging et coffrets",
    "href": "/packaging-et-coffrets/",
    "children": [
      {
        "slug": "valises-de-presentation",
        "label": "Valises de présentation",
        "href": "/packaging-et-coffrets/valises-de-presentation/"
      },
      {
        "slug": "emballages-personnalises-et-cartonnettes",
        "label": "Emballages personnalisés et cartonnettes",
        "href": "/packaging-et-coffrets/emballages-personnalises-et-cartonnettes/"
      },
      {
        "slug": "coffrets-cartons",
        "label": "Coffrets cartons",
        "href": "/packaging-et-coffrets/coffrets-cartons/"
      },
      {
        "slug": "etuis-et-fourreaux-personnalises",
        "label": "Étuis et fourreaux personnalisés",
        "href": "/packaging-et-coffrets/etuis-et-fourreaux-personnalises/"
      }
    ]
  }
]

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
