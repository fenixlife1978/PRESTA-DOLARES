
import { useState, useEffect } from 'react';

const ConsultasModule = () => {
  const [view, setView] = useState('prestamos'); // 'prestamos', 'pagos', 'socios'
  const [data, setData] = useState({ prestamos: [], pagos: [], socios: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prestamosRes, pagosRes, sociosRes] = await Promise.all([
          fetch('/api/prestamos'),
          fetch('/api/pagos'),
          fetch('/api/socios')
        ]);

        if (!prestamosRes.ok) throw new Error('Error al cargar préstamos');
        if (!pagosRes.ok) throw new Error('Error al cargar pagos');
        if (!sociosRes.ok) throw new Error('Error al cargar socios');

        const prestamosData = await prestamosRes.json();
        const pagosData = await pagosRes.json();
        const sociosData = await sociosRes.json();

        setData({ prestamos: prestamosData, pagos: pagosData, socios: sociosData });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <p className="text-center p-4">Cargando datos...</p>;
    }
    if (error) {
      return <p className="text-red-500 bg-red-100 p-3 rounded">Error: {error}</p>;
    }

    switch (view) {
      case 'prestamos':
        return <TablePrestamos prestamos={data.prestamos} />;
      case 'pagos':
        return <TablePagos pagos={data.pagos} prestamos={data.prestamos} />;
      case 'socios':
        return <TableSocios socios={data.socios} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Consultas Generales</h2>
      
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setView('prestamos')} className={`${view === 'prestamos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Historial de Préstamos</button>
          <button onClick={() => setView('pagos')} className={`${view === 'pagos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Historial de Pagos</button>
          <button onClick={() => setView('socios')} className={`${view === 'socios' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Lista General de Socios</button>
        </nav>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        {renderContent()}
      </div>
    </div>
  );
};

// Componentes de tabla para cada vista
const TablePrestamos = ({ prestamos }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Socio</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Original</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Pendiente</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th></tr></thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {prestamos.length > 0 ? prestamos.map(p => (
                <tr key={p.id} className="hover:bg-gray-50"> 
                    <td className="px-6 py-4 whitespace-nowrap">{p.socioNombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${p.monto.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${(p.saldoPendiente ?? p.monto).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.estado === 'pagado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.estado}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(p.fecha).toLocaleDateString()}</td>
                </tr>
            )) : <tr><td colSpan="5" className="text-center py-4">No hay préstamos registrados.</td></tr>}
        </tbody>
    </table>
  </div>
);

const TablePagos = ({ pagos, prestamos }) => {
    const getPrestamoInfo = (prestamoId) => {
        const prestamo = prestamos.find(p => p.id === prestamoId);
        return prestamo ? `${prestamo.socioNombre} ($${prestamo.monto})` : 'Préstamo no encontrado';
    }
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Préstamo (Socio y Monto)</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Pagado</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Pago</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {pagos.length > 0 ? pagos.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">{getPrestamoInfo(p.prestamoId)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">${p.monto.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(p.fecha).toLocaleDateString()}</td>
                        </tr>
                    )) : <tr><td colSpan="3" className="text-center py-4">No hay pagos registrados.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

const TableSocios = ({ socios }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {socios.length > 0 ? socios.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{s.nombreCompleto}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{s.cedula}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{s.telefono}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{s.direccion}</td>
                    </tr>
                )) : <tr><td colSpan="4" className="text-center py-4">No hay socios registrados.</td></tr>}
            </tbody>
        </table>
    </div>
);

export default ConsultasModule;
