import json
import hashlib
from collections import Counter

JSONL = "dmsi_agility_full.jsonl"

MIN_TEXT = 500  # what we considered "real page"
TOP_N = 20

def h(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8", errors="ignore")).hexdigest()

total = 0
kept = 0
empty = 0
short = 0

url_counts = Counter()
text_hash_counts = Counter()
lengths = []
common_phrases = Counter()

phrase_watch = [
    "Table of Contents",
    "Index",
    "Distribution Management Systems",
    "all rights reserved",
    "unsupported browser",
    "This site works best with JavaScript enabled",
    "Menu",
    "Search",
]

largest = []  # (len, url)

with open(JSONL, "r", encoding="utf-8") as f:
    for line in f:
        total += 1
        try:
            obj = json.loads(line)
        except Exception:
            continue

        url = (obj.get("url") or "").strip()
        text = (obj.get("text") or "").strip()

        if not text:
            empty += 1
            continue

        url_counts[url] += 1
        lengths.append(len(text))
        largest.append((len(text), url))

        # phrase signals (boilerplate/nav leakage)
        t_low = text.lower()
        for p in phrase_watch:
            if p.lower() in t_low:
                common_phrases[p] += 1

        if len(text) < MIN_TEXT:
            short += 1
        else:
            kept += 1

        text_hash_counts[h(text[:20000])] += 1  # hash only first 20k chars for speed

largest.sort(reverse=True)

dupe_urls = sum(1 for u, c in url_counts.items() if c > 1)
dupe_texts = sum(1 for hh, c in text_hash_counts.items() if c > 1)

print("\n==== SCRAPE AUDIT ====")
print(f"Lines total in JSONL:        {total}")
print(f"Empty text records:          {empty}")
print(f"Short (<{MIN_TEXT}) records: {short}")
print(f"Kept (>= {MIN_TEXT}) records:{kept}")
print(f"Unique URLs:                 {len(url_counts)}")
print(f"Duplicate URL entries:       {dupe_urls}")
print(f"Duplicate text hashes:       {dupe_texts}")

if lengths:
    lengths_sorted = sorted(lengths)
    print("\nText length stats (chars):")
    print(f"  min:   {lengths_sorted[0]}")
    print(f"  p50:   {lengths_sorted[len(lengths_sorted)//2]}")
    print(f"  p90:   {lengths_sorted[int(len(lengths_sorted)*0.9)]}")
    print(f"  max:   {lengths_sorted[-1]}")

print("\nBoilerplate phrase hits (how many docs contain phrase):")
for p, c in common_phrases.most_common():
    print(f"  {p}: {c}")

print("\nLargest pages:")
for ln, url in largest[:TOP_N]:
    print(f"  {ln:>8}  {url}")

print("\nRecommendation:")
if empty > 0 or dupe_urls > 0:
    print("- Consider post-processing (dedupe + drop empties). Re-scrape not required.")
if kept < 1000:
    print("- Coverage seems low. Likely worth re-scraping with broader allow rules or parsing TOC sources.")
elif common_phrases["unsupported browser"] > kept * 0.2:
    print("- Lots of shell/nav text leaking in. Worth re-scraping with a stricter content selector.")
else:
    print("- Scrape looks usable. Next step: chunk + embed (no re-scrape needed).")