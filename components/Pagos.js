
import { useState } from 'react';

const PagosModule = () => {
  const [socios, setSocios] = useState([
    { id: 1, nombreCompleto: 'Juan Pérez', cedula: '12345678' },
    { id: 2, nombreCompleto: 'Ana Gómez', cedula: '87654321' },
  ]);

  const [cuotas, setCuotas] = useState([
    { socioId: 1, monto: 50, fechaVencimiento: '2024-07-15' },
    { socioId: 2, monto: 50, fechaVencimiento: '2024-07-15' },
    { socioId: 1, monto: 50, fechaVencimiento: '2024-08-15' },
  ]);

  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [anioSeleccionado, setAnioSeleccionado] = useState('');
  const [cuotasPorCobrar, setCuotasPorCobrar] = useState([]);

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
  };

  const getNombreSocio = (socioId) => {
    const socio = socios.find(s => s.id === socioId);
    return socio ? socio.nombreCompleto : 'Desconocido';
  };

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
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
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
                  <th className="py-2 px-4 border-b">Socio</th>
                  <th className="py-2 px-4 border-b">Monto</th>
                  <th className="py-2 px-4 border-b">Fecha de Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {cuotasPorCobrar.map((cuota, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{getNombreSocio(cuota.socioId)}</td>
                    <td className="py-2 px-4 border-b">${cuota.monto}</td>
                    <td className="py-2 px-4 border-b">{cuota.fechaVencimiento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagosModule;
