/**
 * mega-menus.ts — Configurations de mega-menus contextuels personnalisés
 * par rubrique. Indexé par slug de rubrique (top-level).
 *
 * Quand un slug a une config ici, le Navbar rend un mega-menu sur 4 colonnes
 * (image + lien d'en-tête + sous-liens) au lieu de l'arbre auto-généré
 * depuis silos.ts. Le 4ᵉ slot peut être un produit du moment / offre spéciale.
 *
 * Les rubriques sans entrée ici utilisent le rendu par défaut (silos.ts).
 */

export interface MegaCol {
  title: string
  href: string
  /** Image d'en-tête de la colonne. Optionnelle : si absente, la colonne est
   *  plus compacte (utile quand on a beaucoup de colonnes, ex. solutions-metiers). */
  image?: string
  imageAlt?: string
  items: { label: string; href: string }[]
}

export interface MegaPromo {
  eyebrow?: string         // petit label au-dessus (ex. "Offre du moment")
  title: string
  text?: string
  image?: string
  imageAlt?: string
  href: string
  ctaLabel: string
}

export interface CustomMegaMenu {
  /** Libellé du gros CTA en haut du panneau (lien vers la page rubrique).
   *  Si absent, fallback "Voir tout : <label rubrique>". */
  pillarCta?: string
  /** Layout de grille :
   *  - "fixed4" (défaut) : 4 colonnes fixes sur 1 ligne (≤4 slots).
   *  - "grid-3x2" : 4 cols × 2 lignes, promo en col 4 sur 2 lignes
   *                  (6 colonnes secteurs + 1 promo, ex. solutions-metiers).
   *  - "auto" : auto-fit (≥190px), utile pour 5+ colonnes sans promo. */
  layout?: 'fixed4' | 'grid-3x2' | 'auto'
  columns: MegaCol[]
  promo?: MegaPromo
}

export const customMegaMenus: Record<string, CustomMegaMenu> = {
  'plv-carton': {
    pillarCta: 'Découvrez notre gamme PLV carton sur mesure',
    columns: [
      {
        title: 'Totem carton',
        href: '/p/totem-carton-sur-mesure/',
        image: '/assets/produits/plv-totem-carton-rectangulaire.jpg',
        imageAlt: 'Totem carton publicitaire personnalisé',
        items: [
          { label: 'Totem elliptique',  href: '/plv-carton/totems/elliptiques/' },
          { label: 'Totem cubes',       href: '/plv-carton/totems/cubes/' },
          { label: 'Totem carré',       href: '/plv-carton/totems/carres/' },
          { label: 'Totem biscotte',    href: '/plv-carton/totems/biscotte/' },
          { label: 'Totem cache borne', href: '/plv-carton/totems/cache-borne/' },
        ],
      },
      {
        title: 'Animation commerciale',
        href: '/plv-carton/animation-commerciale/',
        image: '/assets/produits/comptoir-animation-personnalise-carton.jpg',
        imageAlt: 'Animation commerciale en carton personnalisé',
        items: [
          { label: 'Stand de dégustation', href: '/plv-carton/stands-de-degustation/' },
          { label: 'Urne de jeux concours', href: '/plv-carton/urnes-de-jeux-concours/' },
          { label: 'Poubelle de tri',     href: '/plv-carton/poubelles-de-tri/' },
          { label: 'Panneau de sol',      href: '/plv-carton/panneaux-de-sol/' },
          { label: 'Fronton sur mât',     href: '/plv-carton/frontons-publicitaires/frontons-sur-mat/' },
        ],
      },
      {
        title: 'Théâtralisation magasin & décors',
        href: '/plv-carton/theatralisation-magasin/',
        image: '/assets/produits/arche-plv-theatralisation-ilot.png',
        imageAlt: 'Théâtralisation de magasin en carton',
        items: [
          { label: 'Arche',              href: '/plv-carton/arches/' },
          { label: 'Factice géant',      href: '/plv-carton/factices-geants/' },
          { label: 'Silhouette découpée', href: '/plv-carton/silhouettes-decoupees/' },
          { label: 'Cube carton',        href: '/plv-carton/cubes/' },
          { label: 'Podium',             href: '/plv-carton/podiums/' },
          { label: 'PLV vitrine',        href: '/plv-carton/vitrine/' },
        ],
      },
    ],
    promo: {
      eyebrow: 'Offre du moment',
      title: 'Le produit du moment',
      text: 'Placeholder — à remplacer par votre offre spéciale (visuel, accroche et CTA).',
      image: '/assets/images/no_image.png',
      imageAlt: '',
      href: '/plv-carton/',
      ctaLabel: 'Découvrir',
    },
  },

  'presentoir-comptoir': {
    pillarCta: 'Découvrez nos présentoirs de comptoir sur mesure',
    columns: [
      {
        title: 'Signalétique d’accueil',
        href: '/presentoir-comptoir/signaletique-d-accueil/',
        image: '/assets/images/no_image.png',
        imageAlt: 'Signalétique d’accueil pour comptoir',
        items: [
          { label: 'Totem de comptoir',                  href: '/presentoir-comptoir/totem-de-comptoir/' },
          { label: 'Porte-documents & brochures',        href: '/presentoir-comptoir/porte-document-et-brochures/' },
          { label: 'Panneau chevalet & cavalier de table', href: '/presentoir-comptoir/panneaux-chevalets-et-cavaliers-de-table/' },
          { label: 'Rappel de marque',                   href: '/signaletique-et-lineaire/rappel-de-marque/' },
        ],
      },
      {
        title: 'Valorisation & mise en avant',
        href: '/presentoir-comptoir/valorisation-et-mise-en-avant/',
        image: '/assets/images/no_image.png',
        imageAlt: 'Valorisation produit en magasin',
        items: [
          { label: 'Sabot & stop-pile',          href: '/presentoir-comptoir/sabots-et-stop-piles/' },
          { label: 'Présentoir escalier',        href: '/presentoir-comptoir/presentoirs-escaliers/' },
          { label: 'Présentoir à empreintes',    href: '/presentoir-comptoir/presentoirs-a-empreinte/' },
          { label: 'Glorifier',                  href: '/signaletique-et-lineaire/glorifier/' },
        ],
      },
      {
        title: 'Distribution & merchandising',
        href: '/presentoir-comptoir/distribution-et-merchandising/',
        image: '/assets/images/no_image.png',
        imageAlt: 'Distribution et merchandising',
        items: [
          { label: 'Distributeur & vrac',     href: '/presentoir-comptoir/distributeurs-et-vrac/' },
          { label: 'Prêt à vendre (PAV)',     href: '/presentoir-comptoir/prets-a-vendre/' },
        ],
      },
    ],
    promo: {
      eyebrow: 'Mise en avant',
      title: 'Présentoir comptoir : nos formats les + commandés',
      text: 'Placeholder — à remplacer par votre mise en avant (visuel, accroche et CTA).',
      image: '/assets/images/no_image.png',
      imageAlt: '',
      href: '/presentoir-comptoir/',
      ctaLabel: 'Découvrir',
    },
  },

  'presentoir-sol': {
    pillarCta: 'Découvrez nos présentoirs de sol sur mesure',
    columns: [
      {
        title: 'Gros volume & promo',
        href: '/presentoir-sol/gros-volume-et-promo/',
        image: '/assets/images/no_image.png',
        imageAlt: 'Présentoirs grand volume promotionnels',
        items: [
          { label: 'Box automatique',           href: '/presentoir-sol/box-automatique/' },
          { label: 'Box barquettes empilables', href: '/presentoir-sol/box-barquettes-emplilables/' },
          { label: 'Box canadien',              href: '/presentoir-sol/box-canadiens/' },
          { label: 'Box palette',               href: '/presentoir-sol/box-palettes/' },
        ],
      },
      {
        title: 'Display & présentoirs spécifiques',
        href: '/presentoir-sol/display-et-presentoirs-specifiques/',
        image: '/assets/mega-menu/Display-et-presentoirs-specifiques.webp',
        imageAlt: 'Display et présentoirs spécifiques pour magasin',
        items: [
          { label: 'Présentoir bouteilles', href: '/presentoir-sol/presentoirs-bouteilles/' },
          { label: 'FSDU',                  href: '/presentoir-sol/fsdu/' },
          { label: 'Bac à fouille',         href: '/presentoir-sol/bac-a-fouille/' },
          { label: 'Stèle d’exposition',    href: '/presentoir-sol/stele-d-exposition/' },
        ],
      },
      {
        title: 'Mobilier permanent',
        href: '/presentoir-sol/mobilier-permanent/',
        image: '/assets/images/no_image.png',
        imageAlt: 'Mobilier permanent magasin',
        items: [
          { label: 'Présentoir colonne édition',     href: '/presentoir-sol/presentoirs-colonne-edition/' },
          { label: 'Présentoir bois pour magasin',   href: '/presentoir-sol/presentoir-bois-magasin/' },
          { label: 'Présentoir métal & permanent',   href: '/presentoir-sol/presentoirs-metal-et-permanents/' },
          { label: 'Présentoir plastique & plexiglas', href: '/presentoir-sol/presentoir-plastique-plexiglas/' },
        ],
      },
    ],
    promo: {
      eyebrow: 'Mise en avant',
      title: 'Présentoir sol : nos best-sellers GMS',
      text: 'Placeholder — à remplacer par votre mise en avant (visuel, accroche et CTA).',
      image: '/assets/images/no_image.png',
      imageAlt: '',
      href: '/presentoir-sol/',
      ctaLabel: 'Découvrir',
    },
  },

  'signaletique-et-lineaire': {
    pillarCta: 'Découvrez notre signalétique en magasin',
    columns: [
      {
        title: 'Balisage rayon',
        href: '/signaletique-et-lineaire/balisage-rayon/',
        image: '/assets/images/no_image.png',
        imageAlt: 'Balisage rayon en magasin',
        items: [
          { label: 'Habillage TG',                  href: '/signaletique-et-lineaire/habillage-tete-de-gondole/' },
          { label: 'Fronton & ILV',                 href: '/signaletique-et-lineaire/fronton-et-ilv/' },
          { label: 'Joue de linéaire & descente',   href: '/signaletique-et-lineaire/joue-de-lineaire-et-descente/' },
        ],
      },
      {
        title: 'Promotion & organisation',
        href: '/signaletique-et-lineaire/promotion-et-organisation/',
        image: '/assets/images/no_image.png',
        imageAlt: 'Outils de promotion en rayon',
        items: [
          { label: 'Nez de tablette & plateau',         href: '/signaletique-et-lineaire/nez-de-tablette-et-plateau/' },
          { label: 'Stop-rayon / Wobbler',              href: '/signaletique-et-lineaire/stop-rayon/' },
          { label: 'Tour de prix & contour étiquette',  href: '/signaletique-et-lineaire/tour-de-prix-et-contour-etiquette/' },
          { label: 'Réglette de linéaire',              href: '/signaletique-et-lineaire/reglette-de-lineaire/' },
        ],
      },
      {
        title: 'Décor îlot, palette & sol',
        href: '/signaletique-et-lineaire/decor-ilot-palette-et-sol/',
        image: '/assets/images/no_image.png',
        imageAlt: 'Décor îlot palette et sol',
        items: [
          { label: 'Contour de palette / cache palette', href: '/signaletique-et-lineaire/contour-de-palette/' },
          { label: 'Jupe de palette',                    href: '/signaletique-et-lineaire/jupe-de-palette/' },
          { label: 'Habillage bac frais',                href: '/signaletique-et-lineaire/habillage-bac-frais/' },
          { label: 'Sticker de sol personnalisé',        href: '/signaletique-et-lineaire/adhesif/sticker-de-sol-personnalise/' },
        ],
      },
      {
        title: 'Support imprimés & documents',
        href: '/signaletique-et-lineaire/support-imprimes-et-documents/',
        image: '/assets/images/no_image.png',
        imageAlt: 'Supports imprimés et documents',
        items: [
          { label: 'Print management', href: '/signaletique-et-lineaire/print-management/' },
          { label: 'Bloc coupons',     href: '/signaletique-et-lineaire/print-management/bloc-coupons/' },
          { label: 'Vitrophanie',      href: '/signaletique-et-lineaire/adhesif/vitrophanie/' },
          { label: 'Posters',          href: '/signaletique-et-lineaire/print-management/posters/' },
          { label: 'Brochures',        href: '/signaletique-et-lineaire/print-management/brochures/' },
          { label: 'Dépliants',        href: '/signaletique-et-lineaire/print-management/depliants/' },
        ],
      },
    ],
    // 4 colonnes → pas de promo (panneau déjà bien rempli).
  },

  'stand-evenementiel': {
    pillarCta: 'Découvrez nos stands & supports événementiels',
    columns: [
      {
        title: 'Mobilier & agencement de stand',
        href: '/stand-evenementiel/mobilier-et-agencement/',
        image: '/assets/images/no_image.png',
        imageAlt: 'Mobilier et agencement de stand',
        items: [
          { label: 'Stand parapluie textile & photocall', href: '/stand-evenementiel/stands-parapluie-textile-et-photocall/' },
          { label: 'Mur d’image courbé',                  href: '/stand-evenementiel/murs-image-scourbes/' },
          { label: 'Comptoir d’accueil',                  href: '/stand-evenementiel/comptoirs-accueil/' },
          { label: 'Tente publicitaire',                  href: '/stand-evenementiel/tentes-publicitaires/' },
        ],
      },
      {
        title: 'Signalétique nomade & visibilité',
        href: '/stand-evenementiel/signaletique-nomade-et-visibilite/',
        image: '/assets/images/no_image.png',
        imageAlt: 'Signalétique nomade pour événement',
        items: [
          { label: 'Roll-up & kakémono',                href: '/stand-evenementiel/roll-up-et-kakemonos/' },
          { label: 'Poster suspendu & X-banner',        href: '/stand-evenementiel/posters-suspendus-et-x-banners/' },
          { label: 'Drapeau, oriflamme & beach flag',   href: '/stand-evenementiel/drapeaux-oriflammes-et-beach-flags/' },
          { label: 'Bâche sur mesure & banderole',      href: '/stand-evenementiel/bache-sur-mesure-et-banderoles/' },
          { label: 'Parasol publicitaire',              href: '/stand-evenementiel/parasols-publicitaires/' },
          { label: 'Nappe personnalisée',               href: '/stand-evenementiel/nappes-personnalises/' },
        ],
      },
      {
        title: 'Digital, lumineux & objets pub',
        href: '/stand-evenementiel/digital-lumineux-et-objets-pub/',
        image: '/assets/images/no_image.png',
        imageAlt: 'PLV digitale, lumineuse et objets publicitaires',
        items: [
          { label: 'PLV digitale',         href: '/stand-evenementiel/plv-digitale/' },
          { label: 'Objet publicitaire',   href: '/stand-evenementiel/objets-publicitaires/' },
          { label: 'Borne digitale',       href: '/stand-evenementiel/bornes-digitales/' },
          { label: 'PLV lumineuse',        href: '/stand-evenementiel/plv-lumineuses/' },
          { label: 'PLV écran',            href: '/stand-evenementiel/plv-ecrans/' },
        ],
      },
    ],
    promo: {
      eyebrow: 'Mise en avant',
      title: 'Salon, festival, lancement : on s’occupe de tout',
      text: 'Placeholder — à remplacer par votre mise en avant (visuel, accroche et CTA).',
      image: '/assets/images/no_image.png',
      imageAlt: '',
      href: '/stand-evenementiel/',
      ctaLabel: 'Découvrir',
    },
  },

  'packaging-et-coffrets': {
    pillarCta: 'Découvrez nos packagings & coffrets sur mesure',
    columns: [
      {
        title: 'Démonstration & outils B2B',
        href: '/packaging-et-coffrets/demonstration-et-outils-b2b/',
        image: '/assets/images/no_image.png',
        imageAlt: 'Démonstration et outils B2B',
        items: [
          { label: 'Valise de présentation & démonstration', href: '/packaging-et-coffrets/valises-de-presentation/' },
        ],
      },
      {
        title: 'Conditionnement & retail',
        href: '/packaging-et-coffrets/conditionnement-et-retail/',
        image: '/assets/images/no_image.png',
        imageAlt: 'Emballage personnalisé retail',
        items: [
          { label: 'Emballage personnalisé & cartonnette', href: '/packaging-et-coffrets/emballages-personnalises-et-cartonnettes/' },
        ],
      },
      {
        title: 'Coffrets & écrins personnalisés',
        href: '/packaging-et-coffrets/coffrets-et-ecrins-personnalises/',
        image: '/assets/images/no_image.png',
        imageAlt: 'Coffrets et écrins personnalisés',
        items: [
          { label: 'Coffret carton',                 href: '/packaging-et-coffrets/coffrets-cartons/' },
          { label: 'Étui & fourreau personnalisé',   href: '/packaging-et-coffrets/etuis-et-fourreaux-personnalises/' },
        ],
      },
    ],
    promo: {
      eyebrow: 'Mise en avant',
      title: 'Coffrets premium : édition limitée, séries courtes',
      text: 'Placeholder — à remplacer par votre mise en avant (visuel, accroche et CTA).',
      image: '/assets/images/no_image.png',
      imageAlt: '',
      href: '/packaging-et-coffrets/',
      ctaLabel: 'Découvrir',
    },
  },

  'solutions-metiers': {
    pillarCta: 'Découvrez nos solutions par secteur',
    layout: 'grid-3x2',
    columns: [
      {
        title: 'Pharmacie, Santé & Bien-être',
        href: '/solutions-metiers/pharmacie-sante-bien-etre/',
        items: [
          { label: 'Médicaments', href: '/solutions-metiers/pharmacie-sante-bien-etre/#medicaments' },
          { label: 'Gummies',     href: '/solutions-metiers/pharmacie-sante-bien-etre/#gummies' },
          { label: 'CBD',         href: '/solutions-metiers/pharmacie-sante-bien-etre/#cbd' },
          { label: 'Optique',     href: '/solutions-metiers/pharmacie-sante-bien-etre/#optique' },
        ],
      },
      {
        title: 'Beauté, Cosmétique & Luxe',
        href: '/solutions-metiers/beaute-cosmetique-luxe/',
        items: [
          { label: 'Parfums',     href: '/solutions-metiers/beaute-cosmetique-luxe/#parfums' },
          { label: 'Soins',       href: '/solutions-metiers/beaute-cosmetique-luxe/#soins' },
          { label: 'Maquillage',  href: '/solutions-metiers/beaute-cosmetique-luxe/#maquillage' },
          { label: 'Bijouterie',  href: '/solutions-metiers/beaute-cosmetique-luxe/#bijouterie' },
        ],
      },
      {
        title: 'Agroalimentaire, Épicerie & Terroir',
        href: '/solutions-metiers/agroalimentaire-epicerie-terroir/',
        items: [
          { label: 'GMS',         href: '/solutions-metiers/agroalimentaire-epicerie-terroir/#gms' },
          { label: 'Vin',         href: '/solutions-metiers/agroalimentaire-epicerie-terroir/#vin' },
          { label: 'Boucherie',   href: '/solutions-metiers/agroalimentaire-epicerie-terroir/#boucherie' },
          { label: 'Confiserie',  href: '/solutions-metiers/agroalimentaire-epicerie-terroir/#confiserie' },
          { label: 'Bio',         href: '/solutions-metiers/agroalimentaire-epicerie-terroir/#bio' },
        ],
      },
      {
        title: 'Édition, Culture & Loisirs',
        href: '/solutions-metiers/edition-culture-loisirs/',
        items: [
          { label: 'Librairie',   href: '/solutions-metiers/edition-culture-loisirs/#librairie' },
          { label: 'Presse',      href: '/solutions-metiers/edition-culture-loisirs/#presse' },
          { label: 'Jouets',      href: '/solutions-metiers/edition-culture-loisirs/#jouets' },
          { label: 'Souvenirs',   href: '/solutions-metiers/edition-culture-loisirs/#souvenirs' },
        ],
      },
      {
        title: 'Maison, Jardin & Industrie',
        href: '/solutions-metiers/maison-jardin-industrie/',
        items: [
          { label: 'Bricolage',   href: '/solutions-metiers/maison-jardin-industrie/#bricolage' },
          { label: 'Auto-Moto',   href: '/solutions-metiers/maison-jardin-industrie/#auto-moto' },
          { label: 'Outillage',   href: '/solutions-metiers/maison-jardin-industrie/#outillage' },
          { label: 'Jardinerie',  href: '/solutions-metiers/maison-jardin-industrie/#jardinerie' },
        ],
      },
      {
        title: 'Services, CHR & Institutionnel',
        href: '/solutions-metiers/services-chr-institutionnel/',
        items: [
          { label: 'Banque',      href: '/solutions-metiers/services-chr-institutionnel/#banque' },
          { label: 'Assurance',   href: '/solutions-metiers/services-chr-institutionnel/#assurance' },
          { label: 'Hôtels',      href: '/solutions-metiers/services-chr-institutionnel/#hotels' },
          { label: 'Restaurants', href: '/solutions-metiers/services-chr-institutionnel/#restaurants' },
          { label: 'Franchise',   href: '/solutions-metiers/services-chr-institutionnel/#franchise' },
        ],
      },
    ],
    promo: {
      eyebrow: 'Mise en avant',
      title: 'Une expertise pensée pour votre secteur',
      text: 'Placeholder — à remplacer par votre mise en avant (visuel, accroche et CTA).',
      image: '/assets/images/no_image.png',
      imageAlt: '',
      href: '/solutions-metiers/',
      ctaLabel: 'Découvrir',
    },
  },
}

export function getCustomMega(slug?: string): CustomMegaMenu | undefined {
  if (!slug) return undefined
  return customMegaMenus[slug]
}
