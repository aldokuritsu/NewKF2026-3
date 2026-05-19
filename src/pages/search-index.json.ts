/**
 * /search-index.json — Index de recherche statique (généré au build).
 *
 * Contenu indexé (uniquement ce qui a une route vivante) :
 *   - Pages : rubriques / catégories / sous-catégories (src/data/silos.ts)
 *   - Articles de blog datés       (collection posts, filtre = même que la route)
 *   - Réalisations actives         (collection realisations, idem)
 *
 * Les fiches produits ne sont PAS indexées : elles n'ont pas encore de page
 * (URLs flat /p/ à venir). « Trouver un produit » renvoie vers la page
 * catégorie correspondante.
 *
 * Format d'une entrée :
 *   { t: titre, u: url, k: contexte, d: description courte, s: blob normalisé }
 * `s` est pré-normalisé (minuscule, sans accents) pour un matching client trivial.
 */
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { walkSilos } from '../data/silos'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

export const prerender = true

/** minuscule + suppression diacritiques + tout non-alphanumérique → espace */
const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const clip = (s: string, n = 140) =>
  s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s

export const GET: APIRoute = async () => {
  const entries: { t: string; u: string; k: string; d: string; s: string }[] = []

  // ── Pages : rubriques / catégories / sous-catégories ──────────────────────
  for (const { node, ancestors } of walkSilos()) {
    const segs = [...ancestors.map((a) => a.slug), node.slug]

    let data: any = {}
    try {
      data = JSON.parse(
        readFileSync(resolve(process.cwd(), `src/content/pages/${segs.join('/')}.json`), 'utf-8'),
      )
    } catch {
      /* squelette absent — on indexe quand même le label/URL */
    }

    const depth = ancestors.length
    const rubrique = ancestors[0]?.label ?? node.label
    const k =
      depth === 0 ? 'Rubrique' : `${depth === 1 ? 'Catégorie' : 'Sous-catégorie'} · ${rubrique}`

    entries.push({
      t: node.label,
      u: node.href,
      k,
      d: clip(String(data.seoDescription ?? '')),
      s: norm(
        [node.label, ...ancestors.map((a) => a.label), data.seoTitle, data.seoDescription]
          .filter(Boolean)
          .join(' '),
      ),
    })
  }

  // ── Articles de blog (mêmes filtres que /actualites-plv/[slug]) ───────────
  for (const p of await getCollection('posts', (p) => !!p.data.date)) {
    entries.push({
      t: p.data.title,
      u: `/actualites-plv/${p.id}/`,
      k: 'Article',
      d: clip(String(p.data.description ?? '')),
      s: norm([p.data.title, p.data.description, ...(p.data.tags ?? [])].filter(Boolean).join(' ')),
    })
  }

  // ── Réalisations (mêmes filtres que /realisations-plv/[slug]) ─────────────
  for (const r of await getCollection('realisations', (r) => r.data.active !== false)) {
    entries.push({
      t: r.data.title,
      u: `/realisations-plv/${r.id}/`,
      k: 'Réalisation',
      d: clip(String(r.data.description ?? '')),
      s: norm(
        [r.data.title, r.data.client, r.data.sector, r.data.description].filter(Boolean).join(' '),
      ),
    })
  }

  // ── Fiches produits (URL flat /p/[slug]) ──────────────────────────────────
  try {
    const dir = resolve(process.cwd(), 'src/content/produits')
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      let d: any = {}
      try {
        d = JSON.parse(readFileSync(resolve(dir, file), 'utf-8'))
      } catch {
        continue
      }
      const slug = file.replace(/\.json$/, '')
      const title = d.title ?? slug
      entries.push({
        t: title,
        u: `/p/${slug}/`,
        k: d.parentLabel ? `Produit · ${d.parentLabel}` : 'Produit',
        d: clip(String(d.seoDescription ?? '')),
        s: norm([title, d.parentLabel, d.seoTitle, d.seoDescription].filter(Boolean).join(' ')),
      })
    }
  } catch {
    /* dossier produits absent — rien à indexer */
  }

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
