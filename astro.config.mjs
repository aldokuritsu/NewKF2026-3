// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: vercel(),
  integrations: [react()],
  redirects: {
    // Migration depuis l'ancien site : Blog PLV → Actualités PLV.
    // Note : Astro n'autorise pas les redirects [...slug] vers une page statique.
    // Les anciens articles individuels (/blog-plv/coup-de-projecteur-...) feront 404
    // tant qu'on n'a pas migré les articles vers une route dynamique. À ce moment,
    // on pourra ajouter '/blog-plv/[...slug]': '/actualites-plv/[...slug]'.
    '/blog-plv': '/actualites-plv',
    // Showroom PLV supprimé (diluait le PageRank) → on récupère le visiteur sur la home
    '/showroom-plv': '/',
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
