# trex_palette_builder.py (v5 - strict Title-Case color extraction + expected counts)
# Run:
#   py -m pip install requests beautifulsoup4 pillow lxml
#   py trex_palette_builder.py

import json
import re
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests
from bs4 import BeautifulSoup
from PIL import Image


@dataclass
class ColorSwatch:
    collection: str
    name: str
    image_url: Optional[str]
    hex: Optional[str]


TREX_PAGES = [
    ("Transcend", "https://www.trex.com/products/decking/transcend/"),
    ("Transcend Lineage", "https://www.trex.com/products/decking/lineage/"),
    ("Select", "https://www.trex.com/products/decking/select/"),
    ("Enhance", "https://www.trex.com/products/decking/enhance/"),
    ("Signature", "https://www.trex.com/products/decking/signature/"),
    ("Refuge PVC", "https://www.trex.com/products/decking/refuge/"),
]

EXPECTED_COUNTS = {
    "Transcend": 6,
    "Transcend Lineage": 7,
    "Select": 5,
    "Enhance": 10,
    "Signature": 2,
    "Refuge PVC": 2,
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0 Safari/537.36"
    )
}

# Strong junk filters
JUNK_EXACT = {
    "popular searches", "suggested pages", "suggested products", "for professionals",
    "project case studies", "all pro resources", "search", "products", "decking", "railing",
    "decking collections", "joist protection", "fascia", "cladding", "under deck drainage system",
    "spiral stairs", "metal railing", "composite railing", "color", "color:", "colors", "colors:",
    "available colors", "color options", "stunning color options",
}
JUNK_CONTAINS = [
    "inch", "sample", "order a sample", "warranty", "overview", "benefits", "features",
    "direct sun", "will get hot", "reclaimed", "sawdust", "edges", "finish", "available in",
    "deck surface", "especially", "children", "but like",
]


def normalize_name(name: str) -> str:
    name = re.sub(r"\s+", " ", name).strip()
    # strip trailing punctuation
    name = re.sub(r"[.,;:]+$", "", name).strip()
    return name


def slugify(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[®™]", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def is_junk_name(name: str) -> bool:
    n = normalize_name(name)
    nl = n.lower()
    if not n:
        return True
    if nl in JUNK_EXACT:
        return True
    for bad in JUNK_CONTAINS:
        if bad in nl:
            return True
    if len(n) > 30:
        return True
    if not re.search(r"[A-Za-z]", n):
        return True
    return False


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


def extract_image_urls(page_text: str) -> List[str]:
    urls = re.findall(r"https://images\.trex\.com/is/image/[^\s\"']+", page_text, flags=re.IGNORECASE)
    seen = set()
    out = []
    for u in urls:
        if u not in seen:
            out.append(u)
            seen.add(u)
    return out


def extract_titlecase_candidates(text_window: str) -> List[str]:
    """
    Extract candidates that look like Trex color names:
      - 1 to 3 Title-Case words (e.g., "Whiskey Barrel", "Foggy Wharf", "Point Reyes")
      - allows hyphens inside words
    """
    # Match sequences like: Word or Word-Word, repeated up to 3 words
    # Examples: "Island Mist", "Point Reyes", "Golden Hour"
    pattern = re.compile(r"\b([A-Z][a-z]+(?:-[A-Z][a-z]+)?(?:\s+[A-Z][a-z]+(?:-[A-Z][a-z]+)?)" r"{0,2})\b")
    hits = pattern.findall(text_window)
    cleaned = []
    for h in hits:
        n = normalize_name(h)
        if is_junk_name(n):
            continue
        cleaned.append(n)

    # de-dupe preserve order
    seen = set()
    out = []
    for c in cleaned:
        key = c.lower()
        if key not in seen:
            out.append(c)
            seen.add(key)
    return out


def extract_colors(collection: str, page_text: str) -> List[str]:
    """
    Find a "color section" window then extract Title-Case candidates from it.
    Finally, cap to EXPECTED_COUNTS[collection] if defined.
    """
    anchors = [
        "Stunning Color Options",
        "Color Options",
        "Available Colors",
        "Available in",
        "colors:",
        "Colors:",
    ]

    idx = None
    lower = page_text.lower()
    for a in anchors:
        p = lower.find(a.lower())
        if p != -1:
            idx = p
            break

    if idx is None:
        # If no anchor found, last-resort: scan whole text but still cap hard
        window = page_text[:2000]
    else:
        window = page_text[idx:idx + 1500]

    candidates = extract_titlecase_candidates(window)

    # Hard cap by expected count if we know it
    expected = EXPECTED_COUNTS.get(collection)
    if expected:
        # Prefer candidates that appear with commas nearby (often in lists)
        # Simple heuristic: keep original order but stop at expected
        candidates = candidates[:expected]

    return candidates


def pair_colors_to_images(colors: List[str], img_urls: List[str]) -> Dict[str, Optional[str]]:
    """
    If there are enough image URLs, pair in order.
    (This worked best in your earlier run.)
    """
    mapping = {c: None for c in colors}
    if not colors or not img_urls:
        return mapping
    if len(img_urls) >= len(colors):
        for c, u in zip(colors, img_urls[:len(colors)]):
            mapping[c] = u
    return mapping


def find_swatches_in_page(collection: str, html: str) -> List[ColorSwatch]:
    soup = BeautifulSoup(html, "lxml")
    page_text = soup.get_text("\n", strip=True)

    colors = extract_colors(collection, page_text)
    if not colors:
        return []

    img_urls = extract_image_urls(page_text)
    mapping = pair_colors_to_images(colors, img_urls)

    return [ColorSwatch(collection=collection, name=c, image_url=mapping.get(c), hex=None) for c in colors]


def build_css(swatches: List[ColorSwatch]) -> str:
    lines: List[str] = []
    lines.append("/* trex-decking.css")
    lines.append("   Generated by trex_palette_builder.py")
    lines.append("   Base vars + CSS-only light grain textures")
    lines.append("*/")
    lines.append("")
    lines.append(":root {")
    for sw in swatches:
        if not sw.hex:
            continue
        coll = slugify(sw.collection)
        name = slugify(sw.name)
        lines.append(f"  --trex-{coll}-{name}: {sw.hex};")
    lines.append("")
    lines.append("  --trex-grain-alpha: 0.12;")
    lines.append("  --trex-grain-size:  18px;")
    lines.append("  --trex-board-sheen: 0.10;")
    lines.append("}")
    lines.append("")
    lines.append(":root {")
    lines.append("  --trex-texture-template:")
    lines.append("    linear-gradient(0deg, rgba(255,255,255,var(--trex-board-sheen)) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0) 100%),")
    lines.append("    repeating-linear-gradient(135deg,")
    lines.append("      rgba(255,255,255,calc(var(--trex-grain-alpha) * 0.55)) 0px,")
    lines.append("      rgba(255,255,255,0) 6px,")
    lines.append("      rgba(0,0,0,calc(var(--trex-grain-alpha) * 0.45)) 12px),")
    lines.append("    repeating-linear-gradient(90deg,")
    lines.append("      rgba(0,0,0,calc(var(--trex-grain-alpha) * 0.35)) 0px,")
    lines.append("      rgba(0,0,0,0) 2px,")
    lines.append("      rgba(255,255,255,calc(var(--trex-grain-alpha) * 0.25)) 4px,")
    lines.append("      rgba(0,0,0,0) 7px);")
    lines.append("}")
    lines.append("")
    lines.append(":root {")
    for sw in swatches:
        if not sw.hex:
            continue
        coll = slugify(sw.collection)
        name = slugify(sw.name)
        lines.append(
            f"  --trex-{coll}-{name}-texture: "
            f"var(--trex-texture-template), "
            f"linear-gradient(0deg, var(--trex-{coll}-{name}), var(--trex-{coll}-{name}));"
        )
    lines.append("}")
    lines.append("")
    lines.append(".trex-board {")
    lines.append("  background-size: 100% 100%, var(--trex-grain-size) var(--trex-grain-size), 10px 100%, 100% 100%;")
    lines.append("  background-blend-mode: overlay, overlay, overlay, normal;")
    lines.append("  border-radius: 10px;")
    lines.append("}")
    lines.append("")
    return "\n".join(lines)


def main():
    out_dir = Path("trex_output")
    out_dir.mkdir(exist_ok=True)
    image_dir = out_dir / "swatches"
    image_dir.mkdir(exist_ok=True)

    all_swatches: List[ColorSwatch] = []

    for collection, page_url in TREX_PAGES:
        print(f"Fetching {collection}: {page_url}")
        try:
            html = fetch_html(page_url)
        except Exception as e:
            print(f"  [err] Failed to fetch page: {e}")
            continue

        sw = find_swatches_in_page(collection, html)
        print(f"  Found {len(sw)} color swatches")
        all_swatches.extend(sw)

    # De-dupe
    unique: Dict[Tuple[str, str], ColorSwatch] = {}
    for sw in all_swatches:
        key = (sw.collection, sw.name.lower())
        if key not in unique:
            unique[key] = sw
    swatches = list(unique.values())

    # Download + compute hex
    for sw in swatches:
        if not sw.image_url:
            print(f"  [warn] No image URL for: {sw.collection} - {sw.name}")
            continue
        try:
            img = download_image(sw.image_url)
            sw.hex = rgb_to_hex(average_color_center(img, center_crop=0.60))
            fname = f"{slugify(sw.collection)}__{slugify(sw.name)}.png"
            img.save(image_dir / fname)
            print(f"  OK {sw.collection} - {sw.name}: {sw.hex}")
        except Exception as e:
            print(f"  [err] {sw.collection} - {sw.name} ({sw.image_url}): {e}")

    # JSON
    grouped: Dict[str, List[dict]] = {}
    for sw in sorted(swatches, key=lambda x: (x.collection, x.name)):
        grouped.setdefault(sw.collection, []).append({
            "name": sw.name,
            "slug": slugify(sw.name),
            "image_url": sw.image_url,
            "hex": sw.hex,
        })

    json_out = out_dir / "trex-decking.json"
    json_out.write_text(json.dumps(grouped, indent=2), encoding="utf-8")
    print(f"Wrote {json_out}")

    # CSS
    css_out = out_dir / "trex-decking.css"
    css_out.write_text(build_css(swatches), encoding="utf-8")
    print(f"Wrote {css_out}")

    print("\nDone.")
    print("Output folder:", out_dir.resolve())


if __name__ == "__main__":
    main()