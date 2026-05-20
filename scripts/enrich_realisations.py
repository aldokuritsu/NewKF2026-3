#!/usr/bin/env python3
"""
enrich_realisations.py — Enrichit les JSON de réalisations avec l'ordre éditorial
et la catégorie tels qu'affichés sur kontfeel.fr/realisations.

Crawle les 6 pages de pagination /realisations[/page-N], extrait pour chaque
portfolio-item le slug, l'image et la catégorie (texte du badge en overlay),
puis patche src/content/realisations/<slug>.json :
  - ajoute   `category` (string)
  - ajoute   `order` (int, 0-based dans l'ordre du site live)
  - supprime `date`

Les JSON absents du site live (slugs en plus) reçoivent order = 9999 + index alpha,
catégorie héritée d'une heuristique mot-clé (pour rester filtrables).
"""
import os, re, json, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, "src", "content", "realisations")
BASE = "https://www.kontfeel.fr/realisations"
PAGES = [BASE] + [f"{BASE}/page-{n}" for n in range(2, 7)]  # pages 1..6

# Catégories officielles du site (label affiché → slug réutilisable)
CATEGORIES = [
    "PLV 3D",
    "PLV de comptoir",
    "PLV de sol",
    "Événementielle",
    "ILV",
    "Signalétique",
    "Théâtralisation",
]

def fetch(url):
    r = subprocess.run(
        ["curl", "-sSL", "--fail", "--max-time", "30",
         "-A", "Mozilla/5.0 (KontfeelMigration)", url],
        capture_output=True,
    )
    if r.returncode != 0:
        raise RuntimeError(f"curl {url} rc={r.returncode}")
    return r.stdout.decode("utf-8", "ignore")

# <div class="portfolio-item"> ... <a href=".../realisations-plv/<slug>" ... <a href=".../realisations/<cat>">Label</a>
ITEM_RX = re.compile(
    r'<div class="portfolio-item".*?'
    r'href="https://www\.kontfeel\.fr/realisations-plv/([^"/?]+)".*?'
    r'href="https://www\.kontfeel\.fr/realisations/[^"]*"[^>]*>([^<]+)</a>',
    re.S,
)

def crawl_order_and_categories():
    """Renvoie [(slug, category_label), …] dans l'ordre des pages du site."""
    items = []
    seen = set()
    for url in PAGES:
        try:
            html = fetch(url)
        except Exception as e:
            print(f"  ⚠ page indisponible : {url} ({e})")
            continue
        for slug, cat in ITEM_RX.findall(html):
            cat = cat.strip()
            if slug in seen:
                continue
            seen.add(slug)
            items.append((slug, cat))
        time.sleep(0.5)
    return items

# Heuristique pour les slugs non listés dans le site live (en plus)
EXTRA_CAT_RULES = [
    (r"comptoir|bijouterie|caisse",                    "PLV de comptoir"),
    (r"sol|palette|box|colonne|stop[- ]?rayon|lin[ée]aire", "PLV de sol"),
    (r"signal|cache|stop-rayon|rappel|drapeau",        "Signalétique"),
    (r"arche|stand|[ée]v[ée]nement|noel|degust|salon|borne|jeu", "Événementielle"),
    (r"th[ée]atralisation|shop[- ]?in[- ]?shop|vitrine|corner", "Théâtralisation"),
    (r"ilv|kakemono|enrouleur|affich|impression",      "ILV"),
    (r"3d|design|silhouette|d[ée]coup",                "PLV 3D"),
]
def infer_category(slug):
    s = slug.lower().replace("-", " ")
    for rx, lab in EXTRA_CAT_RULES:
        if re.search(rx, s):
            return lab
    return "PLV de sol"  # fallback raisonnable

def main():
    print(f"Crawl {len(PAGES)} pages de /realisations…")
    live = crawl_order_and_categories()
    print(f"  → {len(live)} items relevés sur le site live")

    order_map = {slug: i for i, (slug, _) in enumerate(live)}
    cat_map   = {slug: cat for slug, cat in live}

    files = sorted(f for f in os.listdir(OUT) if f.endswith(".json"))
    patched = added = unchanged = 0
    missing = []
    for fname in files:
        slug = fname[:-5]
        path = os.path.join(OUT, fname)
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        before = json.dumps(data, sort_keys=True, ensure_ascii=False)
        # Catégorie / ordre depuis le crawl, sinon heuristique
        if slug in order_map:
            data["category"] = cat_map[slug]
            data["order"]    = order_map[slug]
        else:
            data["category"] = data.get("category") or infer_category(slug)
            data["order"]    = data.get("order")    or 9999
            missing.append(slug)
        # On retire la date (héritée du script d'import — placeholder 2025-01)
        if "date" in data:
            del data["date"]
        after = json.dumps(data, sort_keys=True, ensure_ascii=False)
        if before == after:
            unchanged += 1
            continue
        # Réécriture en préservant l'ordre logique des clés
        ordered = {}
        for k in ("title", "client", "sector", "category", "order",
                  "description", "challenge", "solution", "results",
                  "image", "imageAlt", "quote", "relatedPost",
                  "relatedLinks", "tldr", "blocks", "active"):
            if k in data:
                ordered[k] = data[k]
        # Toute clé restante (cas improbable) en queue
        for k, v in data.items():
            if k not in ordered:
                ordered[k] = v
        with open(path, "w", encoding="utf-8") as f:
            json.dump(ordered, f, ensure_ascii=False, indent=2)
            f.write("\n")
        if slug in order_map:
            patched += 1
        else:
            added += 1
    print(f"\nPatched {patched} fichiers (ordre + cat depuis live)")
    print(f"        {added} fichiers (heuristique cat, en queue order=9999)")
    print(f"        {unchanged} fichiers inchangés")
    if missing:
        print(f"\nSlugs hors site live ({len(missing)}) — vérifier :")
        for s in missing:
            print(f"  · {s}")

if __name__ == "__main__":
    main()
