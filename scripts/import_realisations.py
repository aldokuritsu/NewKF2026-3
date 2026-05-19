#!/usr/bin/env python3
"""
import_realisations.py — Migration des réalisations depuis le site live.

Le xlsx (crawl SEO) ne contient que ~800 car. d'extrait → le contenu INTÉGRAL
n'existe que sur kontfeel.fr. Ce script :
  1. lit les lignes `realisations-plv/...` du xlsx (url, title, h1,
     meta_description, images_urls)
  2. curl la page live, extrait `div.port-info` (corps d'article) → Markdown
     fidèle (h2/h3/p/ul/strong/a/blockquote préservés) + `div.port-meta`
  3. écrit src/content/realisations/<slug>.json : champs structurés + un bloc
     `text_editorial` portant l'article complet (rendu via BlockRenderer).

Usage :
  python3 scripts/import_realisations.py                 # toutes les réalisations
  python3 scripts/import_realisations.py slug1 slug2 …   # seulement celles-ci

⚠️ `date`, `client`, `sector`, `results` ne sont PAS dans la source (xlsx ni
   site) → heuristiques + placeholders, À VALIDER. Le corps d'article, lui,
   est repris verbatim.
"""
import sys, os, re, json, time, html, zipfile, subprocess
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.path.join(ROOT, "kontfeel_seo_full.xlsx")
OUT  = os.path.join(ROOT, "src", "content", "realisations")
NS   = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

# ── 1. Lecture xlsx (stdlib, inlineStr) ──────────────────────────────────────
def read_rows():
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
        if "realisations-plv/" in d.get("url", ""):
            out.append(d)
    return out

# ── 2. Extraction du conteneur (scan équilibré des <div>) ────────────────────
def grab_div(htmltext, classprefix):
    m = re.search(r'<div class="%s[^"]*"[^>]*>' % re.escape(classprefix), htmltext)
    if not m:
        return None
    start = m.end()
    depth = 1
    for mm in re.finditer(r"<(/?)div\b[^>]*>", htmltext[start:]):
        depth += -1 if mm.group(1) else 1
        if depth == 0:
            return htmltext[start:start + mm.start()]
    return htmltext[start:]

# ── 3. HTML → Markdown (fidèle, stdlib) ──────────────────────────────────────
class MD(HTMLParser):
    SKIP = {"script", "style", "svg", "form", "button", "noscript"}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.skip = 0
        self.a_href = None
        self.list_stack = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in self.SKIP:
            self.skip += 1; return
        if self.skip: return
        if tag in ("h2", "h3", "h4"):
            self.out.append("\n\n" + "#" * int(tag[1]) + " ")
        elif tag == "p":
            self.out.append("\n\n")
        elif tag == "br":
            self.out.append("  \n")
        elif tag in ("strong", "b"):
            self.out.append("**")
        elif tag in ("em", "i"):
            self.out.append("*")
        elif tag == "blockquote":
            self.out.append("\n\n> ")
        elif tag == "ul":
            self.list_stack.append("ul"); self.out.append("\n")
        elif tag == "ol":
            self.list_stack.append("ol"); self.out.append("\n")
        elif tag == "li":
            self.out.append("\n- " if (self.list_stack[-1:] or ["ul"])[-1] == "ul" else "\n1. ")
        elif tag == "a":
            self.a_href = a.get("href")
            self.out.append("[")
    def handle_endtag(self, tag):
        if tag in self.SKIP:
            self.skip = max(0, self.skip - 1); return
        if self.skip: return
        if tag in ("strong", "b"):
            self.out.append("**")
        elif tag in ("em", "i"):
            self.out.append("*")
        elif tag == "a":
            href = self.a_href or ""
            self.out.append(f"]({href})" if href else "]")
            self.a_href = None
        elif tag in ("ul", "ol"):
            if self.list_stack: self.list_stack.pop()
            self.out.append("\n")
        elif tag == "blockquote":
            self.out.append("\n")
    def handle_data(self, data):
        if self.skip: return
        self.out.append(re.sub(r"[ \t ]+", " ", data))
    def markdown(self):
        txt = "".join(self.out)
        txt = html.unescape(txt)
        txt = re.sub(r"[ \t]+\n", "\n", txt)
        # blockquotes vides (wrappers décoratifs sans texte) → supprimés
        txt = re.sub(r"(?m)^>[ \t]*$", "", txt)
        txt = re.sub(r"\n{3,}", "\n\n", txt)
        return txt.strip()

def to_markdown(inner_html):
    p = MD()
    p.feed(inner_html)
    return p.markdown()

# ── 4. Heuristiques champs structurés (À VALIDER) ────────────────────────────
SECTOR_RULES = [
    (r"pharma|sant[ée]|parapharm", "Pharmacie & Santé"),
    (r"cosm[ée]tiqu|beaut|parfum|maquillage", "Beauté & Cosmétique"),
    (r"spiritueu|whisky|gin|rhum|vin|champagne|boisson|bi[èe]re", "Spiritueux & Boissons"),
    (r"librairie|livre|[ée]dition|manga|culture", "Édition & Culture"),
    (r"agro|[ée]picerie|terroir|aliment", "Agroalimentaire"),
    (r"bricolage|jardin|m[ée]tal|inox|bois", "Bricolage & Maison"),
    (r"[ée]v[ée]nement|salon|stand|noel|noël", "Événementiel"),
]
def infer_sector(text):
    t = text.lower()
    for rx, lab in SECTOR_RULES:
        if re.search(rx, t):
            return lab
    return "Retail & GMS"

def infer_client(title, h1, meta, body):
    # marques explicitement nommées dans le corps (liens externes fréquents)
    for m in re.finditer(r"(?:Maison|Groupe)\s+[A-ZÉ][\wÉéèê-]+", body):
        return m.group(0)
    m = re.search(r"\bpour (?:la |le |l['’]|les )?([A-ZÉ][\wÉéèê’'&\- ]{2,40})", title + " " + meta)
    if m:
        return m.group(1).strip(" .")
    return "Client confidentiel"

def derive_results(port_meta_text):
    # port-meta = chips process/lieu — repris en repères qualitatifs (à valider)
    parts = [p.strip() for p in re.split(r"\s{2,}|\|", re.sub(r"<[^>]+>", "  ", port_meta_text or "")) if p.strip()]
    parts = [p for p in parts if 2 < len(p) < 40][:3]
    return [{"value": p, "label": ""} for p in parts] or [
        {"value": "Sur mesure", "label": "Conception & fabrication"},
        {"value": "Fabrication française", "label": "Production intégrée"},
    ]

# ── 5. Pipeline ──────────────────────────────────────────────────────────────
def fetch(url):
    # curl : gère TLS/redirections là où urllib échoue (certifs macOS).
    r = subprocess.run(
        ["curl", "-sSL", "--fail", "--max-time", "30",
         "-A", "Mozilla/5.0 (KontfeelMigration)", url],
        capture_output=True,
    )
    if r.returncode != 0:
        raise RuntimeError(f"curl rc={r.returncode}: {r.stderr.decode('utf-8','ignore')[:120]}")
    return r.stdout.decode("utf-8", "ignore")

def main():
    only = set(sys.argv[1:])
    rows = read_rows()
    os.makedirs(OUT, exist_ok=True)
    done = skipped = 0
    for d in rows:
        url = d.get("final_url") or d["url"]
        slug = d["url"].split("realisations-plv/")[-1].strip("/")
        if only and slug not in only:
            continue
        if d.get("http_status") not in ("", "200", None):
            print(f"  skip {slug} (HTTP {d.get('http_status')})"); skipped += 1; continue
        try:
            page = fetch(url)
        except Exception as e:
            print(f"  ERREUR fetch {slug}: {e}"); skipped += 1; continue
        body_html = grab_div(page, "port-info")
        if not body_html or len(body_html) < 200:
            print(f"  ⚠ {slug}: port-info introuvable/court — ignoré"); skipped += 1; continue
        md = to_markdown(body_html)
        meta_div = grab_div(page, "port-meta") or ""
        meta_txt = re.sub(r"\s+", " ", re.sub("<[^>]+>", "  ", meta_div)).strip()

        title = (d.get("h1") or d.get("title") or slug).strip()
        desc = (d.get("meta_description") or title).strip()
        img = (d.get("images_urls") or "").split("|")[0].strip() or \
              "/assets/realisations/arche-evenementielle-sur-mesure.jpg"
        body_text = re.sub("<[^>]+>", " ", body_html)
        sector = infer_sector(title + " " + desc + " " + d.get("url", ""))
        client = infer_client(title, d.get("h1", ""), desc, body_text)

        data = {
            "title": title,
            "client": client,
            "sector": sector,
            "date": "2025-01",  # ⚠ ABSENT de la source — placeholder à valider
            "description": desc,
            "challenge": desc,
            "solution": "Conception, fabrication et logistique sur mesure par KONTFEEL — détail du projet ci-dessous.",
            "results": derive_results(meta_txt),
            "image": img,
            "imageAlt": title,
            "blocks": [
                {"_template": "text_editorial", "content": md}
            ],
            "active": True,
        }
        with open(os.path.join(OUT, slug + ".json"), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"  ✓ {slug}  ({len(md)} car. markdown)")
        done += 1
        time.sleep(0.7)  # politesse
    print(f"\nTerminé : {done} écrites, {skipped} ignorées.")

if __name__ == "__main__":
    main()
