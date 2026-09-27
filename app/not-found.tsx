import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <h1>No encontre esa pagina</h1>
      <p>La ruta puede haber cambiado o estar fuera del catalogo local.</p>
      <Link className="primary-button" href="/">
        Volver al catalogo
      </Link>
    </main>
  );
}
