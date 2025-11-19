
import { useState, useEffect } from 'react';

const PrestamosModule = () => {
  const [socios, setSocios] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [error, setError] = useState(null);
  
  // Estado del formulario
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [monto, setMonto] = useState('');
  const [interes, setInteres] = useState('');
  const [cuotas, setCuotas] = useState('');

  // Carga inicial de datos
  const fetchData = async () => {
    try {
      const [sociosRes, prestamosRes] = await Promise.all([
        fetch('/api/socios'),
        fetch('/api/prestamos'),
      ]);
      if (!sociosRes.ok || !prestamosRes.ok) throw new Error('Error al cargar los datos iniciales.');
      const sociosData = await sociosRes.json();
      const prestamosData = await prestamosRes.json();
      setSocios(sociosData);
      setPrestamos(prestamosData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Manejo del formulario de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedSocio(null);
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

  // Guardar nuevo préstamo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!selectedSocio) {
      setError('Por favor, busque y seleccione un socio válido.');
      return;
    }

    try {
      const response = await fetch('/api/prestamos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            monto, 
            interes, 
            cuotas, 
            socioId: selectedSocio.id 
        }),
      });

      if (!response.ok) throw new Error('Error al registrar el préstamo.');
      
      await fetchData(); // Recargar datos
      alert('¡Préstamo registrado con éxito!');

      // Limpiar formulario
      setSearchTerm('');
      setSelectedSocio(null);
      setMonto('');
      setInteres('');
      setCuotas('');

    } catch (err) {
      setError(err.message);
    }
  };

  // Eliminar préstamo
  const handleDelete = async (prestamoId) => {
    setError(null);
    if (window.confirm('¿Está seguro de que desea eliminar este préstamo?')) {
        try {
            const res = await fetch(`/api/prestamos/${prestamoId}`, { method: 'DELETE' });
            if(res.status === 400){
                const data = await res.json();
                throw new Error(data.error);
            }
            if (!res.ok) throw new Error('Error al eliminar el préstamo.');
            await fetchData(); // Recargar
        } catch (err) {
            setError(err.message);
        }
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Gestión de Préstamos</h1>
        
        {/* Formulario para registrar */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nuevo Préstamo</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Buscar Socio</label>
                    <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Buscar por nombre o cédula..." className="w-full p-3 bg-gray-100 rounded-lg border"/>
                    {isSearching && filteredSocios.length > 0 && (
                    <ul className="absolute border bg-white w-full mt-1 rounded-lg shadow-lg z-10">
                        {filteredSocios.map(s => <li key={s.id} onClick={() => selectSocio(s)} className="p-3 hover:bg-green-100 cursor-pointer">{s.nombreCompleto} ({s.cedula})</li>)}
                    </ul>
                    )}
                    {selectedSocio && <div className="p-2 mt-2 bg-green-100 text-green-700 rounded-lg">Socio seleccionado: <strong>{selectedSocio.nombreCompleto}</strong></div>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="monto" className="block text-sm font-semibold text-gray-600 mb-2">Monto</label>
                        <input type="number" id="monto" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="$1000" className="w-full p-3 bg-gray-100 rounded-lg border" required />
                    </div>
                    <div>
                        <label htmlFor="interes" className="block text-sm font-semibold text-gray-600 mb-2">Interés (%)</label>
                        <input type="number" id="interes" value={interes} onChange={(e) => setInteres(e.target.value)} placeholder="5" className="w-full p-3 bg-gray-100 rounded-lg border" required />
                    </div>
                    <div>
                        <label htmlFor="cuotas" className="block text-sm font-semibold text-gray-600 mb-2">Cuotas</label>
                        <input type="number" id="cuotas" value={cuotas} onChange={(e) => setCuotas(e.target.value)} placeholder="12" className="w-full p-3 bg-gray-100 rounded-lg border" required />
                    </div>
                </div>
                <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all">Registrar Préstamo</button>
                </div>
            </form>
        </div>

        {/* Lista de Préstamos */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-800 p-6">Préstamos Activos</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">Socio</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">Fecha</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">Monto</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">Interés</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">Cuotas</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">Estado</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {prestamos.map((p) => (
                            <tr key={p.id} className="hover:bg-green-50">
                                <td className="py-4 px-6">{p.socio.nombreCompleto}</td>
                                <td className="py-4 px-6">{new Date(p.fecha).toLocaleDateString()}</td>
                                <td className="py-4 px-6">${p.monto.toLocaleString()}</td>
                                <td className="py-4 px-6">{p.interes}%</td>
                                <td className="py-4 px-6">{p.cuotas}</td>
                                <td className="py-4 px-6"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${p.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.estado}</span></td>
                                <td className="py-4 px-6">
                                    <button onClick={() => handleDelete(p.id)} className="py-1 px-3 rounded-full text-xs font-semibold text-red-800 bg-red-200 hover:bg-red-300">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PrestamosModule;
