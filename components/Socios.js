
import { useState, useEffect } from 'react';

// El formulario emergente (modal) con el estilo de Starbucks
const SocioForm = ({ socio, onSave, onCancel, errorMessage }) => {
  const [formData, setFormData] = useState(socio || { nombreCompleto: '', cedula: '', telefono: '', direccion: '' });

  useEffect(() => {
    if (socio) {
      setFormData(socio);
    } else {
      setFormData({ nombreCompleto: '', cedula: '', telefono: '', direccion: '' });
    }
  }, [socio]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{socio ? 'Modificar Socio' : 'Agregar Nuevo Socio'}</h3>
        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} placeholder="Nombre y Apellido" className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500" required />
          <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} placeholder="Cédula" className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500" required />
          <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono (opcional)" className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección (opcional)" className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <div className="flex justify-end pt-4 space-x-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 rounded-full font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors duration-300">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 rounded-full font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors duration-300">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// El componente principal con el estilo de Starbucks
const SociosModule = () => {
  const [socios, setSocios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSocio, setEditingSocio] = useState(null);
  const [error, setError] = useState(null);

  const fetchSocios = async () => {
    try {
        const res = await fetch('/api/socios');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setSocios(data);
    } catch (err) {
        setError('No se pudieron cargar los socios.');
    }
  };

  useEffect(() => {
    fetchSocios();
  }, []);

  const handleSaveSocio = async (socioData) => {
    setError(null); // Limpiar errores previos
    const url = editingSocio ? `/api/socios/${editingSocio.id}` : '/api/socios';
    const method = editingSocio ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(socioData),
        });

        if (response.status === 409) {
            const data = await response.json();
            setError(data.error);
            return; // No cerrar el formulario si hay un error de duplicado
        }

        if (!response.ok) {
            throw new Error('Error al guardar el socio');
        }

        setShowForm(false);
        setEditingSocio(null);
        fetchSocios(); // Recargar la lista de socios

    } catch (err) {
        setError(err.message);
    }
  };

  const handleDeleteSocio = (socioId) => {
    // La funcionalidad de eliminar se implementará en un paso posterior
    if (window.confirm('Funcionalidad de eliminar pendiente. ¿Desea continuar?')) {
        console.log("Eliminar socio", socioId);
    }
  };

  const handleCancel = () => {
      setShowForm(false);
      setEditingSocio(null);
      setError(null); // Limpiar cualquier mensaje de error al cancelar
  }

  return (
    <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Gestión de Socios</h1>
                <button onClick={() => { setEditingSocio(null); setShowForm(true); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
                    + Agregar Socio
                </button>
            </div>

            {showForm && <SocioForm socio={editingSocio} onSave={handleSaveSocio} onCancel={handleCancel} errorMessage={error} />}

            {error && !showForm && <p className="text-red-500 text-center mb-4">{error}</p>}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Nombre y Apellido</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Cédula</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Teléfono</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Dirección</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {socios.map((s) => (
                        <tr key={s.id} className="hover:bg-green-50 transition-colors duration-200">
                            <td className="py-4 px-6 whitespace-nowrap">{s.nombreCompleto}</td>
                            <td className="py-4 px-6 whitespace-nowrap">{s.cedula}</td>
                            <td className="py-4 px-6 whitespace-nowrap">{s.telefono}</td>
                            <td className="py-4 px-6 whitespace-nowrap">{s.direccion}</td>
                            <td className="py-4 px-6 whitespace-nowrap space-x-2">
                                <button onClick={() => { setEditingSocio(s); setShowForm(true); }} className="py-1 px-3 rounded-full text-xs font-semibold text-yellow-800 bg-yellow-200 hover:bg-yellow-300">
                                Modificar
                                </button>
                                <button onClick={() => handleDeleteSocio(s.id)} className="py-1 px-3 rounded-full text-xs font-semibold text-red-800 bg-red-200 hover:bg-red-300">
                                Eliminar
                                </button>
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

export default SociosModule;
