import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <h1>No encontré esa página</h1>
      <p>Puede que la canción haya cambiado de dirección. Búscala en el cancionero.</p>
      <Link className="primary-button" href="/">
        Ir a las canciones
      </Link>
    </main>
  );
}
