
import { useState, useMemo } from 'react';

const ConsultasModule = () => {
  const [socios] = useState([
    { id: 1, nombreCompleto: 'Juan Pérez' },
    { id: 2, nombreCompleto: 'Ana Gómez' },
  ]);

  const [pagos] = useState([
    // Pagos de cuotas regulares
    { id: 1, socioId: 1, monto: 50, fechaPago: '2024-07-20', numeroCuota: 1, totalCuotas: 12, capital: 40, interes: 10, esLibreAbono: false },
    { id: 2, socioId: 2, monto: 50, fechaPago: '2024-07-22', numeroCuota: 1, totalCuotas: 12, capital: 40, interes: 10, esLibreAbono: false },
    // Pago de libre abono
    { id: 3, socioId: 1, monto: 100, fechaPago: '2024-07-25', capital: 90, interes: 10, esLibreAbono: true, fechaVencimiento: 'N/A' },
    // Pagos en otro mes
    { id: 4, socioId: 1, monto: 50, fechaPago: '2024-08-20', numeroCuota: 2, totalCuotas: 12, capital: 40, interes: 10, esLibreAbono: false },
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
      return (
        fecha.getMonth() + 1 === parseInt(mesSeleccionado) &&
        fecha.getFullYear() === parseInt(anioSeleccionado)
      );
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
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Consulta de Pagos</h2>

      <div className="mb-4 p-4 border rounded shadow-sm">
        <h3 className="text-xl font-semibold mb-2">Total de Cuotas Pagadas por Mes y Año</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">Seleccione un Mes</option>
            {[...Array(12).keys()].map(i => (
              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('es', { month: 'long' })}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Año"
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleBuscarPagos}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Consultar
          </button>
        </div>

        {pagosFiltrados.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border-b">Socio</th>
                  <th className="py-2 px-4 border-b">N° Cuota</th>
                  <th className="py-2 px-4 border-b">Fecha de Vencimiento</th>
                  <th className="py-2 px-4 border-b">Total Pagado</th>
                  <th className="py-2 px-4 border-b">Capital</th>
                  <th className="py-2 px-4 border-b">Interés</th>
                </tr>
              </thead>
              <tbody>
                {pagosFiltrados.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{getNombreSocio(pago.socioId)}</td>
                    <td className="py-2 px-4 border-b">{pago.esLibreAbono ? 'Libre Abono' : `${pago.numeroCuota}/${pago.totalCuotas}`}</td>
                    <td className="py-2 px-4 border-b">{pago.fechaVencimiento || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">${pago.monto.toFixed(2)}</td>
                    <td className="py-2 px-4 border-b">${pago.capital.toFixed(2)}</td>
                    <td className="py-2 px-4 border-b">${pago.interes.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-300">
                <tr>
                  <td colSpan="3" className="py-2 px-4 border-b text-right font-bold text-lg">Totales:</td>
                  <td className="py-2 px-4 border-b font-bold text-lg">${totals.monto.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b font-bold text-lg">${totals.capital.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b font-bold text-lg">${totals.interes.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultasModule;
