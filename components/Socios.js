
import { useState } from 'react';
import { read, utils } from 'xlsx';

const SociosModule = () => {
  const [socios, setSocios] = useState([]);
  const [socio, setSocio] = useState({ nombre: '', apellido: '', cedula: '' });
  const [editIndex, setEditIndex] = useState(-1);
  const [showForm, setShowForm] = useState(false); // Estado para controlar la visibilidad del formulario

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSocio({ ...socio, [name]: value });
  };

  const handleAddSocio = () => {
    if (editIndex > -1) {
      const updatedSocios = [...socios];
      updatedSocios[editIndex] = socio;
      setSocios(updatedSocios);
      setEditIndex(-1);
    } else {
      setSocios([...socios, socio]);
    }
    setSocio({ nombre: '', apellido: '', cedula: '' });
    setShowForm(false); // Ocultar el formulario después de agregar/modificar
  };

  const handleEditSocio = (index) => {
    setSocio(socios[index]);
    setEditIndex(index);
    setShowForm(true); // Mostrar el formulario para editar
  };

  const handleDeleteSocio = (index) => {
    const updatedSocios = socios.filter((_, i) => i !== index);
    setSocios(updatedSocios);
  };

  const handleDeleteAllSocios = () => {
    setSocios([]);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = utils.sheet_to_json(worksheet);
      const newSocios = json.map(item => ({
        nombre: item.nombre,
        apellido: item.apellido,
        cedula: item.cedula,
      }));
      setSocios([...socios, ...newSocios]);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gestión de Socios</h2>

      {/* Botón para desplegar/ocultar el formulario */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
      >
        {showForm ? 'Ocultar Formulario' : 'Agregar Nuevo Socio'}
      </button>

      {/* Formulario de registro (condicional) */}
      {showForm && (
        <div className="mb-4 p-4 border rounded shadow-sm">
          <h3 className="text-xl font-semibold mb-2">{editIndex > -1 ? 'Modificar Socio' : 'Agregar Socio'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={socio.nombre}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={socio.apellido}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              name="cedula"
              placeholder="Cédula (opcional)"
              value={socio.cedula}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <button
            onClick={handleAddSocio}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {editIndex > -1 ? 'Guardar Cambios' : 'Agregar Socio'}
          </button>
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <div>
          <label htmlFor="import-file" className="block text-sm font-medium text-gray-700">
            Importar desde Excel o CSV
          </label>
          <input
            id="import-file"
            type="file"
            accept=".xls,.xlsx,.csv"
            onChange={handleImport}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button
          onClick={handleDeleteAllSocios}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Eliminar Lista de Socios
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Apellido</th>
              <th className="py-2 px-4 border-b">Cédula</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {socios.map((s, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b">{s.nombre}</td>
                <td className="py-2 px-4 border-b">{s.apellido}</td>
                <td className="py-2 px-4 border-b">{s.cedula}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEditSocio(index)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    Modificar
                  </button>
                  <button
                    onClick={() => handleDeleteSocio(index)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SociosModule;
