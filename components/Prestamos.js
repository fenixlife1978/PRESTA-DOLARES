
import { useState } from 'react';

const PrestamosModule = () => {
  // Datos de ejemplo iniciales
  const [socios] = useState([
    { id: 1, nombreCompleto: 'Juan Pérez', cedula: '12345678' },
    { id: 2, nombreCompleto: 'Ana Gómez', cedula: '87654321' },
    { id: 3, nombreCompleto: 'Carlos Sánchez', cedula: '112233445' },
  ]);
  const [prestamos, setPrestamos] = useState([]);

  // Estado para el formulario
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [monto, setMonto] = useState('');
  const [interes, setInteres] = useState('');
  const [cuotas, setCuotas] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedSocio(null); // Deseleccionar al buscar de nuevo
    setIsSearching(true);
  };

  const selectSocio = (socio) => {
    setSelectedSocio(socio);
    setSearchTerm(socio.nombreCompleto);
    setIsSearching(false);
  };

  const filteredSocios = searchTerm
    ? socios.filter(s =>
        s.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cedula.includes(searchTerm)
      )
    : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSocio) {
      alert('Por favor, busque y seleccione un socio válido.');
      return;
    }

    const newPrestamo = {
      id: prestamos.length + 1,
      socioId: selectedSocio.id,
      socioNombre: selectedSocio.nombreCompleto,
      fecha: new Date().toISOString().split('T')[0],
      monto: parseFloat(monto),
      interes: parseFloat(interes),
      cuotas: parseInt(cuotas, 10),
      estado: 'activo'
    };

    setPrestamos([...prestamos, newPrestamo]);
    alert('¡Préstamo registrado con éxito!');

    // Limpiar formulario
    setSearchTerm('');
    setSelectedSocio(null);
    setMonto('');
    setInteres('');
    setCuotas('');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Gestión de Préstamos</h1>
        
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nuevo Préstamo</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Búsqueda de Socio */}
                <div className="relative">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Buscar Socio</label>
                    <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Buscar por nombre o cédula..."
                    className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {isSearching && filteredSocios.length > 0 && (
                    <ul className="absolute border bg-white w-full mt-1 rounded-lg shadow-lg z-10">
                        {filteredSocios.map(s => (
                        <li key={s.id} onClick={() => selectSocio(s)} className="p-3 hover:bg-green-100 cursor-pointer">
                            {s.nombreCompleto} ({s.cedula})
                        </li>
                        ))}
                    </ul>
                    )}
                     {selectedSocio && <div className="p-2 mt-2 bg-green-100 text-green-700 rounded-lg">Socio seleccionado: <strong>{selectedSocio.nombreCompleto}</strong></div>}
                </div>

                {/* Campos del Préstamo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="monto" className="block text-sm font-semibold text-gray-600 mb-2">Monto del Préstamo</label>
                        <input type="number" id="monto" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="$1000" className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200" required />
                    </div>
                    <div>
                        <label htmlFor="interes" className="block text-sm font-semibold text-gray-600 mb-2">Tasa de Interés (%)</label>
                        <input type="number" id="interes" value={interes} onChange={(e) => setInteres(e.target.value)} placeholder="5%" className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200" required />
                    </div>
                    <div>
                        <label htmlFor="cuotas" className="block text-sm font-semibold text-gray-600 mb-2">Plazo (en cuotas)</label>
                        <input type="number" id="cuotas" value={cuotas} onChange={(e) => setCuotas(e.target.value)} placeholder="12" className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200" required />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
                        Registrar Préstamo
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default PrestamosModule;
