import type { APIRoute } from 'astro'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as HandleUploadBody

    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
        maximumSizeInBytes: 10 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('[blob upload] terminé :', blob.url)
      },
    })

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[blob upload] erreur :', err)
    return new Response(JSON.stringify({ error: err?.message ?? 'Upload failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
