# Universo Soda/Cerati

Aplicacion fullstack con Next.js App Router para explorar el catalogo, leer las
tablaturas desde archivos TXT y renderizar paginas indexables con metadata SEO.

## Ejecutar

```bash
cd frontend
npm install --cache .npm-cache
npm run dev
```

La app queda en:

```text
http://127.0.0.1:3000
```

## Configuracion

El catalogo vive en `data/snapshot/`. El codigo server-side de Next.js lee el
manifiesto y los TXT directamente, rechaza rutas inseguras y verifica el hash
SHA-256 de cada tablatura antes de renderizarla. No se necesita API externa ni
base de datos.

```bash
cp .env.example .env
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

## Scripts

- `npm run dev`: servidor local Next.js.
- `npm run build`: build de produccion con chequeo de tipos.
- `npm run start`: servir el build localmente.

## SEO y contenido

La home se renderiza en servidor para soportar busqueda por URL. Las paginas de
artista y las 204 fichas se generan desde el snapshot versionado. Los TXT no se
guardan en `public/`: solo el contenido validado se incorpora al HTML de cada
ficha.
