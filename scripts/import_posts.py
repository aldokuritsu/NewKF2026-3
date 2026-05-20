#!/usr/bin/env python3
"""
import_posts.py — Migration des articles de blog depuis le site live.

Pipeline jumeau de import_realisations.py mais ciblé sur /blog-plv/<slug> :
  1. lit les lignes `blog-plv/...` du xlsx (url, title, h1, meta_description,
     images_urls)
  2. curl la page live, extrait `div.port-info` (corps d'article, MÊME classe
     que les réalisations — le site utilise un template unifié) → Markdown
  3. extrait depuis le HTML : date publiée (icône calendar), catégorie blog
     (icône folder-open)
  4. télécharge l'image principale dans public/assets/actualites/ sous un
     nom kebab-case propre → `image` pointe en local (idempotent)
  5. écrit src/content/posts/<slug>.md avec frontmatter YAML
     (title/date/description/image/imageAlt/author/tags/...) suivi du
     corps Markdown.

Usage :
  python3 scripts/import_posts.py                 # tous (skip si déjà présent)
  python3 scripts/import_posts.py slug1 slug2 …   # seulement ceux-ci
  python3 scripts/import_posts.py --force         # écrase les .md existants
  python3 scripts/import_posts.py --dry-run       # n'écrit aucun fichier

⚠️ `tags` et `relatedRealisation`/`relatedLinks`/`tldr` ne sont pas dans la
   source → tags inférés par heuristique mots-clés ; les autres restent à
   compléter à la main pour le maillage SEO (cf. CLAUDE.md). Le corps
   d'article, lui, est repris verbatim.
"""
import sys, os, re, time, html, zipfile, subprocess, unicodedata, urllib.parse
import xml.etree.ElementTree as ET

# On réutilise le HTML→Markdown et fetch de l'import des réalisations
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from import_realisations import grab_div, to_markdown, fetch, _kebab  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.path.join(ROOT, "kontfeel_seo_full.xlsx")
OUT  = os.path.join(ROOT, "src", "content", "posts")
IMG_OUT = os.path.join(ROOT, "public", "assets", "actualites")
IMG_WEB = "/assets/actualites"
PUBLIC_ASSETS = os.path.join(ROOT, "public", "assets")
NS   = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

# ── 1. Lecture xlsx, filtre sur /blog-plv/ ───────────────────────────────────
def read_blog_rows():
    z = zipfile.ZipFile(XLSX)
    def colnum_to_letters(n):
        s = ""
        while n >= 0:
            s = chr(n % 26 + 65) + s
            n = n // 26 - 1
        return s
    def cell_text(c):
        t = c.get("t"); v = c.find(f"{NS}v"); isn = c.find(f"{NS}is")
        if t == "inlineStr" and isn is not None:
            return "".join(x.text or "" for x in isn.iter(f"{NS}t"))
        return (v.text or "") if v is not None else ""
    root = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
    rows = root.findall(f".//{NS}row")
    hdr = [cell_text(c) for c in rows[0].findall(f"{NS}c")]
    cmap = {colnum_to_letters(i): h for i, h in enumerate(hdr)}
    out = []
    for r in rows[1:]:
        d = {}
        for c in r.findall(f"{NS}c"):
            letter = re.match(r"[A-Z]+", c.get("r")).group(0)
            d[cmap.get(letter, letter)] = cell_text(c)
        url = d.get("url", "")
        # Garde uniquement les vrais articles : /blog-plv/<slug> (pas la page
        # index `/blog-plv/conseils-et-astuces-plv` qui est elle-même le hub).
        if "/blog-plv/" not in url:
            continue
        slug = url.split("/blog-plv/")[-1].strip("/")
        if not slug or slug == "conseils-et-astuces-plv":
            continue
        d["_slug"] = slug
        out.append(d)
    return out

# ── 2. Extraction date & catégorie depuis la page live ──────────────────────
DATE_RX = re.compile(r"calendar[^<]*</i>\s*(\d{1,2})/(\d{1,2})/(\d{4})", re.I)
# Catégorie : libellé après l'icône folder-open, soit en texte brut soit
# enveloppé dans un <a href="/blog-plv/<cat>">Libellé</a>.
CAT_RX  = re.compile(
    r"folder-open[^<]*</i>\s*(?:<a[^>]*>)?\s*([^<\n]+?)\s*<", re.I)

def extract_date(htmltext):
    """Renvoie 'YYYY-MM-DD' ou None."""
    m = DATE_RX.search(htmltext)
    if not m:
        return None
    dd, mm, yyyy = m.group(1), m.group(2), m.group(3)
    return f"{yyyy}-{int(mm):02d}-{int(dd):02d}"

def extract_category(htmltext):
    """Renvoie le libellé de catégorie blog (ex. 'Conseils et Astuces PLV')."""
    m = CAT_RX.search(htmltext)
    if not m:
        return None
    return html.unescape(m.group(1).strip()) or None

# ── 3. Heuristique tags (depuis titre + description + catégorie) ────────────
TAG_RULES = [
    (r"carton",                              "PLV carton"),
    (r"comptoir",                            "Présentoir comptoir"),
    (r"sol|box.?palette|fsdu",               "Présentoir sol"),
    (r"th[ée]atralisation|vitrine|shop.?in", "Théâtralisation magasin"),
    (r"signal[ée]?tique|stop.?rayon|rappel|ilv|lin[ée]aire", "Signalétique magasin"),
    (r"stand|salon|[ée]v[ée]nement|festival","Événementiel"),
    (r"packaging|coffret|[ée]tui|fourreau",  "Packaging"),
    (r"pharma|sant[ée]|parapharm",           "Pharmacie & santé"),
    (r"cosm[ée]tiqu|beaut|parfum|maquillage","Beauté & cosmétique"),
    (r"librairie|livre|[ée]dition|culture",  "Édition & culture"),
    (r"gms|grande distribution|hyper|super", "Grande distribution"),
    (r"[ée]coresponsable|recycl|durable|biosourc[ée]", "Éco-conception"),
    (r"design|cr[ée]atif|3d",                "Design PLV"),
    (r"jardin|outillage|bricolage",          "Maison & jardin"),
    (r"impression|imprim",                   "Impression"),
]
def infer_tags(title, desc, category, body):
    pool = " ".join([title, desc or "", category or "", body[:600]]).lower()
    found = []
    for rx, tag in TAG_RULES:
        if re.search(rx, pool) and tag not in found:
            found.append(tag)
        if len(found) >= 4:
            break
    if category and category not in found:
        found.insert(0, category)
    return found[:5] or ["PLV"]

# ── 4. Image locale (idempotent) ────────────────────────────────────────────
def build_assets_index():
    idx = {}
    for root, _, files in os.walk(PUBLIC_ASSETS):
        for fn in files:
            rel = os.path.relpath(os.path.join(root, fn), os.path.dirname(PUBLIC_ASSETS))
            idx.setdefault(fn, "/" + rel.replace(os.sep, "/"))
    return idx

_ASSETS_INDEX = None

def localize_image(url):
    """Télécharge dans public/assets/actualites/ sous un nom kebab-case ASCII.
    Si le fichier existe déjà n'importe où sous public/assets/, on réutilise
    ce chemin (économise un download + évite les doublons)."""
    global _ASSETS_INDEX
    if _ASSETS_INDEX is None:
        _ASSETS_INDEX = build_assets_index()
    if not url.startswith(("http://", "https://")):
        return url
    raw = urllib.parse.unquote(url.split("/")[-1])
    raw = unicodedata.normalize("NFC", raw)
    # 1) déjà présent sous public/assets/** ?
    if raw in _ASSETS_INDEX:
        return _ASSETS_INDEX[raw]
    # 2) télécharger sous un nom propre dans public/assets/actualites/
    clean = _kebab(raw)
    if clean in _ASSETS_INDEX:
        return _ASSETS_INDEX[clean]
    dest = os.path.join(IMG_OUT, clean)
    web  = f"{IMG_WEB}/{clean}"
    if os.path.exists(dest):
        _ASSETS_INDEX[clean] = web
        return web
    os.makedirs(IMG_OUT, exist_ok=True)
    r = subprocess.run(
        ["curl", "-sSL", "--fail", "--max-time", "30",
         "-A", "Mozilla/5.0 (KontfeelMigration)", "-o", dest, url],
        capture_output=True,
    )
    if r.returncode != 0:
        print(f"  ⚠ image non téléchargée ({url}): rc={r.returncode}")
        if os.path.exists(dest) and os.path.getsize(dest) == 0:
            os.remove(dest)
        return url
    _ASSETS_INDEX[clean] = web
    return web

# ── 5. Frontmatter YAML (stdlib only) ───────────────────────────────────────
def yaml_string(s):
    """Quote un scalaire YAML, gère guillemets et sauts de ligne."""
    if s is None:
        return '""'
    s = str(s).replace("\\", "\\\\").replace('"', '\\"')
    # YAML accepte les " avec échappement basique ; on évite les newlines.
    s = s.replace("\n", " ").replace("\r", " ").strip()
    return f'"{s}"'

def yaml_list(items):
    if not items:
        return "[]"
    parts = [yaml_string(i) for i in items]
    return "[" + ", ".join(parts) + "]"

def build_frontmatter(*, title, date, description, image, image_alt, tags):
    lines = ["---"]
    lines.append(f"title: {yaml_string(title)}")
    if date:
        lines.append(f'date: "{date}"')
    if description:
        lines.append(f"description: {yaml_string(description)}")
    if image:
        lines.append(f"image: {yaml_string(image)}")
    if image_alt:
        lines.append(f"imageAlt: {yaml_string(image_alt)}")
    lines.append('author: "Équipe Kontfeel"')
    if tags:
        lines.append(f"tags: {yaml_list(tags)}")
    lines.append("---\n")
    return "\n".join(lines)

# ── 6. Pipeline ──────────────────────────────────────────────────────────────
def main():
    args = sys.argv[1:]
    force   = "--force"   in args
    dry_run = "--dry-run" in args
    only = {a for a in args if not a.startswith("--")}
    rows = read_blog_rows()
    print(f"Articles relevés dans le xlsx : {len(rows)}")
    os.makedirs(OUT, exist_ok=True)
    done = skipped = errors = 0
    for d in rows:
        slug = d["_slug"]
        if only and slug not in only:
            continue
        url = d.get("final_url") or d["url"]
        if d.get("http_status") not in ("", "200", None):
            print(f"  skip {slug} (HTTP {d.get('http_status')})"); skipped += 1; continue
        out_path = os.path.join(OUT, slug + ".md")
        if os.path.exists(out_path) and not force:
            print(f"  skip {slug} (déjà présent — --force pour écraser)")
            skipped += 1
            continue
        try:
            page = fetch(url)
        except Exception as e:
            print(f"  ERREUR fetch {slug}: {e}"); errors += 1; continue
        body_html = grab_div(page, "port-info")
        if not body_html or len(body_html) < 200:
            print(f"  ⚠ {slug}: port-info introuvable/court — ignoré"); skipped += 1; continue
        md = to_markdown(body_html)
        body_text = re.sub("<[^>]+>", " ", body_html)
        title = (d.get("h1") or d.get("title") or slug).strip()
        desc = (d.get("meta_description") or "").strip()
        date = extract_date(page)
        category = extract_category(page)
        img_src = (d.get("images_urls") or "").split("|")[0].strip()
        image = localize_image(img_src) if img_src else ""
        tags = infer_tags(title, desc, category, body_text)
        fm = build_frontmatter(
            title=title,
            date=date,
            description=desc or title,
            image=image,
            image_alt=title,
            tags=tags,
        )
        content = fm + "\n" + md + "\n"
        if dry_run:
            print(f"  (dry-run) {slug}  date={date}  cat={category}  tags={tags}  img={image[:60]}")
        else:
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"  ✓ {slug}  ({len(md)} car. md, date={date}, {len(tags)} tags)")
        done += 1
        time.sleep(0.6)  # politesse
    mode = "(dry-run) " if dry_run else ""
    print(f"\n{mode}Terminé : {done} traités, {skipped} ignorés, {errors} erreurs.")

if __name__ == "__main__":
    main()
