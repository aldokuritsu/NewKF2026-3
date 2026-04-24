#!/usr/bin/env node
/**
 * Associe à chaque page enfant (src/content/pages/**\/*.json) son image hero
 * produit dans public/assets/produits/ en cherchant un fichier dont le nom
 * préfixe correspond au slug de la page.
 *
 * Mode dry-run par défaut ; passer --apply pour écrire.
 * Exemples :
 *   node scripts/link-images.mjs               # affiche le plan
 *   node scripts/link-images.mjs --apply       # écrit les changements
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, basename } from 'node:path'

const APPLY = process.argv.includes('--apply')

// Décode les séquences `_XX` (hex) — certains noms de fichiers ont été stockés
// avec `_` en remplacement de `%` (ex. `_20` = espace, `_C3_A9` = é).
// On ne touche pas aux `_N` simples (variantes type `_1`, `_2`).
const decodeHexEscapes = name => {
  try { return decodeURIComponent(name.replace(/_([0-9A-F]{2})/gi, '%$1')) }
  catch { return name }
}

const slugify = s => decodeHexEscapes(s)
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')  // strip accents
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

const PRODUITS_DIR = 'public/assets/produits'
const images = readdirSync(PRODUITS_DIR).filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f))

// Retire les suffixes de taille (1170x780, 600x600) et "Kontfeel" pour isoler
// le nom du produit, puis slugifie pour la comparaison.
function baseOf(fname) {
  return fname
    .replace(/\.(jpe?g|png|webp|avif)$/i, '')
    .replace(/-?\d{3,4}x\d{3,4}(px)?-?Kontfeel[-_]?\d*$/i, '')
    .replace(/-Kontfeel(-\d+)?(_\d+)?$/i, '')
    .replace(/[-_]\d+$/, '')
    .trim()
}

const heroByBase  = new Map()  // slug -> fichier 1170x780
const thumbByBase = new Map()  // slug -> fichier 600x600
const anyByBase   = new Map()  // slug -> premier fichier trouvé

for (const fname of images) {
  const base = slugify(baseOf(fname))
  if (!base) continue
  if (/1170x780/i.test(fname) && !heroByBase.has(base))  heroByBase.set(base, fname)
  if (/600x600/i.test(fname)  && !thumbByBase.has(base)) thumbByBase.set(base, fname)
  if (!anyByBase.has(base))                               anyByBase.set(base, fname)
}

function findImage(slug) {
  // 1) match strict
  if (heroByBase.has(slug))  return { kind: 'hero',  file: heroByBase.get(slug) }
  if (thumbByBase.has(slug)) return { kind: 'thumb', file: thumbByBase.get(slug) }
  if (anyByBase.has(slug))   return { kind: 'any',   file: anyByBase.get(slug) }

  // 2) préfixe (slug plus long que le nom du produit, ou inverse)
  for (const [base] of anyByBase) {
    if (slug === base || slug.startsWith(base + '-') || base.startsWith(slug + '-')) {
      return {
        kind: heroByBase.has(base) ? 'hero' : thumbByBase.has(base) ? 'thumb' : 'any',
        file: heroByBase.get(base) ?? thumbByBase.get(base) ?? anyByBase.get(base),
      }
    }
  }

  // 3) tous les tokens du slug apparaissent dans le nom de fichier décodé
  const tokens = slug.split('-').filter(t => t.length >= 3)
  if (tokens.length) {
    for (const fname of images) {
      const decoded = slugify(fname)
      if (tokens.every(t => decoded.includes(t))) {
        return { kind: 'contains', file: fname }
      }
    }
  }

  // 4) chevauchement de tokens (seuil adaptatif : ≥2 si slug a plusieurs tokens,
  //    sinon ≥1 — évite de laisser sans image les slugs courts type "ilot")
  const slugTokens = new Set(tokens)
  const minScore = slugTokens.size >= 2 ? 2 : 1
  let best = null, bestScore = 0
  for (const [base, fname] of anyByBase) {
    const baseTokens = new Set(base.split('-').filter(t => t.length >= 3))
    let score = 0
    for (const t of slugTokens) if (baseTokens.has(t)) score++
    if (score >= minScore && score > bestScore) {
      best = { kind: 'fuzzy', file: fname }; bestScore = score
    }
  }
  return best
}

const results = []
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name)
    if (e.isDirectory()) walk(full)
    else if (full.endsWith('.json')) {
      const slug = basename(full, '.json')
      results.push({ file: full, slug, match: findImage(slug) })
    }
  }
}
walk('src/content/pages')

const hit  = results.filter(r => r.match).length
const miss = results.length - hit
console.log(`\n=== ${results.length} pages scannées — ${hit} matches, ${miss} non-matchées ===\n`)

console.log('--- MATCHES ---')
for (const r of results.filter(x => x.match)) {
  console.log(`[${r.match.kind.padEnd(5)}]  ${r.slug.padEnd(32)} → ${r.match.file}`)
}

console.log('\n--- NON-MATCHÉES ---')
for (const r of results.filter(x => !x.match)) console.log(`         ${r.slug}`)

if (!APPLY) {
  console.log('\n(dry-run : relancer avec --apply pour écrire les fichiers)')
  process.exit(0)
}

let written = 0
for (const r of results) {
  if (!r.match) continue
  const data = JSON.parse(readFileSync(r.file, 'utf-8'))
  if (!Array.isArray(data.blocks)) continue
  let changed = false
  for (const b of data.blocks) {
    if (b._template === 'hero') {
      const newPath = `/assets/produits/${r.match.file}`
      if (b.image !== newPath) { b.image = newPath; changed = true }
    }
  }
  if (changed) {
    writeFileSync(r.file, JSON.stringify(data, null, 2) + '\n')
    written++
  }
}
console.log(`\n✓ ${written} fichier(s) mis à jour.`)
