export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-starbucks-green mb-4">Préstamos de Socios</h1>
      <p className="text-lg text-starbucks-dark mb-8 text-center">
        Sistema de gestión de préstamos responsivo, inspirado en Starbucks.
      </p>
      <button className="bg-starbucks-green hover:bg-starbucks-dark text-white font-bold py-2 px-6 rounded-full shadow-lg transition">
        ¡Comenzar!
      </button>
    </div>
  );
}
