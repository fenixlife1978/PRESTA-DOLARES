
import { useState } from 'react';
import SociosModule from '../components/Socios';
import PagosModule from '../components/Pagos';
import PrestamosModule from '../components/Prestamos';
import ConsultasModule from '../components/Consultas';
import ConfiguracionesModule from '../components/Configuraciones';
import withAuth from '../components/withAuth'; // Importa el HOC withAuth

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
        return <ConfiguracionesModule />;
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
      <div className="flex-1 p-10 overflow-y-auto">
        {renderModule()}
      </div>
    </div>
  );
};

// Envuelve el componente AdminDashboard con el HOC withAuth
export default withAuth(AdminDashboard);
