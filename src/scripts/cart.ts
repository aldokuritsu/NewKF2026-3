/**
 * cart.ts — Panier client (100 % localStorage, aucun backend).
 *
 * - Source de vérité persistante : localStorage (clé `kf_cart_v1`).
 * - Réactivité même page : CustomEvent `kf-cart-change` sur `window`.
 * - Multi-onglets : event natif `storage`.
 * - Exposé en singleton sur `window.__kfCart` (idempotent) → utilisable
 *   depuis n'importe quel script (module ou inline) une fois la Navbar chargée.
 *
 * ⚠️ `unitPrice` n'est qu'un prix d'AFFICHAGE (drawer). Le prix réel est
 *    TOUJOURS recalculé côté serveur dans /api/checkout à partir du slug /
 *    variantId / optionIds. Ne jamais faire confiance au prix client.
 */

export interface CartLine {
  id: string
  slug: string
  name: string
  qty: number
  variantId: string | null
  variantLabel?: string
  optionIds: string[]
  optionLabels?: string[]
  unitPrice: number
  currency: string
  image?: string
  customAssetUrl?: string | null
}

const KEY = 'kf_cart_v1'
const CHANGE = 'kf-cart-change'
const OPEN = 'kf-cart-open'
const MAX_QTY = 99

function read(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function write(lines: CartLine[]): void {
  localStorage.setItem(KEY, JSON.stringify(lines))
  window.dispatchEvent(new CustomEvent(CHANGE))
}

function makeId(
  slug: string,
  variantId: string | null,
  optionIds: string[],
  customAssetUrl?: string | null,
): string {
  return [slug, variantId || '', [...optionIds].sort().join('+'), customAssetUrl || ''].join('|')
}

const clampQty = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.round(n) || 1))

const api = {
  all: read,

  count(): number {
    return read().reduce((n, l) => n + l.qty, 0)
  },

  /** Total d'affichage (le total réel est établi par Stripe Checkout). */
  total(): number {
    return read().reduce((s, l) => s + l.unitPrice * l.qty, 0)
  },

  currency(): string {
    return read()[0]?.currency ?? 'eur'
  },

  add(line: Omit<CartLine, 'id'>): void {
    const lines = read()
    const id = makeId(line.slug, line.variantId, line.optionIds, line.customAssetUrl)
    const existing = lines.find((l) => l.id === id)
    if (existing) existing.qty = clampQty(existing.qty + line.qty)
    else lines.push({ ...line, id, qty: clampQty(line.qty) })
    write(lines)
  },

  setQty(id: string, qty: number): void {
    const lines = read()
    const l = lines.find((x) => x.id === id)
    if (!l) return
    l.qty = clampQty(qty)
    write(lines)
  },

  remove(id: string): void {
    write(read().filter((l) => l.id !== id))
  },

  clear(): void {
    write([])
  },

  /** Payload minimal envoyé à /api/checkout (slugs/ids only — pas de prix). */
  checkoutItems() {
    return read().map((l) => ({
      slug: l.slug,
      quantity: l.qty,
      variantId: l.variantId,
      optionIds: l.optionIds,
      customAssetUrl: l.customAssetUrl ?? null,
    }))
  },

  /** Demande l'ouverture du drawer (écouté par la Navbar). */
  openDrawer(): void {
    window.dispatchEvent(new CustomEvent(OPEN))
  },

  /** S'abonner aux changements (même page + multi-onglets). */
  onChange(cb: () => void): void {
    window.addEventListener(CHANGE, cb)
    window.addEventListener('storage', (e) => {
      if (e.key === KEY) cb()
    })
  },

  onOpenRequest(cb: () => void): void {
    window.addEventListener(OPEN, cb)
  },
}

export type CartApi = typeof api

declare global {
  interface Window {
    __kfCart?: CartApi
  }
}

// Singleton idempotent
if (!window.__kfCart) {
  window.__kfCart = api

  // Vider le panier au retour d'un paiement réussi.
  if (location.pathname.replace(/\/$/, '') === '/success') {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* noop */
    }
  }
}

export const cart: CartApi = window.__kfCart!
