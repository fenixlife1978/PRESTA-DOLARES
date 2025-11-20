
import { useState, useMemo } from 'react';

const ReporteCuotasModule = () => {
    // Estado para manejar la selección de fecha (mes y año)
    const [fecha, setFecha] = useState({ 
        month: new Date().getMonth() + 1, // Mes actual por defecto
        year: new Date().getFullYear()      // Año actual por defecto
    });

    // Estados para los datos del reporte, carga y errores
    const [cuotas, setCuotas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para manejar la búsqueda de cuotas
    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setCuotas([]); // Limpiar resultados anteriores
        try {
            const { month, year } = fecha;
            const res = await fetch(`/api/cuotas/reporte?month=${month}&year=${year}`);
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al generar el reporte.');
            }

            const data = await res.json();
            setCuotas(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Requerimiento 2: Lógica para registrar un pago retroactivo
    const handlePagarCuota = async (cuota) => {
        // Confirmación antes de realizar la acción
        if (!window.confirm(`¿Seguro que deseas registrar el pago de la cuota #${cuota.numeroCuota} para ${cuota.prestamo.socio.nombreCompleto}?`)) {
            return;
        }
        try {
             const response = await fetch(`/api/pagos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    monto: cuota.monto,
                    fechaPago: cuota.fechaVencimiento, // La fecha de pago es la del vencimiento
                    capital: cuota.capital,
                    interes: cuota.interes,
                    socioId: cuota.prestamo.socioId,
                    prestamoId: cuota.prestamoId,
                    cuotaId: cuota.id // Vinculamos el pago a la cuota específica
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error al registrar el pago.');
            }
            
            // Si el pago es exitoso, actualizamos la UI quitando la cuota pagada
            setCuotas(prevCuotas => prevCuotas.filter(c => c.id !== cuota.id));
            alert('Pago registrado exitosamente.');

        } catch (err) {
            setError(err.message);
        }
    }

    // Generar opciones para los selectores de fecha
    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('es-ES', { month: 'long' }) }));

    // Requerimiento 2: Totalización del reporte
    const totales = useMemo(() => {
        return cuotas.reduce((acc, cuota) => {
            acc.total += cuota.monto || 0;
            acc.capital += cuota.capital || 0;
            acc.interes += cuota.interes || 0;
            return acc;
        }, { total: 0, capital: 0, interes: 0 });
    }, [cuotas]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">Reporte de Cuotas por Cobrar</h1>

                {/* Panel de Filtros */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-10 flex items-end gap-4">
                    <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700">Año</label>
                        <select id="year" name="year" value={fecha.year} onChange={e => setFecha({...fecha, year: parseInt(e.target.value)})} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="month" className="block text-sm font-medium text-gray-700">Mes</label>
                        <select id="month" name="month" value={fecha.month} onChange={e => setFecha({...fecha, month: parseInt(e.target.value)})} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleSearch} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md disabled:bg-indigo-300">
                        {isLoading ? 'Generando...' : 'Generar Reporte'}
                    </button>
                </div>

                {/* Resultados del Reporte */}
                {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4 text-sm">{`Error: ${error}`}</p>}
                
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        { !isLoading && cuotas.length === 0 && (
                            <p className='p-10 text-center text-gray-500'>No se encontraron cuotas para el período seleccionado o ya fueron pagadas.</p>
                        )}
                        { cuotas.length > 0 && (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Socio</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Fecha Venc.</th>
                                        <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase"># Cuota</th>
                                        <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase">Total a Pagar</th>
                                        <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase">Capital</th>
                                        <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase">Interés</th>
                                        <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {cuotas.map((cuota) => (
                                        <tr key={cuota.id}>
                                            <td className="py-4 px-4 font-medium whitespace-nowrap">{cuota.prestamo.socio.nombreCompleto}</td>
                                            <td className="py-4 px-4 whitespace-nowrap">{new Date(cuota.fechaVencimiento).toLocaleDateString()}</td>
                                            <td className="py-4 px-4 text-center whitespace-nowrap">{cuota.numeroCuota}</td>
                                            <td className="py-4 px-4 text-right font-mono whitespace-nowrap">${(cuota.monto || 0).toLocaleString('es-CO')}</td>
                                            <td className="py-4 px-4 text-right font-mono whitespace-nowrap">${(cuota.capital || 0).toLocaleString('es-CO')}</td>
                                            <td className="py-4 px-4 text-right font-mono whitespace-nowrap">${(cuota.interes || 0).toLocaleString('es-CO')}</td>
                                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                                <button onClick={() => handlePagarCuota(cuota)} className="py-1 px-3 rounded-full text-xs font-semibold text-green-800 bg-green-200 hover:bg-green-300">Marcar como Pagada</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {/* Fila de Totales */}
                                <tfoot className="bg-gray-200">
                                    <tr>
                                        <td colSpan="3" className="py-3 px-4 text-left text-sm font-bold text-gray-800">TOTALES</td>
                                        <td className="py-3 px-4 text-right font-bold font-mono text-gray-800">${totales.total.toLocaleString('es-CO')}</td>
                                        <td className="py-3 px-4 text-right font-bold font-mono text-gray-800">${totales.capital.toLocaleString('es-CO')}</td>
                                        <td className="py-3 px-4 text-right font-bold font-mono text-gray-800">${totales.interes.toLocaleString('es-CO')}</td>
                                        <td className="py-3 px-4"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReporteCuotasModule;
