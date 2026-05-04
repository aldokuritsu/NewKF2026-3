// Ajoute un bloc product_buy juste avant le cta_banner final dans les pages
// PLV carton qui n'en ont pas encore. Idempotent.
// Usage : node scripts/add-product-buy-blocks.mjs

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const PAGES_DIR = resolve(process.cwd(), 'src/content/pages/plv-carton')
const PRODUCTS_DIR = resolve(process.cwd(), 'src/content/products')

// Ne traite que les pages qui ont un product JSON correspondant
const productSlugs = new Set(
  readdirSync(PRODUCTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''))
)

let updated = 0
let skipped = 0

for (const file of readdirSync(PAGES_DIR)) {
  if (!file.endsWith('.json')) continue
  const slug = file.replace(/\.json$/, '')
  if (!productSlugs.has(slug)) {
    console.log(`⚠ ${slug}: pas de product JSON → ignoré`)
    skipped++
    continue
  }

  const filePath = resolve(PAGES_DIR, file)
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))

  if (!Array.isArray(data.blocks)) {
    console.log(`⚠ ${slug}: pas de tableau "blocks" → ignoré`)
    skipped++
    continue
  }

  // Déjà un bloc product_buy ?
  if (data.blocks.some(b => b?._template === 'product_buy')) {
    skipped++
    continue
  }

  const buyBlock = {
    _template: 'product_buy',
    heading: 'Commander en ligne',
    productSlug: slug,
  }

  // Insertion : juste avant le dernier bloc (typiquement cta_banner)
  const lastIdx = data.blocks.length
  data.blocks.splice(lastIdx - 1, 0, buyBlock)

  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  updated++
  console.log(`✓ ${slug}`)
}

console.log(`\n✓ ${updated} page(s) mise(s) à jour, ${skipped} ignorée(s).`)
