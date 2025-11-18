
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-4">Préstamos de Socios</h1>
      <p className="text-lg mb-8 text-center">
        Sistema de gestión de préstamos responsivo, inspirado en Starbucks.
      </p>
      <Link href="/admin" legacyBehavior>
        <a className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition">
          Ir al Dashboard de Administrador
        </a>
      </Link>
    </div>
  );
}
