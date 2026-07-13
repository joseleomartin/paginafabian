import re
import urllib.request
from pathlib import Path

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
out = Path("Material/_social")
out.mkdir(parents=True, exist_ok=True)

pages = [
    "https://www.somosemagroup.com/",
]

req = urllib.request.Request(pages[0], headers={"User-Agent": UA})
html = urllib.request.urlopen(req, timeout=25).read().decode("utf-8", "ignore")
links = sorted(set(re.findall(r'href=["\'](https://www\.somosemagroup\.com/[^"\'#?]+)', html)))
print("links", len(links))
for l in links[:50]:
    print(l)

imgs = sorted(
    set(
        re.findall(
            r"https://www\.somosemagroup\.com/wp-content/uploads/[^\"'\s>]+\.(?:jpg|jpeg|png|webp)",
            html,
            flags=re.I,
        )
    )
)
print("imgs", len(imgs))
for i in imgs:
    print(i)

# crawl a few likely pages
extra = [
    "https://www.somosemagroup.com/equipo/",
    "https://www.somosemagroup.com/quienes-somos/",
    "https://www.somosemagroup.com/nosotros/",
    "https://www.somosemagroup.com/cfo-fractional/",
]
for url in extra:
    try:
        r = urllib.request.Request(url, headers={"User-Agent": UA})
        h = urllib.request.urlopen(r, timeout=15).read().decode("utf-8", "ignore")
        found = re.findall(
            r"https://www\.somosemagroup\.com/wp-content/uploads/[^\"'\s>]+\.(?:jpg|jpeg|png|webp)",
            h,
            flags=re.I,
        )
        print(url, "status ok", "imgs", len(set(found)))
        for f in sorted(set(found))[:12]:
            print(" ", f)
    except Exception as e:
        print(url, "FAIL", e)
