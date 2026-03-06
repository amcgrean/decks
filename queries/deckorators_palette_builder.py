# deckorators_palette_builder.py (v6)
# - Colors list from: /collections/decking-collections
# - Swatch images from each product page via "#color_<slug>" alt tags
# - Clean logging (no stray prints / no phantom warnings)
#
# Run:
#   py -m pip install requests beautifulsoup4 pillow lxml
#   py deckorators_palette_builder.py
#
# Output:
#   deckorators_output/deckorators-decking.json
#   deckorators_output/deckorators-decking.css
#   deckorators_output/swatches/*.png

import json
import re
from io import BytesIO
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from PIL import Image

BASE = "https://www.deckorators.com"
INDEX_URL = "https://www.deckorators.com/collections"
DECKING_COLLECTIONS_URL = "https://www.deckorators.com/collections/decking-collections"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0 Safari/537.36"
    )
}

COLLECTIONS = ["Voyage", "Summit", "Venture"]

STOPWORDS = {
    "product", "products", "decking", "collection", "collections",
    "add", "sample", "cart", "details", "view", "learn", "more",
    "where", "to", "buy", "find", "builder", "options"
}


def slugify(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[®™]", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def fetch_html(url: str, timeout: int = 30) -> str:
    r = requests.get(url, headers=HEADERS, timeout=timeout)
    r.raise_for_status()
    return r.text


def pick_img_url(img_tag) -> Optional[str]:
    u = img_tag.get("data-src") or img_tag.get("src")
    if u:
        return urljoin(BASE, u)
    srcset = img_tag.get("srcset")
    if srcset:
        first = srcset.split(",")[0].strip().split(" ")[0]
        if first:
            return urljoin(BASE, first)
    return None


def download_image(url: str, timeout: int = 30) -> Image.Image:
    r = requests.get(url, headers=HEADERS, timeout=timeout)
    r.raise_for_status()
    return Image.open(BytesIO(r.content)).convert("RGBA")


def average_color_center(img: Image.Image, center_crop: float = 0.60) -> Tuple[int, int, int]:
    w, h = img.size
    cw, ch = int(w * center_crop), int(h * center_crop)
    left = (w - cw) // 2
    top = (h - ch) // 2
    crop = img.crop((left, top, left + cw, top + ch))

    r_sum = g_sum = b_sum = n = 0
    for r, g, b, a in crop.getdata():
        if a < 20:
            continue
        r_sum += r
        g_sum += g
        b_sum += b
        n += 1

    if n == 0:
        return (128, 128, 128)
    return (r_sum // n, g_sum // n, b_sum // n)


def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
    return "#{:02X}{:02X}{:02X}".format(*rgb)


def extract_decking_product_links(index_html: str) -> Dict[str, str]:
    """Return mapping like {"Voyage": url, "Summit": url, "Venture": url}."""
    soup = BeautifulSoup(index_html, "lxml")
    found: Dict[str, str] = {}

    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "/products/" not in href:
            continue

        text = a.get_text(" ", strip=True)
        if not text:
            continue
        tl = text.lower()
        if "decking" not in tl or "railing" in tl:
            continue

        coll = text.replace("Decking", "").strip()
        for target in COLLECTIONS:
            if coll.lower() == target.lower():
                found[target] = urljoin(BASE, href)

    return found


def find_color_image_map(prod_soup: BeautifulSoup) -> Dict[str, str]:
    """
    Map keys from img alt like "#color_glacier" or "#color_summit-glacier".
    Store:
      - full key
      - tail (after last '-') to allow direct match on 'glacier'
    """
    mapping: Dict[str, str] = {}

    for img in prod_soup.find_all("img"):
        alt = (img.get("alt") or "").lower()
        if "#color_" not in alt:
            continue
        m = re.search(r"#color_([a-z0-9\-_]+)", alt)
        if not m:
            continue

        key = m.group(1)  # e.g. summit-glacier
        url = pick_img_url(img)
        if not url:
            continue

        mapping.setdefault(key, url)
        if "-" in key:
            tail = key.split("-")[-1]
            if tail:
                mapping.setdefault(tail, url)

    return mapping


def parse_colors_from_hub(hub_html: str) -> Dict[str, List[str]]:
    """
    Parse /collections/decking-collections.
    For each collection, anchor on "<Collection> Decking", then capture "Color:" blob.
    """
    soup = BeautifulSoup(hub_html, "lxml")
    text = soup.get_text("\n", strip=True)
    text = re.sub(r"[ \t]+", " ", text)

    out: Dict[str, List[str]] = {}

    for coll in COLLECTIONS:
        m = re.search(rf"\b{coll}\s+Decking\b(.{{0,4000}})", text, flags=re.IGNORECASE | re.DOTALL)
        if not m:
            out[coll] = []
            continue

        window = m.group(1)

        m2 = re.search(
            r"Color:\s*(.+?)(?:Add Sample|Add Sample to Cart|View product details|Where to Buy|$)",
            window,
            flags=re.IGNORECASE | re.DOTALL,
        )
        if not m2:
            out[coll] = []
            continue

        blob = m2.group(1).strip()

        # Pull TitleCase 1–2 word tokens (Deckorators colors fit this well)
        hits = re.findall(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b", blob)

        seen = set()
        colors: List[str] = []
        for h in hits:
            key = h.lower()
            if key in STOPWORDS:
                continue
            if key not in seen:
                colors.append(h)
                seen.add(key)

        # Handle repeated first color (sometimes "Costa Costa Sierra...")
        if len(colors) >= 2 and colors[0].lower() == colors[1].lower():
            colors.pop(0)

        out[coll] = colors

    return out


def build_css(grouped: Dict[str, List[dict]]) -> str:
    lines: List[str] = []
    lines.append("/* deckorators-decking.css")
    lines.append("   Generated by deckorators_palette_builder.py (v6)")
    lines.append("*/\n")

    lines.append(":root {")
    for coll, items in grouped.items():
        coll_slug = slugify(coll)
        for it in items:
            if it.get("hex"):
                lines.append(f"  --deckorators-{coll_slug}-{it['slug']}: {it['hex']};")
    lines.append("}\n")

    lines.append(":root {")
    lines.append("  --deckorators-grain-alpha: 0.12;")
    lines.append("  --deckorators-grain-size:  18px;")
    lines.append("  --deckorators-board-sheen: 0.10;")
    lines.append("}\n")

    lines.append(":root {")
    lines.append("  --deckorators-texture-template:")
    lines.append("    linear-gradient(0deg, rgba(255,255,255,var(--deckorators-board-sheen)) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0) 100%),")
    lines.append("    repeating-linear-gradient(135deg,")
    lines.append("      rgba(255,255,255,calc(var(--deckorators-grain-alpha) * 0.55)) 0px,")
    lines.append("      rgba(255,255,255,0) 6px,")
    lines.append("      rgba(0,0,0,calc(var(--deckorators-grain-alpha) * 0.45)) 12px),")
    lines.append("    repeating-linear-gradient(90deg,")
    lines.append("      rgba(0,0,0,calc(var(--deckorators-grain-alpha) * 0.35)) 0px,")
    lines.append("      rgba(0,0,0,0) 2px,")
    lines.append("      rgba(255,255,255,calc(var(--deckorators-grain-alpha) * 0.25)) 4px,")
    lines.append("      rgba(0,0,0,0) 7px);")
    lines.append("}\n")

    lines.append(":root {")
    for coll, items in grouped.items():
        coll_slug = slugify(coll)
        for it in items:
            if not it.get("hex"):
                continue
            key = f"deckorators-{coll_slug}-{it['slug']}"
            lines.append(
                f"  --{key}-texture: var(--deckorators-texture-template), "
                f"linear-gradient(0deg, var(--{key}), var(--{key}));"
            )
    lines.append("}\n")

    lines.append(".deckorators-board {")
    lines.append("  background-size: 100% 100%, var(--deckorators-grain-size) var(--deckorators-grain-size), 10px 100%, 100% 100%;")
    lines.append("  background-blend-mode: overlay, overlay, overlay, normal;")
    lines.append("  border-radius: 10px;")
    lines.append("}\n")

    return "\n".join(lines)


def main():
    out_dir = Path("deckorators_output")
    out_dir.mkdir(exist_ok=True)
    img_dir = out_dir / "swatches"
    img_dir.mkdir(exist_ok=True)

    print(f"Fetching Deckorators collections: {INDEX_URL}")
    index_html = fetch_html(INDEX_URL)
    product_map = extract_decking_product_links(index_html)
    print(f"Found {len(product_map)} decking products")

    print(f"Fetching decking collections hub: {DECKING_COLLECTIONS_URL}")
    hub_html = fetch_html(DECKING_COLLECTIONS_URL)
    hub_colors = parse_colors_from_hub(hub_html)

    grouped: Dict[str, List[dict]] = {}

    # Build records (NO warnings here)
    for coll in COLLECTIONS:
        product_url = product_map.get(coll)
        if not product_url:
            print(f"  [warn] Missing product URL for {coll}")
            continue

        colors = hub_colors.get(coll, [])
        if not colors:
            print(f"  [warn] No colors found on hub page for {coll}")
            continue

        print(f"Fetching {coll} Decking: {product_url}")
        prod_html = fetch_html(product_url)
        prod_soup = BeautifulSoup(prod_html, "lxml")
        img_map = find_color_image_map(prod_soup)

        for c in colors:
            c_slug = slugify(c)
            image_url = (
                img_map.get(c_slug)
                or img_map.get(f"{coll.lower()}-{c_slug}")
                or img_map.get(f"voyage-{c_slug}")
                or img_map.get(f"summit-{c_slug}")
                or img_map.get(f"venture-{c_slug}")
            )

            grouped.setdefault(coll, []).append({
                "name": c,
                "slug": c_slug,
                "collection": coll,
                "product_url": product_url,
                "image_url": image_url,
                "hex": None,
            })

    # Download + compute hex (warnings only here)
    for coll, items in grouped.items():
        for it in items:
            if not it.get("image_url"):
                print(f"  [warn] No image URL for: {coll} - {it['name']}")
                continue
            try:
                im = download_image(it["image_url"])
                it["hex"] = rgb_to_hex(average_color_center(im, center_crop=0.60))
                fname = f"{slugify(coll)}__{it['slug']}.png"
                im.save(img_dir / fname)
                print(f"  OK {coll} - {it['name']}: {it['hex']}")
            except Exception as e:
                print(f"  [err] {coll} - {it['name']}: {e}")

    (out_dir / "deckorators-decking.json").write_text(json.dumps(grouped, indent=2), encoding="utf-8")
    (out_dir / "deckorators-decking.css").write_text(build_css(grouped), encoding="utf-8")
    print(f"Wrote {out_dir/'deckorators-decking.json'}")
    print(f"Wrote {out_dir/'deckorators-decking.css'}")
    print("Done.", out_dir.resolve())


if __name__ == "__main__":
    main()