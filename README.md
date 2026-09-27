# Frontend Soda/Cerati

App Next.js App Router para explorar el catalogo y renderizar paginas
indexables con metadata SEO.

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

El frontend consume exclusivamente el contrato publico del backend. No abre el
manifiesto ni los TXT directamente; el backend verifica la fuente antes de
entregar una tablatura publicada.

```bash
cp .env.example .env
SODA_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

## Scripts

- `npm run dev`: servidor local Next.js.
- `npm run build`: build de produccion con chequeo de tipos.
- `npm run start`: servir el build localmente.

## SEO y contenido privado

La home, las paginas de artista y las fichas publicadas son server-rendered. El
backend solo devuelve registros con `publication_status = public`; borradores,
hashes, paths y flags de calidad nunca forman parte de la respuesta que recibe
Next.js. Las fichas publicadas incluyen el contenido musical validado.
