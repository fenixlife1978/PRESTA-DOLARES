
import { useState, useMemo } from 'react';

const PagosModule = () => {
  // Datos de ejemplo iniciales
  const [socios] = useState([
    { id: 1, nombreCompleto: 'Juan Pérez', cedula: '12345678' },
    { id: 2, nombreCompleto: 'Ana Gómez', cedula: '87654321' },
  ]);

  const [cuotas] = useState([
    { id: 1, socioId: 1, monto: 50, fechaVencimiento: '2024-07-15', numeroCuota: 1, totalCuotas: 12, capital: 40, interes: 10 },
    { id: 2, socioId: 2, monto: 50, fechaVencimiento: '2024-07-15', numeroCuota: 1, totalCuotas: 12, capital: 40, interes: 10 },
    { id: 3, socioId: 1, monto: 50, fechaVencimiento: '2024-08-15', numeroCuota: 2, totalCuotas: 12, capital: 40, interes: 10 },
  ]);

  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [cuotasPorCobrar, setCuotasPorCobrar] = useState([]);
  const [selectedCuotas, setSelectedCuotas] = useState([]);

  const handleBuscarCuotas = () => {
    if (!mesSeleccionado || !anioSeleccionado) {
      alert('Por favor, seleccione un mes y un año.');
      return;
    }
    const cuotasFiltradas = cuotas.filter(cuota => {
      const fecha = new Date(cuota.fechaVencimiento);
      return fecha.getMonth() + 1 === parseInt(mesSeleccionado) && fecha.getFullYear() === parseInt(anioSeleccionado);
    });
    setCuotasPorCobrar(cuotasFiltradas);
    setSelectedCuotas([]);
  };

  const getNombreSocio = (socioId) => {
    const socio = socios.find(s => s.id === socioId);
    return socio ? socio.nombreCompleto : 'Desconocido';
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCuotas(cuotasPorCobrar.map(c => c.id));
    } else {
      setSelectedCuotas([]);
    }
  };

  const totals = useMemo(() => {
    return cuotasPorCobrar.reduce((acc, cuota) => {
      acc.monto += cuota.monto;
      acc.capital += cuota.capital;
      acc.interes += cuota.interes;
      return acc;
    }, { monto: 0, capital: 0, interes: 0 });
  }, [cuotasPorCobrar]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Gestión de Pagos</h1>
        
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cuotas por Cobrar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Mes</label>
              <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)} className="w-full p-3 bg-gray-100 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500">
                {[...Array(12).keys()].map(i => <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('es', { month: 'long' })}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Año</label>
              <input type="number" value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(e.target.value)} placeholder="Año" className="w-full p-3 bg-gray-100 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <button onClick={handleBuscarCuotas} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
              Buscar Cuotas
            </button>
          </div>
        </div>

        {cuotasPorCobrar.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-left"><input type="checkbox" onChange={handleSelectAll} checked={selectedCuotas.length > 0 && selectedCuotas.length === cuotasPorCobrar.length} /></th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">Socio</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">N° Cuota</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">Vencimiento</th>
                    <th className="py-4 px-6 text-right text-sm font-semibold text-gray-600 uppercase">Total</th>
                    <th className="py-4 px-6 text-right text-sm font-semibold text-gray-600 uppercase">Capital</th>
                    <th className="py-4 px-6 text-right text-sm font-semibold text-gray-600 uppercase">Interés</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cuotasPorCobrar.map((cuota) => (
                    <tr key={cuota.id} className={`${selectedCuotas.includes(cuota.id) ? 'bg-green-100' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                      <td className="py-4 px-6"><input type="checkbox" checked={selectedCuotas.includes(cuota.id)} onChange={() => setSelectedCuotas(p => p.includes(cuota.id) ? p.filter(id => id !== cuota.id) : [...p, cuota.id])} /></td>
                      <td className="py-4 px-6 whitespace-nowrap">{getNombreSocio(cuota.socioId)}</td>
                      <td className="py-4 px-6 whitespace-nowrap">{cuota.numeroCuota}/{cuota.totalCuotas}</td>
                      <td className="py-4 px-6 whitespace-nowrap">{cuota.fechaVencimiento}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-right font-medium">${cuota.monto.toFixed(2)}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-right text-gray-600">${cuota.capital.toFixed(2)}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-right text-gray-600">${cuota.interes.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                    <tr>
                        <td colSpan="4" className="py-4 px-6 text-right font-bold text-gray-700">TOTAL A COBRAR:</td>
                        <td className="py-4 px-6 text-right font-bold text-xl text-green-700">${totals.monto.toFixed(2)}</td>
                        <td className="py-4 px-6 text-right font-bold text-gray-700">${totals.capital.toFixed(2)}</td>
                        <td className="py-4 px-6 text-right font-bold text-gray-700">${totals.interes.toFixed(2)}</td>
                    </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagosModule;
