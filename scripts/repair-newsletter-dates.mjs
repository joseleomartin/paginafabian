/**
 * Corrige las fechas de las ediciones del newsletter guardadas en
 * data/novedades.json usando la fecha real que publica LinkedIn en cada ediciÃ³n.
 *
 *   node scripts/repair-newsletter-dates.mjs          # solo muestra diferencias
 *   node scripts/repair-newsletter-dates.mjs --write  # aplica (con respaldo)
 */
import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { extractArticlePublishedDate } from "../src/lib/linkedin-article.ts";

const DATA_FILE = path.join(process.cwd(), "data", "novedades.json");
const FETCH_TIMEOUT_MS = 8000;
const REQUEST_DELAY_MS = 1500;
const shouldWrite = process.argv.includes("--write");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** DÃ­a calendario en Buenos Aires, igual que usa el panel de admin. */
function toBuenosAiresDate(isoDate) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(isoDate));
}

async function fetchPublishedDate(url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FabianCanoniSite/1.0)" },
    });
    if (!response.ok) {
      console.warn(`  ! HTTP ${response.status} en ${url}`);
      return null;
    }
    return extractArticlePublishedDate(await response.text());
  } catch (error) {
    console.warn(`  ! No se pudo leer ${url}: ${error.message}`);
    return null;
  }
}

const items = JSON.parse(await readFile(DATA_FILE, "utf8"));
const newsletters = items.filter((item) => item.type === "newsletter");
console.log(`Revisando ${newsletters.length} ediciones...`);

const corrections = [];
let unreadable = 0;
for (const item of newsletters) {
  const published = await fetchPublishedDate(item.href);
  if (published) {
    const realDate = toBuenosAiresDate(published);
    if (realDate !== item.date) corrections.push({ item, realDate });
  } else {
    unreadable += 1;
  }
  await sleep(REQUEST_DELAY_MS);
}

if (unreadable > 0) {
  console.warn(
    `\n${unreadable} ediciones no se pudieron verificar (LinkedIn limita las consultas). ` +
      "ReintentÃ¡ en unos minutos."
  );
}

if (corrections.length === 0) {
  console.log(
    unreadable === 0
      ? "Todas las fechas coinciden con LinkedIn. Nada que corregir."
      : "No se detectaron diferencias en las ediciones verificadas."
  );
  process.exit(0);
}

for (const { item, realDate } of corrections) {
  console.log(`  ${item.title}: ${item.date} -> ${realDate}`);
}

if (!shouldWrite) {
  console.log("\nModo simulaciÃ³n. EjecutÃ¡ con --write para aplicar los cambios.");
  process.exit(0);
}

const backupFile = `${DATA_FILE}.bak`;
await copyFile(DATA_FILE, backupFile);

const realDateById = new Map(corrections.map(({ item, realDate }) => [item.id, realDate]));
const repaired = items.map((item) =>
  realDateById.has(item.id) ? { ...item, date: realDateById.get(item.id) } : item
);
await writeFile(DATA_FILE, `${JSON.stringify(repaired, null, 2)}\n`, "utf8");

console.log(`\n${corrections.length} fechas corregidas. Respaldo en ${backupFile}`);
