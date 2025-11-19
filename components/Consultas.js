
import { useState, useMemo } from 'react';

const ConsultasModule = () => {
  // Datos de ejemplo iniciales
  const [socios] = useState([
    { id: 1, nombreCompleto: 'Juan Pérez' },
    { id: 2, nombreCompleto: 'Ana Gómez' },
  ]);

  const [pagos] = useState([
    { id: 1, socioId: 1, monto: 50, fechaPago: '2024-07-20', numeroCuota: 1, totalCuotas: 12, capital: 40, interes: 10 },
    { id: 2, socioId: 2, monto: 50, fechaPago: '2024-07-22', numeroCuota: 1, totalCuotas: 12, capital: 40, interes: 10 },
    { id: 3, socioId: 1, monto: 100, fechaPago: '2024-07-25', esLibreAbono: true, capital: 90, interes: 10 },
    { id: 4, socioId: 1, monto: 50, fechaPago: '2024-08-20', numeroCuota: 2, totalCuotas: 12, capital: 40, interes: 10 },
  ]);

  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [anioSeleccionado, setAnioSeleccionado] = useState('');
  const [pagosFiltrados, setPagosFiltrados] = useState([]);

  const handleBuscarPagos = () => {
    if (!mesSeleccionado || !anioSeleccionado) {
      alert('Por favor, seleccione un mes y un año.');
      return;
    }
    const filtrados = pagos.filter(pago => {
      const fecha = new Date(pago.fechaPago);
      return fecha.getMonth() + 1 === parseInt(mesSeleccionado) && fecha.getFullYear() === parseInt(anioSeleccionado);
    });
    setPagosFiltrados(filtrados);
  };

  const getNombreSocio = (socioId) => {
    const socio = socios.find(s => s.id === socioId);
    return socio ? socio.nombreCompleto : 'Desconocido';
  };

  const totals = useMemo(() => {
    return pagosFiltrados.reduce((acc, pago) => {
      acc.monto += pago.monto;
      acc.capital += pago.capital;
      acc.interes += pago.interes;
      return acc;
    }, { monto: 0, capital: 0, interes: 0 });
  }, [pagosFiltrados]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Consulta de Pagos</h1>

        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Filtrar Pagos por Mes y Año</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Mes</label>
                <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)} className="w-full p-3 bg-gray-100 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Seleccione un Mes</option>
                    {[...Array(12).keys()].map(i => <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('es', { month: 'long' })}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Año</label>
                <input type="number" value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(e.target.value)} placeholder="Año" className="w-full p-3 bg-gray-100 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <button onClick={handleBuscarPagos} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
              Consultar
            </button>
          </div>
        </div>

        {pagosFiltrados.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">Socio</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">Tipo de Pago</th>
                    <th className="py-4 px-6 text-right text-sm font-semibold text-gray-600 uppercase">Total Pagado</th>
                    <th className="py-4 px-6 text-right text-sm font-semibold text-gray-600 uppercase">Capital</th>
                    <th className="py-4 px-6 text-right text-sm font-semibold text-gray-600 uppercase">Interés</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pagosFiltrados.map((pago) => (
                    <tr key={pago.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-6 whitespace-nowrap">{getNombreSocio(pago.socioId)}</td>
                      <td className="py-4 px-6 whitespace-nowrap">{pago.esLibreAbono ? 'Libre Abono' : `Cuota ${pago.numeroCuota}/${pago.totalCuotas}`}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-right font-medium">${pago.monto.toFixed(2)}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-right text-gray-600">${pago.capital.toFixed(2)}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-right text-gray-600">${pago.interes.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td colSpan="2" className="py-4 px-6 text-right font-bold text-gray-700">TOTALES:</td>
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

export default ConsultasModule;
