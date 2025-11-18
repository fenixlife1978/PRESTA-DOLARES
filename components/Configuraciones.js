
import { useState, useRef } from 'react';

const ConfiguracionesModule = () => {
  const [companyName, setCompanyName] = useState('Mi Empresa');
  const [logo, setLogo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [admins, setAdmins] = useState([
    { id: 1, nombre: 'Admin Principal', email: 'admin@example.com' },
  ]);
  const [newAdmin, setNewAdmin] = useState({ nombre: '', email: '' });
  const fileInputRef = useRef(null);

  const handleNameChange = (e) => {
    setCompanyName(e.target.value);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => fileInputRef.current.click();

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin({ ...newAdmin, [name]: value });
  };

  const handleAddAdmin = (e) => {
    e.preventDefault();
    if (newAdmin.nombre && newAdmin.email) {
      setAdmins([...admins, { id: Date.now(), ...newAdmin }]);
      setNewAdmin({ nombre: '', email: '' });
    }
  };
  
  const handleSave = () => {
      alert('Configuración guardada!');
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Configuraciones</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h3 className="text-xl font-semibold mb-4">General</h3>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company-name">
              Nombre de la Empresa
            </label>
            <input
              id="company-name"
              type="text"
              value={companyName}
              onChange={handleNameChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Logo de la Empresa
            </label>
            <div className="flex items-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Logo Preview" className="w-16 h-16 rounded-full mr-4 object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full mr-4 bg-gray-200 flex items-center justify-center text-gray-500">
                  Logo
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                ref={fileInputRef}
              />
              <button
                onClick={triggerFileSelect}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cargar Logo
              </button>
            </div>
          </div>
           <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Guardar Cambios
            </button>
        </div>

        {/* Admin Management */}
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h3 className="text-xl font-semibold mb-4">Administradores</h3>
          
          <form onSubmit={handleAddAdmin} className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                type="text"
                name="nombre"
                placeholder="Nombre del admin"
                value={newAdmin.nombre}
                onChange={handleAdminInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
                />
                <input
                type="email"
                name="email"
                placeholder="Email del admin"
                value={newAdmin.email}
                onChange={handleAdminInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
                />
            </div>
            <button
              type="submit"
              className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Crear Nuevo Administrador
            </button>
          </form>

          <div className="overflow-x-auto">
            <h4 className="font-semibold mb-2">Lista de Administradores</h4>
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Nombre</th>
                  <th className="py-2 px-4 border-b text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td className="py-2 px-4 border-b">{admin.nombre}</td>
                    <td className="py-2 px-4 border-b">{admin.email}</td>
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

export default ConfiguracionesModule;
