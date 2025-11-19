
import { useState, useEffect } from 'react';

const PrestamosModule = () => {
  // Estado para la lista de socios, el socio seleccionado y el término de búsqueda
  const [socios, setSocios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Estado para el formulario de préstamo
  const [prestamo, setPrestamo] = useState({
    fecha: new Date().toISOString().split('T')[0],
    monto: '',
    interes: '',
    cuotas: '',
    // Campos adicionales que podrías querer en el futuro
  });

  // Estado para la carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Cargar socios desde la API cuando el componente se monta
  useEffect(() => {
    const fetchSocios = async () => {
      try {
        const res = await fetch('/api/socios');
        if (!res.ok) throw new Error('No se pudo obtener la lista de socios');
        const data = await res.json();
        setSocios(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSocios();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedSocio(null); // Deseleccionar socio al cambiar la búsqueda
    setIsSearching(true);
  };

  const selectSocio = (socio) => {
    setSelectedSocio(socio);
    setSearchTerm(socio.nombreCompleto);
    setIsSearching(false); // Ocultar resultados al seleccionar
  };

  // Filtrar socios basándose en el término de búsqueda
  const filteredSocios = searchTerm
    ? socios.filter(s =>
        s.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cedula.includes(searchTerm)
      )
    : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrestamo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSocio) {
      setError('Por favor, busque y seleccione un socio válido.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess('');

    const prestamoData = {
      socioId: selectedSocio.id,
      socioNombre: selectedSocio.nombreCompleto, // Guardar el nombre para referencia rápida
      ...prestamo,
      monto: parseFloat(prestamo.monto),
      interes: parseFloat(prestamo.interes),
      cuotas: parseInt(prestamo.cuotas, 10),
      estado: 'activo' // Estado inicial del préstamo
    };

    try {
      const res = await fetch('/api/prestamos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prestamoData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'No se pudo registrar el préstamo');
      }

      setSuccess('¡Préstamo registrado con éxito!');
      // Resetear formulario
      setSelectedSocio(null);
      setSearchTerm('');
      setPrestamo({
        fecha: new Date().toISOString().split('T')[0],
        monto: '',
        interes: '',
        cuotas: '',
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gestión de Préstamos</h2>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Error: {error}</p>}
      {success && <p className="text-green-500 bg-green-100 p-3 rounded mb-4">{success}</p>}

      <div className="p-4 border rounded shadow-sm bg-white">
        <h3 className="text-xl font-semibold mb-4">Nuevo Préstamo</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Búsqueda de Socio */}
          <div className="relative">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="socio-search">
              Buscar Socio por Nombre o Cédula
            </label>
            <input
              id="socio-search"
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Empezar a escribir para buscar..."
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              autoComplete="off"
            />
            {isSearching && filteredSocios.length > 0 && (
              <ul className="absolute border bg-white w-full mt-1 rounded-md shadow-lg z-10">
                {filteredSocios.map(s => (
                  <li key={s.id} onClick={() => selectSocio(s)} className="p-3 hover:bg-gray-200 cursor-pointer">
                    {s.nombreCompleto} ({s.cedula})
                  </li>
                ))}
              </ul>
            )}
             {selectedSocio && <div className="p-2 mt-2 bg-green-100 text-green-700 rounded-md">Socio seleccionado: <strong>{selectedSocio.nombreCompleto}</strong></div>}
          </div>

          {/* Campos del Préstamo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div>
                <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">Fecha</label>
                <input type="date" name="fecha" id="fecha" value={prestamo.fecha} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
            </div>
            <div>
                <label htmlFor="monto" className="block text-sm font-medium text-gray-700">Monto</label>
                <input type="number" name="monto" id="monto" value={prestamo.monto} onChange={handleInputChange} placeholder='Ej: 1000' className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
            </div>
            <div>
                <label htmlFor="interes" className="block text-sm font-medium text-gray-700">Interés (%)</label>
                <input type="number" name="interes" id="interes" value={prestamo.interes} onChange={handleInputChange} placeholder='Ej: 5' className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
            </div>
            <div>
                <label htmlFor="cuotas" className="block text-sm font-medium text-gray-700">Cuotas</label>
                <input type="number" name="cuotas" id="cuotas" value={prestamo.cuotas} onChange={handleInputChange} placeholder='Ej: 12' className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300">
            {loading ? 'Registrando...' : 'Registrar Préstamo'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrestamosModule;
