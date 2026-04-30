import type { APIRoute } from 'astro'
import { getEntry } from 'astro:content'
import Stripe from 'stripe'

export const prerender = false

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY)

export const POST: APIRoute = async ({ request }) => {
  try {
    const SITE_URL =
      import.meta.env.PUBLIC_SITE_URL?.replace(/\/$/, '') ||
      new URL(request.url).origin

    const body = await request.json().catch(() => ({}))
    const slug = String(body.slug ?? '').trim()
    const quantity = Math.min(Math.max(parseInt(body.quantity ?? '1', 10) || 1, 1), 99)
    const variantId: string | null = body.variantId ?? null
    const optionIds: string[] = Array.isArray(body.optionIds) ? body.optionIds : []

    if (!slug) return jsonError('Slug produit manquant.', 400)

    const entry = await getEntry('products', slug)
    if (!entry) return jsonError(`Produit introuvable : ${slug}`, 404)

    const product = entry.data
    if (!product.active) return jsonError('Produit non disponible à la vente.', 400)

    // ── Variante : si le produit en propose, une variante DOIT être choisie
    let basePrice = product.price
    let baseLabel = product.name

    if (product.variants && product.variants.length > 0) {
      if (!variantId) return jsonError('Variante non sélectionnée.', 400)
      const found = product.variants.find((v) => v.id === variantId)
      if (!found) return jsonError(`Variante invalide : ${variantId}`, 400)
      basePrice = found.price
      baseLabel = `${product.name} — ${found.label}`
    }

    // ── Options : on ne garde que celles qui existent vraiment
    const validOptions = (product.options ?? []).filter((o) => optionIds.includes(o.id))

    const rawImageUrl = product.image.startsWith('http')
      ? product.image
      : `${SITE_URL}${product.image.startsWith('/') ? '' : '/'}${product.image}`
    const imageUrl = isValidHttpUrl(rawImageUrl) ? rawImageUrl : null

    // ── Line items Stripe : produit principal + 1 ligne par option
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: product.currency,
          unit_amount: Math.round(basePrice * 100),
          product_data: {
            name: baseLabel,
            description: product.description.slice(0, 500),
            ...(imageUrl ? { images: [imageUrl] } : {}),
            metadata: { slug, variantId: variantId ?? '' },
          },
        },
        quantity,
        adjustable_quantity: { enabled: true, minimum: 1, maximum: 99 },
      },
      ...validOptions.map<Stripe.Checkout.SessionCreateParams.LineItem>((option) => ({
        price_data: {
          currency: product.currency,
          unit_amount: Math.round(option.price * 100),
          product_data: {
            name: `Option : ${option.label}`,
            metadata: { slug, optionId: option.id },
          },
        },
        quantity,
      })),
    ]

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: product.shippingCountries as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      },
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      locale: 'fr',
      metadata: {
        slug,
        variantId: variantId ?? '',
        optionIds: validOptions.map((o) => o.id).join(',') || '',
        source: 'test-stripe-page',
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

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
