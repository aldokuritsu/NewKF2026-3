import type { APIRoute } from 'astro'
import { getEntry } from 'astro:content'
import Stripe from 'stripe'

export const prerender = false

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY)

const DEFAULT_SHIPPING = ['FR', 'BE', 'CH', 'LU']

interface CartItemInput {
  slug: string
  quantity: number
  variantId: string | null
  optionIds: string[]
  customAssetUrl: string | null
}

interface BuiltItem {
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]
  currency: string
  shippingCountries: string[]
  meta: { slug: string; variantId: string; optionIds: string; customAssetUrl: string }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const envSiteUrl = import.meta.env.PUBLIC_SITE_URL?.trim().replace(/\/$/, '')
    const SITE_URL = isValidHttpUrl(envSiteUrl) ? envSiteUrl : new URL(request.url).origin

    const body = await request.json().catch(() => ({}))

    // ── Normalisation : panier (items[]) OU achat direct (slug unique, legacy)
    const rawItems: any[] = Array.isArray(body.items) && body.items.length
      ? body.items
      : [body]

    const items: CartItemInput[] = rawItems
      .map((it) => ({
        slug: String(it?.slug ?? '').trim(),
        quantity: Math.min(Math.max(parseInt(it?.quantity ?? '1', 10) || 1, 1), 99),
        variantId: it?.variantId ?? null,
        optionIds: Array.isArray(it?.optionIds) ? it.optionIds : [],
        customAssetUrl:
          typeof it?.customAssetUrl === 'string' &&
          isValidHttpUrl(it.customAssetUrl) &&
          it.customAssetUrl.includes('.blob.vercel-storage.com')
            ? it.customAssetUrl
            : null,
      }))
      .filter((it) => it.slug)

    if (!items.length) return jsonError('Panier vide ou slug produit manquant.', 400)

    // ── Construction des line items (prix recalculés serveur) ────────────────
    const built: BuiltItem[] = []
    for (const item of items) {
      const b = await buildItem(item, SITE_URL)
      if ('error' in b) return jsonError(b.error, b.status)
      built.push(b)
    }

    // ── Garde-fou devise unique (une session Stripe = une devise) ────────────
    const currencies = [...new Set(built.map((b) => b.currency))]
    if (currencies.length > 1) {
      return jsonError(
        'Le panier contient des produits de devises différentes. Commandez-les séparément.',
        400,
      )
    }

    // ── Pays de livraison = intersection des produits ────────────────────────
    let shipping = built.reduce<string[]>(
      (acc, b) => acc.filter((c) => b.shippingCountries.includes(c)),
      built[0].shippingCountries,
    )
    if (!shipping.length) shipping = DEFAULT_SHIPPING

    const lineItems = built.flatMap((b) => b.lineItems)

    // ── Métadonnées compactes (limites Stripe : 500 car. / valeur) ───────────
    const cartSummary = JSON.stringify(
      built.map((b) => ({
        s: b.meta.slug,
        v: b.meta.variantId || undefined,
        o: b.meta.optionIds || undefined,
      })),
    ).slice(0, 480)

    const assetUrls = built
      .map((b) => b.meta.customAssetUrl)
      .filter(Boolean)
      .join(' | ')
      .slice(0, 480)

    const metadata: Record<string, string> = {
      cart: cartSummary,
      itemCount: String(built.length),
      customAssetUrls: assetUrls,
      source: items.length > 1 || Array.isArray(body.items) ? 'cart' : 'direct',
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries:
          shipping as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      },
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      locale: 'fr',
      metadata,
      payment_intent_data: {
        metadata,
        description: assetUrls ? `Visuels personnalisés : ${assetUrls}` : undefined,
      },
      success_url: `${SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cancel`,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[stripe checkout] error:', err)
    return jsonError(err?.message ?? 'Unknown error', 500)
  }
}

/** Construit les line items Stripe d'UN article (prix autoritatif serveur). */
async function buildItem(
  item: CartItemInput,
  SITE_URL: string,
): Promise<BuiltItem | { error: string; status: number }> {
  const entry = await getEntry('products', item.slug)
  if (!entry) return { error: `Produit introuvable : ${item.slug}`, status: 404 }

  const product = entry.data
  if (!product.active) return { error: `Produit non disponible : ${item.slug}`, status: 400 }

  let basePrice = product.price
  let baseLabel = product.name

  if (product.variants && product.variants.length > 0) {
    if (!item.variantId) return { error: `Variante non sélectionnée (${item.slug}).`, status: 400 }
    const found = product.variants.find((v) => v.id === item.variantId)
    if (!found) return { error: `Variante invalide : ${item.variantId}`, status: 400 }
    basePrice = found.price
    baseLabel = `${product.name} — ${found.label}`
  }

  const validOptions = (product.options ?? []).filter((o) => item.optionIds.includes(o.id))

  const rawImageUrl = product.image.startsWith('http')
    ? product.image
    : `${SITE_URL}${product.image.startsWith('/') ? '' : '/'}${product.image}`
  const imageUrl = isValidHttpUrl(rawImageUrl) ? rawImageUrl : null

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency: product.currency,
        unit_amount: Math.round(basePrice * 100),
        product_data: {
          name: baseLabel,
          description: product.description.slice(0, 500),
          ...(imageUrl ? { images: [imageUrl] } : {}),
          metadata: { slug: item.slug, variantId: item.variantId ?? '' },
        },
      },
      quantity: item.quantity,
      adjustable_quantity: { enabled: true, minimum: 1, maximum: 99 },
    },
    ...validOptions.map<Stripe.Checkout.SessionCreateParams.LineItem>((option) => ({
      price_data: {
        currency: product.currency,
        unit_amount: Math.round(option.price * 100),
        product_data: {
          name: `Option : ${option.label} (${baseLabel})`,
          metadata: { slug: item.slug, optionId: option.id },
        },
      },
      quantity: item.quantity,
    })),
  ]

  return {
    lineItems,
    currency: product.currency,
    shippingCountries: product.shippingCountries ?? DEFAULT_SHIPPING,
    meta: {
      slug: item.slug,
      variantId: item.variantId ?? '',
      optionIds: validOptions.map((o) => o.id).join(','),
      customAssetUrl: item.customAssetUrl ?? '',
    },
  }
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function isValidHttpUrl(value: string | undefined | null): value is string {
  if (!value) return false
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
