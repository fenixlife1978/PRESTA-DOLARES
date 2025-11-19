
import { useState, useEffect } from 'react';

// Componente para el formulario de Socio (reutilizable para añadir/editar)
const SocioForm = ({ socio, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({ nombreCompleto: '', cedula: '', telefono: '', direccion: '' });

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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold mb-4">{socio ? 'Modificar Socio' : 'Agregar Nuevo Socio'}</h3>
          <div className="space-y-4">
            <input type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} placeholder="Nombre y Apellido" className="w-full p-2 border rounded" required />
            <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} placeholder="Cédula" className="w-full p-2 border rounded" required />
            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono (opcional)" className="w-full p-2 border rounded" />
            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección (opcional)" className="w-full p-2 border rounded" />
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal del módulo de Socios
const SociosModule = () => {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSocio, setEditingSocio] = useState(null);

  const fetchSocios = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/socios');
      if (!res.ok) throw new Error('Error al cargar los socios');
      const data = await res.json();
      setSocios(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocios();
  }, []);

  const handleSaveSocio = async (socioData) => {
    const url = editingSocio ? `/api/socios/${editingSocio.id}` : '/api/socios';
    const method = editingSocio ? 'PUT' : 'POST';

    try {
      setLoading(true);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socioData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'No se pudo guardar el socio');
      }
      
      setShowForm(false);
      setEditingSocio(null);
      await fetchSocios(); // Recargar la lista de socios
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSocio = async (socioId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este socio?')) {
      try {
        setLoading(true);
        const res = await fetch(`/api/socios/${socioId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('No se pudo eliminar el socio');
        await fetchSocios(); // Recargar la lista
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gestión de Socios</h2>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Error: {error}</p>}

      <button onClick={() => { setEditingSocio(null); setShowForm(true); }} className="mb-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Agregar Nuevo Socio
      </button>

      {showForm && (
        <SocioForm
          socio={editingSocio}
          onSave={handleSaveSocio}
          onCancel={() => { setShowForm(false); setEditingSocio(null); }}
          loading={loading}
        />
      )}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-left">Nombre y Apellido</th>
              <th className="py-3 px-4 text-left">Cédula</th>
              <th className="py-3 px-4 text-left">Teléfono</th>
              <th className="py-3 px-4 text-left">Dirección</th>
              <th className="py-3 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-4 text-center">Cargando...</td></tr>
            ) : (
              socios.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{s.nombreCompleto}</td>
                  <td className="py-2 px-4">{s.cedula}</td>
                  <td className="py-2 px-4">{s.telefono}</td>
                  <td className="py-2 px-4">{s.direccion}</td>
                  <td className="py-2 px-4">
                    <button onClick={() => { setEditingSocio(s); setShowForm(true); }} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded mr-2">
                      Modificar
                    </button>
                    <button onClick={() => handleDeleteSocio(s.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SociosModule;
