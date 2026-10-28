# Fabián Canoni — Marca personal

Sitio de marca personal para **Fabián Canoni**, CFO Fractional.

Inspirado en la lógica de sitios como [Sofía Contreras](https://www.soficontreras.com/): la persona primero, contenido, acompañamiento y contacto.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Contenido

La fuente de verdad del proyecto está en `/material`.

## Calidad

```bash
npm run lint   # ESLint (0 warnings)
npm test       # tests de la lógica de merge de novedades
npm run build
```

## Panel admin

El panel vive en `/admin` (sin link en el menú, no se indexa) y tiene dos pestañas:

- **Prensa**: notas propias del sitio (charlas, eventos, anuncios) con imagen opcional. Se muestran en `/prensa` (`/novedades` redirige ahí).
- **Newsletter, podcast y tips**: correcciones manuales de lo que se sincroniza solo (ver más abajo).

### Prensa (con imagen)

- Campos: título, texto (párrafos separados por línea en blanco), imagen opcional, fecha, enlace opcional y publicada/borrador.
- Imágenes: JPG, PNG o WebP, máximo 4 MB. Las fotos grandes (celular) se reducen solas en el navegador a 1600 px antes de subirse. El servidor valida el **contenido real** del archivo, no la extensión.
- Al reemplazar o quitar una imagen, o al eliminar la novedad, el archivo anterior se borra.
- Almacenamiento: en local, `data/noticias.json` + `public/uploads/images/`; en Vercel, Vercel Blob (requiere `BLOB_READ_WRITE_TOKEN`; sin él el panel avisa que no puede guardar).
- Si querés conservar en el repo las notas de prensa cargadas en local, hacé commit de `data/noticias.json` **y** de `public/uploads/`.

### Newsletter, podcast y tips

Publicá o corregí newsletter, podcast y tips en `/admin`. Cada contenido acepta una imagen propia (mismas reglas que Prensa): reemplaza a la portada de LinkedIn o a la miniatura de YouTube. Editar un contenido conserva su imagen y badge. Al reemplazar o eliminar solo se borran imágenes subidas desde el admin, nunca las covers del repo (`public/images/newsletter/`) ni las de fuentes externas.

1. Copiá `.env.example` a `.env.local` y definí `ADMIN_PASSWORD`.
2. En local: `npm run dev` → los cambios se guardan en `data/novedades.json`.
3. En Vercel: además de `ADMIN_PASSWORD`, creá un Blob store y seteá `BLOB_READ_WRITE_TOKEN` para que los cambios perduren en producción.

Las novedades publicadas aparecen en el home (carruseles), `/en-clave-pyme`, `/off-the-record` y `/tips`.

## Actualización automática de contenido

| Fuente | Cómo se obtiene |
| --- | --- |
| Podcast (YouTube) | Feed Atom oficial de la playlist (`podcast.playlistId`) |
| Tips PyMEs (YouTube) | Feed Atom de la playlist (`tips.playlistId`). El feed solo trae los 15 más nuevos: los anteriores viven en el archivo `data/novedades.json` |
| Newsletter (LinkedIn) | Feed RSS de terceros (`linkedinrss.cns.me`), solo trae las ~5 últimas |

- Al visitar `/`, `/en-clave-pyme`, `/off-the-record` o `/tips` se hace un sync "best effort": máximo cada 10 min por instancia y **nunca rompe la página** si la fuente o el storage fallan.
- Cron diario en `vercel.json` → `/api/novedades/sync` (requiere `CRON_SECRET`; Vercel envía el Bearer solo).
- El sync **solo agrega lo nuevo y completa datos faltantes**: nunca pisa fecha, título, link ni imagen ya guardados (`src/lib/novedades-merge.ts`, con tests).
- En Vercel hace falta `BLOB_READ_WRITE_TOKEN`; sin él el filesystem es de solo lectura y los cambios no persisten.
- Si el Blob ya existe, **tiene prioridad** sobre `data/novedades.json` del repo.

### Cargar el archivo histórico de la newsletter (manual)

LinkedIn no expone el archivo completo sin login, así que es una tarea local puntual:

```bash
node scripts/scrape-linkedin-newsletter.mjs   # abre Chrome; logueate; scrollea y guarda
node scripts/download-newsletter-covers.mjs   # baja las covers a public/images/newsletter/
```

LinkedIn devuelve 403 a las covers desde servidores, por eso se guardan en local.
La sesión queda en `scripts/.li-profile/` (ignorada por git).

## TODO

- [ ] Confirmar dominio definitivo en `src/lib/content.ts` (`siteConfig.url`)
- [ ] Conectar formulario de contacto a un servicio de envío
- [ ] Agregar testimonios reales cuando estén disponibles
- [ ] Agregar precios / paquetes solo si se definen explícitamente
