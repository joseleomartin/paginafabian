from pathlib import Path
from PIL import Image
import urllib.request
import re

SOC = Path("Material/_social")
PUB = Path("public/images")

yt = Image.open(SOC / "yt-Nf2calxXrms-maxresdefault.jpg").convert("RGB")
yt.save(PUB / "social-yt-featured.jpg", "JPEG", quality=90, optimize=True)
print("featured", yt.size)

untitled = SOC / "ema-untitled.webp"
im = Image.open(untitled).convert("RGB")
im.save(SOC / "ema-untitled.jpg", "JPEG", quality=90)
print("untitled", im.size)

# branded.me
for u in ["http://fabian-canoni.branded.me/", "https://fabian-canoni.branded.me/"]:
    try:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req, timeout=15).read().decode("utf-8", "ignore")
        print(u, "len", len(html))
        imgs = re.findall(r"https?://[^\"'\s>]+\.(?:jpg|jpeg|png|webp)", html, flags=re.I)
        print("imgs", imgs[:20])
    except Exception as e:
        print("fail", u, e)
