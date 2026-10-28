/**
 * Scrape En Clave PyME (logueado) con scroll + imágenes.
 * Uso: node scripts/scrape-linkedin-newsletter.mjs
 *
 * Abre Chrome headed con perfil en scripts/.li-profile
 * (reutiliza login si ya existe).
 */
import { chromium } from "playwright";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data", "novedades.json");
const OUT = path.join(ROOT, "data", "newsletter-scrape.json");
const PROFILE = path.join(__dirname, ".li-profile");
const NEWSLETTER_URL =
  "https://www.linkedin.com/newsletters/en-clave-pyme-7462332384512782336/";

function editionNumber(title) {
  const m = String(title || "").match(/#\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

function slugId(url, index) {
  try {
    const last = new URL(url).pathname.replace(/\/+$/, "").split("/").pop();
    if (last) return `li-${decodeURIComponent(last).slice(0, 80)}`;
  } catch {
    /* ignore */
  }
  return `li-edition-${index}`;
}

function fingerprint(item) {
  const n = editionNumber(item.title);
  if (n !== null) return `n:${n}`;
  try {
    const u = new URL(item.href);
    return `href:${u.origin}${u.pathname.replace(/\/$/, "")}`;
  } catch {
    return `href:${item.href}`;
  }
}

function cleanImage(src) {
  if (!src || typeof src !== "string") return undefined;
  if (src.startsWith("data:")) return undefined;
  // Prefer full media.licdn.com cover images
  const abs = src.startsWith("//") ? `https:${src}` : src;
  try {
    const u = new URL(abs);
    if (!u.hostname.includes("licdn.com") && !u.hostname.includes("linkedin.com")) {
      return undefined;
    }
    return abs.split("&")[0];
  } catch {
    return undefined;
  }
}

async function extractEditions(page) {
  return page.evaluate(() => {
    const results = [];
    const seen = new Set();

    const push = (title, href, imageUrl, summary) => {
      if (!href || !/\/pulse\//i.test(href)) return;
      let url;
      try {
        url = new URL(href, location.origin).href.split("?")[0];
      } catch {
        return;
      }
      const key = url.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const t = (title || "").replace(/\s+/g, " ").trim();
      results.push({
        title: t,
        href: url,
        imageUrl: imageUrl || null,
        summary: (summary || "").replace(/\s+/g, " ").trim().slice(0, 220) || null,
      });
    };

    // Cards / articles with pulse links
    const anchors = [
      ...document.querySelectorAll('a[href*="/pulse/"]'),
    ];

    for (const a of anchors) {
      const href = a.getAttribute("href") || "";
      const card =
        a.closest("article, li, .feed-shared-update-v2, [data-view-name]") ||
        a.parentElement?.parentElement ||
        a;

      let title =
        a.getAttribute("aria-label") ||
        a.querySelector("h2, h3, span[dir='ltr']")?.textContent ||
        a.textContent ||
        "";

      title = title.replace(/\s+/g, " ").trim();
      title = title
        .replace(/^Abrir art[ií]culo:\s*/i, "")
        .replace(/\s+de\s+Fabi[aá]n\s+Canoni\s*[•·].*$/i, "")
        .replace(/\s*[•·]\s*\d+\s*min.*$/i, "")
        .trim();
      // Skip nav noise
      if (title.length < 8 && !/#\s*\d+/.test(title)) {
        const heading = card?.querySelector?.("h2, h3");
        if (heading) title = heading.textContent?.replace(/\s+/g, " ").trim() || title;
      }

      let img =
        card?.querySelector?.("img[src*='licdn'], img[src*='media']")?.src ||
        card?.querySelector?.("img")?.src ||
        a.querySelector("img")?.src ||
        null;

      // srcset largest
      const srcset =
        card?.querySelector?.("img[srcset]")?.getAttribute("srcset") ||
        a.querySelector("img[srcset]")?.getAttribute("srcset");
      if (srcset) {
        const parts = srcset.split(",").map((p) => p.trim().split(/\s+/));
        const last = parts[parts.length - 1];
        if (last?.[0]) img = last[0];
      }

      let summary = "";
      const paras = card?.querySelectorAll?.("p, span.break-words");
      if (paras) {
        for (const p of paras) {
          const t = p.textContent?.replace(/\s+/g, " ").trim() || "";
          if (t.length > 40 && t !== title) {
            summary = t;
            break;
          }
        }
      }

      if (/#\s*\d+/.test(title) || /\/pulse\/\d+/i.test(href)) {
        push(title, href, img, summary);
      }
    }

    return results;
  });
}

async function scrollArchive(page) {
  let stableRounds = 0;
  let lastCount = 0;
  const maxRounds = 80;

  for (let i = 0; i < maxRounds; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, Math.max(900, window.innerHeight * 0.9));
      const main =
        document.querySelector("main") ||
        document.querySelector(".scaffold-finite-scroll__content") ||
        document.scrollingElement;
      if (main && main !== document.scrollingElement) {
        main.scrollTop = main.scrollTop + 1200;
      }
    });
    await page.waitForTimeout(900);

    // Click "Show more" / "Ver más" if present
    const more = page
      .locator(
        'button:has-text("Show more"), button:has-text("Ver más"), button:has-text("See more")'
      )
      .first();
    if (await more.isVisible().catch(() => false)) {
      await more.click({ timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(800);
    }

    const count = await page.locator('a[href*="/pulse/"]').count();
    if (count <= lastCount) {
      stableRounds += 1;
    } else {
      stableRounds = 0;
      lastCount = count;
    }
    if (stableRounds >= 6) break;
  }
}

function merge(existing, incoming) {
  const map = new Map();
  for (const item of existing) map.set(fingerprint(item), item);
  let added = 0;
  let updatedImages = 0;

  for (const item of incoming) {
    const key = fingerprint(item);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, item);
      added += 1;
      continue;
    }
    const next = {
      ...prev,
      title: item.title || prev.title,
      summary:
        item.summary && item.summary !== "Edición de En Clave PyME en LinkedIn."
          ? item.summary
          : prev.summary,
      href: item.href || prev.href,
      date: prev.date && prev.date !== new Date().toISOString().slice(0, 10)
        ? prev.date
        : item.date || prev.date,
      imageUrl: item.imageUrl || prev.imageUrl,
      badge: prev.badge || item.badge || "En Clave PyME",
      published: prev.published !== false,
    };
    if (!prev.imageUrl && next.imageUrl) updatedImages += 1;
    map.set(key, next);
  }

  const items = [...map.values()].sort((a, b) => {
    const na = editionNumber(a.title);
    const nb = editionNumber(b.title);
    if (a.type !== b.type) {
      if (a.type === "newsletter") return -1;
      if (b.type === "newsletter") return 1;
    }
    if (na !== null && nb !== null && na !== nb) return nb - na;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return { items, added, updatedImages };
}

async function main() {
  await fs.mkdir(PROFILE, { recursive: true });
  await fs.mkdir(path.dirname(OUT), { recursive: true });

  const context = await chromium.launchPersistentContext(PROFILE, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1400, height: 900 },
    locale: "es-AR",
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = context.pages()[0] || (await context.newPage());

  // Capture voyager newsletter payloads if LinkedIn loads them
  const apiEditions = [];
  page.on("response", async (res) => {
    try {
      const url = res.url();
      if (!/voyager|graphql|newsletter/i.test(url)) return;
      if (res.status() !== 200) return;
      const ct = res.headers()["content-type"] || "";
      if (!ct.includes("json")) return;
      const json = await res.json().catch(() => null);
      if (!json) return;
      const blob = JSON.stringify(json);
      const titleHits = [
        ...blob.matchAll(/"#(\d+)\.\s*([^"\\]{8,180})"/g),
      ];
      const pulseHits = [
        ...blob.matchAll(
          /https?:\\\/\\\/[^"\\]*linkedin\.com\\\/pulse\\\/([a-zA-Z0-9%\-]+)/g
        ),
      ];
      // also unescaped
      const pulseHits2 = [
        ...blob.matchAll(
          /https?:\/\/(?:[a-z]+\.)?linkedin\.com\/pulse\/([a-z0-9%\-]+)/gi
        ),
      ];
      const imgHits = [
        ...blob.matchAll(
          /(https:\/\/media\.licdn\.com\/dms\/image\/[^"\\]+)/g
        ),
      ];

      for (const m of titleHits) {
        const num = m[1];
        const rest = m[2];
        const link =
          pulseHits2.find((l) =>
            decodeURIComponent(l[1]).startsWith(`${num}-`)
          ) ||
          pulseHits.find((l) =>
            decodeURIComponent(l[1].replace(/\\u002[fF]/g, "/")).startsWith(
              `${num}-`
            )
          );
        if (!link) continue;
        let href = link[0]
          .replace(/\\\//g, "/")
          .replace(/\\u002[fF]/g, "/");
        href = href.split("?")[0];
        const cover = imgHits.find((im) =>
          /article-cover|shrink_720|feedshare/i.test(im[1])
        );
        apiEditions.push({
          title: `#${num}. ${rest}`,
          href,
          imageUrl: cover?.[1]?.replace(/\\u002[fF]/g, "/") || null,
          summary: null,
        });
      }
    } catch {
      /* ignore */
    }
  });

  console.log("Opening newsletter…");
  await page.goto(NEWSLETTER_URL, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page.waitForTimeout(4000);

  // Wait for a real logged-in session (up to ~10 min). Guest pages also show
  // ~8 pulse links, so do NOT treat that as success.
  // Never goto while on login — it kicks the user off the form mid-typing.
  const deadline = Date.now() + 600_000;
  let navigatedToNewsletter = false;
  while (Date.now() < deadline) {
    const url = page.url();
    const onLoginFlow = /\/login|\/authwall|\/checkpoint|\/uas\//i.test(url);
    const onNewsletter = /newsletters\/en-clave/i.test(url);

    const loggedIn = await page.evaluate(() => {
      const hasMe =
        !!document.querySelector(
          'img.global-nav__me-photo, button.global-nav__primary-link-me-menu-trigger, [data-control-name="identity_welcome_message"], .feed-identity-module'
        ) ||
        !!document.cookie.match(/(^|;\s*)li_at=/);
      const joinText = (document.body?.innerText || "").slice(0, 2000);
      const guestPrompt =
        /Join to Subscribe|Únete para suscribirte|Sign in|Inicia sesión/i.test(
          joinText
        );
      return hasMe && !guestPrompt;
    });

    if (onLoginFlow) {
      console.log("Esperando login (no navego; escribí tranquilo)…");
      await page.waitForTimeout(4000);
      continue;
    }

    if (loggedIn && !onNewsletter) {
      console.log("Login detectado, abriendo newsletter…");
      await page
        .goto(NEWSLETTER_URL, { waitUntil: "domcontentloaded", timeout: 90000 })
        .catch(() => {});
      navigatedToNewsletter = true;
      await page.waitForTimeout(4000);
      continue;
    }

    if (loggedIn && onNewsletter) {
      console.log("Sesión OK en newsletter, arranco scrape…");
      break;
    }

    // Still guest: open login once, then leave the user alone
    if (!navigatedToNewsletter && onNewsletter) {
      const signIn = page
        .locator(
          'a[href*="/login"], a:has-text("Sign in"), a:has-text("Inicia sesión")'
        )
        .first();
      if (await signIn.isVisible().catch(() => false)) {
        console.log("Abrí Sign in — logueate; no toco la página mientras escribís.");
        await signIn.click().catch(() => {});
      }
      navigatedToNewsletter = true;
    }

    console.log("Esperando que completes el login…");
    await page.waitForTimeout(5000);
  }

  console.log("Scrolling archive…");
  await scrollArchive(page);

  const fromDom = await extractEditions(page);
  console.log(`DOM editions: ${fromDom.length}; API glimpses: ${apiEditions.length}`);

  // Enrich missing images by visiting each pulse briefly (cover/og)
  const needImages = fromDom.filter((e) => !cleanImage(e.imageUrl));
  const imageByHref = new Map();

  for (const ed of needImages.slice(0, 40)) {
    try {
      const p = await context.newPage();
      await p.goto(ed.href, { waitUntil: "domcontentloaded", timeout: 45000 });
      await p.waitForTimeout(1200);
      const img = await p.evaluate(() => {
        const og =
          document.querySelector('meta[property="og:image"]')?.content ||
          document.querySelector('meta[name="twitter:image"]')?.content;
        if (og) return og;
        const cover = document.querySelector(
          "img[src*='media.licdn.com'][src*='article'], img[src*='media.licdn.com']"
        );
        return cover?.src || null;
      });
      if (img) imageByHref.set(ed.href, img);
      await p.close();
    } catch {
      /* skip */
    }
  }

  const combined = [...apiEditions, ...fromDom];
  const byKey = new Map();
  for (const raw of combined) {
    const title = (raw.title || "").replace(/\s+/g, " ").trim();
    const href = raw.href;
    if (!href) continue;
    let finalTitle = title;
    if (!/#\s*\d+/.test(finalTitle)) {
      const m = href.match(/\/pulse\/(\d+)/i);
      if (m) finalTitle = `#${m[1]}. ${finalTitle || "Edición"}`.trim();
    }
    const n = editionNumber(finalTitle);
    const key = n !== null ? `n:${n}` : href;
    const imageUrl =
      cleanImage(imageByHref.get(href)) ||
      cleanImage(raw.imageUrl) ||
      undefined;
    const prev = byKey.get(key);
    byKey.set(key, {
      id: slugId(href, byKey.size),
      type: "newsletter",
      title: finalTitle || prev?.title || "Edición En Clave PyME",
      summary:
        raw.summary ||
        prev?.summary ||
        "Edición de En Clave PyME en LinkedIn.",
      date: new Date().toISOString().slice(0, 10),
      href,
      imageUrl: imageUrl || prev?.imageUrl,
      badge: "En Clave PyME",
      published: true,
    });
  }

  const scraped = [...byKey.values()].sort((a, b) => {
    const na = editionNumber(a.title);
    const nb = editionNumber(b.title);
    if (na !== null && nb !== null) return nb - na;
    return 0;
  });

  await fs.writeFile(OUT, `${JSON.stringify(scraped, null, 2)}\n`, "utf8");

  let existing = [];
  try {
    existing = JSON.parse(await fs.readFile(DATA, "utf8"));
  } catch {
    existing = [];
  }
  if (!Array.isArray(existing)) existing = [];

  const { items, added, updatedImages } = merge(existing, scraped);
  await fs.writeFile(DATA, `${JSON.stringify(items, null, 2)}\n`, "utf8");

  const newsletters = items.filter((i) => i.type === "newsletter");
  const withImg = newsletters.filter((i) => i.imageUrl).length;

  console.log(
    JSON.stringify(
      {
        ok: true,
        scraped: scraped.length,
        newsletterTotal: newsletters.length,
        withImages: withImg,
        added,
        updatedImages,
        titles: scraped.map((s) => s.title),
      },
      null,
      2
    )
  );

  await context.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
