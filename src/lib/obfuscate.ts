/**
 * obfuscate — Encodage XOR cyclique + hex pour cacher des URL aux crawlers HTML.
 *
 * But : pas un secret cryptographique. On veut juste qu'aucun parser de liens
 * naïf (Screaming Frog, scrapers, audit SEO tiers) ne reconnaisse l'URL dans
 * le HTML, et que le moteur de recherche ne traite pas l'élément comme un
 * `<a href>` (donc ne transmette pas d'équité PageRank).
 *
 * La clé est volontairement publique : le décodage doit pouvoir s'exécuter
 * côté client. Tout adversaire qui rend la page pourra retrouver les URL ;
 * c'est une protection contre l'analyse statique du HTML, pas contre le
 * rendu JS.
 */

const KEY = 'kf26-x9m-q-zt'

export function obfuscate(plain: string): string {
  let out = ''
  for (let i = 0; i < plain.length; i++) {
    const code = plain.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length)
    out += code.toString(16).padStart(2, '0')
  }
  return out
}

export function deobfuscate(encoded: string): string {
  let out = ''
  for (let i = 0; i < encoded.length; i += 2) {
    const code = parseInt(encoded.substr(i, 2), 16) ^ KEY.charCodeAt((i / 2) % KEY.length)
    out += String.fromCharCode(code)
  }
  return out
}

/** Exposé pour que le script inline du composant <ObfuscatedLink> partage la même clé. */
export const OBF_KEY = KEY
