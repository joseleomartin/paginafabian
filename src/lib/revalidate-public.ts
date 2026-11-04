import { revalidatePath } from "next/cache";

/** Rutas públicas con ISR que dependen del store de novedades/noticias. */
const PUBLIC_CONTENT_PATHS = [
  "/",
  "/en-clave-pyme",
  "/off-the-record",
  "/tips",
  "/prensa",
] as const;

/** Invalida el HTML cacheado tras sync o cambios del admin. */
export function revalidatePublicContent(): void {
  for (const path of PUBLIC_CONTENT_PATHS) {
    revalidatePath(path);
  }
}
