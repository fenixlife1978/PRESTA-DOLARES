
import { useState, useMemo } from 'react';

const PagosModule = () => {
  const [socios] = useState([
    { id: 1, nombreCompleto: 'Juan Pérez', cedula: '12345678' },
    { id: 2, nombreCompleto: 'Ana Gómez', cedula: '87654321' },
  ]);

  const [cuotas] = useState([
    { id: 1, socioId: 1, monto: 50, fechaVencimiento: '2024-07-15', numeroCuota: 1, totalCuotas: 12, capital: 40, interes: 10 },
    { id: 2, socioId: 2, monto: 50, fechaVencimiento: '2024-07-15', numeroCuota: 1, totalCuotas: 12, capital: 40, interes: 10 },
    { id: 3, socioId: 1, monto: 50, fechaVencimiento: '2024-08-15', numeroCuota: 2, totalCuotas: 12, capital: 40, interes: 10 },
  ]);

  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [anioSeleccionado, setAnioSeleccionado] = useState('');
  const [cuotasPorCobrar, setCuotasPorCobrar] = useState([]);
  const [selectedCuotas, setSelectedCuotas] = useState([]);

  const handleBuscarCuotas = () => {
    if (!mesSeleccionado || !anioSeleccionado) {
      alert('Por favor, seleccione un mes y un año.');
      return;
    }

    const cuotasFiltradas = cuotas.filter(cuota => {
      const fecha = new Date(cuota.fechaVencimiento);
      return (
        fecha.getMonth() + 1 === parseInt(mesSeleccionado) &&
        fecha.getFullYear() === parseInt(anioSeleccionado)
      );
    });

    setCuotasPorCobrar(cuotasFiltradas);
    setSelectedCuotas([]); // Reset selection
  };

  const getNombreSocio = (socioId) => {
    const socio = socios.find(s => s.id === socioId);
    return socio ? socio.nombreCompleto : 'Desconocido';
  };

  const handleSelectCuota = (cuotaId) => {
    setSelectedCuotas(prev =>
      prev.includes(cuotaId) ? prev.filter(id => id !== cuotaId) : [...prev, cuotaId]
    );
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
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gestión de Pagos</h2>

      <div className="mb-4 p-4 border rounded shadow-sm">
        <h3 className="text-xl font-semibold mb-2">Cuotas por Cobrar</h3>
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
            onClick={handleBuscarCuotas}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Buscar
          </button>
        </div>

        {cuotasPorCobrar.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border-b">
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedCuotas.length === cuotasPorCobrar.length && cuotasPorCobrar.length > 0} />
                  </th>
                  <th className="py-2 px-4 border-b">Socio</th>
                  <th className="py-2 px-4 border-b">N° Cuota</th>
                  <th className="py-2 px-4 border-b">Fecha Vencimiento</th>
                  <th className="py-2 px-4 border-b">Total Pagado</th>
                  <th className="py-2 px-4 border-b">Capital</th>
                  <th className="py-2 px-4 border-b">Interés</th>
                </tr>
              </thead>
              <tbody>
                {cuotasPorCobrar.map((cuota) => (
                  <tr key={cuota.id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">
                      <input type="checkbox" checked={selectedCuotas.includes(cuota.id)} onChange={() => handleSelectCuota(cuota.id)} />
                    </td>
                    <td className="py-2 px-4 border-b">{getNombreSocio(cuota.socioId)}</td>
                    <td className="py-2 px-4 border-b">{`${cuota.numeroCuota}/${cuota.totalCuotas}`}</td>
                    <td className="py-2 px-4 border-b">{cuota.fechaVencimiento}</td>
                    <td className="py-2 px-4 border-b">${cuota.monto.toFixed(2)}</td>
                    <td className="py-2 px-4 border-b">${cuota.capital.toFixed(2)}</td>
                    <td className="py-2 px-4 border-b">${cuota.interes.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-300">
                <tr>
                  <td colSpan="4" className="py-2 px-4 border-b text-right font-bold text-lg">Totales:</td>
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

export default PagosModule;
