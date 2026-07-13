from pathlib import Path
import urllib.request
from PIL import Image

UA = "Mozilla/5.0"
OUT = Path("Material/_social")
PUB = Path("public/images")
OUT.mkdir(exist_ok=True)
PUB.mkdir(exist_ok=True)

urls = [
    ("https://www.somosemagroup.com/wp-content/uploads/2024/01/Fabian-Redonda.webp", "ema-fabian-round.webp"),
    ("https://www.somosemagroup.com/wp-content/uploads/2023/11/imagenHome1.webp", "ema-home1.webp"),
    ("https://www.somosemagroup.com/wp-content/uploads/2023/11/5-capacitacion-1.webp", "ema-capacitacion.webp"),
    ("https://www.somosemagroup.com/wp-content/uploads/2023/07/1.png", "ema-1.png"),
    ("https://www.somosemagroup.com/wp-content/uploads/2023/07/4.png", "ema-4.png"),
    ("https://www.somosemagroup.com/wp-content/uploads/2023/07/5.png", "ema-5.png"),
    ("https://www.somosemagroup.com/wp-content/uploads/2023/07/8.png", "ema-8.png"),
    ("https://www.somosemagroup.com/wp-content/uploads/2023/08/10.png", "ema-10.png"),
    ("https://www.somosemagroup.com/wp-content/uploads/2023/08/12-copia.png", "ema-12.png"),
    ("https://www.somosemagroup.com/wp-content/uploads/2023/08/Untitled-design-26-1.webp", "ema-untitled.webp"),
]

for url, name in urls:
    dest = OUT / name
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            dest.write_bytes(r.read())
        print("OK", name, dest.stat().st_size // 1024, "KB")
    except Exception as e:
        print("FAIL", name, e)


def to_jpg(src: Path, name: str, max_w: int = 1400) -> None:
    im = Image.open(src).convert("RGB")
    w, h = im.size
    if w > max_w:
        im = im.resize((max_w, int(h * max_w / w)), Image.Resampling.LANCZOS)
    dest = PUB / name
    im.save(dest, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"  -> {name} {im.size}")


for src_name, out_name in [
    ("ema-fabian-round.webp", "social-fabian-round.jpg"),
    ("ema-home1.webp", "social-office-desk.jpg"),
    ("ema-capacitacion.webp", "social-capacitacion.jpg"),
]:
    p = OUT / src_name
    if p.exists() and p.stat().st_size > 5000:
        to_jpg(p, out_name)
