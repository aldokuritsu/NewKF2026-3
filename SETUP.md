# Guide de setup — Astro 6 + TinaCMS 3 + Tailwind 4 + React

> Retour d'expérience complet issu du projet KONTFEEL / AstroTina2026.
> À suivre dans l'ordre pour éviter toutes les erreurs rencontrées.

---

## 1. Stack et versions validées

| Package | Version | Rôle |
|---|---|---|
| `astro` | ^6.1.5 | Framework SSR/SSG |
| `tinacms` | ^3.7.2 | CMS headless + éditeur visuel |
| `@tinacms/cli` | ^2.2.2 | Commande `tinacms dev` |
| `@tinacms/auth` | ^1.1.2 | Auth TinaCMS (local + cloud) |
| `tailwindcss` | ^4.2.2 | CSS utilitaire |
| `@tailwindcss/vite` | ^4.2.2 | Plugin Vite pour Tailwind 4 |
| `@astrojs/react` | latest | Renderer React dans Astro |
| `react` + `react-dom` | latest | Requis par TinaCMS et @astrojs/react |

---

## 2. Installation dans le bon ordre

### Étape 1 — Créer le projet Astro

```bash
npm create astro@latest mon-projet
cd mon-projet
```

### Étape 2 — Installer Tailwind 4

```bash
npm install tailwindcss @tailwindcss/vite
```

Dans `astro.config.mjs` :

```js
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
})
```

Dans `src/styles/global.css` :

```css
@import "tailwindcss";
/* ⚠️ Ne jamais mettre @import url() ici après — voir point 5 */
```

### Étape 3 — Installer React (requis par TinaCMS)

**Toujours utiliser `--legacy-peer-deps`** pour résoudre les conflits de versions entre TinaCMS et les autres packages.

```bash
npm install @astrojs/react react react-dom --legacy-peer-deps
```

### Étape 4 — Installer TinaCMS

```bash
npm install tinacms @tinacms/auth
npm install -D @tinacms/cli
```

Si des erreurs de dépendances manquantes apparaissent après :

```bash
npm install fs-extra slate slate-dom --legacy-peer-deps
```

### Étape 5 — Script de dev

Dans `package.json`, TinaCMS **doit envelopper** Astro (pas l'inverse) :

```json
"scripts": {
  "dev":     "tinacms dev -c \"astro dev\"",
  "build":   "tinacms build && astro build",
  "preview": "astro preview"
}
```

---

## 3. Configuration TinaCMS — pièges GraphQL

### ⚠️ Règle "Fields Can Merge"

TinaCMS génère un schéma GraphQL avec des **unions de blocs**. Tous les blocs partagent la même sélection GraphQL, donc :

**Règle 1 — Pas de `required: true` sur des champs portant le même nom.**

Si deux blocs ont un champ `heading`, l'un avec `required: true` (→ `String!`) et l'autre sans (→ `String`), GraphQL refuse de les merger.

```typescript
// ❌ Interdit si d'autres blocs ont aussi "heading" sans required
{ type: "string", name: "heading", required: true }

// ✅ Correct
{ type: "string", name: "heading" }
```

**Règle 2 — Des champs du même nom doivent avoir le même type.**

Si deux blocs ont un champ `body`, l'un en `rich-text` (→ JSON) et l'autre en `string` (→ String), GraphQL refuse.

```typescript
// ❌ Conflit : body est à la fois JSON et String
// bloc text_editorial :
{ type: "rich-text", name: "body" }
// bloc cta_banner :
{ type: "string", name: "body" }

// ✅ Nommer différemment
{ type: "rich-text", name: "content" }  // dans text_editorial
{ type: "string",    name: "body" }     // dans cta_banner
```

**Règle 3 — Après toute modification de `tina/config.ts`, supprimer les fichiers générés.**

TinaCMS peut valider des fichiers générés stales et bloquer le démarrage :

```bash
# Supprimer tout sauf static-media.json
rm tina/__generated__/client.ts
rm tina/__generated__/frags.gql
rm tina/__generated__/schema.gql
rm tina/__generated__/types.ts
# Puis relancer npm run dev pour régénérer
```

### ⚠️ Ne pas utiliser `visualSelector: true` sans thumbnails

```typescript
// ❌ Cause un block picker vide/cassé dans la sidebar
ui: {
  visualSelector: true,
},

// ✅ Retirer simplement l'option ui
```

---

## 4. Google Fonts — ordre des imports CSS

Tailwind 4 (via PostCSS) génère des règles CSS avant de processer le fichier. Un `@import url()` après `@import "tailwindcss"` provoque l'erreur :

```
@import must precede all other statements
```

**Solution : ne jamais mettre Google Fonts dans le CSS.** Les mettre dans le `<head>` du layout :

```astro
<!-- Dans BaseLayout.astro -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:...&display=swap" rel="stylesheet" />
```

---

## 5. Connecter TinaCMS Visual Editor à Astro

### Le problème

Astro est un framework SSR — les pages sont rendues côté serveur. TinaCMS ne peut pas détecter automatiquement quel document JSON correspond à la page affichée. Sans connexion explicite, la sidebar affiche :

> "TinaCMS form fields will appear here."

### La solution : `TinaPageBridge`

Créer `src/components/TinaPageBridge.tsx` :

```tsx
import { useTina } from 'tinacms/dist/react'

interface Props {
  query:     string
  variables: Record<string, unknown>
  data:      Record<string, unknown>
}

export default function TinaPageBridge({ query, variables, data }: Props) {
  // Enregistre le document dans TinaCMS → la sidebar affiche le formulaire
  useTina({ query, variables, data })
  return null  // Aucun rendu visuel
}
```

Dans chaque page Astro, **passer le résultat complet** de la requête TinaCMS (pas seulement `data`) et monter le bridge en `client:load` :

```astro
---
import TinaPageBridge from '../../components/TinaPageBridge'
import { client } from '../../../tina/__generated__/client'

// getStaticPaths : stocker le résultat complet
let tinaResult = null
try {
  tinaResult = await client.queries.ma_collection({ relativePath: '...' })
} catch {}

const pageData = tinaResult?.data?.ma_collection ?? null
---

{tinaResult && (
  <TinaPageBridge
    query={tinaResult.query}
    variables={tinaResult.variables}
    data={tinaResult.data}
    client:load
  />
)}

<!-- Rendu normal Astro en dessous -->
```

### Pourquoi `client:load` ?

Le hook `useTina` a besoin de tourner côté client pour ouvrir le canal WebSocket avec TinaCMS. `client:load` monte le composant React dès que la page est chargée dans le navigateur.

---

## 6. Architecture cocon sémantique (siloing strict)

### Principe

- **1 hub** (`/`) → liens vers toutes les pages piliers
- **6 silos** (`/[silo]/`) → page pilier + enfants
- **N pages enfants** (`/[silo]/[slug]/`)
- **Règle absolue** : aucun lien ne traverse les silos

### NavbarSilo vs NavbarHome

```astro
<!-- BaseLayout.astro : switche automatiquement selon siloSlug -->
{siloSlug
  ? <NavbarSilo siloSlug={siloSlug} />
  : <NavbarHome />
}
```

- `NavbarHome` : liens vers les 6 pages piliers
- `NavbarSilo` : logo → `/` + enfants du silo courant **seulement**
- `Footer` : liens vers les 6 piliers uniquement (jamais vers les enfants)

### Structure des fichiers de contenu

```
src/content/
  silos/
    plv-carton.json        ← page pilier
    plv-plastique.json
    ...
  pages/
    plv-carton/
      totem-carton.json    ← page enfant
      totem-arche.json
      ...
```

### Collections TinaCMS correspondantes

```typescript
// silo_page  → path: "src/content/silos",    format: "json"
// child_page → path: "src/content/pages",    format: "json"
```

---

## 7. Checklist de démarrage d'un nouveau projet

- [ ] `npm create astro@latest`
- [ ] Installer Tailwind 4 + @tailwindcss/vite
- [ ] Installer `@astrojs/react react react-dom --legacy-peer-deps`
- [ ] Installer `tinacms @tinacms/auth` + `@tinacms/cli` en dev
- [ ] Si erreur fs-extra/slate : `npm install fs-extra slate slate-dom --legacy-peer-deps`
- [ ] Ajouter `react()` dans `astro.config.mjs`
- [ ] Google Fonts → `<link>` dans BaseLayout, jamais dans le CSS
- [ ] Pas de `required: true` sur champs partagés entre blocs
- [ ] Pas de même nom de champ avec types différents entre blocs
- [ ] Pas de `visualSelector: true` sans thumbnails SVG
- [ ] Créer `TinaPageBridge.tsx` + le monter en `client:load` dans chaque page
- [ ] Passer `{ query, variables, data }` (pas seulement `data.blocks`) au bridge
