"""Procesa assets de YouTube/Material a public/images sin repetir usos."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOCIAL = ROOT / "Material" / "_social"
MAT = ROOT / "Material"
PUB = ROOT / "public" / "images"
PUB.mkdir(parents=True, exist_ok=True)


def save(im: Image.Image, name: str, max_w: int = 1600) -> None:
    im = im.convert("RGB")
    w, h = im.size
    if w > max_w:
        im = im.resize((max_w, int(h * max_w / w)), Image.Resampling.LANCZOS)
    dest = PUB / name
    im.save(dest, "JPEG", quality=85, optimize=True, progressive=True)
    print(f"{name}: {im.size[0]}x{im.size[1]} ({dest.stat().st_size // 1024}KB)")


def crop_box(im: Image.Image, box: tuple[float, float, float, float]) -> Image.Image:
    """box as fractions (l,t,r,b) of width/height."""
    w, h = im.size
    l, t, r, b = box
    return im.crop((int(l * w), int(t * h), int(r * w), int(b * h)))


def main() -> None:
    # 1) YouTube featured — seated coach (newsletter / charlas)
    yt_feat = Image.open(SOCIAL / "yt-Nf2calxXrms-maxresdefault.jpg")
    # Quitar franja de texto inferior y logos superiores: foco en Fabián
    save(crop_box(yt_feat, (0.28, 0.08, 0.72, 0.78)), "social-coach-seated.jpg", 1400)
    # Versión landscape más amplia del mismo frame
    save(crop_box(yt_feat, (0.18, 0.05, 0.82, 0.82)), "social-coach-wide.jpg", 1600)

    # 2) Off the Record — crop solo Fabián (panel izquierdo)
    otr_ep1 = Image.open(SOCIAL / "yt-Wzumzk4dXYQ-maxresdefault.jpg")
    save(crop_box(otr_ep1, (0.18, 0.18, 0.48, 0.78)), "social-otr-ep1.jpg", 900)

    otr_ep2 = Image.open(SOCIAL / "yt-OuMY52QBSfk-maxresdefault.jpg")
    save(crop_box(otr_ep2, (0.18, 0.18, 0.48, 0.78)), "social-otr-ep2.jpg", 900)

    otr_ep3 = Image.open(SOCIAL / "yt-_nFpwIM3-bw-maxresdefault.jpg")
    # Fabian está a la derecha en este
    save(crop_box(otr_ep3, (0.52, 0.18, 0.82, 0.78)), "social-otr-ep3.jpg", 900)

    otr_ep4 = Image.open(SOCIAL / "yt-7NyZEC7hlk0-sddefault.jpg")
    save(crop_box(otr_ep4, (0.08, 0.18, 0.48, 0.88)), "social-otr-ep4.jpg", 900)
    # Frame completo episodio (podcast body)
    save(otr_ep4, "social-otr-duo.jpg", 1280)

    # 3) Material no usado — podio formal (trayectoria)
    podium = Image.open(MAT / "P1040514.JPG")
    save(crop_box(podium, (0.22, 0.05, 0.78, 0.95)), "portrait-podium.jpg", 1200)

    # 4) Material — wide stage aún no en catálogo activo
    wide_a = Image.open(PUB / "stage-wide-a.jpg")
    save(wide_a, "stage-wide-a.jpg", 1600)  # ensure present

    # 5) Stage exit / room already exist — crop alternate from _DSC1659 favoring speaker
    room = Image.open(MAT / "_DSC1659.jpg")
    save(crop_box(room, (0.35, 0.15, 0.95, 0.95)), "stage-speaker-right.jpg", 1400)

    # 6) Close from high-res 1671 different crop than speaking-1671
    hi = Image.open(MAT / "_DSC1671.jpg")
    # tighter head/shoulders alternate
    save(crop_box(hi, (0.32, 0.08, 0.72, 0.62)), "portrait-close-alt.jpg", 1100)

    print("done")


if __name__ == "__main__":
    main()
