/**
 * Descarga covers En Clave PyME (sesión .li-profile) a public/images/newsletter/
 * y actualiza imageUrl + fechas reales en data/novedades.json
 */
import { chromium } from "playwright";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data", "novedades.json");
const PROFILE = path.join(__dirname, ".li-profile");
const OUT_DIR = path.join(ROOT, "public", "images", "newsletter");

function editionNumber(title) {
  const m = String(title || "").match(/#\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

function isArticleCover(url) {
  if (!url) return false;
  if (/profile-frame|profile-framedphoto|ghost-person/i.test(url)) return false;
  return /article-cover|article_cover|feedshare|media\.licdn\.com/i.test(url);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const items = JSON.parse(await fs.readFile(DATA, "utf8"));

  const context = await chromium.launchPersistentContext(PROFILE, {
    channel: "chrome",
    headless: true,
    viewport: { width: 1280, height: 900 },
    locale: "es-AR",
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const page = context.pages()[0] || (await context.newPage());

  let saved = 0;
  let dates = 0;

  for (const item of items) {
    if (item.type !== "newsletter") continue;
    const n = editionNumber(item.title);
    if (n === null) continue;

    try {
      await page.goto(item.href, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page.waitForTimeout(1500);

      const meta = await page.evaluate(() => {
        const published =
          document.querySelector('meta[property="article:published_time"]')
            ?.content || null;
        const og = document.querySelector('meta[property="og:image"]')?.content;
        const covers = [...document.querySelectorAll("img[src*='media.licdn.com']")]
          .map((img) => img.currentSrc || img.src)
          .filter((src) => /article-cover|article_cover|feedshare/i.test(src));
        return { published, og, cover: covers[0] || null };
      });

      if (meta.published) {
        const d = new Date(meta.published);
        if (!Number.isNaN(d.getTime())) {
          const iso = d.toISOString().slice(0, 10);
          if (item.date !== iso) {
            item.date = iso;
            dates += 1;
          }
        }
      }

      const remote = [meta.og, meta.cover, item.imageUrl].find((u) =>
        isArticleCover(u)
      );
      if (!remote) {
        console.log(`#${n} sin cover remota`);
        continue;
      }

      // Download via authenticated browser context
      const response = await page.request.get(remote, {
        headers: { Referer: item.href },
      });
      if (!response.ok()) {
        console.log(`#${n} download ${response.status()}`);
        continue;
      }
      const buf = Buffer.from(await response.body());
      const ct = response.headers()["content-type"] || "";
      const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
      const fileName = `ed-${n}.${ext}`;
      const filePath = path.join(OUT_DIR, fileName);
      await fs.writeFile(filePath, buf);
      item.imageUrl = `/images/newsletter/${fileName}`;
      saved += 1;
      console.log(`#${n} ${item.date} -> ${fileName} (${buf.length} bytes)`);
    } catch (err) {
      console.error(`#${n} fail`, err.message);
    }
  }

  items.sort((a, b) => {
    if (a.type === "newsletter" && b.type === "newsletter") {
      const na = editionNumber(a.title);
      const nb = editionNumber(b.title);
      if (na !== null && nb !== null && na !== nb) return nb - na;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  await fs.writeFile(DATA, `${JSON.stringify(items, null, 2)}\n`, "utf8");
  await context.close();
  console.log(JSON.stringify({ ok: true, saved, dates }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
