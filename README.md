# Universo Soda/Cerati

Aplicacion web con Next.js App Router para explorar el catalogo, leer las
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

En Vercel la variable es opcional: la aplicacion usa automaticamente
`VERCEL_PROJECT_PRODUCTION_URL` como dominio canonico.

El blog consume el feed publico de Blogger. `BLOGGER_BLOG_ID` permite cambiar
el blog conectado y por defecto usa `953522655128278607`. Las entradas se
revalidan cada hora y su HTML se sanea antes de renderizarse.

## Scripts

- `npm run dev`: servidor local Next.js.
- `npm run build`: build de produccion con chequeo de tipos.
- `npm run start`: servir el build localmente.

## SEO y contenido

La home se renderiza en servidor para soportar busqueda por URL. Las paginas de
artista y las 204 fichas se generan desde el snapshot versionado. Los TXT no se
guardan en `public/`: solo el contenido validado se incorpora al HTML de cada
ficha.

Los diagramas de acordes tambien funcionan sin servicios externos. Las
posiciones proceden del paquete MIT `@tombatossals/chords-db`, se resuelven en
el servidor durante el render y se dibujan como SVG en el navegador. Solo las
posiciones utilizadas por cada cancion se envian al cliente; no existe una
base de datos ni una API en tiempo de ejecucion.

## Curaduria del catalogo

Los TXT del snapshot no se editan (su hash se verifica). Las correcciones
editoriales viven en `lib/curation.ts`: titulos corregidos, versiones agrupadas
bajo una misma cancion (estudio, en vivo, unplugged, solos), notas del
transcriptor plegadas, entradas ocultas y redirecciones 308 de duplicados.

## Lector

El lector detecta acordes en cifrado americano y latino (DO, SOLm, RE/FA#),
permite transponer, cambiar el tamano de letra y activar desplazamiento
automatico. Los diagramas de las 12 transposiciones se resuelven en el servidor.

## ChordWeaver

Cada pagina enlaza a ChordWeaver con parametros UTM y los acordes de la cancion
(`?chords=Bm,G,D,A`). La URL se configura con `NEXT_PUBLIC_CHORDWEAVER_URL`.
