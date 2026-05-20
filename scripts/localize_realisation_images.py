#!/usr/bin/env python3
"""
localize_realisation_images.py — Rapatrie en local les images de réalisations
qui pointent encore vers kontfeel.fr.

Pour chaque src/content/realisations/<slug>.json dont `image` est une URL
absolue (https://www.kontfeel.fr/…):
  1. décode le nom de fichier (URL-unescape, NFD → NFC)
  2. si le fichier existe déjà sous public/assets/**, réécrit `image` en chemin
     local (`/assets/<sous-dossier>/<nom>`)
  3. sinon, télécharge l'image dans public/assets/realisations/ sous un nom
     kebab-case propre (sans espaces ni accents), puis réécrit `image`

Idempotent : relancer ne re-télécharge pas (skip si la cible existe déjà).
"""
import os, sys, re, json, unicodedata, urllib.parse, subprocess, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_DIR = os.path.join(ROOT, "src", "content", "realisations")
ASSET_DIR = os.path.join(ROOT, "public", "assets")
DEST_SUBDIR = "realisations"
DEST_DIR = os.path.join(ASSET_DIR, DEST_SUBDIR)

# ── Index des images déjà présentes (filename → chemin web /assets/...) ─────
def build_index():
    idx = {}
    for root, _, files in os.walk(ASSET_DIR):
        for fn in files:
            rel = os.path.relpath(os.path.join(root, fn), os.path.dirname(ASSET_DIR))
            idx[fn] = "/" + rel.replace(os.sep, "/")
    return idx

# ── Slugify (kebab-case, ASCII, conserve l'extension) ───────────────────────
def kebab(name):
    base, ext = os.path.splitext(name)
    # NFKD → drop combining marks
    base = unicodedata.normalize("NFKD", base)
    base = "".join(c for c in base if not unicodedata.combining(c))
    base = base.lower()
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")
    return (base or "image") + ext.lower()

# ── Téléchargement ──────────────────────────────────────────────────────────
def fetch_binary(url, dest):
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    r = subprocess.run(
        ["curl", "-sSL", "--fail", "--max-time", "30",
         "-A", "Mozilla/5.0 (KontfeelMigration)", "-o", dest, url],
        capture_output=True,
    )
    if r.returncode != 0:
        raise RuntimeError(f"curl rc={r.returncode}: {r.stderr.decode('utf-8','ignore')[:160]}")
    return dest

def main():
    if not os.path.isdir(JSON_DIR):
        print(f"Dossier introuvable : {JSON_DIR}", file=sys.stderr); sys.exit(1)
    os.makedirs(DEST_DIR, exist_ok=True)
    index = build_index()
    rewritten = downloaded = unchanged = errors = 0
    for fname in sorted(os.listdir(JSON_DIR)):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(JSON_DIR, fname)
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        img = data.get("image", "")
        if not img.startswith(("http://", "https://")):
            unchanged += 1
            continue
        raw_name = urllib.parse.unquote(img.split("/")[-1])
        # Normalisation NFC pour matcher l'arborescence locale (les FS Mac écrivent
        # parfois en NFD ; on cherche en NFC ce que produit `os.walk`).
        nfc_name = unicodedata.normalize("NFC", raw_name)

        # 1) Le fichier existe-t-il déjà quelque part sous public/assets ?
        local_web = index.get(nfc_name) or index.get(raw_name)
        if local_web:
            data["image"] = local_web
            rewritten += 1
        else:
            # 2) Téléchargement avec un nom propre kebab-case
            clean = kebab(nfc_name)
            dest_fs = os.path.join(DEST_DIR, clean)
            if not os.path.exists(dest_fs):
                try:
                    fetch_binary(img, dest_fs)
                    time.sleep(0.4)
                except Exception as e:
                    print(f"  ⚠ {fname}: échec download ({e})")
                    errors += 1
                    continue
                index[clean] = f"/assets/{DEST_SUBDIR}/{clean}"
                downloaded += 1
            data["image"] = f"/assets/{DEST_SUBDIR}/{clean}"
            rewritten += 1

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"  ✓ {fname} → {data['image']}")
    print(f"\n{rewritten} fiches réécrites, {downloaded} images téléchargées,"
          f" {unchanged} inchangées, {errors} erreurs.")

if __name__ == "__main__":
    main()
