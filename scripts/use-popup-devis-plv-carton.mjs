// Remplace les CTAs "/devis/" par "#devis" dans les pages PLV carton
// pour que les boutons "Demander un devis" ouvrent la popup au lieu de
// naviguer vers la page autonome.
//
// Pages traitées :
//  - src/content/silos/plv-carton.json (pilier)
//  - src/content/pages/plv-carton/*.json (19 enfants)
//
// Idempotent : si un CTA est déjà sur "#devis" ou pointe ailleurs, ne change rien.
// Usage : node scripts/use-popup-devis-plv-carton.mjs

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const targets = [
  resolve(process.cwd(), 'src/content/silos/plv-carton.json'),
  ...readdirSync(resolve(process.cwd(), 'src/content/pages/plv-carton'))
    .filter(f => f.endsWith('.json'))
    .map(f => resolve(process.cwd(), 'src/content/pages/plv-carton', f)),
]

let changed = 0

for (const filePath of targets) {
  if (!existsSync(filePath)) continue
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  let modified = false

  function rewriteHref(value) {
    if (value === '/devis/' || value === '/devis') return '#devis'
    return value
  }

  function walk(obj) {
    if (Array.isArray(obj)) return obj.forEach(walk)
    if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        const val = obj[key]
        if ((key === 'href' || key === 'btnHref' || key === 'ctaHref') && typeof val === 'string') {
          const newVal = rewriteHref(val)
          if (newVal !== val) {
            obj[key] = newVal
            modified = true
          }
        } else {
          walk(val)
        }
      }
    }
  }

  walk(data)

  if (modified) {
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
    changed++
    const rel = filePath.replace(process.cwd() + '/', '')
    console.log(`✓ ${rel}`)
  }
}

console.log(`\n✓ ${changed} fichier(s) modifié(s).`)
