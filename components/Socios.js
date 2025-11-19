
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
    setError(null);
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
            return; 
        }

        if (!response.ok) {
            throw new Error('Error al guardar el socio');
        }

        setShowForm(false);
        setEditingSocio(null);
        fetchSocios();

    } catch (err) {
        setError(err.message);
    }
  };

  const handleDeleteSocio = async (socioId) => {
    setError(null);
    if (window.confirm('¿Está seguro de que desea eliminar este socio?')) {
      try {
        const response = await fetch(`/api/socios/${socioId}`, {
          method: 'DELETE',
        });

        if (response.status === 400) {
            const data = await response.json();
            setError(data.error);
            return;
        }

        if (!response.ok) {
          throw new Error('Error al eliminar el socio');
        }

        fetchSocios(); // Recargar la lista de socios
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCancel = () => {
      setShowForm(false);
      setEditingSocio(null);
      setError(null);
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

            {error && !showForm && 
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                        <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </span>
                </div>
            }

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
