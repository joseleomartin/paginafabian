import archiveSnapshot from "../../data/novedades.json";
import {
  normalizeNovedades,
  type Novedad,
  type NovedadType,
} from "@/lib/novedades";

/**
 * Archivo histórico (con portadas locales) que viaja dentro del deploy.
 * Se incluye en el build, así que no depende de que el filesystem de Vercel
 * exponga `data/`. El sync lo usa para completar el store con lo que falte;
 * a partir de ahí las fuentes externas solo aportan lo más nuevo.
 */
const archive: readonly Novedad[] = normalizeNovedades(archiveSnapshot);

export function archivedNovedades(type: NovedadType): Novedad[] {
  return archive.filter((item) => item.type === type);
}
