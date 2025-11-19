
import { useState, useEffect } from 'react';

const PagosModule = () => {
  // Estados para la búsqueda y selección de préstamos
  const [prestamos, setPrestamos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Estados para el formulario de pago
  const [pago, setPago] = useState({ monto: '', fecha: new Date().toISOString().split('T')[0] });

  // Estados para la carga, errores y éxito
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Cargar todos los préstamos activos
  const fetchPrestamos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/prestamos');
      if (!res.ok) throw new Error('No se pudo obtener la lista de préstamos');
      const data = await res.json();
      // Filtrar solo los préstamos activos
      const activos = data.filter(p => p.estado === 'activo');
      setPrestamos(activos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestamos();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedPrestamo(null);
    setIsSearching(true);
    setError(null);
    setSuccess('');
  };

  const selectPrestamo = (prestamo) => {
    setSelectedPrestamo(prestamo);
    setSearchTerm(`${prestamo.socioNombre} - Préstamo de $${prestamo.monto}`);
    setIsSearching(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPago(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitPago = async (e) => {
    e.preventDefault();
    if (!selectedPrestamo || !pago.monto) {
      setError('Seleccione un préstamo y ingrese un monto a pagar.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess('');

    try {
      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prestamoId: selectedPrestamo.id, ...pago }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'No se pudo registrar el pago');
      }

      const { nuevoSaldo } = await res.json();

      setSuccess(`¡Pago registrado con éxito! Nuevo saldo pendiente: $${nuevoSaldo.toFixed(2)}`);
      
      // Actualizar el estado del préstamo en la UI
      setSelectedPrestamo(prev => ({...prev, saldoPendiente: nuevoSaldo, estado: nuevoSaldo <= 0 ? 'pagado' : 'activo'}));
      setPago({ monto: '', fecha: new Date().toISOString().split('T')[0] });

      // Si el préstamo está pagado, refrescar la lista para que desaparezca de "activos"
      if (nuevoSaldo <= 0) {
        setSearchTerm('');
        setSelectedPrestamo(null);
        fetchPrestamos();
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrestamos = searchTerm
    ? prestamos.filter(p => 
        p.socioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.socioId && p.socioId.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Registro de Pagos a Préstamos</h2>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Error: {error}</p>}
      {success && <p className="text-green-500 bg-green-100 p-3 rounded mb-4">{success}</p>}

      <div className="p-4 border rounded shadow-sm bg-white">
        {/* Paso 1: Buscar y seleccionar el préstamo */}
        <div className="relative mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="prestamo-search">
            1. Buscar Préstamo Activo (por nombre de socio)
          </label>
          <input
            id="prestamo-search"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Empezar a escribir para buscar..."
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            autoComplete="off"
            disabled={loading}
          />
          {isSearching && filteredPrestamos.length > 0 && (
            <ul className="absolute border bg-white w-full mt-1 rounded-md shadow-lg z-10">
              {filteredPrestamos.map(p => (
                <li key={p.id} onClick={() => selectPrestamo(p)} className="p-3 hover:bg-gray-200 cursor-pointer">
                  {p.socioNombre} (Préstamo: ${p.monto}, Saldo: ${p.saldoPendiente?.toFixed(2) ?? p.monto.toFixed(2)})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Paso 2: Registrar el pago si hay un préstamo seleccionado */}
        {selectedPrestamo && (
          <div>
             <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-bold text-blue-800">Detalles del Préstamo</h4>
                <p><strong>Socio:</strong> {selectedPrestamo.socioNombre}</p>
                <p><strong>Monto Original:</strong> ${selectedPrestamo.monto.toFixed(2)}</p>
                <p className="text-lg"><strong>Saldo Pendiente:</strong> <span className="font-mono text-red-600">${(selectedPrestamo.saldoPendiente ?? selectedPrestamo.monto).toFixed(2)}</span></p>
            </div>

            <form onSubmit={handleSubmitPago} className="space-y-4">
                <h3 className="text-xl font-semibold mb-2">2. Registrar Nuevo Pago</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="monto" className="block text-sm font-medium text-gray-700">Monto a Pagar</label>
                        <input type="number" name="monto" id="monto" value={pago.monto} onChange={handleInputChange} placeholder="0.00" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">Fecha del Pago</label>
                        <input type="date" name="fecha" id="fecha" value={pago.fecha} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-green-300">
                    {loading ? 'Registrando Pago...' : 'Confirmar Pago'}
                </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagosModule;
