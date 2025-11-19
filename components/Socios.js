
import { useState, useEffect, useRef } from 'react';

// --- Componentes Internos ---

// Formulario para agregar o modificar un socio (simplificado)
const SocioForm = ({ socio, onSave, onCancel, errorMessage }) => {
  const [formData, setFormData] = useState(socio || { nombreCompleto: '', cedula: '' });

  useEffect(() => {
    setFormData(socio || { nombreCompleto: '', cedula: '' });
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
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{socio ? 'Modificar Socio' : 'Agregar Socio'}</h3>
        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} placeholder="Nombre y Apellido" className="w-full p-3 bg-gray-100 rounded-lg" required />
          <input type="text" name="cedula" value={formData.cedula || ''} onChange={handleChange} placeholder="Cédula (opcional)" className="w-full p-3 bg-gray-100 rounded-lg" />
          <div className="flex justify-end pt-4 space-x-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 rounded-full font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 rounded-full font-semibold text-white bg-green-600 hover:bg-green-700">
              Guardar
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
  const [showForm, setShowForm] = useState(false);
  const [editingSocio, setEditingSocio] = useState(null);
  const [error, setError] = useState(null);
  const [importMessage, setImportMessage] = useState(null);
  const fileInputRef = useRef(null);

  const fetchSocios = async () => {
    try {
      const res = await fetch('/api/socios');
      if (!res.ok) throw new Error('No se pudieron cargar los socios.');
      const data = await res.json();
      setSocios(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchSocios();
  }, []);

  const clearMessages = () => {
      setError(null);
      setImportMessage(null);
  }

  const handleSaveSocio = async (socioData) => {
    clearMessages();
    const url = editingSocio ? `/api/socios/${editingSocio.id}` : '/api/socios';
    const method = editingSocio ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...socioData, cedula: socioData.cedula || null }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al guardar el socio');
      }
      setShowForm(false);
      setEditingSocio(null);
      fetchSocios();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSocio = async (socioId) => {
    clearMessages();
    if (window.confirm('¿Está seguro?')) {
      try {
        const res = await fetch(`/api/socios/${socioId}`, { method: 'DELETE' });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Error al eliminar el socio');
        }
        fetchSocios();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    clearMessages();
    const formData = new FormData();
    formData.append('file', file);

    try {
      setImportMessage('Importando socios, por favor espere...');
      const response = await fetch('/api/socios/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error en la importación');
      
      setImportMessage(result.message);
      fetchSocios(); // Recargar la lista

    } catch (err) {
      setError(`Error de importación: ${err.message}`);
    } finally {
        // Limpiar el input para poder subir el mismo archivo de nuevo
        event.target.value = null;
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSocio(null);
    clearMessages();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-gray-800">Gestión de Socios</h1>
          <div className="flex gap-2">
             <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".xlsx, .xls"/>
             <button onClick={() => fileInputRef.current.click()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg">
                Importar desde Excel
             </button>
             <button onClick={() => { setEditingSocio(null); setShowForm(true); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg">
                + Agregar Socio
             </button>
          </div>
        </div>

        {showForm && <SocioForm socio={editingSocio} onSave={handleSaveSocio} onCancel={handleCancel} errorMessage={error} />}

        {/* Mensajes de estado (Error o Éxito) */}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"><span className="block sm:inline">{error}</span></div>}
        {importMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"><span className="block sm:inline">{importMessage}</span></div>}

        {/* Tabla de Socios */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">Nombre y Apellido</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">Cédula</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {socios.map((s) => (
                  <tr key={s.id} className="hover:bg-green-50">
                    <td className="py-4 px-6 whitespace-nowrap">{s.nombreCompleto}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{s.cedula || 'N/A'}</td>
                    <td className="py-4 px-6 whitespace-nowrap space-x-2">
                      <button onClick={() => { setEditingSocio(s); setShowForm(true); }} className="py-1 px-3 rounded-full text-xs font-semibold text-yellow-800 bg-yellow-200 hover:bg-yellow-300">Modificar</button>
                      <button onClick={() => handleDeleteSocio(s.id)} className="py-1 px-3 rounded-full text-xs font-semibold text-red-800 bg-red-200 hover:bg-red-300">Eliminar</button>
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
