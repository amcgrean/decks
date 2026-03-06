import json
import re
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List


# --- mappings inferred from Trex image URL abbreviations ---
# These are short codes embedded in the image_url, e.g. "...-rh-..." or "...-pg-..."
MAP_BY_COLLECTION_CODE: Dict[str, Dict[str, str]] = {
    "Transcend": {
        "hg": "Havana Gold",
        "im": "Island Mist",
        "lr": "Lava Rock",
        "sr": "Spiced Rum",
        "tt": "Tiki Torch",
        "rs": "Rope Swing",
    },
    "Transcend Lineage": {
        "bc": "Biscayne",
        "cl": "Carmel",
        "im": "Island Mist",
        "ja": "Jasper",
        "rn": "Rainier",
        "sf": "Salt Flat",
        "ht": "Hatteras",
    },
    "Select": {
        "wl": "Whiskey Barrel",
        "my": "Malted Barley",
        "ms": "Millstone",
        "pg": "Pebble Grey",
        "sd": "Saddle",
    },
    "Enhance": {
        "fw": "Foggy Wharf",
        "rh": "Rocky Harbor",
        "ts": "Toasted Sand",
        "hy": "Honey Grove",
        "cc": "Cinnamon Cove",
        "gh": "Golden Hour",
        "sd": "Saddle",
        "cs": "Clam Shell",
        "tp": "Tide Pool",
        "pb": "Pebble Beach",
    },
    "Refuge PVC": {
        "mv": "Martis Valley",
        "pr": "Point Reyes",
    },
    # Signature is not in your output (image_url null), so we’ll leave it empty for now.
    "Signature": {},
}

# exact garbage entries to drop if they show up as "names"
DROP_NAME_EXACT = {
    "trex",
    "trex signature",
    "transcend",
    "transcend lineage",
    "select",
    "enhance",
    "refuge",
    "shop trex refuge",
    "shop trex enhance",
    "composite decking",
}

# ---------- helpers ----------
def extract_code_from_image_url(url: str, collection: str) -> Optional[str]:
    """
    Extract embedded color code from Trex image URL.

    Handles patterns seen in your JSON, e.g.:
      .../trn-3inch-001-hg-decking-...
      .../lin-3inch-001-rn-decking-...
      .../sel-3inch-001-pg-decking-...
      .../enh-3inch-four-scallop-002-rh-decking-...
      .../refuge-2065-mv-decking-...
      .../salt-flat-... (no short code)
    """
    u = url.lower()

    # common "-<code>-decking" pattern
    m = re.search(r"-([a-z]{2})-decking", u)
    if m:
        return m.group(1)

    # refuge pattern "...-mv-decking..." or "...-pr-decking..."
    m = re.search(r"-(mv|pr)-decking", u)
    if m:
        return m.group(1)

    # salt flat special case (often no short code)
    if collection == "Transcend Lineage" and "salt-flat" in u:
        return "sf"

    return None


def slugify(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[®™]", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def build_css(grouped: Dict[str, List[Dict[str, Any]]]) -> str:
    lines = []
    lines.append("/* trex-decking.cleaned.css")
    lines.append("   Cleaned from trex-decking.json")
    lines.append("   Base vars + CSS-only light grain textures")
    lines.append("*/")
    lines.append("")
    lines.append(":root {")

    for collection, items in grouped.items():
        coll_slug = slugify(collection)
        for it in items:
            if not it.get("hex"):
                continue
            name_slug = slugify(it["name"])
            lines.append(f"  --trex-{coll_slug}-{name_slug}: {it['hex']};")

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

    for collection, items in grouped.items():
        coll_slug = slugify(collection)
        for it in items:
            if not it.get("hex"):
                continue
            name_slug = slugify(it["name"])
            lines.append(
                f"  --trex-{coll_slug}-{name_slug}-texture: "
                f"var(--trex-texture-template), "
                f"linear-gradient(0deg, var(--trex-{coll_slug}-{name_slug}), var(--trex-{coll_slug}-{name_slug}));"
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
    # Adjust if your paths differ
    in_json = Path("trex_output") / "trex-decking.json"
    if not in_json.exists():
        raise FileNotFoundError(f"Could not find {in_json}. Run trex_palette_builder.py first.")

    data = json.loads(in_json.read_text(encoding="utf-8"))

    cleaned: Dict[str, List[Dict[str, Any]]] = {}

    for collection, items in data.items():
        code_map = MAP_BY_COLLECTION_CODE.get(collection, {})
        out_items = []

        for it in items:
            name = (it.get("name") or "").strip()
            img = it.get("image_url")
            hx = it.get("hex")

            # Drop known junk names
            if name.lower() in DROP_NAME_EXACT:
                continue

            # If we can decode the real color name from the image_url -> replace it
            if img:
                code = extract_code_from_image_url(img, collection)
                if code and code in code_map:
                    name = code_map[code]

            # Drop anything still junky after decoding
            if not name or len(name) > 30:
                continue
            if name.lower() in DROP_NAME_EXACT:
                continue
            # must look like Title Case words (color names)
            if not re.fullmatch(r"[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,2}", name):
                continue

            out_items.append({
                "name": name,
                "slug": slugify(name),
                "image_url": img,
                "hex": hx,
            })

        # de-dupe by name
        seen = set()
        uniq = []
        for it in out_items:
            k = it["name"].lower()
            if k not in seen:
                uniq.append(it)
                seen.add(k)

        # sort by name for consistency
        uniq.sort(key=lambda x: x["name"])
        if uniq:
            cleaned[collection] = uniq

    out_dir = Path("trex_output")
    out_json = out_dir / "trex-decking.cleaned.json"
    out_css = out_dir / "trex-decking.cleaned.css"

    out_json.write_text(json.dumps(cleaned, indent=2), encoding="utf-8")
    out_css.write_text(build_css(cleaned), encoding="utf-8")

    print(f"Wrote {out_json}")
    print(f"Wrote {out_css}")


if __name__ == "__main__":
    main()