// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Chemins exacts exclus du sitemap (transactionnels Stripe, page de test,
// pages orphelines pré-2026 et doublon /realisations/). Doit rester aligné
// avec les directives Disallow correspondantes dans public/robots.txt.
const SITEMAP_EXCLUDE = [
  '/success/',
  '/cancel/',
  '/test-stripe/',
  '/digital/',
  '/display/',
  '/mobilier/',
  '/stand/',
  '/realisations/',
];

// https://astro.build/config
export default defineConfig({
  // Requis par @astrojs/sitemap pour générer des URLs absolues.
  site: 'https://www.kontfeel.fr',
  output: 'static',
  adapter: vercel(),
  integrations: [
    react(),
    sitemap({
      // Pages sans valeur SEO exclues du sitemap. Match EXACT du pathname
      // (pas un includes) pour éviter de capturer par préfixe les vraies
      // rubriques : /stand/ (orphelin) ≠ /stand-evenementiel/,
      // /realisations/ (doublon) ≠ /realisations-plv/ (canonique).
      filter: (page) => !SITEMAP_EXCLUDE.includes(new URL(page).pathname),
    }),
  ],
  redirects: {
    // Migration depuis l'ancien site : Blog PLV → Actualités PLV.
    // Note : Astro n'autorise pas les redirects [...slug] vers une page statique.
    // Les anciens articles individuels (/blog-plv/coup-de-projecteur-...) feront 404
    // tant qu'on n'a pas migré les articles vers une route dynamique. À ce moment,
    // on pourra ajouter '/blog-plv/[...slug]': '/actualites-plv/[...slug]'.
    '/blog-plv': '/actualites-plv',
    // Showroom PLV supprimé (diluait le PageRank) → on récupère le visiteur sur la home
    '/showroom-plv': '/',
    // Doublon nettoyé
    '/demande-de-devis': '/devis',
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
