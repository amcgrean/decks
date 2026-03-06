import os
import re
import io
import json
import hashlib
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple

import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageStat

import fitz  # PyMuPDF


OUTPUT_DIR = "railing_output"
SWATCH_DIR = os.path.join(OUTPUT_DIR, "swatches")
OUT_JSON = os.path.join(OUTPUT_DIR, "railing-palettes.json")
OUT_CSS = os.path.join(OUTPUT_DIR, "railing-palettes.css")


# ----------------------------
# Utilities
# ----------------------------
def ensure_dirs():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(SWATCH_DIR, exist_ok=True)


def slug(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def sha1(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8")).hexdigest()[:10]


def requests_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
    })
    return s


def fetch(sess: requests.Session, url: str, timeout=30) -> requests.Response:
    r = sess.get(url, timeout=timeout, allow_redirects=True)
    r.raise_for_status()
    return r


def fetch_bytes(sess: requests.Session, url: str) -> bytes:
    return fetch(sess, url).content


def fetch_html(sess: requests.Session, url: str) -> str:
    return fetch(sess, url).text


def scene7_normalize(url: str) -> str:
    """
    Trex uses Scene7 URLs like:
      https://images.trex.com/is/image/trexcompany/swatch-trn-railing-charcoalblack:Small
    Pillow often fails on :Small. Convert to proper request:
      .../swatch-trn-railing-charcoalblack?wid=300&fmt=png-alpha
    """
    u = url.strip()
    if u.startswith("//"):
        u = "https:" + u
    if u.startswith("/"):
        u = "https://www.trex.com" + u

    # If it's a Scene7 named rendition, strip :Something
    if re.search(r"/is/image/[^?]+:[A-Za-z0-9_]+$", u):
        u = re.sub(r":([A-Za-z0-9_]+)$", "", u)
        joiner = "&" if "?" in u else "?"
        u = u + f"{joiner}wid=300&fmt=png-alpha"

    # If it already has params but not fmt, add fmt
    if "/is/image/" in u and "fmt=" not in u:
        joiner = "&" if "?" in u else "?"
        u = u + f"{joiner}fmt=png-alpha"

    return u


def try_open_image_from_response(resp: requests.Response) -> Image.Image:
    """
    Some URLs return HTML or something unexpected.
    Validate content-type first; otherwise Pillow raises "cannot identify image file".
    """
    ct = (resp.headers.get("Content-Type") or "").lower()
    data = resp.content
    if "image" not in ct:
        # If Scene7 sometimes returns image without correct header, still try,
        # but if it fails we raise with a better hint.
        try:
            return Image.open(io.BytesIO(data))
        except Exception:
            raise ValueError(f"Non-image response (Content-Type: {ct})")
    return Image.open(io.BytesIO(data))


def fetch_image(sess: requests.Session, url: str) -> Image.Image:
    r = fetch(sess, url)
    return try_open_image_from_response(r)


def crop_safe(img: Image.Image, box: Tuple[int, int, int, int]) -> Image.Image:
    x0, y0, x1, y1 = box
    x0 = max(0, min(img.width, x0))
    x1 = max(0, min(img.width, x1))
    y0 = max(0, min(img.height, y0))
    y1 = max(0, min(img.height, y1))
    if x1 <= x0 or y1 <= y0:
        return img.crop((0, 0, 1, 1))
    return img.crop((x0, y0, x1, y1))


def avg_hex(img: Image.Image) -> str:
    img = img.convert("RGB")
    stat = ImageStat.Stat(img)
    r, g, b = stat.mean
    return "#{:02X}{:02X}{:02X}".format(int(r), int(g), int(b))


def patch_score(img: Image.Image) -> float:
    """
    Score a patch for "looks like a swatch":
    - avoid near-white / near-black extremes
    - prefer lower variance (more uniform)
    """
    rgb = img.convert("RGB")
    stat = ImageStat.Stat(rgb)
    r, g, b = stat.mean
    # brightness
    y = 0.2126*r + 0.7152*g + 0.0722*b

    # stddev average
    sr, sg, sb = stat.stddev
    s = (sr + sg + sb) / 3.0

    # Penalize near-white/near-black
    penalty = 0.0
    if y > 245:
        penalty += (y - 245) * 5
    if y < 15:
        penalty += (15 - y) * 5

    # Lower variance is better, but not zero (zero could be a mask/flat background)
    # So aim for small stddev ~ 3-25
    variance_penalty = abs(s - 10) * 2

    return penalty + variance_penalty


@dataclass
class PaletteItem:
    brand: str
    line: str
    color: str
    hex: Optional[str] = None
    swatch_url: Optional[str] = None
    swatch_file: Optional[str] = None
    source: Optional[str] = None


# ----------------------------
# PDF helpers
# ----------------------------
def pdf_page_dimensions(pdf_bytes: bytes, page_index: int) -> Tuple[float, float]:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page = doc.load_page(page_index)
    rect = page.rect
    doc.close()
    return rect.width, rect.height


def render_pdf_page_to_image(pdf_bytes: bytes, page_index: int, zoom: float = 3.5) -> Image.Image:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page = doc.load_page(page_index)
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    doc.close()
    return img


def find_text_blocks(pdf_bytes: bytes, page_index: int) -> List[Tuple[str, Tuple[float, float, float, float]]]:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page = doc.load_page(page_index)
    blocks = page.get_text("blocks")  # (x0,y0,x1,y1,"text", block_no, block_type)
    out = []
    for b in blocks:
        x0, y0, x1, y1, text, *_ = b
        if not text:
            continue
        t = " ".join(text.split())
        if t:
            out.append((t, (x0, y0, x1, y1)))
    doc.close()
    return out


def pdf_bbox_to_img_bbox(bbox_pdf, page_w_pdf, page_h_pdf, img_w, img_h):
    x0, y0, x1, y1 = bbox_pdf
    sx = img_w / page_w_pdf
    sy = img_h / page_h_pdf
    return (int(x0 * sx), int(y0 * sy), int(x1 * sx), int(y1 * sy))


# ----------------------------
# Westbury (use a live brochure PDF)
# ----------------------------
def scrape_westbury_from_pdf(sess: requests.Session) -> List[PaletteItem]:
    # A currently live Westbury brochure that contains the "Aluminum Colors" section.
    # If this link ever changes, we can swap to a new brochure URL.
    pdf_url = "https://www.uslumber.com/wp-content/uploads/2023/09/Westbury-Railing-Aluminum-Railing-Brochure.pdf"
    print(f"Fetching Westbury brochure PDF: {pdf_url}")
    pdf_bytes = fetch_bytes(sess, pdf_url)

    # We scan first ~6 pages for common Westbury color names and sample nearby.
    targets = [
        "Satin Black Fine Texture", "Black Fine Texture", "Brown Fine Texture", "Bronze Fine Texture",
        "Grey Fine Texture", "White Fine Texture",
        "Gloss White", "Gloss Beige", "Sandy Shore", "Ninety Bronze",
        "Speckled Walnut", "Chocolate"
    ]
    wanted = {t.lower(): t for t in targets}

    items: List[PaletteItem] = []
    seen = set()

    for pi in range(0, 8):
        blocks = find_text_blocks(pdf_bytes, page_index=pi)
        if not blocks:
            continue

        img = render_pdf_page_to_image(pdf_bytes, page_index=pi, zoom=3.5)
        page_w, page_h = pdf_page_dimensions(pdf_bytes, page_index=pi)

        for text, bbox_pdf in blocks:
            key = text.strip().lower()
            if key not in wanted:
                continue
            if key in seen:
                continue

            x0, y0, x1, y1 = pdf_bbox_to_img_bbox(bbox_pdf, page_w, page_h, img.width, img.height)

            # try multiple candidate patches around label and pick best
            candidates = []
            # left
            candidates.append(crop_safe(img, (x0 - 190, y0 - 10, x0 - 20, y1 + 10)))
            # above
            candidates.append(crop_safe(img, (x0 - 50, y0 - 190, x0 + 120, y0 - 20)))
            # right
            candidates.append(crop_safe(img, (x1 + 20, y0 - 10, x1 + 190, y1 + 10)))

            best = min(candidates, key=patch_score)
            hexv = avg_hex(best)

            fn = f"westbury_{slug(wanted[key])}_{hexv.replace('#','')}_{pi}_{sha1(wanted[key])}.png"
            fp = os.path.join(SWATCH_DIR, fn)
            best.save(fp)

            print(f"  OK Westbury - {wanted[key]}: {hexv} (page {pi})")
            items.append(PaletteItem(
                brand="Westbury",
                line="Aluminum",
                color=wanted[key],
                hex=hexv,
                swatch_url=pdf_url,
                swatch_file=fp.replace("\\", "/"),
                source=f"pdf_page_{pi}"
            ))
            seen.add(key)

    if not items:
        print("  [warn] Westbury: no target color labels found in brochure pages scanned.")
    return items


# ----------------------------
# Trex (strictly use swatch images; normalize Scene7 URLs)
# ----------------------------
def scrape_trex_line(sess: requests.Session, line: str, url: str, color_names: List[str]) -> List[PaletteItem]:
    print(f"Fetching Trex {line}: {url}")
    html = fetch_html(sess, url)
    soup = BeautifulSoup(html, "html.parser")

    def norm(s: str) -> str:
        return re.sub(r"\s+", " ", s.strip()).lower()

    wanted = {norm(c): c for c in color_names}
    found: Dict[str, str] = {}

    # Pull all images; only keep those that look like swatches
    for im in soup.find_all("img"):
        alt = (im.get("alt") or "").strip()
        src = (im.get("src") or "").strip()
        if not alt or not src:
            continue

        # Only accept images whose URL indicates a swatch
        if "swatch" not in src.lower():
            continue

        akey = norm(alt)
        # sometimes alt contains extra words, try containment match
        for wkey in wanted.keys():
            if wkey == akey or wkey in akey or akey in wkey:
                if wkey not in found:
                    found[wkey] = src

    items: List[PaletteItem] = []
    for wkey, display_name in wanted.items():
        src = found.get(wkey)
        if not src:
            print(f"  [warn] Trex {line}: no swatch image found for {display_name}")
            items.append(PaletteItem(brand="Trex", line=line, color=display_name, hex=None, swatch_url=None, source=url))
            continue

        src = scene7_normalize(src)

        try:
            img = fetch_image(sess, src)
            w, h = img.size
            crop = crop_safe(img, (int(w*0.25), int(h*0.25), int(w*0.75), int(h*0.75)))
            hexv = avg_hex(crop)

            fn = f"trex_{slug(line)}_{slug(display_name)}_{hexv.replace('#','')}.png"
            fp = os.path.join(SWATCH_DIR, fn)
            crop.save(fp)

            print(f"  OK Trex {line} - {display_name}: {hexv}")
            items.append(PaletteItem(
                brand="Trex",
                line=line,
                color=display_name,
                hex=hexv,
                swatch_url=src,
                swatch_file=fp.replace("\\", "/"),
                source=url
            ))
        except Exception as e:
            print(f"  [warn] Trex {line}: failed sampling {display_name} from {src}: {e}")
            items.append(PaletteItem(brand="Trex", line=line, color=display_name, hex=None, swatch_url=src, source=url))

    return items


def scrape_trex(sess: requests.Session) -> List[PaletteItem]:
    # Keep these lists tight and real; expand after you confirm UI needs
    trex_targets = [
        ("Select", "https://www.trex.com/products/railing/select/",
         ["Charcoal Black", "Burnished Bronze", "Classic White"]),
        ("Transcend", "https://www.trex.com/products/railing/transcend/",
         ["Charcoal Black", "Classic White", "Rope Swing", "Vintage Lantern"]),
        ("Signature", "https://www.trex.com/products/railing/signature/",
         ["Charcoal Black", "Bronze", "Classic White", "Black"]),
        ("Enhance", "https://www.trex.com/products/railing/enhance/",
         ["Charcoal Black", "Classic White", "Saddle"])
    ]
    out: List[PaletteItem] = []
    for line, url, colors in trex_targets:
        out.extend(scrape_trex_line(sess, line, url, colors))
    return out


# ----------------------------
# TimberTech (scan PDF but choose best patch around label)
# ----------------------------
def scrape_timbertech_from_pdf(sess: requests.Session) -> List[PaletteItem]:
    pdf_url = "https://assets.timbertech.com/content/dam//wp-content/TimberTech-Rail-Order-Guide-2024.pdf"
    print(f"Fetching TimberTech railing PDF: {pdf_url}")
    pdf_bytes = fetch_bytes(sess, pdf_url)

    # Start with common/needed (expand later)
    targets = [
        "Matte Black", "White", "Black", "Brown", "Kona", "Slate Gray",
        "Classic White", "Maritime Gray", "Sea Salt Gray", "Dark Cocoa", "Dark Teak"
    ]
    wanted = {t.lower(): t for t in targets}

    items: List[PaletteItem] = []
    seen = set()

    for pi in range(0, 10):
        blocks = find_text_blocks(pdf_bytes, page_index=pi)
        if not blocks:
            continue

        img = render_pdf_page_to_image(pdf_bytes, page_index=pi, zoom=3.5)
        page_w, page_h = pdf_page_dimensions(pdf_bytes, page_index=pi)

        for text, bbox_pdf in blocks:
            key = text.strip().lower()
            if key not in wanted or key in seen:
                continue

            x0, y0, x1, y1 = pdf_bbox_to_img_bbox(bbox_pdf, page_w, page_h, img.width, img.height)

            # candidates around label (left/above/right/below)
            candidates = []
            candidates.append(crop_safe(img, (x0 - 190, y0 - 10, x0 - 20, y1 + 10)))  # left
            candidates.append(crop_safe(img, (x0 - 60, y0 - 190, x0 + 140, y0 - 20)))  # above
            candidates.append(crop_safe(img, (x1 + 20, y0 - 10, x1 + 190, y1 + 10)))  # right
            candidates.append(crop_safe(img, (x0 - 60, y1 + 20, x0 + 140, y1 + 190)))  # below

            best = min(candidates, key=patch_score)
            hexv = avg_hex(best)

            fn = f"timbertech_{slug(wanted[key])}_{hexv.replace('#','')}_{pi}_{sha1(wanted[key])}.png"
            fp = os.path.join(SWATCH_DIR, fn)
            best.save(fp)

            print(f"  OK TimberTech - {wanted[key]}: {hexv} (page {pi})")
            items.append(PaletteItem(
                brand="TimberTech",
                line="Railing",
                color=wanted[key],
                hex=hexv,
                swatch_url=pdf_url,
                swatch_file=fp.replace("\\", "/"),
                source=f"pdf_page_{pi}"
            ))
            seen.add(key)

    if not items:
        print("  [warn] TimberTech: no target labels found in scanned pages.")
    return items


# ----------------------------
# Output writers
# ----------------------------
def write_json(items: List[PaletteItem]):
    payload = []
    for it in items:
        payload.append({
            "brand": it.brand,
            "line": it.line,
            "color": it.color,
            "hex": it.hex,
            "swatch_url": it.swatch_url,
            "swatch_file": it.swatch_file,
            "source": it.source,
        })
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    print(f"Wrote {OUT_JSON}")


def write_css(items: List[PaletteItem]):
    lines = []
    lines.append("/* Auto-generated railing palette tokens */")
    lines.append(":root {")
    for it in items:
        if not it.hex:
            continue
        varname = f"--rail-{slug(it.brand)}-{slug(it.line)}-{slug(it.color)}"
        lines.append(f"  {varname}: {it.hex};")
    lines.append("}")
    lines.append("")
    lines.append(".rail-swatch { width: 64px; height: 32px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.12); }")
    with open(OUT_CSS, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Wrote {OUT_CSS}")


def main():
    ensure_dirs()
    sess = requests_session()

    items: List[PaletteItem] = []

    # Westbury via brochure (avoids dealer 403 + dead WB_Colors.pdf)
    try:
        items.extend(scrape_westbury_from_pdf(sess))
    except Exception as e:
        print(f"[warn] Westbury scrape failed: {e}")

    # Trex (swatch-only + Scene7 normalization)
    try:
        items.extend(scrape_trex(sess))
    except Exception as e:
        print(f"[warn] Trex scrape failed: {e}")

    # TimberTech (better patch selection)
    try:
        items.extend(scrape_timbertech_from_pdf(sess))
    except Exception as e:
        print(f"[warn] TimberTech scrape failed: {e}")

    write_json(items)
    write_css(items)

    print("\nDone.")
    print(f"Output folder: {OUTPUT_DIR}")
    print(f"Swatches (if any): {SWATCH_DIR}")


if __name__ == "__main__":
    main()