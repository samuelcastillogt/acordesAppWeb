// Editorial layer over the captured snapshot: fixes titles, groups alternative
// transcriptions of the same song and hides entries that do not belong.

export type SongCuration = {
  /** Corrected display title. */
  title?: string;
  /** Slug of the song this transcription belongs to (defaults to its own slug). */
  work?: string;
  /** Short label shown when a song has several transcriptions. */
  version?: string;
  /** Sort position inside the work; the lowest one is the main version. */
  order?: number;
  /** Excluded from the catalog (wrong artist, broken capture). */
  hidden?: boolean;
};

type Key = `${string}/${string}`;

export const SONG_CURATION: Record<Key, SongCuration> = {
  // Soda Stereo
  "soda-stereo/afrodisiacos": { title: "Afrodisíacos" },
  "soda-stereo/algun-dia": { title: "Algún día" },
  "soda-stereo/angel-electrico": { title: "Ángel eléctrico" },
  "soda-stereo/cuando-pase-el-temblor": { version: "Acordes", order: 0 },
  "soda-stereo/cuando-pase-el-temblor-unplugged": {
    title: "Cuando pase el temblor",
    work: "cuando-pase-el-temblor",
    version: "Unplugged",
    order: 1,
  },
  "soda-stereo/de-musica-ligera": { title: "De música ligera", version: "Acordes", order: 0 },
  "soda-stereo/de-msica-ligera": {
    title: "De música ligera",
    work: "de-musica-ligera",
    version: "Tablatura completa",
    order: 1,
  },
  "soda-stereo/musica-ligera": {
    title: "De música ligera",
    work: "de-musica-ligera",
    version: "Riff en tablatura",
    order: 2,
  },
  "soda-stereo/de-musica-ligera-solo": {
    title: "De música ligera",
    work: "de-musica-ligera",
    version: "Solo",
    order: 3,
  },
  "soda-stereo/musica-ligera-solo": {
    title: "De música ligera",
    work: "de-musica-ligera",
    version: "Solo (alternativo)",
    order: 4,
  },
  "soda-stereo/dietetico": { title: "Dietético" },
  "soda-stereo/disco-eterno": { title: "Disco eterno", version: "Acordes", order: 0 },
  "soda-stereo/disco-eterno-unplugged": {
    title: "Disco eterno",
    work: "disco-eterno",
    version: "Unplugged",
    order: 1,
  },
  "soda-stereo/el-rito": { title: "El rito", version: "Estudio", order: 0 },
  "soda-stereo/el-rito-live": { title: "El rito", work: "el-rito", version: "En vivo", order: 1 },
  "soda-stereo/ella-uso-mi-cabeza-con-un-revolver": {
    title: "Ella usó mi cabeza como un revólver",
    work: "ella-uso-mi-cabeza-como-un-revolver",
    version: "Acordes (cifrado latino)",
    order: 0,
  },
  "soda-stereo/ella-uso-mi-cabeza-como-un-revolver": {
    title: "Ella usó mi cabeza como un revólver",
    version: "Unplugged",
    order: 1,
  },
  "soda-stereo/en-el-septimo-dia": { title: "En el séptimo día" },
  "soda-stereo/la-ciudad-de-la-furia": {
    title: "En la ciudad de la furia",
    work: "en-la-ciudad-de-la-furia",
    version: "Acordes",
    order: 0,
  },
  "soda-stereo/en-la-ciudad-de-la-furia": { version: "Cifrado latino", order: 1 },
  "soda-stereo/la-cuidad-de-la-furia": {
    title: "En la ciudad de la furia",
    work: "en-la-ciudad-de-la-furia",
    version: "Tablatura completa",
    order: 2,
  },
  "soda-stereo/la-ciudad-de-la-furia-unplugged": {
    title: "En la ciudad de la furia",
    work: "en-la-ciudad-de-la-furia",
    version: "Unplugged",
    order: 3,
  },
  "soda-stereo/entre-canibales": { title: "Entre caníbales", version: "Estudio", order: 0 },
  "soda-stereo/entre-canibales-unplugged": {
    title: "Entre caníbales",
    work: "entre-canibales",
    version: "Unplugged",
    order: 1,
  },
  "soda-stereo/imagenes-retro": { title: "Imágenes retro" },
  "soda-stereo/juego-de-seduccion": {
    title: "Juegos de seducción",
    work: "juegos-de-seduccion",
    version: "Acordes y riff",
    order: 0,
  },
  "soda-stereo/juegos-de-seduccion": {
    title: "Juegos de seducción",
    version: "Cifrado latino",
    order: 1,
  },
  "soda-stereo/la-cupula": {
    title: "Lo que sangra (La cúpula)",
    work: "lo-que-sangra",
    version: "Digitaciones",
    order: 2,
  },
  "soda-stereo/lo-que-sangra": { title: "Lo que sangra (La cúpula)", version: "Acordes", order: 0 },
  "soda-stereo/lo-que-sangra-la-cupula": {
    title: "Lo que sangra (La cúpula)",
    work: "lo-que-sangra",
    version: "Cifrado latino",
    order: 1,
  },
  "soda-stereo/luna-roja": { title: "Luna roja", version: "Estudio", order: 0 },
  "soda-stereo/luna-roja-live": { title: "Luna roja", work: "luna-roja", version: "En vivo", order: 1 },
  "soda-stereo/mi-novia-tiene-biceps": { title: "Mi novia tiene bíceps" },
  "soda-stereo/nuestra-fe": { title: "Nuestra fe" },
  "soda-stereo/observandonos": { title: "Observándonos" },
  "soda-stereo/persiana-americana": { title: "Persiana americana", version: "Acordes", order: 0 },
  "soda-stereo/persiana-americana-intro": {
    title: "Persiana americana",
    work: "persiana-americana",
    version: "Solo",
    order: 1,
  },
  "soda-stereo/pic-nic-en-el-4o-b": { title: "Pic-nic en el 4º B" },
  "soda-stereo/puente-lado-b": { hidden: true },
  "soda-stereo/sequencia-inicial": { title: "Sequencia inicial" },
  "soda-stereo/signos": { version: "Estudio", order: 0 },
  "soda-stereo/signos-live": { title: "Signos", work: "signos", version: "En vivo", order: 1 },
  "soda-stereo/sueles-dejarme": { title: "Sueles dejarme solo", version: "Acordes", order: 0 },
  "soda-stereo/sueles-dejarme-solo": {
    title: "Sueles dejarme solo",
    work: "sueles-dejarme",
    version: "Acordes con bajos",
    order: 1,
  },
  "soda-stereo/te-para-3": {
    title: "Té para tres",
    work: "te-para-tres",
    version: "Acordes y tablatura",
    order: 0,
  },
  "soda-stereo/te-para-tres": { title: "Té para tres", version: "Cifrado latino", order: 1 },
  "soda-stereo/te-para-tres-live": {
    title: "Té para tres",
    work: "te-para-tres",
    version: "En vivo",
    order: 2,
  },
  "soda-stereo/te-para-tres-solo": {
    title: "Té para tres",
    work: "te-para-tres",
    version: "Solo",
    order: 3,
  },
  "soda-stereo/tele-k": { version: "Me verás volver (2007)", order: 0 },
  "soda-stereo/tele-ka": { title: "Tele-K", work: "tele-k", version: "Versión alternativa", order: 1 },
  "soda-stereo/tratame-suavemente": { title: "Trátame suavemente" },
  "soda-stereo/un-millon-de-anos-luz": { title: "Un millón de años luz" },
  "soda-stereo/un-misil-en-mi-placard": {
    title: "Un misil en mi placard",
    version: "Estudio",
    order: 0,
  },
  "soda-stereo/un-misil-en-mi-placard-unplugged": {
    title: "Un misil en mi placard",
    work: "un-misil-en-mi-placard",
    version: "Unplugged",
    order: 1,
  },
  // Slipknot song mislabeled in the source catalog.
  "soda-stereo/wait-and-bleed": { hidden: true },

  // Gustavo Cerati
  "gustavo-cerati/adios": { title: "Adiós" },
  "gustavo-cerati/amo-dejarte-asi": { title: "Amo dejarte así" },
  "gustavo-cerati/av-alcorta": { hidden: true },
  "gustavo-cerati/beautiful": { version: "Acordes", order: 0 },
  "gustavo-cerati/beatiful": {
    title: "Beautiful",
    work: "beautiful",
    version: "Tablatura completa",
    order: 1,
  },
  "gustavo-cerati/cabeza-de-medusa": { title: "Cabeza de medusa", version: "Acordes", order: 0 },
  "gustavo-cerati/cabeza-de-mudusa": {
    title: "Cabeza de medusa",
    work: "cabeza-de-medusa",
    version: "Tablatura completa",
    order: 1,
  },
  "gustavo-cerati/engana": { version: "Acordes", order: 0 },
  "gustavo-cerati/engaca": {
    title: "Engaña",
    work: "engana",
    version: "Tablatura completa",
    order: 1,
  },
  "gustavo-cerati/la-excepcion": { title: "La excepción", version: "Acordes", order: 0 },
  "gustavo-cerati/la-exepcion": {
    title: "La excepción",
    work: "la-excepcion",
    version: "Versión alternativa",
    order: 1,
  },
  "gustavo-cerati/naci-para-esto": { title: "Nací para esto" },
  "gustavo-cerati/profugos": { title: "Prófugos" },
  "gustavo-cerati/raiz": { title: "Raíz" },
  "gustavo-cerati/tabu": { title: "Tabú" },
  "gustavo-cerati/traeme-la-noche": { title: "Tráeme la noche" },
};

/** Old URLs that now live elsewhere (identical duplicates). */
export const SONG_REDIRECTS: Array<{ source: string; destination: string }> = [
  { source: "/canciones/gustavo-cerati/av-alcorta", destination: "/canciones/gustavo-cerati/avenida-alcorta" },
  { source: "/canciones/soda-stereo/puente-lado-b", destination: "/canciones/soda-stereo/puente" },
];

export function getCuration(artistSlug: string, songSlug: string): SongCuration {
  return SONG_CURATION[`${artistSlug}/${songSlug}`] ?? {};
}
