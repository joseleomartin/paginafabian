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

## Panel admin (novedades)

Publicá novedades de newsletter y podcast en `/admin`.

1. Copiá `.env.example` a `.env.local` y definí `ADMIN_PASSWORD`.
2. En local: `npm run dev` → los cambios se guardan en `data/novedades.json`.
3. En Vercel: además de `ADMIN_PASSWORD`, creá un Blob store y seteá `BLOB_READ_WRITE_TOKEN` para que los cambios perduren en producción.

Las novedades publicadas aparecen en `/en-clave-pyme` y `/off-the-record`.

## TODO

- [ ] Confirmar dominio definitivo en `src/lib/content.ts` (`siteConfig.url`)
- [ ] Conectar formulario de contacto a un servicio de envío
- [ ] Agregar testimonios reales cuando estén disponibles
- [ ] Agregar precios / paquetes solo si se definen explícitamente
