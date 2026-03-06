# timbertech_palette_builder.py (v6)
# - Extracts all colors + product URLs from https://www.timbertech.com/colors/
# - Extracts per-color image URL directly from the color tile (img or background-image)
# - Product-page fallback includes slug+CSS url scanning as last resort
#
# Run:
#   py -m pip install requests beautifulsoup4 pillow lxml
#   py timbertech_palette_builder.py
#
# Output:
#   timbertech_output/timbertech-decking.json
#   timbertech_output/timbertech-decking.css
#   timbertech_output/swatches/*.png

import json
import re
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup, Tag
from PIL import Image

BASE = "https://www.timbertech.com"
COLORS_PAGE = "https://www.timbertech.com/colors/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0 Safari/537.36"
    )
}

BAD_TEXT = {"shop all colors", "shop", "colors", ""}

@dataclass
class Swatch:
    collection: str
    name: str
    product_url: str
    image_url: Optional[str]
    hex: Optional[str]


def fetch_html(url: str, timeout: int = 30) -> str:
    r = requests.get(url, headers=HEADERS, timeout=timeout)
    r.raise_for_status()
    return r.text


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


def slugify(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[®™]", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def collection_from_product_url(product_url: str) -> str:
    path = urlparse(product_url).path.strip("/")
    parts = path.split("/")
    slug = parts[1] if len(parts) >= 2 and parts[0] == "product" else (parts[-1] or "unknown")
    slug = slug.replace("azek-", "").replace("pro-", "").replace("-decking", "")
    words = [w.capitalize() for w in slug.replace("-", " ").split()]
    return " ".join(words)


def pick_img_url(img_tag: Tag) -> Optional[str]:
    u = img_tag.get("data-src") or img_tag.get("src")
    if u:
        return urljoin(BASE, u)
    srcset = img_tag.get("srcset")
    if srcset:
        first = srcset.split(",")[0].strip().split(" ")[0]
        if first:
            return urljoin(BASE, first)
    return None


def extract_url_from_style(style: str) -> Optional[str]:
    if not style:
        return None
    m = re.search(r"url\((['\"]?)(.*?)\1\)", style, flags=re.IGNORECASE)
    if not m:
        return None
    u = (m.group(2) or "").strip()
    if not u:
        return None
    return urljoin(BASE, u)


def tile_image_url(anchor: Tag) -> Optional[str]:
    """
    Try hard to find the per-color swatch/board image for a given tile anchor.
    Looks:
      1) <img> inside anchor
      2) style="background-image:url(...)"
      3) any url(...) in the anchor HTML
      4) parent containers (sometimes the background-image is on a child div)
    """
    # 1) img in anchor
    img = anchor.find("img")
    if img:
        u = pick_img_url(img)
        if u:
            return u

    # 2) style on anchor
    u = extract_url_from_style(anchor.get("style") or "")
    if u:
        return u

    # 3) any url(...) in anchor HTML
    html = str(anchor)
    m = re.findall(r"url\((['\"]?)(.*?)\1\)", html, flags=re.IGNORECASE)
    for _, raw in m:
        raw = (raw or "").strip()
        if raw and any(raw.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"]):
            return urljoin(BASE, raw)

    # 4) look at a few nearby wrappers (common pattern: background-image on a div inside tile)
    for el in list(anchor.descendants):
        if isinstance(el, Tag):
            u2 = extract_url_from_style(el.get("style") or "")
            if u2:
                return u2

    parent = anchor.parent
    for _ in range(3):
        if not parent or not isinstance(parent, Tag):
            break
        u3 = extract_url_from_style(parent.get("style") or "")
        if u3:
            return u3
        parent = parent.parent

    return None


def extract_color_slug(product_url: str) -> Optional[str]:
    m = re.search(r"attribute_pa_color=([a-z0-9\-]+)", product_url.lower())
    return m.group(1) if m else None


def product_page_fallback_image(product_url: str, color_name: str) -> Optional[str]:
    """
    Last resort:
      1) any <img> URL containing the color slug
      2) any CSS url(...) containing the slug
      3) img alt contains color name
      4) og:image
    """
    try:
        html = fetch_html(product_url)
    except Exception:
        return None

    soup = BeautifulSoup(html, "lxml")
    slug = extract_color_slug(product_url)

    img_urls: List[str] = []
    for img in soup.find_all("img"):
        u = pick_img_url(img)
        if u:
            img_urls.append(u)

    if slug:
        for u in img_urls:
            if slug in u.lower():
                return u

        bg_urls = re.findall(r"url\((['\"]?)(.*?)\1\)", html, flags=re.IGNORECASE)
        for _, raw in bg_urls:
            raw = (raw or "").strip()
            if not raw:
                continue
            full = urljoin(BASE, raw)
            low = full.lower()
            if slug in low and any(ext in low for ext in [".jpg", ".jpeg", ".png", ".webp"]):
                return full

    cname = color_name.lower().strip()
    if cname:
        for img in soup.find_all("img"):
            alt = (img.get("alt") or "").lower()
            if cname in alt:
                u = pick_img_url(img)
                if u:
                    return u

    og = soup.find("meta", attrs={"property": "og:image"})
    if og and og.get("content"):
        return og["content"].strip()

    return None


def extract_color_tiles(colors_html: str) -> List[Swatch]:
    soup = BeautifulSoup(colors_html, "lxml")

    anchors = soup.select('a[href*="/product/"][href*="attribute_pa_color="]')
    swatches: List[Swatch] = []

    for a in anchors:
        name = (a.get_text(" ", strip=True) or "").strip()
        if name.lower() in BAD_TEXT:
            continue

        href = a.get("href")
        if not href:
            continue

        product_url = urljoin(BASE, href)
        collection = collection_from_product_url(product_url)

        # NEW: pull image URL from the tile itself
        image_url = tile_image_url(a)

        swatches.append(Swatch(
            collection=collection,
            name=name,
            product_url=product_url,
            image_url=image_url,
            hex=None,
        ))

    # de-dupe by (collection, name)
    uniq: Dict[Tuple[str, str], Swatch] = {}
    for s in swatches:
        key = (s.collection.lower(), s.name.lower())
        uniq.setdefault(key, s)

    return list(uniq.values())


def build_css(swatches: List[Swatch]) -> str:
    lines: List[str] = []
    lines.append("/* timbertech-decking.css")
    lines.append("   Generated by timbertech_palette_builder.py (v6)")
    lines.append("*/\n")

    lines.append(":root {")
    for sw in swatches:
        if not sw.hex:
            continue
        coll = slugify(sw.collection)
        name = slugify(sw.name)
        lines.append(f"  --tt-{coll}-{name}: {sw.hex};")
    lines.append("")
    lines.append("  --tt-grain-alpha: 0.12;")
    lines.append("  --tt-grain-size:  18px;")
    lines.append("  --tt-board-sheen: 0.10;")
    lines.append("}\n")

    lines.append(":root {")
    lines.append("  --tt-texture-template:")
    lines.append("    linear-gradient(0deg, rgba(255,255,255,var(--tt-board-sheen)) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0) 100%),")
    lines.append("    repeating-linear-gradient(135deg,")
    lines.append("      rgba(255,255,255,calc(var(--tt-grain-alpha) * 0.55)) 0px,")
    lines.append("      rgba(255,255,255,0) 6px,")
    lines.append("      rgba(0,0,0,calc(var(--tt-grain-alpha) * 0.45)) 12px),")
    lines.append("    repeating-linear-gradient(90deg,")
    lines.append("      rgba(0,0,0,calc(var(--tt-grain-alpha) * 0.35)) 0px,")
    lines.append("      rgba(0,0,0,0) 2px,")
    lines.append("      rgba(255,255,255,calc(var(--tt-grain-alpha) * 0.25)) 4px,")
    lines.append("      rgba(0,0,0,0) 7px);")
    lines.append("}\n")

    lines.append(":root {")
    for sw in swatches:
        if not sw.hex:
            continue
        coll = slugify(sw.collection)
        name = slugify(sw.name)
        lines.append(
            f"  --tt-{coll}-{name}-texture: "
            f"var(--tt-texture-template), "
            f"linear-gradient(0deg, var(--tt-{coll}-{name}), var(--tt-{coll}-{name}));"
        )
    lines.append("}\n")

    lines.append(".tt-board {")
    lines.append("  background-size: 100% 100%, var(--tt-grain-size) var(--tt-grain-size), 10px 100%, 100% 100%;")
    lines.append("  background-blend-mode: overlay, overlay, overlay, normal;")
    lines.append("  border-radius: 10px;")
    lines.append("}\n")

    return "\n".join(lines)


def main():
    out_dir = Path("timbertech_output")
    out_dir.mkdir(exist_ok=True)
    img_dir = out_dir / "swatches"
    img_dir.mkdir(exist_ok=True)

    print(f"Fetching colors page: {COLORS_PAGE}")
    colors_html = fetch_html(COLORS_PAGE)

    swatches = extract_color_tiles(colors_html)
    print(f"Found {len(swatches)} color tiles")

    missing = [sw for sw in swatches if not sw.image_url]
    if missing:
        print(f"Attempting product-page fallback for {len(missing)} missing images...")
        for sw in missing:
            sw.image_url = product_page_fallback_image(sw.product_url, sw.name)

    for sw in swatches:
        if not sw.image_url:
            print(f"  [warn] No image URL for: {sw.collection} - {sw.name} ({sw.product_url})")
            continue
        try:
            img = download_image(sw.image_url)
            sw.hex = rgb_to_hex(average_color_center(img, center_crop=0.60))
            fname = f"{slugify(sw.collection)}__{slugify(sw.name)}.png"
            img.save(img_dir / fname)
            print(f"  OK {sw.collection} - {sw.name}: {sw.hex}")
        except Exception as e:
            print(f"  [err] {sw.collection} - {sw.name}: {e}")

    grouped: Dict[str, List[dict]] = {}
    for sw in sorted(swatches, key=lambda x: (x.collection, x.name)):
        grouped.setdefault(sw.collection, []).append({
            "name": sw.name,
            "slug": slugify(sw.name),
            "collection": sw.collection,
            "product_url": sw.product_url,
            "image_url": sw.image_url,
            "hex": sw.hex,
        })

    (out_dir / "timbertech-decking.json").write_text(json.dumps(grouped, indent=2), encoding="utf-8")
    (out_dir / "timbertech-decking.css").write_text(build_css(swatches), encoding="utf-8")
    print(f"Wrote {out_dir/'timbertech-decking.json'}")
    print(f"Wrote {out_dir/'timbertech-decking.css'}")
    print("Done.", out_dir.resolve())


if __name__ == "__main__":
    main()