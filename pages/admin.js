
import { useState } from 'react';
import SociosModule from '../components/Socios';
import PagosModule from '../components/Pagos';
import PrestamosModule from '../components/Prestamos'; // Import PrestamosModule
import ConsultasModule from '../components/Consultas'; // Import ConsultasModule

const AdminDashboard = () => {
  const [activeModule, setActiveModule] = useState('socios');

  const renderModule = () => {
    switch (activeModule) {
      case 'socios':
        return <SociosModule />;
      case 'prestamos':
        return <PrestamosModule />;
      case 'pagos':
        return <PagosModule />;
      case 'consultas':
        return <ConsultasModule />;
      case 'configuraciones':
        return <div>Configuraciones Module</div>;
      default:
        return <SociosModule />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 text-xl font-bold">Admin Dashboard</div>
        <ul>
          <li className={`p-4 hover:bg-gray-700 cursor-pointer ${activeModule === 'socios' ? 'bg-gray-700' : ''}`} onClick={() => setActiveModule('socios')}>
            Socios
          </li>
          <li className={`p-4 hover:bg-gray-700 cursor-pointer ${activeModule === 'prestamos' ? 'bg-gray-700' : ''}`} onClick={() => setActiveModule('prestamos')}>
            Préstamos
          </li>
          <li className={`p-4 hover:bg-gray-700 cursor-pointer ${activeModule === 'pagos' ? 'bg-gray-700' : ''}`} onClick={() => setActiveModule('pagos')}>
            Pagos
          </li>
          <li className={`p-4 hover:bg-gray-700 cursor-pointer ${activeModule === 'consultas' ? 'bg-gray-700' : ''}`} onClick={() => setActiveModule('consultas')}>
            Consultas
          </li>
          <li className={`p-4 hover:bg-gray-700 cursor-pointer ${activeModule === 'configuraciones' ? 'bg-gray-700' : ''}`} onClick={() => setActiveModule('configuraciones')}>
            Configuraciones
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        {renderModule()}
      </div>
    </div>
  );
};

export default AdminDashboard;
