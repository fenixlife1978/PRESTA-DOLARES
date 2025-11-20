import Link from 'next/link';

const Layout = ({ children }) => {
  return (
    <div className="bg-starbucks-light min-h-screen">
      <nav className="bg-starbucks-dark shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" legacyBehavior>
                <a className="text-white font-bold text-xl">FINANZAS</a>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" legacyBehavior><a className="text-gray-300 hover:bg-starbucks-green hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</a></Link>
                <Link href="/admin?tab=socios" legacyBehavior><a className="text-gray-300 hover:bg-starbucks-green hover:text-white px-3 py-2 rounded-md text-sm font-medium">Socios</a></Link>
                <Link href="/admin?tab=prestamos" legacyBehavior><a className="text-gray-300 hover:bg-starbucks-green hover:text-white px-3 py-2 rounded-md text-sm font-medium">Préstamos</a></Link>
                <Link href="/reportes" legacyBehavior><a className="text-gray-300 hover:bg-starbucks-green hover:text-white px-3 py-2 rounded-md text-sm font-medium">Reporte de Cuotas</a></Link>
                <Link href="/admin?tab=pagos" legacyBehavior><a className="text-gray-300 hover:bg-starbucks-green hover:text-white px-3 py-2 rounded-md text-sm font-medium">Pagos</a></Link>
                <Link href="/admin?tab=consultas" legacyBehavior><a className="text-gray-300 hover:bg-starbucks-green hover:text-white px-3 py-2 rounded-md text-sm font-medium">Consultas</a></Link>
                <Link href="/admin?tab=configuraciones" legacyBehavior><a className="text-gray-300 hover:bg-starbucks-green hover:text-white px-3 py-2 rounded-md text-sm font-medium">Configuraciones</a></Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;
