# Architecture SEO — Cocon sémantique Kontfeel.fr

**Version :** 1.0 — 7 avril 2026
**Méthodologie :** Siloing strict (Bourrelly / Blasco)
**Statut :** En attente de validation avant implémentation

---

## 1. Principes directeurs

### 1.1 Règle d'étanchéité des silos

Chaque silo est un univers thématique autonome. Le maillage interne respecte ces règles :

- **Intra-silo uniquement** : une page enfant ne lie que vers sa page pilier et vers les autres pages enfants de son propre silo.
- **Page pilier ↔ pages enfants** : la page pilier pointe vers toutes ses pages enfants ; chaque page enfant pointe vers la page pilier.
- **Liens entre pages enfants du même silo** : autorisés et recommandés (maillage horizontal frère-à-frère) pour renforcer la cohérence sémantique.
- **Inter-silo interdit** : aucun lien dans le contenu éditorial d'un silo vers une page d'un autre silo.
- **Exceptions contrôlées** : seuls le footer (liens vers pages piliers uniquement) et la page d'accueil (hub universel vers les pages piliers) créent des ponts inter-silos.

### 1.2 Navigation contextuelle

Le menu principal n'est **pas** un méga-menu global. Il fonctionne ainsi :

- **Sur la page d'accueil** : le menu affiche les 6 liens vers les pages piliers de chaque silo.
- **Sur une page d'un silo donné** : le menu n'affiche que les pages enfants de ce silo + un lien retour vers l'accueil. Les autres silos ne sont pas visibles dans la navigation principale.
- **Objectif** : concentrer le jus de lien intra-silo et éviter la dilution vers des pages non pertinentes sémantiquement.

### 1.3 Structure des URLs

```
/                                     → Accueil (hub universel)
/plv-carton/                          → Pilier Silo 1
/plv-carton/totem-carton/             → Enfant Silo 1
/presentoirs/                         → Pilier Silo 2
/presentoirs/presentoir-comptoir/     → Enfant Silo 2
...
```

Chaque silo = un dossier Astro dans `src/pages/[silo]/`. La page `index.astro` de chaque dossier est la page pilier.

---

## 2. Arborescence détaillée des 6 silos

### Silo 1 : PLV carton

**Page pilier** : `/plv-carton/` — *PLV carton : présentoirs, totems et supports sur mesure en carton*

| Catégorie | Pages enfants | URL |
|-----------|--------------|-----|
| Totems | Totem carton | `/plv-carton/totem-carton/` |
| | Totem arche | `/plv-carton/totem-arche/` |
| | Totem cube | `/plv-carton/totem-cube/` |
| | Triptyque carton | `/plv-carton/triptyque-carton/` |
| | Présentoir de sol carton | `/plv-carton/presentoir-de-sol-carton/` |
| Structures | Cube carton | `/plv-carton/cube-carton/` |
| | Podium carton | `/plv-carton/podium-carton/` |
| | Urne en carton | `/plv-carton/urne-en-carton/` |
| Décoration | Silhouette découpée | `/plv-carton/silhouette-decoupee/` |
| | PLV vitrine carton | `/plv-carton/plv-vitrine/` |
| | Poubelle carton | `/plv-carton/poubelle-carton/` |

**Maillage autorisé :** Toutes ces pages lient entre elles et vers `/plv-carton/`. Aucun lien vers `/presentoirs/`, `/signaletique/`, etc.

---

### Silo 2 : Présentoirs

**Page pilier** : `/presentoirs/` — *Présentoirs PLV : comptoir, sol, mural et plastique sur mesure*

| Catégorie | Pages enfants | URL |
|-----------|--------------|-----|
| Présentoirs comptoir | Stop pile | `/presentoirs/stop-pile/` |
| | Présentoir distributeur | `/presentoirs/presentoir-distributeur/` |
| | Présentoir rempli | `/presentoirs/presentoir-rempli/` |
| | PLV à poser | `/presentoirs/plv-a-poser/` |
| | Sabot de comptoir | `/presentoirs/sabot-de-comptoir/` |
| | Cavalier de table | `/presentoirs/cavalier-de-table/` |
| | Porte-documents | `/presentoirs/porte-documents/` |
| | Panneau chevalet | `/presentoirs/panneau-chevalet/` |
| | Porte-affiche | `/presentoirs/porte-affiche/` |
| Présentoirs sol | Bac à fouille | `/presentoirs/bac-a-fouille/` |
| | Box autoportant | `/presentoirs/box-autoportant/` |
| | Bacs barquettes | `/presentoirs/bacs-barquettes/` |
| | Box conteneur | `/presentoirs/box-conteneur/` |
| | FSDU | `/presentoirs/fsdu/` |
| | Présentoir colonne | `/presentoirs/presentoir-colonne/` |
| | Îlot | `/presentoirs/ilot/` |
| | Présentoir bouteilles | `/presentoirs/presentoir-bouteilles/` |
| | Présentoir pharmacie | `/presentoirs/presentoir-pharmacie/` |
| | Présentoir cosmétique | `/presentoirs/presentoir-cosmetique/` |
| | Présentoir édition | `/presentoirs/presentoir-edition/` |
| Présentoirs mural | Présentoir book | `/presentoirs/presentoir-book/` |
| | Présentoir plastique | `/presentoirs/presentoir-plastique/` |

**Maillage autorisé :** Toutes ces pages lient entre elles et vers `/presentoirs/`. Aucun lien vers `/plv-carton/`, `/signaletique/`, etc.

---

### Silo 3 : Signalétique

**Page pilier** : `/signaletique/` — *Signalétique PLV : habillages de rayon, stickers et balisage en point de vente*

| Catégorie | Pages enfants | URL |
|-----------|--------------|-----|
| PLV rayon | Stop rayon | `/signaletique/stop-rayon/` |
| | Tour de prix | `/signaletique/tour-de-prix/` |
| | Plateau linéaire | `/signaletique/plateau-lineaire/` |
| | Bande de rive | `/signaletique/bande-de-rive/` |
| | Réglette de linéaire | `/signaletique/reglette-de-lineaire/` |
| | Habillage de tablette | `/signaletique/habillage-de-tablette/` |
| | Joue de linéaire | `/signaletique/joue-de-lineaire/` |
| PLV tête de gondole | Fronton | `/signaletique/fronton/` |
| | Habillage palette | `/signaletique/habillage-palette/` |
| Stickers & sol | Stickers de sol | `/signaletique/stickers-de-sol/` |
| | Stickers vitrine | `/signaletique/stickers-vitrine/` |
| Extérieur | Rappel de marque | `/signaletique/rappel-de-marque/` |
| | Stop trottoir | `/signaletique/stop-trottoir/` |

**Maillage autorisé :** Intra-silo uniquement.

---

### Silo 4 : Impression

**Page pilier** : `/impression/` — *Impression et packaging sur mesure : print, coffrets, objets publicitaires*

| Catégorie | Pages enfants | URL |
|-----------|--------------|-----|
| Print management | Affichage publicitaire | `/impression/affichage-publicitaire/` |
| | Flyers | `/impression/flyers/` |
| | Brochures | `/impression/brochures/` |
| Packaging | Cartonnette | `/impression/cartonnette/` |
| | Étiquette en rouleaux | `/impression/etiquette-en-rouleaux/` |
| | PLV factice | `/impression/plv-factice/` |
| Emballage personnalisé | Coffret bouteille | `/impression/coffret-bouteille/` |
| | Coffret carton | `/impression/coffret-carton/` |
| | Coffret de presse | `/impression/coffret-de-presse/` |
| | Coffret écrin | `/impression/coffret-ecrin/` |
| | Coffret présentation | `/impression/coffret-presentation/` |
| | Étui coffret | `/impression/etui-coffret/` |
| Objets publicitaires | Objet publicitaire | `/impression/objet-publicitaire/` |
| | Nappe personnalisée | `/impression/nappe-personnalisee/` |
| | Panneau publicitaire | `/impression/panneau-publicitaire/` |
| | Sac personnalisé | `/impression/sac-personnalise/` |
| | Voile commerciale | `/impression/voile-commerciale/` |
| Éco | Objets recyclés | `/impression/objets-recycles/` |

**Maillage autorisé :** Intra-silo uniquement.

---

### Silo 5 : PLV événementielle

**Page pilier** : `/plv-evenementielle/` — *PLV événementielle : stands, impression grand format et signalétique salon*

| Catégorie | Pages enfants | URL |
|-----------|--------------|-----|
| Stands | Stand expo | `/plv-evenementielle/stand-expo/` |
| | Stand de dégustation | `/plv-evenementielle/stand-de-degustation/` |
| | Stand animation | `/plv-evenementielle/stand-animation/` |
| | Stand parapluie | `/plv-evenementielle/stand-parapluie/` |
| | Tente publicitaire | `/plv-evenementielle/tente-publicitaire/` |
| Accueil | Borne accueil | `/plv-evenementielle/borne-accueil/` |
| | Comptoir stand | `/plv-evenementielle/comptoir-stand/` |
| Impression grand format | Rollup | `/plv-evenementielle/rollup/` |
| | Kakémono | `/plv-evenementielle/kakemono/` |
| | Mur d'image courbé | `/plv-evenementielle/mur-image-courbe/` |
| | Poster suspendu | `/plv-evenementielle/poster-suspendu/` |
| | X-banner | `/plv-evenementielle/x-banner/` |
| | Banderole publicitaire | `/plv-evenementielle/banderole-publicitaire/` |
| Drapeaux | Drapeau publicitaire | `/plv-evenementielle/drapeau-publicitaire/` |

**Maillage autorisé :** Intra-silo uniquement.

---

### Silo 6 : Solutions

**Page pilier** : `/solutions/` — *Solutions PLV par secteur et par besoin*

**Note :** Ce silo reprend la structure du site actuel (mention "idem site actuel" dans l'arborescence). Il regroupe des pages transversales orientées par secteur d'activité ou par problématique client, sans lien vers les pages enfants des autres silos.

| Pages enfants (à définir) | URL |
|---------------------------|-----|
| PLV pharmacie | `/solutions/plv-pharmacie/` |
| PLV grande distribution | `/solutions/plv-grande-distribution/` |
| PLV cosmétique | `/solutions/plv-cosmetique/` |
| PLV agroalimentaire | `/solutions/plv-agroalimentaire/` |
| PLV écologique | `/solutions/plv-ecologique/` |
| PLV salon professionnel | `/solutions/plv-salon-professionnel/` |

> **À valider** : le contenu exact de ce silo dépend des pages actuelles de kontfeel.fr. Il faudra auditer le site existant pour identifier les pages "Solutions" à conserver.

---

## 3. Navigation contextuelle — Fonctionnement détaillé

### 3.1 Page d'accueil (`/`)

La page d'accueil est le **hub universel**. Son rôle SEO est de distribuer le PageRank vers chaque page pilier.

**Menu principal (accueil)** :
```
[Logo KONTFEEL]    PLV carton | Présentoirs | Signalétique | Impression | PLV événementielle | Solutions
```

Chaque lien pointe vers la page pilier du silo. Aucun sous-menu, aucun dropdown.

**Contenu** : présentation de l'entreprise + 6 blocs renvoyant chacun vers une page pilier (avec image, titre, description courte, CTA).

### 3.2 Page pilier d'un silo (ex : `/plv-carton/`)

**Menu principal (contexte silo PLV carton)** :
```
[Logo → /]    Totem carton | Totem arche | Cube carton | Podium carton | Urne en carton | Silhouette découpée | ...
```

Seules les pages enfants de ce silo apparaissent. Le logo ramène à l'accueil (seul lien inter-silo dans le menu).

**Variante possible :** Si le nombre de pages enfants est trop élevé (ex : Silo 2 — Présentoirs avec 22 pages), regrouper par sous-catégorie dans le menu :
```
[Logo → /]    Comptoir ▾ | Sol ▾ | Mural ▾
                └ Stop pile          └ Bac à fouille       └ Présentoir book
                └ Présentoir distributeur  └ Box autoportant  └ Présentoir plastique
                └ ...                └ ...
```

### 3.3 Page enfant (ex : `/plv-carton/totem-carton/`)

**Menu principal** : identique à celui de la page pilier du même silo. Le lien de la page courante est mis en surbrillance (`.active`).

**Liens dans le contenu éditorial** :
- Lien vers la page pilier : OUI (obligatoire, en breadcrumb et dans le texte)
- Liens vers d'autres pages enfants du même silo : OUI (recommandé, via sections "Produits similaires" ou liens en contexte)
- Liens vers des pages d'un autre silo : NON (interdit)

### 3.4 Breadcrumb

Le breadcrumb suit la hiérarchie du silo et est présent sur toutes les pages sauf l'accueil.

```
Accueil › PLV carton › Totem carton
Accueil › Présentoirs › Présentoir comptoir
Accueil › Signalétique › Stop rayon
```

**Règle** : le breadcrumb ne comporte jamais plus de 3 niveaux (Accueil → Pilier → Enfant). Pas de sous-sous-catégories.

---

## 4. Footer

Le footer est identique sur toutes les pages. Il contient uniquement :

```
[Logo]
Description courte de KONTFEEL

Nos univers              Informations           Contact
PLV carton               Mentions légales       Adresse
Présentoirs              CGV                    Téléphone
Signalétique             Confidentialité        Email
Impression               Plan du site
PLV événementielle
Solutions

© 2026 KONTFEEL — Fabricant français de PLV sur mesure
```

**Règles du footer :**
- Liens vers les 6 pages piliers : OUI
- Liens vers des pages enfants : NON
- Liens vers pages légales, contact, plan du site : OUI
- Aucun lien profond dans le footer

---

## 5. Structure des dossiers Astro

```
src/
├── pages/
│   ├── index.astro                          ← Accueil (hub)
│   ├── plv-carton/
│   │   ├── index.astro                      ← Pilier PLV carton
│   │   ├── totem-carton.astro               ← Page enfant
│   │   ├── totem-arche.astro
│   │   ├── totem-cube.astro
│   │   ├── triptyque-carton.astro
│   │   ├── presentoir-de-sol-carton.astro
│   │   ├── cube-carton.astro
│   │   ├── podium-carton.astro
│   │   ├── urne-en-carton.astro
│   │   ├── silhouette-decoupee.astro
│   │   ├── plv-vitrine.astro
│   │   └── poubelle-carton.astro
│   ├── presentoirs/
│   │   ├── index.astro                      ← Pilier Présentoirs
│   │   ├── stop-pile.astro
│   │   ├── presentoir-distributeur.astro
│   │   ├── ... (22 pages enfants)
│   │   └── presentoir-plastique.astro
│   ├── signaletique/
│   │   ├── index.astro                      ← Pilier Signalétique
│   │   ├── stop-rayon.astro
│   │   ├── ... (13 pages enfants)
│   │   └── stop-trottoir.astro
│   ├── impression/
│   │   ├── index.astro                      ← Pilier Impression
│   │   ├── affichage-publicitaire.astro
│   │   ├── ... (17 pages enfants)
│   │   └── objets-recycles.astro
│   ├── plv-evenementielle/
│   │   ├── index.astro                      ← Pilier PLV événementielle
│   │   ├── stand-expo.astro
│   │   ├── ... (13 pages enfants)
│   │   └── drapeau-publicitaire.astro
│   ├── solutions/
│   │   ├── index.astro                      ← Pilier Solutions
│   │   ├── plv-pharmacie.astro
│   │   ├── ... (pages à définir)
│   │   └── plv-salon-professionnel.astro
│   ├── contact.astro
│   ├── devis.astro
│   ├── mentions-legales.astro
│   ├── cgv.astro
│   └── politique-de-confidentialite.astro
├── layouts/
│   ├── BaseLayout.astro                     ← Layout global (topbar, footer)
│   ├── PillarLayout.astro                   ← Layout page pilier
│   └── ChildLayout.astro                    ← Layout page enfant
├── components/
│   ├── Topbar.astro
│   ├── NavbarHome.astro                     ← Menu accueil (6 liens piliers)
│   ├── NavbarSilo.astro                     ← Menu contextuel silo
│   ├── Footer.astro
│   ├── Breadcrumb.astro
│   ├── Hero.astro
│   ├── ProductCard.astro
│   ├── ComparisonTable.astro
│   ├── FaqSection.astro
│   ├── TestimonialCard.astro
│   ├── CtaBanner.astro
│   └── ExpertArticle.astro
└── content/                                 ← Données TinaCMS
    ├── plv-carton/
    │   ├── _pillar.json
    │   ├── totem-carton.md
    │   └── ...
    ├── presentoirs/
    │   ├── _pillar.json
    │   └── ...
    └── ...
```

---

## 6. Schéma de maillage — Résumé visuel

```
                         ┌──────────┐
                         │ ACCUEIL  │
                         │  (hub)   │
                         └────┬─────┘
           ┌──────┬──────┬───┴───┬──────┬──────┐
           ▼      ▼      ▼       ▼      ▼      ▼
       ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
       │Silo 1││Silo 2││Silo 3││Silo 4││Silo 5││Silo 6│
       │Pilier││Pilier││Pilier││Pilier││Pilier││Pilier│
       └──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘
          │       │       │       │       │       │
    ┌─────┼─────┐ │  ...  │  ...  │  ...  │  ...  │  ...
    ▼     ▼     ▼ ▼
  ┌───┐ ┌───┐ ┌───┐
  │E1 │↔│E2 │↔│E3 │  ← Pages enfants (liens horizontaux frère-à-frère)
  └─┬─┘ └─┬─┘ └─┬─┘
    │      │      │
    └──────┴──────┘ → Toutes remontent vers la page pilier
```

**Légende :**
- `→` ou `▼` = lien descendant (pilier vers enfant)
- `↑` = lien remontant (enfant vers pilier)
- `↔` = lien horizontal (entre enfants du même silo)
- ✕ = aucun lien entre silos dans le contenu éditorial

---

## 7. Topbar

La topbar est un élément utilitaire, identique sur toutes les pages :

```
Réalisations PLV | Blog PLV | Demande de devis | Showroom PLV          Contactez-nous · 02 78 77 53 93
```

**Note SEO** : les liens de la topbar (Réalisations, Blog, Devis, Showroom, Contact) sont des pages transversales hors-silo. Elles ne participent pas au maillage du cocon. Elles sont liées depuis toutes les pages via la topbar et ne lient vers aucun silo en particulier.

---

## 8. Templates de pages

### 8.1 Template page pilier (cf. prototype `index.html`)

Sections dans l'ordre :
1. Topbar
2. Navbar contextuelle (pages enfants du silo)
3. Breadcrumb
4. Sub-nav sticky (ancres intra-page)
5. Hero (H1, H2, description, badges, CTA)
6. Grille produits (cards vers les pages enfants)
7. Tableau comparatif
8. Section éco-responsabilité
9. Témoignages clients
10. Produits populaires (liens enfants du même silo)
11. FAQ (balisage Schema.org FAQPage)
12. Article expert (balisage Schema.org Article)
13. CTA banner
14. Trust bar (logos clients)
15. Footer

### 8.2 Template page enfant (cf. prototype `presentoir.html`)

Sections dans l'ordre :
1. Topbar
2. Navbar contextuelle (pages du même silo)
3. Breadcrumb
4. Hero produit (image + galerie + specs)
5. Barre de réassurance
6. Matériaux / variantes
7. Secteurs d'activité
8. Processus en 5 étapes
9. Section prix / fourchettes
10. Témoignages clients
11. Galerie réalisations
12. CTA banner
13. FAQ (balisage Schema.org FAQPage)
14. Article expert
15. Footer

---

## 9. Règles de maillage — Checklist par type de page

| Élément | Accueil | Page pilier | Page enfant |
|---------|---------|-------------|-------------|
| Lien vers pages piliers (footer) | ✅ | ✅ | ✅ |
| Lien vers pages enfants du même silo | — | ✅ | ✅ |
| Lien vers pages enfants d'un autre silo | ❌ | ❌ | ❌ |
| Lien vers page pilier du même silo | — | — | ✅ (breadcrumb + contenu) |
| Lien vers page pilier d'un autre silo | ❌ | ❌ | ❌ |
| Lien accueil | ✅ (logo) | ✅ (logo) | ✅ (logo + breadcrumb) |
| Liens topbar (transversaux) | ✅ | ✅ | ✅ |
| Liens footer (piliers + légales) | ✅ | ✅ | ✅ |

---

## 10. Points à valider avant implémentation

1. **Silo Solutions** : le contenu de ce silo est noté "idem site actuel". Il faudra auditer les pages existantes de kontfeel.fr pour déterminer les pages enfants exactes.

2. **Silo Présentoirs** : avec 22 pages enfants, c'est le silo le plus volumineux. Faut-il regrouper les pages enfants par sous-catégorie dans le menu contextuel (Comptoir / Sol / Mural) ou garder une liste plate ?

3. **Pages transversales** : les pages Réalisations, Blog, Devis, Showroom, Contact ne font partie d'aucun silo. Elles sont accessibles depuis la topbar et éventuellement le footer, mais ne participent pas au maillage du cocon.

4. **Profondeur maximale** : l'arborescence est à 2 niveaux (Pilier → Enfant). Confirmes-tu qu'il n'y a pas de niveau intermédiaire (ex : `/presentoirs/comptoir/stop-pile/`) ?

5. **Canonicalisation** : les pages enfants utiliseront-elles des URL plates (`/presentoirs/stop-pile/`) ou avec sous-dossier par catégorie (`/presentoirs/comptoir/stop-pile/`) ?

---

*Document à valider avant de passer à l'étape suivante : initialisation du projet Astro.*
