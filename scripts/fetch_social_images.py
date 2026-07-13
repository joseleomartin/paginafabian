"""Descarga thumbnails/frames de YouTube + intenta OG images públicas."""
from __future__ import annotations

import re
import urllib.request
from pathlib import Path

import yt_dlp
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "Material" / "_social"
PUBLIC = ROOT / "public" / "images"
OUT.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)

VIDEO_IDS = [
    "Nf2calxXrms",  # En Clave / compromiso
    "7NyZEC7hlk0",  # OTR ep4
    "_nFpwIM3-bw",  # OTR ep3
    "OuMY52QBSfk",  # OTR ep2
    "Wzumzk4dXYQ",  # OTR ep1
]

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)


def download(url: str, dest: Path) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            dest.write_bytes(r.read())
        print(f"OK {dest.name} ({dest.stat().st_size // 1024}KB) <- {url[:80]}")
        return True
    except Exception as e:
        print(f"FAIL {dest.name}: {e}")
        return False


def save_jpeg(src: Path, dest: Path, max_w: int = 1600) -> None:
    im = Image.open(src).convert("RGB")
    w, h = im.size
    if w > max_w:
        im = im.resize((max_w, int(h * max_w / w)), Image.Resampling.LANCZOS)
    im.save(dest, "JPEG", quality=85, optimize=True, progressive=True)
    print(f"  -> public {dest.name} {im.size[0]}x{im.size[1]}")


def fetch_youtube_thumbs() -> list[Path]:
    saved: list[Path] = []
    for vid in VIDEO_IDS:
        # maxres > hq > sd
        for quality in ("maxresdefault", "sddefault", "hqdefault"):
            url = f"https://i.ytimg.com/vi/{vid}/{quality}.jpg"
            dest = OUT / f"yt-{vid}-{quality}.jpg"
            if download(url, dest) and dest.stat().st_size > 5000:
                saved.append(dest)
                break
    return saved


def extract_frames() -> list[Path]:
    """Baja clips cortos y saca frames representativos."""
    frames: list[Path] = []
    for vid in VIDEO_IDS[:3]:
        url = f"https://www.youtube.com/watch?v={vid}"
        tmpl = str(OUT / f"clip-{vid}.%(ext)s")
        opts = {
            "quiet": True,
            "outtmpl": tmpl,
            "format": "best[height<=720]/best",
            "download_ranges": yt_dlp.utils.download_range_func(None, [(12, 14)]),
            "force_keyframes_at_cuts": True,
            "noprogress": True,
        }
        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                ydl.download([url])
        except Exception as e:
            print(f"clip fail {vid}: {e}")
            continue

        clips = list(OUT.glob(f"clip-{vid}.*"))
        if not clips:
            continue
        clip = clips[0]
        # frame via pillow if image; else ffmpeg-like via yt_dlp postprocessor skipped
        # Use yt_dlp to get a single frame by converting with pillow only if png/jpg
        if clip.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            frames.append(clip)
            continue
        # Try extracting with ffmpeg if available
        frame_path = OUT / f"frame-{vid}.jpg"
        import subprocess

        try:
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-ss",
                    "1",
                    "-i",
                    str(clip),
                    "-frames:v",
                    "1",
                    "-q:v",
                    "2",
                    str(frame_path),
                ],
                check=True,
                capture_output=True,
            )
            if frame_path.exists():
                frames.append(frame_path)
                print(f"frame OK {frame_path.name}")
        except Exception as e:
            print(f"ffmpeg fail {vid}: {e}")
    return frames


def fetch_og_pages() -> list[Path]:
    pages = [
        "https://somosemagroup.com/",
        "https://www.linkedin.com/newsletters/en-clave-pyme-7462332384512782336/",
    ]
    saved: list[Path] = []
    for i, url in enumerate(pages):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=25) as r:
                html = r.read().decode("utf-8", "ignore")
        except Exception as e:
            print(f"page fail {url}: {e}")
            continue
        ogs = re.findall(
            r'property=["\']og:image["\'][^>]*content=["\']([^"\']+)',
            html,
            flags=re.I,
        )
        ogs += re.findall(
            r'content=["\']([^"\']+)["\'][^>]*property=["\']og:image',
            html,
            flags=re.I,
        )
        imgs = re.findall(r"https://media\.licdn\.com/[^\"'\s>]+", html)
        imgs += re.findall(
            r"https://[^\"'\s>]+\.(?:jpg|jpeg|png|webp)", html, flags=re.I
        )
        candidates = list(dict.fromkeys(ogs + imgs))[:6]
        print(f"page {url} candidates {len(candidates)}")
        for j, img_url in enumerate(candidates):
            dest = OUT / f"web-{i}-{j}.jpg"
            # keep original extension if png
            if ".png" in img_url.lower():
                dest = OUT / f"web-{i}-{j}.png"
            if download(img_url, dest) and dest.stat().st_size > 8000:
                saved.append(dest)
    return saved


def main() -> None:
    thumbs = fetch_youtube_thumbs()
    ogs = fetch_og_pages()
    frames = extract_frames()
    print("--- summarize ---")
    print("thumbs", len(thumbs), "ogs", len(ogs), "frames", len(frames))


if __name__ == "__main__":
    main()
