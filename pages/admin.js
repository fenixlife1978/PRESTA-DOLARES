import { useState } from 'react';
// CORRECCIÓN: Se corrige la errata en 'frocm' a 'from'
import DashboardModule from '../components/DashboardModule'; 
import SociosModule from '../components/Socios';
import PagosModule from '../components/Pagos';
import PrestamosModule from '../components/Prestamos';
import ConsultasModule from '../components/Consultas';
import ConfiguracionesModule from '../components/Configuraciones';
// Se deja el import de withAuth, pero se corrige la errata:
import withAuth from '../components/withAuth'; 

const AdminDashboard = () => {
    // CAMBIAMOS EL MÓDULO ACTIVO POR DEFECTO A 'dashboard'
    const [activeModule, setActiveModule] = useState('dashboard');

    const renderModule = () => {
        switch (activeModule) {
            case 'dashboard': // Nuevo caso
                return <DashboardModule />; 
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
                return <DashboardModule />; // Muestra Dashboard por defecto
        }
    };

    const NavItem = ({ moduleName, label }) => (
        <li 
            className={`p-4 hover:bg-gray-700 cursor-pointer ${activeModule === moduleName ? 'bg-gray-700' : ''}`} 
            onClick={() => setActiveModule(moduleName)}
        >
            {label}
        </li>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white">
                <div className="p-4 text-xl font-bold">Admin Dashboard</div>
                <ul>
                    {/* AGREGAMOS EL ENLACE DEL DASHBOARD */}
                    <NavItem moduleName="dashboard" label="📊 Dashboard" />
                    <NavItem moduleName="socios" label="👤 Socios" />
                    <NavItem moduleName="prestamos" label="💸 Préstamos" />
                    <NavItem moduleName="pagos" label="🧾 Pagos" />
                    <NavItem moduleName="consultas" label="🔎 Consultas" />
                    <NavItem moduleName="configuraciones" label="⚙️ Configuraciones" />
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-10 overflow-y-auto">
                {renderModule()}
            </div>
        </div>
    );
};

// Se EXPORTA DIRECTAMENTE el componente para aislar withAuth.
export default AdminDashboard;