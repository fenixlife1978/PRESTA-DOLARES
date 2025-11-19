
import { useState, useEffect } from 'react';

// --- Componente del Modal de Pagos (con lógica de estado) --- 
const PagosModal = ({ prestamo, onClose, onPaymentSuccess }) => {
    const [pagos, setPagos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formState, setFormState] = useState({
        monto: '',
        fechaPago: new Date().toISOString().split('T')[0],
        capital: '',
        interes: '',
    });

    const fetchPagos = async () => {
        if (!prestamo) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/prestamos/${prestamo.id}/pagos`);
            if (!res.ok) throw new Error('Error al cargar los pagos.');
            const data = await res.json();
            setPagos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPagos();
    }, [prestamo]);

    const handleFormChange = (e) => {
        setError(null);
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const montoPago = parseFloat(formState.monto);
            let capital = formState.capital ? parseFloat(formState.capital) : 0;
            let interes = formState.interes ? parseFloat(formState.interes) : 0;
            if (!formState.capital && !formState.interes) capital = montoPago;
            else if (formState.capital && !formState.interes) interes = montoPago - capital;
            else if (!formState.capital && formState.interes) capital = montoPago - interes;

            const response = await fetch(`/api/prestamos/${prestamo.id}/pagos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ monto: montoPago, fechaPago: formState.fechaPago, capital, interes }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error al registrar el pago.');
            }
            setFormState({ monto: '', fechaPago: new Date().toISOString().split('T')[0], capital: '', interes: '' });
            await fetchPagos();
            if(onPaymentSuccess) onPaymentSuccess();
        } catch (err) {
            setError(err.message);
        }
    }

    if (!prestamo) return null;

    const totalCapitalPagado = pagos.reduce((acc, pago) => acc + pago.capital, 0);
    const saldoCapital = prestamo.monto - totalCapitalPagado;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className='flex justify-between items-start'>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Pagos</h3>
                        <p className='mb-1'><strong>Socio:</strong> {prestamo.socio.nombreCompleto}</p>
                        <p><strong>Préstamo:</strong> ${prestamo.monto.toLocaleString('en-US')} <span className={`ml-2 px-3 py-1 text-xs font-bold rounded-full ${prestamo.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{prestamo.estado}</span></p>
                    </div>
                     <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 flex-grow overflow-y-auto">
                    <div className='md:border-r md:pr-8'>
                        <h4 className='text-lg font-semibold mb-4 border-b pb-2'>Registrar Nuevo Pago</h4>
                        {prestamo.estado === 'Pagado' ? (
                            <div className='text-center p-10 bg-gray-100 rounded-lg'>
                                <p className='font-bold text-lg text-green-700'>Este préstamo ya ha sido saldado.</p>
                                <p className='text-gray-600'>No se pueden registrar nuevos pagos.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <p className="text-red-500 bg-red-100 p-2 rounded-lg text-sm">{`Error: ${error}`}</p>}
                                <input type="date" name="fechaPago" value={formState.fechaPago} onChange={handleFormChange} className="w-full p-2 bg-gray-100 rounded-lg border" required />
                                <input type="number" step="0.01" name="monto" value={formState.monto} onChange={handleFormChange} placeholder="Monto Total del Pago" className="w-full p-2 bg-gray-100 rounded-lg border" required />
                                <p className='text-xs text-gray-500 text-center'>Opcional: especifique la distribución del pago.</p>
                                <div className='flex gap-4'>
                                    <input type="number" step="0.01" name="capital" value={formState.capital} onChange={handleFormChange} placeholder="Abono a Capital" className="w-full p-2 bg-gray-100 rounded-lg border" />
                                    <input type="number" step="0.01" name="interes" value={formState.interes} onChange={handleFormChange} placeholder="Pago de Interés" className="w-full p-2 bg-gray-100 rounded-lg border" />
                                </div>
                                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md">Registrar Pago</button>
                            </form>
                        )}
                    </div>
                    <div>
                        <h4 className='text-lg font-semibold mb-4 border-b pb-2'>Historial y Saldos</h4>
                         <div className='grid grid-cols-2 gap-4 mb-4 text-center'>
                            <div className='bg-blue-100 p-3 rounded-lg'>
                                <p className='text-sm text-blue-800'>Capital Pagado</p>
                                <p className='text-xl font-bold text-blue-900'>${totalCapitalPagado.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                            </div>
                            <div className='bg-red-100 p-3 rounded-lg'>
                                <p className='text-sm text-red-800'>Saldo de Capital</p>
                                <p className='text-xl font-bold text-red-900'>${saldoCapital.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                            </div>
                        </div>
                        {isLoading ? <p>Cargando pagos...</p> : (
                            <ul className="space-y-3 max-h-72 overflow-y-auto pr-2">
                                {pagos.length === 0 && <p className='text-center text-gray-500 pt-8'>No hay pagos registrados.</p>}
                                {pagos.map(pago => (
                                    <li key={pago.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <p className="font-semibold">${pago.monto.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                                            <p className="text-xs text-gray-500">Cap: ${pago.capital.toLocaleString()} / Int: ${pago.interes.toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm text-gray-600">{new Date(pago.fechaPago).toLocaleDateString()}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- Componente Principal del Módulo de Préstamos ---
const PrestamosModule = () => {
  const [socios, setSocios] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);

  const [formState, setFormState] = useState({ /* ... */ });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchData = async (isInitialLoad = false) => {
    if(isInitialLoad) setIsLoading(true);
    try {
      const [sociosRes, prestamosRes] = await Promise.all([ fetch('/api/socios'), fetch('/api/prestamos') ]);
      if (!sociosRes.ok || !prestamosRes.ok) throw new Error('Error al cargar los datos.');
      const sociosData = await sociosRes.json();
      const prestamosData = await prestamosRes.json();
      setSocios(sociosData);
      setPrestamos(prestamosData);
    } catch (err) {
      setError(err.message);
    } finally {
      if(isInitialLoad) setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(true); }, []);

  // ... (todos los handlers y funciones de formulario permanecen igual)
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setError(null);
    setFormState(prev => {
        const newState = { ...prev, [name]: val };
        if(name === 'tipoPrestamo') {
            newState.tipoInteres = 'Porcentual';
            newState.esLibreAbono = false;
            newState.interes = '';
            newState.cuotas = '';
        }
        if(name === 'tipoInteres') newState.interes = '';
        if(name === 'esLibreAbono' && checked) newState.cuotas = '';
        return newState;
    });
  };
  const handleSearchChange = (e) => { /* ... */ };
  const selectSocio = (socio) => { /* ... */ };
  const resetForm = () => { /* ... */ };
  const handleSubmit = async (e) => { /* ... */ };
  const handleDelete = async (prestamoId) => { /* ... */ };
  const formatInteres = (p) => {
        if (p.tipoInteres === 'SinInteres') return "-";
        if (p.tipoInteres === 'Fijo') return `$${p.interes.toFixed(2)}`;
        return `${p.interes}%`;
    }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Gestión de Préstamos</h1>
        
        {/* Formulario de registro de Préstamos (sin cambios) */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-10"> ... </div>

        {selectedPrestamo && <PagosModal prestamo={selectedPrestamo} onClose={() => setSelectedPrestamo(null)} onPaymentSuccess={() => fetchData()} />}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
             <h3 className="text-xl font-bold text-gray-800 p-6">Historial de Préstamos</h3>
             <div className="overflow-x-auto">
                 {isLoading ? <p className='p-6'>Cargando préstamos...</p> : 
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Socio</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                                <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase">Monto</th>
                                <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase">Interés</th>
                                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Cuotas</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {prestamos.map((p) => (
                                <tr key={p.id} className={`${p.estado === 'Pagado' ? 'bg-gray-50 text-gray-500' : 'hover:bg-green-50'}`}>
                                    <td className="py-4 px-4 font-medium">{p.socio.nombreCompleto}</td>
                                    <td className="py-4 px-4"><span className={`px-3 py-1 text-xs font-bold rounded-full ${p.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{p.estado}</span></td>
                                    <td className="py-4 px-4">{new Date(p.fechaOtorgamiento).toLocaleDateString()}</td>
                                    <td className="py-4 px-4 text-right font-mono">${p.monto.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                    <td className="py-4 px-4 text-right font-semibold text-green-700">{formatInteres(p)}</td>
                                    <td className="py-4 px-4 text-center">{p.cuotas || 'N/A'}</td>
                                    <td className="py-4 px-4 space-x-2">
                                        <button onClick={() => setSelectedPrestamo(p)} disabled={p.estado === 'Pagado'} className="py-1 px-3 rounded-full text-xs font-semibold text-blue-800 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">Ver Pagos</button>
                                        <button onClick={() => handleDelete(p.id)} disabled={p.estado === 'Pagado'} className="py-1 px-3 rounded-full text-xs font-semibold text-red-800 bg-red-200 hover:bg-red-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 }
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrestamosModule;
