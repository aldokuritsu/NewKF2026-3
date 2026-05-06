# GUIDE_EDITORIAL.md — Kontfeel

> **Objet** : règles de production éditoriale pour le site Kontfeel. Définit le rôle de chaque type de contenu, les templates structurels, et les règles de maillage interne.
>
> **Lecteurs** : Alex, Baptiste (rédacteur principal), Claude Code (génération assistée et validation), tout futur intervenant.
>
> **Règle d'or** : si un contenu ne sait pas dans quel type il rentre, il n'est pas prêt à être publié. Reformuler l'intention avant de rédiger.

---

## 1. Cartographie des contenus par intention de recherche

| Type | Intention | Composition | Rôle dans le tunnel |
|------|-----------|-------------|---------------------|
| **Article de blog (`ressource`)** | Informationnelle large | Commodity dominant + Non-Commodity injecté | Captation top-of-funnel |
| **Retour terrain (`retour_terrain`)** | Informationnelle pointue, technique | Non-Commodity pur (expertise interne) | Autorité, citation IA, GEO |
| **Réalisation (`etude_de_cas`)** | Commerciale (comparaison de prestataires) | Non-Commodity pur (preuve sociale) | Conviction mid-funnel |
| **Fiche produit (`produit`)** | Transactionnelle | Commodity (specs) + Non-Commodity (avis BE, liens) | Conversion bottom-funnel |

**Règle de placement** : un contenu = une intention dominante = un type. Un contenu qui semble pouvoir aller dans deux types est un signal qu'il doit être **scindé en deux contenus distincts**, chacun optimisé pour son intention.

---

## 2. Arbre de décision — où va mon contenu ?

```
Question de départ : que cherche le visiteur quand il arrive sur ce contenu ?

├─ Il veut comprendre un sujet général (qu'est-ce que c'est, comment choisir)
│   └─ ARTICLE DE BLOG (ressource)
│       └─ La matière vient-elle de l'extérieur (compilation) ou de Kontfeel (test, donnée propre) ?
│           ├─ Extérieur dominant → article Commodity, mais OBLIGATOIREMENT enrichi de blocs Non-Commodity
│           └─ Kontfeel dominant → bascule vers RETOUR TERRAIN
│
├─ Il veut un apprentissage technique pointu (pourquoi tel matériau, retour d'expérience)
│   └─ RETOUR TERRAIN (retour_terrain)
│
├─ Il évalue des prestataires (qui sait faire, sur quel projet, avec quels résultats)
│   └─ RÉALISATION (etude_de_cas)
│       └─ Prérequis : accord client + matière concrète (photos, contexte, savoir-faire technique démontré)
│           ├─ Matière complète (témoignage + chiffres ou retour qualitatif fort) → réalisation complète
│           └─ Matière partielle (photos terrain + défi technique documenté) → réalisation technique
│
└─ Il cherche un produit précis ou une famille de produits
    └─ FICHE PRODUIT (produit)
```

**Cas limites fréquents** :

- *"Comment choisir un présentoir pour ma pharmacie"* : article de blog, mais qui doit pointer vers une ou plusieurs réalisations en pharmacie et vers les fiches produits concernées.
- *"On a testé le carton triple cannelure pour les charges lourdes"* : retour terrain. L'angle "test sur matière interne" l'emporte sur l'angle "guide de choix".
- *"Pourquoi Marque X a choisi notre îlot promotionnel"* : réalisation, pas article de blog. L'angle commercial domine.

---

## 3. Templates par type de contenus

### 3.1 Article de blog (`ressource`)

**Composition cible** :

| Bloc | Statut | Rôle |
|------|--------|------|
| Titre orienté requête | Obligatoire | SEO + clarté de l'intention |
| Réponse directe en intro (verdict) | Obligatoire | GEO + UX |
| Sommaire (si > 1500 mots) | Recommandé | UX + extraction par IA |
| Corps Commodity (le guide général) | Obligatoire | SEO informationnel |
| **Encadré Non-Commodity** | **Obligatoire** | E-E-A-T, différenciation |
| Liens vers réalisations du même thème | Obligatoire si réalisations existent | Maillage commercial |
| Liens vers retours terrain du même thème | Recommandé | Maillage expertise |
| Liens vers fiches produits mentionnées | Obligatoire si produits cités | Maillage transactionnel |
| FAQ structurée | Recommandé | GEO + Schema.org `FAQPage` |

**Le bloc Non-Commodity obligatoire** : c'est ce qui sépare un article Kontfeel d'un article généré par IA. Il prend l'une des formes suivantes :

- Un encadré "L'avis du bureau d'études" : un paragraphe signé qui prend position sur un point du sujet, basé sur l'expérience interne.
- Une donnée chiffrée propriétaire : "Sur les X projets que nous avons réalisés en pharmacie, on observe que…"
- Un mini-cas concret : "Récemment, un client en GMS nous a sollicités pour Y. Voici ce qu'on a appris."

Sans bloc Non-Commodity, l'article ne se publie pas. Si la matière manque, soit on attend qu'elle existe, soit on bascule le contenu en simple FAQ produit.

### 3.2 Retour terrain (`retour_terrain`)

**Composition cible** :

| Bloc | Statut |
|------|--------|
| Titre orienté problème ou apprentissage | Obligatoire |
| Contexte (le problème rencontré) | Obligatoire |
| Démarche (ce qu'on a testé, comment) | Obligatoire |
| Résultat (ce qui a fonctionné, ce qui n'a pas fonctionné) | Obligatoire |
| Conclusion actionnable | Obligatoire |
| Auteur signé | Obligatoire (E-E-A-T) |
| Liens vers produits concernés | Obligatoire si produits du catalogue impliqués |
| Liens vers réalisations qui illustrent | Recommandé |

**Particularités** :

- Le retour terrain est le format le plus rapide à produire pour Kontfeel parce qu'il ne nécessite **aucun accord client**. La matière vient de l'atelier, du bureau d'études, des installations.
- Le ton est direct, technique, factuel. Ne pas chercher à "vendre" — la crédibilité fait la vente.
- Les échecs sont un excellent matériau ("on a testé X, ça n'a pas marché parce que…"). Ils sont rares sur le web et très bien valorisés par les IA génératives.

### 3.3 Réalisation (`etude_de_cas`)

La réalisation existe en **deux sous-formats** pour s'adapter à la matière disponible. Le choix du sous-format se fait au moment de la rédaction, en fonction de ce que Kontfeel a réellement à exposer pour ce projet.

#### 3.3.a Réalisation technique (format par défaut)

C'est le format **standard** chez Kontfeel. Il documente un projet réel via le savoir-faire technique mobilisé, sans dépendre des données de performance commerciale du client (qui sont généralement non mesurées ou non partagées dans le secteur PLV).

**Composition cible** :

| Bloc | Statut |
|------|--------|
| Titre orienté défi ou solution (pas centré client) | Obligatoire |
| Client + secteur | Obligatoire (avec accord, même tacite pour la mention) |
| Date du projet | Obligatoire |
| Contexte : besoin client, contraintes (délai, volume, secteur, lieu) | Obligatoire |
| Défi technique ou créatif rencontré | Obligatoire |
| Solution apportée : choix techniques justifiés, partis pris créatifs | Obligatoire |
| Données internes mesurables (au moins une) | Obligatoire |
| Photos terrain (pas rendus 3D) | Obligatoire |
| Liens vers produits utilisés | **Critique** (alimente le maillage automatique) |

**Données internes mesurables** : ce sont des chiffres que Kontfeel possède **sans demander quoi que ce soit au client**. Au moins une de ces données doit figurer dans toute réalisation technique :

- Volume produit ("80 points de vente équipés", "200 unités déployées")
- Délai réel ("12 jours entre validation du brief et livraison")
- Temps de montage mesuré en interne ("90 secondes par unité, sans outil")
- Taux de retour interne pour ce type de produit ("moins de 1% de retours pour déformation")
- Nombre d'itérations en bureau d'études ("3 prototypes avant validation")
- Particularité technique chiffrable ("structure tenant 15 kg par étagère, validée par test de charge interne")

#### 3.3.b Réalisation complète (format enrichi, plus rare)

Quand le client accepte de partager des données de performance ou un témoignage qualitatif fort, la réalisation technique est enrichie pour devenir une réalisation complète.

**Composition supplémentaire** :

| Bloc | Statut |
|------|--------|
| Résultats client (chiffres ROI, taux de transformation, etc.) | Si partagés par le client |
| Témoignage client | Si obtenu |
| Signal comportemental client (renouvellement, extension à d'autres opérations) | Recommandé si applicable |

**Note importante** : un signal comportemental ("le client a renouvelé pour 3 campagnes successives", "l'opération a été étendue à 50 magasins supplémentaires") est aussi convaincant qu'un chiffre ROI direct, et beaucoup plus accessible. Le mentionner systématiquement quand c'est le cas.

#### Règles communes aux deux sous-formats

**Règle anti-piège** : une réalisation sans matière concrète (sans photos terrain, sans contexte précis, sans données internes mesurables) **n'est pas une réalisation**, c'est une page de référence. Mieux vaut une logo wall qu'une fausse étude de cas creuse.

**Format des résultats orienté GEO** : privilégier les phrases citables par les IA. "Le projet a mobilisé du carton triple cannelure pour tenir 15 kg par étagère, déployé sur 80 points de vente en 12 jours" est cité plus volontiers que "le client a apprécié le résultat".

**Hiérarchie de preuve dans le secteur PLV** : la réalité du secteur est que les chiffres ROI client sont rarement disponibles (clients qui ne mesurent pas, ou qui ne partagent pas). Le standard chez Kontfeel n'est donc **pas** "réalisation avec chiffres ROI", c'est **"réalisation technique avec données internes"**. Les chiffres client sont un bonus, jamais un prérequis.

### 3.4 Fiche produit (`produit`)

**Composition cible** :

| Bloc | Statut |
|------|--------|
| Titre commercial + slug SEO | Obligatoire |
| Description courte (max 160 car.) | Obligatoire |
| Description longue (markdown) | Obligatoire |
| Caractéristiques techniques structurées | Obligatoire |
| **Encadré "L'avis du bureau d'études"** | **Obligatoire pour les pages produit prioritaires** |
| Image principale en situation réelle | Obligatoire |
| Galerie d'images secondaires | Recommandé |
| Vidéo de montage | Recommandé (très fort en GEO) |
| Réalisations liées (auto-générées) | Auto |
| Retours terrain liés (auto-générés) | Auto |
| Articles de blog mentionnant ce produit (auto-générés) | Auto |
| CTA contextuel selon mode commercial | Obligatoire |

**Distinction "page produit prioritaire" vs "page produit secondaire"** :

- Pages prioritaires (10 à 15 identifiées par Alex) : composition complète, enrichie, mise à jour régulièrement.
- Pages secondaires : composition minimale (specs + image + CTA), suffisant pour exister dans le catalogue. Si une page secondaire commence à générer du trafic mesurable, la promouvoir au statut prioritaire.

---

## 4. Règles de maillage interne

### 4.1 Principe directeur

Le maillage est **bidirectionnel et automatique** via les références entre content collections. Aucun lien interne n'est jamais hardcodé en Markdown vers une autre page du site (sauf cas exceptionnel et justifié dans `DECISIONS.md`).

### 4.2 Règles par type

**Article de blog (`ressource`)** :
- DOIT pointer vers : au moins une fiche produit OU une réalisation OU un retour terrain du même silo.
- DOIT être pointé par : autres articles de blog du même silo qui traitent de sujets connexes.
- NE DOIT PAS pointer vers : des contenus d'un autre silo (sauf cas validé explicitement).

**Retour terrain (`retour_terrain`)** :
- DOIT pointer vers : les fiches produits concernées par l'apprentissage.
- PEUT pointer vers : une ou plusieurs réalisations qui illustrent.
- DOIT être pointé par : les fiches produits concernées (auto), les articles de blog du même silo qui abordent le sujet.

**Réalisation (`etude_de_cas`)** :
- DOIT pointer vers : les fiches produits utilisés dans le projet.
- PEUT pointer vers : un retour terrain technique lié.
- DOIT être pointée par : les fiches produits utilisés (auto), les articles de blog du silo concerné.

**Fiche produit (`produit`)** :
- DOIT pointer vers : la page catégorie de son silo.
- PEUT pointer vers : d'autres fiches produits du même silo (cross-sell, produits complémentaires).
- DOIT être pointée par : tout retour terrain ou réalisation qui la mentionne (auto), les articles de blog qui la citent.

### 4.3 Inter-silo : règles strictes

Les liens entre silos sont autorisés uniquement dans :
- La page d'accueil
- Les pages utilitaires (à propos, contact, mentions légales)
- Le footer (limité)

**Tout autre lien inter-silo doit faire l'objet d'une décision explicite**, consignée dans `DECISIONS.md`.

### 4.4 Densité de maillage cible

Pas de règle stricte, mais ordre de grandeur sain :

- Article de blog : 3 à 6 liens internes contextuels.
- Retour terrain : 2 à 4 liens.
- Réalisation : 2 à 5 liens (selon nombre de produits utilisés).
- Fiche produit : 5 à 10 liens entrants depuis les autres types (générés automatiquement).

Si un contenu cumule plus de 10 liens sortants, il est probablement mal scopé (sujet trop large) et devrait être scindé.

---

## 5. Sources de matière non-reproductible chez Kontfeel

Cette section est destinée à servir de référence quand on rédige un contenu et qu'on cherche **où aller chercher de la matière différenciante**. Elle classe les sources par accessibilité réelle, c'est-à-dire par facilité à les obtenir sans dépendre d'une partie tierce.

### 5.1 Sources toujours disponibles (matière interne pure)

Aucune autorisation tierce nécessaire. Cette matière existe déjà dans Kontfeel, il s'agit juste de la formaliser.

| Source | Exemples d'usage |
|--------|------------------|
| Volumes produits par projet | "80 points de vente équipés", "campagne de 200 unités" |
| Délais réels mesurés | "12 jours de la validation à la livraison", "prototype en 48h" |
| Temps de montage interne | "90 secondes par unité, testé en interne sans outil" |
| Choix techniques justifiés | "passage au triple cannelure pour les charges > 12 kg" |
| Apprentissages atelier | "matériau X abandonné après 18 mois pour Y raisons" |
| Taux de retour produit interne | "moins de 1% de retours sur ce modèle depuis 2024" |
| Charge supportée (test interne) | "validé pour 15 kg par étagère par notre BE" |
| Itérations de conception | "3 prototypes avant validation pour ce projet" |
| Données agrégées sur le portefeuille | "sur les 40 projets pharmacie réalisés depuis 2023, on observe…" |

**Règle d'or** : tout chiffre interne mentionné dans un contenu doit être réellement mesurable ou vérifiable côté Kontfeel. Pas de chiffre inventé pour faire joli.

### 5.2 Sources souvent disponibles (matière mixte)

Nécessite une simple validation client, pas de partage de données sensibles.

| Source | Exemples d'usage |
|--------|------------------|
| Mention du nom client + secteur | "Pour une marque de cosmétique en parfumerie sélective…" |
| Photo terrain en magasin | Photo du produit installé, prise par Kontfeel ou par le client |
| Témoignage qualitatif court | "Le déploiement a été plus rapide que prévu" |
| Signal comportemental | "Le client a renouvelé pour 3 campagnes successives", "extension à 50 magasins supplémentaires" |
| Validation pour autre opération | "Le format a été repris pour leur lancement automne" |

**Astuce** : un signal comportemental est aussi convaincant qu'un chiffre ROI direct, et beaucoup plus accessible. Quand un client renouvelle, étend, recommande, ou valide pour une autre opération, c'est une donnée à exploiter.

### 5.3 Sources rarement disponibles (matière à ne pas attendre)

Quand elles arrivent, c'est un bonus. Ne **jamais** les considérer comme un prérequis pour publier.

| Source | Exemples d'usage |
|--------|------------------|
| Chiffre ROI client (taux de transformation, sortie de caisse) | "+18% sur le linéaire équipé" |
| Étude comparative avant/après côté client | Données fournies par les équipes data du client |
| Témoignage long et structuré | Citation longue avec contexte et résultats |

**Constat sectoriel** : la majorité des clients PLV ne mesurent pas l'impact de la PLV posée, et ceux qui le mesurent ne partagent généralement pas leurs chiffres. C'est une réalité du secteur. La stratégie éditoriale Kontfeel ne doit pas dépendre de cette matière, sinon elle ne se déclenchera jamais.

### 5.4 Comment puiser dans ces sources

Workflow recommandé pour chaque type de contenu :

- **Retour terrain** : puiser exclusivement dans 5.1. Aucune dépendance externe.
- **Réalisation technique** (format par défaut) : puiser dans 5.1 + 5.2. Au moins une donnée interne mesurable obligatoire.
- **Réalisation complète** (format enrichi) : 5.1 + 5.2 + 5.3 si disponible.
- **Article de blog** : enrichir le contenu généraliste avec au moins un élément de 5.1 ou 5.2.
- **Fiche produit prioritaire** : enrichir avec un avis BE basé sur 5.1.

---

## 6. Checklist E-E-A-T avant publication

À cocher pour tout contenu, quel que soit son type :

- [ ] **Expérience** : le contenu mentionne au moins une expérience concrète (projet, test, donnée propre) plutôt que de rester théorique
- [ ] **Expertise** : le contenu prend position sur au moins un point. Ne se contente pas de lister les options.
- [ ] **Autorité** : l'auteur ou la source de l'expertise est nommé(e) (signature, mention "le bureau d'études Kontfeel", etc.)
- [ ] **Trustworthiness** : les chiffres sont vérifiables ou attribués. Aucune affirmation chiffrée sans source ou contexte.

**Test rapide** : "Si je remplaçais le nom Kontfeel par celui d'un concurrent dans cet article, est-ce que le contenu serait toujours juste ?" Si oui, le contenu manque de signaux Kontfeel-spécifiques. Le réécrire pour intégrer de la matière propriétaire.

---

## 7. Anti-patterns à éviter

| Anti-pattern | Pourquoi c'est un problème | Action |
|--------------|----------------------------|--------|
| Article de blog sans bloc Non-Commodity | Indistinguable de l'IA, sera filtré par Google | Ne pas publier tant qu'un bloc Non-Commodity n'est pas ajouté |
| Réalisation sans photos terrain | Pas de preuve, donc pas de fonction de réassurance | Repousser la publication ou requalifier en logo wall |
| Réalisation sans aucune donnée interne mesurable | Manque de matière concrète, contenu mou | Ajouter au moins un élément de la section 5.1 |
| Reporter une réalisation en attendant des chiffres ROI client qui ne viendront pas | Stratégie qui ne se déclenche jamais | Publier en format réalisation technique avec données internes |
| Fiche produit sans avis BE (page prioritaire) | Indistinguable d'un catalogue de concurrent | Ajouter un paragraphe d'expertise spécifique |
| Lien interne hardcodé en Markdown | Casse le maillage automatique, crée des liens orphelins en cas de renommage | Toujours passer par les références entre collections |
| Réutilisation d'un même angle dans plusieurs articles | Cannibalisation interne | Fusionner ou différencier explicitement les angles |
| Génération de réalisation ou retour terrain par IA sans matière réelle | Détruit la valeur Non-Commodity de tout le site | Strictement interdit |
| Bloc "produits associés" qui pointe vers d'autres silos | Casse le cocon sémantique | Limiter aux produits du même silo |
| Chiffre interne inventé ou approximatif "pour faire joli" | Risque de crédibilité si contesté, casse l'E-E-A-T | Ne mentionner que des chiffres réellement mesurables |

---

## 8. Workflow de publication

1. **Idée de contenu** : appliquer l'arbre de décision (section 2) pour identifier le type cible.
2. **Préparation de la matière** : selon le type, rassembler les éléments obligatoires (photos, données, accord client, etc.).
3. **Rédaction** : suivre le template du type concerné (section 3).
4. **Maillage** : remplir les champs de référence dans le frontmatter (`produits_lies`, `produits_utilises`, etc.). Le maillage entrant se génère automatiquement.
5. **Checklist E-E-A-T** (section 5) : cocher avant publication.
6. **Publication** : commit avec message au format `content: [type] [titre court]`.

---

## 9. Rythme de publication recommandé

Le rythme cible tient compte de la disponibilité réelle de la matière, du fait que les chiffres ROI client sont rares, et de la nécessité de tenir le rythme dans la durée.

| Type | Cible mensuelle | Justification |
|------|-----------------|---------------|
| Retour terrain | 2 par mois | Aucune dépendance externe, matière abondante en interne |
| Réalisation technique | 1 tous les 2 mois | Nécessite accord client + photos, mais pas de chiffres ROI |
| Réalisation complète | Opportuniste | Quand un client partage des données, en profiter |
| Article de blog | 1 à 2 par mois | Selon les besoins de couverture des silos |
| Enrichissement fiche produit | 2 à 3 par mois | Jusqu'à ce que les 10-15 prioritaires soient toutes au format complet |

**Volume total cible** : environ 5 à 7 contenus par mois (vs ~16 actuellement). La quantité diminue, la valeur unitaire augmente.

---

## 10. Cas particuliers et exceptions

Cette section est destinée à grossir au fil du temps. Y consigner toute situation qui sort des règles standards et la décision prise.

*(à compléter au fil des publications)*

---

**Fin du guide.** Toute évolution structurelle (ajout d'un type de contenu, modification des règles de maillage) doit être discutée avec Alex et consignée dans `DECISIONS.md`.