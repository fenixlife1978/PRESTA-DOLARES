
import { useState, useEffect } from 'react';

const StatCard = ({ title, value, icon, color }) => {
    const colorClasses = {
        green: 'from-green-500 to-green-600',
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        red: 'from-red-500 to-red-600',
        yellow: 'from-yellow-500 to-yellow-600',
        indigo: 'from-indigo-500 to-indigo-600',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} text-white p-6 rounded-xl shadow-lg flex items-center justify-between`}>
            <div>
                <p className="text-sm font-semibold uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
            <div className="text-4xl opacity-80">
                {icon}
            </div>
        </div>
    );
};


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

    const formatCurrency = (amount) => {
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen"><p>Cargando dashboard...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen"><p className='text-red-500'>{`Error: ${error}`}</p></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard Financiero</h1>
                
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Métricas Principales */}
                        <StatCard 
                            title="Total Prestado" 
                            value={formatCurrency(stats.totalPrestado)} 
                            icon={'💸'} 
                            color="blue" 
                        />
                        <StatCard 
                            title="Total Recuperado" 
                            value={formatCurrency(stats.totalRecuperado)} 
                            icon={'💰'} 
                            color="green" 
                        />
                        <StatCard 
                            title="Saldo en Calle" 
                            value={formatCurrency(stats.totalPrestado - stats.capitalRecuperado)} 
                            icon={' STREET '} 
                            color="yellow" 
                        />

                        {/* Desglose de Recuperación */}
                        <StatCard 
                            title="Capital Recuperado" 
                            value={formatCurrency(stats.capitalRecuperado)} 
                            icon={'🏦'} 
                            color="indigo" 
                        />
                        <StatCard 
                            title="Interés Ganado" 
                            value={formatCurrency(stats.interesGanado)} 
                            icon={'📈'} 
                            color="purple" 
                        />
                        <div></div>{/* Placeholder */}

                        {/* Métricas de Entidad */}
                        <StatCard 
                            title="Número de Socios" 
                            value={stats.numeroSocios}
                            icon={'👥'}
                            color="red"
                        />
                         <StatCard 
                            title="Número de Préstamos" 
                            value={stats.numeroPrestamos}
                            icon={'📄'}
                            color="red"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
