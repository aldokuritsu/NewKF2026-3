#!/usr/bin/env node
/**
 * Migre toutes les références `/img/...` vers `/assets/...` dans les sources
 * (JSON + .astro) et déplace les 3 fichiers qui n'ont pas de pendant dans
 * `public/assets/` (apple-touch-icon, placeholders).
 *
 * Mode dry-run par défaut. Lancer avec --apply pour écrire.
 *
 * Après exécution + vérification dev, on peut supprimer `public/img/`.
 */
import { readdirSync, readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const APPLY = process.argv.includes('--apply')

// Table de substitution — résultat de l'inventaire manuel : chaque URL /img/…
// trouvée dans le code est mappée soit à son pendant dans /assets/…, soit à
// une copie à créer dans public/assets/.
const SUBST = {
  // Process (steps) — copies exactes dans /assets/images/
  '/img/01-Design-Kontfeel.jpg':      '/assets/images/01-Design-Kontfeel.jpg',
  '/img/02-Conception-Kontfeel.jpg':  '/assets/images/02-Conception-Kontfeel.jpg',
  '/img/03-Fabrication-Kontfeel.jpg': '/assets/images/03-Fabrication-Kontfeel.jpg',
  '/img/04-Logistique-Kontfeel.jpg':  '/assets/images/04-Logistique-Kontfeel.jpg',

  // Logos & assets de marque
  '/img/logo.svg':                    '/assets/images/logo.svg',
  '/img/logo-region-normandie.png':   '/assets/logo-region-normandie.png',
  '/img/slide-new.jpg':               '/assets/images/slide-new.jpg',

  // Réalisations
  '/img/arche-evenementielle.jpg':                          '/assets/realisations/arche-evenementielle.jpg',
  '/img/arches-en-carton-pour-mise-en-avant-magasin.jpg':   '/assets/realisations/arches-en-carton-pour-mise-en-avant-magasin.jpg',
  '/img/habillage-tete-de-gondole-premium-pmma-kontfeel.jpg': '/assets/realisations/habillage-tete-de-gondole-premium-pmma-kontfeel.jpg',
  '/img/plv-vitrine-sur-les-champs-elysees.jpg':            '/assets/realisations/plv-vitrine-sur-les-champs-elysees.jpg',
  '/img/shop-in-shop-avec-de-la-plv.jpg':                   '/assets/realisations/shop-in-shop-avec-de-la-plv.jpg',
  '/img/theatralisation-magasin-avec-plvc-carton-sur-mesure.jpg': '/assets/realisations/theatralisation-magasin-avec-plvc-carton-sur-mesure.jpg',

  // Catégories / silos (encodés URL-style dans /assets/produits/categories/)
  '/img/Impression-PLV.jpg':          '/assets/produits/categories/Impression_20PLV.jpg',
  '/img/Mobilier-commercial.jpg':     '/assets/produits/categories/Mobilier_20commercial.jpg',
  '/img/PLV-digitale.jpg':            '/assets/produits/categories/PLV_20digitale.jpg',
  '/img/PLV-display.jpg':             '/assets/produits/categories/PLV_20display.jpg',
  '/img/PLV-stand-expo.jpg':          '/assets/produits/categories/PLV_20stand_20expo.jpg',
  '/img/PLV-sur-mesure.jpg':          '/assets/produits/categories/PLV_20sur_20mesure.jpg',

  // Solutions
  '/img/Solutions-PLV-Kontfeel.jpg':  '/assets/solutions/Solutions-PLV-Kontfeel.jpg',

  // Images produits spécifiques (dans /assets/produits/)
  '/img/Rendu-3d-totem-carton-automatique-1900-x-500-cm.jpg': '/assets/produits/Rendu-3d-totem-carton-automatique-1900-x-500-cm.jpg',
  '/img/totem-carton-automatique-1900-x-500-cm.jpg':          '/assets/produits/totem-carton-automatique-1900-x-500-cm.jpg',

  // Fichier à recopier depuis public/img/ (pas de pendant /assets/)
  '/img/apple-touch-icon.png':        '/assets/apple-touch-icon.png',

  // Placeholders : fichiers cassés dans le POC d'origine — redirigés vers
  // l'image "no_image" déjà présente dans /assets/images/
  '/img/placeholder-hero.jpg':        '/assets/images/no_image.png',
  '/img/placeholder-product.jpg':     '/assets/images/no_image.png',
}

// ──────────────── 1. Copier les fichiers sans pendant ────────────────
const FILES_TO_COPY = [
  ['public/img/apple-touch-icon.png', 'public/assets/apple-touch-icon.png'],
]

console.log('=== Étape 1 : copies de fichiers ===\n')
for (const [src, dst] of FILES_TO_COPY) {
  if (!existsSync(src))  { console.log(`  ⚠ SRC manquant : ${src}`); continue }
  if (existsSync(dst))   { console.log(`  = déjà en place : ${dst}`); continue }
  if (APPLY) {
    copyFileSync(src, dst)
    console.log(`  ✓ copié  ${src} → ${dst}`)
  } else {
    console.log(`  (dry) copier ${src} → ${dst}`)
  }
}

// ──────────────── 2. Vérifier que chaque cible de substitution existe ────────
console.log('\n=== Étape 2 : vérification des cibles dans public/assets/ ===\n')
let missing = 0
for (const [from, to] of Object.entries(SUBST)) {
  const target = 'public' + to
  // Si on vient de copier dans l'étape 1, c'est OK même en dry-run
  const isJustCopied = FILES_TO_COPY.some(([, dst]) => dst === target)
  if (existsSync(target) || (isJustCopied && APPLY)) continue
  if (isJustCopied && !APPLY) continue  // sera là après --apply
  console.log(`  ✗ cible absente : ${target}  (pour ${from})`)
  missing++
}
if (missing === 0) console.log('  ✓ toutes les cibles sont présentes')

// ──────────────── 3. Substitutions dans les fichiers source ────────────────
console.log('\n=== Étape 3 : substitutions dans src/ + layouts ===\n')

const SOURCE_GLOBS = ['src']
const EXT = /\.(astro|ts|tsx|js|jsx|json|md|mdx|html|yaml|yml)$/i

function walkFiles(dir) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name)
    if (e.isDirectory()) out.push(...walkFiles(full))
    else if (EXT.test(full)) out.push(full)
  }
  return out
}

const allFiles = SOURCE_GLOBS.flatMap(walkFiles)

let filesTouched = 0
let replacementCount = 0
const keys = Object.keys(SUBST).sort((a, b) => b.length - a.length)  // longest first

for (const file of allFiles) {
  const before = readFileSync(file, 'utf-8')
  let after = before
  let fileReps = 0
  for (const key of keys) {
    const value = SUBST[key]
    const occurrences = after.split(key).length - 1
    if (occurrences > 0) {
      after = after.split(key).join(value)
      fileReps += occurrences
    }
  }
  if (fileReps > 0) {
    filesTouched++
    replacementCount += fileReps
    if (APPLY) writeFileSync(file, after)
    console.log(`  ${APPLY ? '✓' : '(dry)'}  ${file}  (${fileReps} occurrence(s))`)
  }
}

console.log(`\n${filesTouched} fichier(s) modifié(s), ${replacementCount} occurrence(s) remplacée(s).`)

// ──────────────── 4. Vérification finale : plus aucune référence /img/ ────────
if (APPLY) {
  console.log('\n=== Étape 4 : vérification finale ===\n')
  const remaining = []
  for (const file of allFiles) {
    const content = readFileSync(file, 'utf-8')
    if (/\/img\//.test(content)) remaining.push(file)
  }
  if (remaining.length) {
    console.log('  ⚠ références /img/ restantes :')
    for (const f of remaining) console.log('     ' + f)
  } else {
    console.log('  ✓ aucune référence /img/ restante dans src/')
    console.log('\n    public/img/ peut maintenant être supprimé :')
    console.log('      rm -rf public/img')
  }
}

if (!APPLY) console.log('\n(dry-run : relancer avec --apply pour appliquer)')
