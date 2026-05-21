#!/usr/bin/env python3
"""
import_posts.py — Migration des articles de blog depuis le site live.

Pipeline jumeau de import_realisations.py mais ciblé sur /blog-plv/<slug> :
  1. lit les lignes `blog-plv/...` du xlsx (url, title, h1, meta_description,
     images_urls)
  2. curl la page live, puis tranche ARTICLE vs PAGE-CATÉGORIE selon la
     présence du corps `div.port-info` :
       • ARTICLE  → extrait port-info → Markdown ; capte date (icône calendar),
                    catégorie (icône folder-open), image → src/content/posts/<slug>.md
       • CATÉGORIE (pas de port-info, ex. /blog-plv/experience-shopper)
                  → capte slug + label (H1) + meta description + intro, et
                    l'ajoute au manifeste src/data/blog-categories.json
  3. télécharge l'image principale dans public/assets/actualites/ sous un nom
     kebab-case propre → `image` pointe en local (idempotent ; réutilise une
     image déjà présente sous public/assets/**).

Le manifeste blog-categories.json permettra de régénérer les pages catégorie
côté front (route à créer, ex. /actualites-plv/categorie/<slug>/). Chaque
article porte un champ `category` (slug) reliant à ce manifeste.

Usage :
  python3 scripts/import_posts.py                 # tout (skip articles déjà présents)
  python3 scripts/import_posts.py slug1 slug2 …   # seulement ceux-ci
  python3 scripts/import_posts.py --force         # écrase les .md existants
  python3 scripts/import_posts.py --dry-run       # n'écrit aucun fichier

⚠️ `tags`/`relatedRealisation`/`relatedLinks`/`tldr` ne sont pas dans la
   source → tags inférés par heuristique ; les autres restent à compléter à la
   main pour le maillage SEO (cf. CLAUDE.md). Date = critère de routage de la
   liste /actualites-plv/ : un article sans date détectée est signalé en fin
   de run. Le corps d'article, lui, est repris verbatim.
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
# Manifeste des catégories blog (slug + label + intro) — sert à régénérer les
# pages catégorie (type kontfeel.fr/blog-plv/experience-shopper) côté front.
CATS_OUT = os.path.join(ROOT, "src", "data", "blog-categories.json")
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
        if "/blog-plv/" not in url:
            continue
        slug = url.split("/blog-plv/")[-1].strip("/")
        # Slug à segment unique uniquement. Article vs page-catégorie est
        # tranché au runtime selon la présence du corps `port-info` (cf. main).
        if not slug or "/" in slug:
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
# Slug de la catégorie depuis le href du lien folder-open.
CAT_HREF_RX = re.compile(
    r"folder-open[^<]*</i>\s*<a[^>]*href=\"[^\"]*/blog-plv/([a-z0-9-]+)\"", re.I)
H1_RX = re.compile(r"<h1[^>]*>(.*?)</h1>", re.S | re.I)

def extract_date(htmltext):
    """Renvoie 'YYYY-MM-DD' ou None."""
    m = DATE_RX.search(htmltext)
    if not m:
        return None
    dd, mm, yyyy = m.group(1), m.group(2), m.group(3)
    return f"{yyyy}-{int(mm):02d}-{int(dd):02d}"

def extract_category(htmltext):
    """Renvoie (slug, label) de la catégorie blog de l'article, ou (None, None)."""
    label_m = CAT_RX.search(htmltext)
    slug_m  = CAT_HREF_RX.search(htmltext)
    label = html.unescape(label_m.group(1).strip()) if label_m else None
    slug  = slug_m.group(1) if slug_m else None
    return slug, label

def extract_h1(htmltext):
    m = H1_RX.search(htmltext)
    return html.unescape(re.sub("<[^>]+>", "", m.group(1)).strip()) if m else None

def extract_intro(htmltext):
    """1er paragraphe substantiel après le H1 (sert d'intro de page catégorie)."""
    seg = htmltext[htmltext.find("<h1"):] if "<h1" in htmltext else htmltext
    for p in re.findall(r"<p[^>]*>(.*?)</p>", seg, re.S):
        t = html.unescape(re.sub(r"\s+", " ", re.sub("<[^>]+>", "", p)).strip())
        if len(t) > 40:
            return t
    return None

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

def build_frontmatter(*, title, date, description, image, image_alt, category, tags):
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
    if category:
        lines.append(f"category: {yaml_string(category)}")
    if tags:
        lines.append(f"tags: {yaml_list(tags)}")
    lines.append("---\n")
    return "\n".join(lines)

# ── 6. Pipeline ──────────────────────────────────────────────────────────────
def write_categories_manifest(categories, dry_run):
    """Écrit src/data/blog-categories.json (trié par label). Idempotent :
    fusionne avec l'existant pour ne pas perdre d'éventuels ajustements manuels
    sur des catégories non revues lors de ce run."""
    existing = {}
    if os.path.exists(CATS_OUT):
        try:
            with open(CATS_OUT, encoding="utf-8") as f:
                for c in __import__("json").load(f):
                    existing[c["slug"]] = c
        except Exception:
            pass
    existing.update({c["slug"]: c for c in categories})
    merged = sorted(existing.values(), key=lambda c: c.get("label", c["slug"]).lower())
    if dry_run:
        print(f"  (dry-run) manifeste catégories : {len(merged)} entrées → {CATS_OUT}")
        return
    os.makedirs(os.path.dirname(CATS_OUT), exist_ok=True)
    import json
    with open(CATS_OUT, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"  ✓ manifeste catégories : {len(merged)} entrées → src/data/blog-categories.json")


def main():
    args = sys.argv[1:]
    force   = "--force"   in args
    dry_run = "--dry-run" in args
    only = {a for a in args if not a.startswith("--")}
    rows = read_blog_rows()
    print(f"Pages /blog-plv/ relevées dans le xlsx : {len(rows)}")
    os.makedirs(OUT, exist_ok=True)
    done = skipped = errors = cats = no_date = 0
    categories = []
    for d in rows:
        slug = d["_slug"]
        if only and slug not in only:
            continue
        url = d.get("final_url") or d["url"]
        if d.get("http_status") not in ("", "200", None):
            print(f"  skip {slug} (HTTP {d.get('http_status')})"); skipped += 1; continue
        try:
            page = fetch(url)
        except Exception as e:
            print(f"  ERREUR fetch {slug}: {e}"); errors += 1; continue

        body_html = grab_div(page, "port-info")
        is_article = bool(body_html and len(body_html) >= 200)

        # ── Page CATÉGORIE (pas de corps port-info) → manifeste, pas un .md ──
        if not is_article:
            label = extract_h1(page) or (d.get("h1") or d.get("title") or slug).strip()
            desc = (d.get("meta_description") or "").strip()
            intro = extract_intro(page) or ""
            categories.append({
                "slug": slug,
                "label": label,
                "description": desc,
                "intro": intro,
            })
            print(f"  ⊞ catégorie : {slug}  («{label}»)")
            cats += 1
            time.sleep(0.6)
            continue

        # ── ARTICLE ─────────────────────────────────────────────────────────
        out_path = os.path.join(OUT, slug + ".md")
        if os.path.exists(out_path) and not force:
            print(f"  skip {slug} (déjà présent — --force pour écraser)")
            skipped += 1
            time.sleep(0.6)
            continue
        md = to_markdown(body_html)
        body_text = re.sub("<[^>]+>", " ", body_html)
        title = (d.get("h1") or d.get("title") or slug).strip()
        desc = (d.get("meta_description") or "").strip()
        date = extract_date(page)
        if not date:
            print(f"  ⚠ {slug}: date introuvable dans la page (à renseigner à la main)")
            no_date += 1
        cat_slug, cat_label = extract_category(page)
        img_src = (d.get("images_urls") or "").split("|")[0].strip()
        image = localize_image(img_src) if img_src else ""
        tags = infer_tags(title, desc, cat_label, body_text)
        fm = build_frontmatter(
            title=title,
            date=date,
            description=desc or title,
            image=image,
            image_alt=title,
            category=cat_slug,
            tags=tags,
        )
        content = fm + "\n" + md + "\n"
        if dry_run:
            print(f"  (dry-run) {slug}  date={date}  cat={cat_slug}  tags={tags}  img={image[:50]}")
        else:
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"  ✓ {slug}  ({len(md)} car. md, date={date}, cat={cat_slug})")
        done += 1
        time.sleep(0.6)  # politesse

    if categories:
        write_categories_manifest(categories, dry_run)

    mode = "(dry-run) " if dry_run else ""
    print(f"\n{mode}Terminé : {done} articles, {cats} catégories, "
          f"{skipped} ignorés, {errors} erreurs.")
    if no_date:
        print(f"⚠ {no_date} article(s) sans date détectée — la liste "
              f"/actualites-plv/ ne route que les posts AVEC date.")

if __name__ == "__main__":
    main()
