# E-commerce — Stripe Checkout + Vercel Blob

## Vue d'ensemble du flow

```
┌──────────┐                                        ┌────────────┐
│ Client   │                                        │ Vercel CDN │
│ (browser)│                                        │ (HTML SSG) │
└────┬─────┘                                        └─────┬──────┘
     │ 1. GET /plv-carton/totem-carton-automatique         │
     │◄────────── HTML statique avec ProductBuyBlock ──────│
     │
     │ 2. (optionnel) POST /api/upload    ┌─────────────────┐
     │ ──────────────────────────────────▶│ Astro serverless │
     │ ◄── { clientToken } ──────────────  │ /api/upload      │
     │                                     └─────────────────┘
     │
     │ 3. PUT du fichier             ┌─────────────────┐
     │ ────────────────────────────▶│ Vercel Blob     │
     │ ◄── { url: ".blob.vercel-storage.com/..." } ─│
     │
     │ 4. POST /api/checkout       ┌─────────────────┐
     │ { slug, variantId, optionIds, qty, customAssetUrl }
     │ ─────────────────────────▶│ /api/checkout    │─── stripe.checkout.sessions.create() ──▶ Stripe
     │ ◄── { url: "checkout.stripe.com/..." } ──────│
     │
     │ 5. window.location = url
     │ ────────────────▶ Stripe Checkout (hosted)
     │
     │ 6. Paiement confirmé → redirect vers /success?session_id=cs_...
     │
     │ 7. GET /success?session_id=...   ┌─────────────────┐
     │ ──────────────────────────────▶│ /success.astro   │── stripe.sessions.retrieve() ──▶ Stripe
     │ ◄── HTML récap (montant, email, lien Blob) ──────│
```

## Pré-requis Vercel

Avant que ça marche en prod il faut :

1. **STRIPE_SECRET_KEY** dans les env vars du projet Vercel (mode test :
   `sk_test_...`, mode live : `sk_live_...`).
2. **Vercel Blob store** créé : Dashboard → projet → Storage → Create →
   Blob → choisir un nom. Vercel ajoute automatiquement
   `BLOB_READ_WRITE_TOKEN` aux env vars.
3. **Pas besoin de PUBLIC_SITE_URL** — le code dérive l'origin de
   `request.url`. Si tu la définis quand même, valide qu'elle est en
   `https://...` (un typo `ttps://` produit "Not a valid URL" côté Stripe).

## Schéma produit

Fichier : `src/content/products/{slug}.json`. Schéma défini dans
[src/content.config.ts](../src/content.config.ts) :

```jsonc
{
  "name": "Totem carton automatique",
  "shortDescription": "Description courte affichée à côté de l'image.",
  "description": "Description longue passée à Stripe Checkout (tronquée à 500 chars).",
  "price": 119.90,                  // prix de base TTC en EUR (utilisé si pas de variant)
  "currency": "eur",                // eur | usd | gbp | chf
  "image": "/assets/produits/x.jpg", // URL relative (transformée en absolue dans Stripe images[])
  "imageAlt": "Texte alt",
  "specs": [                        // optionnel, affiché dans le bloc
    { "label": "Format", "value": "50 × 190 cm" }
  ],
  "variants": [                     // optionnel — si défini, le client DOIT en choisir une
    { "id": "f50x190", "label": "50 × 190 cm", "price": 119.90, "default": true }
  ],
  "options": [                      // optionnel — checkboxes multi-choix, chaque option = une ligne Stripe
    { "id": "porte-flyers", "label": "Porte-flyers A5", "price": 22.00 }
  ],
  "shippingCountries": ["FR", "BE", "CH", "LU"],  // ISO codes pour shipping_address_collection
  "active": true                    // false → checkout refuse 400 "Produit non disponible"
}
```

Validation Zod automatique au build via Astro Content Collections.

## ProductBuyBlock

Bloc CMS réutilisable : [src/components/blocks/ProductBuyBlock.astro](../src/components/blocks/ProductBuyBlock.astro).

### Usage dans un JSON de page

```json
{
  "_template": "product_buy",
  "heading": "Commander en ligne",
  "productSlug": "totem-carton-automatique"
}
```

`productSlug` doit correspondre **exactement** au nom du fichier
`src/content/products/{slug}.json` (sans extension).

### Comportement

- **Server-side** : lit le produit via `getEntry('products', slug)` au
  build. Si introuvable, affiche un bloc d'erreur (visible uniquement en
  dev / build, masqué en prod statique).
- **Client-side** : recalcule le prix total à chaque interaction. Upload
  via `@vercel/blob/client.upload(...)` → token signé via `/api/upload`,
  fichier va directement à Blob (pas de payload côté serverless).
- **CSS scoped** : préfixe `.pb-` pour éviter les collisions avec d'autres
  blocs.

### Limites du bloc

- Un seul bloc `product_buy` par page (les IDs DOM sont fixes : `pb-qty`,
  `pb-checkout-btn`, etc.). Si on veut plusieurs blocs par page, il faut
  scope les IDs par index.
- Pas de variantes en stepper / sélecteur déroulant : uniquement radio
  buttons (pour 4-6 options max). Au-delà, à refaire.

## /api/checkout

Fichier : [src/pages/api/checkout.ts](../src/pages/api/checkout.ts).
`prerender = false` → fonction serverless Vercel.

### Payload accepté

```jsonc
POST /api/checkout
Content-Type: application/json

{
  "slug": "totem-carton-automatique",   // requis, doit matcher un produit
  "quantity": 1,                         // optionnel, borné [1, 99]
  "variantId": "f50x190",                // requis si le produit a des variants
  "optionIds": ["porte-flyers"],         // optionnel, filtré contre options du produit
  "customAssetUrl": "https://….blob.vercel-storage.com/x.jpg"  // optionnel, validé
}
```

### Réponse

```json
200 OK
{ "url": "https://checkout.stripe.com/c/pay/cs_test_..." }
```

```json
400/404/500
{ "error": "Message lisible" }
```

### Logique

1. `getEntry('products', slug)` — lookup serveur du produit dans la collection.
2. Validation `active`, `variants` (obligatoire si présent), `optionIds`
   filtrés contre la liste réelle.
3. Construction des `line_items` Stripe :
   - 1 line_item principal avec le `name` et `price` de la variante choisie
   - 1 line_item additionnel par option cochée (chaque option = ligne séparée dans le panier Stripe)
4. Validation de l'URL d'image (rejet si non `http(s)://`).
5. `customAssetUrl` validé : doit être une URL valide ET contenir
   `.blob.vercel-storage.com` (anti-injection — empêche d'attacher l'URL d'un site tiers).
6. `metadata` ajoutée à la fois sur la session ET sur le PaymentIntent
   (via `payment_intent_data.metadata`) — visible dans le dashboard Stripe
   sur la page Payment directement.
7. `description` du PaymentIntent affiche l'URL Blob si présente, pour
   visibilité immédiate.
8. `success_url` / `cancel_url` dérivés de `request.url.origin` (avec
   fallback sur `PUBLIC_SITE_URL` si valide).

### Sécurité

- Le **prix vient du serveur** (fichier JSON), jamais du client → pas de
  manipulation possible.
- `quantity` borné à 99 max.
- `customAssetUrl` doit pointer sur Vercel Blob (vérifié par substring) →
  un attaquant ne peut pas faire passer une URL arbitraire dans la
  metadata Stripe.
- Pas de rate-limit actuellement (cf. security.md, point en suspens).

## /api/upload

Fichier : [src/pages/api/upload.ts](../src/pages/api/upload.ts).

Implémente le pattern `handleUpload` officiel de `@vercel/blob/client` :

1. Le client SDK appelle ce endpoint avec un payload `blob.generate-client-token`.
2. Notre handler valide les contraintes (`onBeforeGenerateToken`) :
   - Types autorisés : `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
   - Taille max : 10 MB
   - `addRandomSuffix: true` → empêche la collision si deux clients uploadent
     un fichier du même nom
3. Vercel Blob renvoie un `clientToken` que le SDK utilise pour PUT le
   fichier directement vers le store.

### Pourquoi pas un upload "classique" multipart vers le serverless ?

Vercel a une limite de **4.5 MB par requête** sur les fonctions
serverless. Pour des PDF ou des images haute déf, c'est insuffisant. Le
pattern client → Blob direct contourne cette limite.

### Hooks utiles

- `onBeforeGenerateToken` : c'est ici qu'on pourrait ajouter de l'auth
  (ex : ne permettre l'upload que si l'utilisateur a passé un check),
  ajouter des metadata supplémentaires, ou taguer le pathname.
- `onUploadCompleted` : appelé par Vercel après l'upload fini (webhook
  interne). On l'utilise actuellement juste pour logger ; on pourrait y
  envoyer un email, lancer un traitement, etc. **Ce hook ne fonctionne
  pas en local** (Vercel ne sait pas atteindre `localhost`).

## /success

Fichier : [src/pages/success.astro](../src/pages/success.astro). SSR.

- Lit `?session_id=cs_...` depuis l'URL.
- Appelle `stripe.checkout.sessions.retrieve(id, { expand: [...] })` pour
  récupérer le détail.
- Affiche : statut paiement, montant total, email client, session ID, et
  un lien vers `customAssetUrl` si présent.
- Si pas de `session_id` → message d'erreur.
- Si Stripe rejette le `session_id` → message d'erreur (avec détail).

C'est la **vue côté client** ; côté admin tu utilises soit le dashboard
Stripe directement, soit cette page avec le bon session_id.

## Stripe metadata — où la voir dans le dashboard

| Type metadata | Visible où | Comment |
|---|---|---|
| `session.metadata` | Dashboard → Payments → clic paiement → lien "Checkout Session" → scroll metadata | 2 clics |
| `payment_intent.metadata` | Dashboard → Payments → clic paiement → directement dans la page | 1 clic ✓ |
| `payment_intent.description` | Tout en haut de la page Payment | 0 clic ✓ |

Notre code écrit aux trois pour visibilité maximale.

## Tests Stripe — cartes utiles

| N° carte | Comportement |
|---|---|
| `4242 4242 4242 4242` | Succès immédiat |
| `4000 0027 6000 3184` | Force 3D Secure |
| `4000 0000 0000 9995` | Refusée pour solde insuffisant |
| `4000 0000 0000 0002` | Refusée (générique) |

Date future quelconque, CVC quelconque, code postal quelconque.

## Cleanup des Blobs

Aucun mécanisme automatique. Pour supprimer programmatiquement :

```ts
import { del } from '@vercel/blob'
await del('https://….blob.vercel-storage.com/old-file.jpg')
```

Un job cron pourrait être ajouté plus tard (ex : supprimer les uploads
anciens de plus de 90 jours qui ne correspondent à aucune commande
Stripe), mais ce n'est pas critique tant que le free tier (1 GB) n'est
pas atteint.

## Webhooks Stripe — pas implémentés

Aucun endpoint `/api/stripe-webhook` actuellement. Tant que la fulfillment
est manuelle (regarder le dashboard, traiter la commande), c'est OK.

**Si on automatise** (envoi mail, notif Slack, mise à jour stock) :
endpoint à ajouter, qui doit valider la signature avec
`stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET)`.
Sans signature, n'importe qui peut faire croire qu'un paiement est
arrivé. Voir security.md.
