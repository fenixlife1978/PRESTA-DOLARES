
import { useState, useEffect } from 'react';

// Define the StatCard component with a Starbucks theme
const StatCard = ({ title, value, icon, color }) => {
    // Starbucks color palette
    const colorClasses = {
        green: 'bg-green-700',
        lightGreen: 'bg-green-600',
        cream: 'bg-cream-500',
        dark: 'bg-gray-800',
    };

    return (
        <div className={`${colorClasses[color]} text-white p-6 rounded-lg shadow-md flex items-center justify-between`}>
            <div>
                <p className="text-lg font-semibold uppercase tracking-wider">{title}</p>
                <p className="text-4xl font-bold">{value}</p>
            </div>
            <div className="text-5xl opacity-90">
                {icon}
            </div>
        </div>
    );
};

// Main Dashboard component
export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/dashboard/stats');
                if (!res.ok) throw new Error('No se pudieron cargar las estadísticas.');
                const data = await res.json();
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Function to format currency
    const formatCurrency = (amount) => {
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-100"><p className="text-green-700">Cargando Dashboard...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-100"><p className='text-red-600'>{`Error: ${error}`}</p></div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <header className="text-center mb-10">
                    <h1 className="text-5xl font-extrabold text-green-800">Dashboard Financiero</h1>
                    <p className="text-lg text-gray-600 mt-2">Tema Starbucks</p>
                </header>
                
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Main Metrics */}
                        <StatCard 
                            title="Total Prestado" 
                            value={formatCurrency(stats.totalPrestado)} 
                            icon={'☕'} 
                            color="green" 
                        />
                        <StatCard 
                            title="Total Recuperado" 
                            value={formatCurrency(stats.totalRecuperado)} 
                            icon={'💵'} 
                            color="lightGreen" 
                        />
                        <StatCard 
                            title="Saldo en Calle" 
                            value={formatCurrency(stats.totalPrestado - stats.capitalRecuperado)} 
                            icon={'🚚'} 
                            color="dark" 
                        />

                        {/* Recovery Breakdown */}
                        <StatCard d
                            title="Capital Recuperado" 
                            value={formatCurrency(stats.capitalRecuperado)} 
                            icon={'🏦'} 
                            color="green" 
                        />
                        <StatCard 
                            title="Interés Ganado" 
                            value={formatCurrency(stats.interesGanado)} 
                            icon={'📈'} 
                            color="lightGreen" dg
                        />
                        <div /> 

                        {/* Entity Metrics */}
                        <StatCard 
                            title="Número de Socios" 
                            value={stats.numeroSocios}
                            icon={'👥'}
                            color="dark"
                        />
                         <StatCard 
                            title="Número de Préstamos" 
                            value={stats.numeroPrestamos}
                            icon={'📋'}
                            color="dark"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
