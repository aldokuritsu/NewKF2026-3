# Guide de setup — Astro 6 + Sveltia CMS + Tailwind 4 + React

> Retour d'expérience complet issu du projet KONTFEEL / Kontfeel2026-V3.
> À suivre dans l'ordre pour éviter toutes les erreurs rencontrées.

---

## 1. Stack et versions validées

| Package | Version | Rôle |
|---|---|---|
| `astro` | ^6.1.5 | Framework SSR/SSG |
| `tailwindcss` | ^4.2.2 | CSS utilitaire |
| `@tailwindcss/vite` | ^4.2.2 | Plugin Vite pour Tailwind 4 |
| `@astrojs/react` | latest | Renderer React dans Astro |
| `react` + `react-dom` | latest | Composants interactifs |
| Sveltia CMS | dernière version (CDN) | CMS Git-based, chargé dans `/admin/` |

Sveltia CMS n'est **pas** un package npm dans ce projet : il est chargé via CDN dans `public/admin/index.html`. Le contenu est versionné dans `src/content/` et committé via GitHub.

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
/* ⚠️ Ne jamais mettre @import url() ici après — voir point 4 */
```

### Étape 3 — Installer React

```bash
npm install @astrojs/react react react-dom
```

### Étape 4 — Mettre en place Sveltia CMS

Sveltia CMS est servi statiquement depuis `/admin/`. Créer deux fichiers dans `public/admin/` :

**`public/admin/index.html`** :

```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Sveltia CMS — Kontfeel</title>
  </head>
  <body>
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
  </body>
</html>
```

**`public/admin/config.yml`** : déclaration des collections (silos, pages enfants, articles…) qui pointent vers les fichiers JSON/Markdown de `src/content/`.

```yaml
backend:
  name: github
  repo: <org>/<repo>
  branch: main

media_folder: public/assets
public_folder: /assets

collections:
  - name: silos
    folder: src/content/silos
    extension: json
    # ...champs
```

### Étape 5 — Scripts de dev

```json
"scripts": {
  "dev":     "astro dev",
  "build":   "astro build",
  "preview": "astro preview"
}
```

Aucun proxy CMS n'est nécessaire : Sveltia tourne entièrement dans le navigateur côté `/admin/` et parle directement à GitHub (ou au système de fichiers local en mode "Work with Local Repository").

---

## 3. Sveltia CMS — pièges à éviter

### Édition locale (sans GitHub)

Pour éditer le contenu hors-ligne :

1. Lancer `npm run dev`.
2. Ouvrir `http://localhost:4321/admin/` dans **Chrome ou Edge** (l'API File System Access n'est pas supportée par Firefox/Safari).
3. Cliquer sur « **Work with Local Repository** » et pointer le dossier racine du projet.
4. Les modifications écrivent directement dans `src/content/`.

### Édition GitHub

En mode `backend.name: github`, Sveltia commit directement sur la branche déclarée. Vérifier que :

- Le repo dans `config.yml` correspond au bon fork/org.
- L'utilisateur a les droits d'écriture (sinon les sauvegardes échouent silencieusement).
- L'OAuth GitHub est configuré côté hébergeur si on veut ouvrir l'admin en prod.

### Schéma JSON / Markdown

Sveltia n'a **pas** de couche GraphQL : il écrit/lit directement les fichiers déclarés dans `config.yml`. Donc :

- Pas de contrainte « fields can merge » comme avec d'autres CMS headless.
- Les collections de type `files` ou `folder` doivent matcher exactement la structure réelle de `src/content/`.
- Tout changement de schéma dans `config.yml` est immédiat — pas de regénération de client.

### Médias

`media_folder: public/assets` + `public_folder: /assets` → les images uploadées sont écrites dans `public/assets/` et référencées en `/assets/...` dans le contenu. C'est cette URL publique qui est consommée par Astro.

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

## 5. Architecture cocon sémantique (siloing strict)

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

### Collections Sveltia correspondantes

Dans `public/admin/config.yml`, déclarer une collection par type de page :

```yaml
collections:
  - name: silo_page
    folder: src/content/silos
    extension: json
    # ...

  - name: child_page
    folder: src/content/pages
    extension: json
    # ...
```

---

## 6. Checklist de démarrage d'un nouveau projet

- [ ] `npm create astro@latest`
- [ ] Installer Tailwind 4 + @tailwindcss/vite
- [ ] Installer `@astrojs/react react react-dom`
- [ ] Ajouter `react()` dans `astro.config.mjs`
- [ ] Créer `public/admin/index.html` avec le script Sveltia CDN
- [ ] Créer `public/admin/config.yml` avec backend GitHub + collections
- [ ] Vérifier que `media_folder` + `public_folder` matchent la convention Astro (`public/assets` ↔ `/assets`)
- [ ] Google Fonts → `<link>` dans BaseLayout, jamais dans le CSS
- [ ] Tester l'admin en local (Chrome/Edge → `/admin/` → Work with Local Repository)
- [ ] Vérifier qu'un commit Sveltia atterrit bien sur la bonne branche du bon repo
