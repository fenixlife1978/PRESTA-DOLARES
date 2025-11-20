import { useState, useEffect, useMemo } from 'react';

// --- NUEVO: Modal para ver el Plan de Pagos ---
const PlanDePagosModal = ({ prestamo, onClose }) => {
    if (!prestamo) return null;

    const planDePagos = Array.isArray(prestamo.planDePagos) ? prestamo.planDePagos : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className='flex justify-between items-start mb-6'>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Plan de Pagos</h3>
                        <p className='text-gray-600'>Préstamo a {prestamo.socio?.nombreCompleto || 'Socio no encontrado'}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                </div>
                <div className="overflow-y-auto">
                    {planDePagos.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Cuota</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Venc.</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Cuota</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Capital</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Interés</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {planDePagos.map((cuota) => (
                                    <tr key={cuota.numeroCuota}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cuota.numeroCuota}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(cuota.fechaVencimiento).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${(cuota.monto || 0).toLocaleString('es-CO')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${(cuota.capital || 0).toLocaleString('es-CO')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${(cuota.interes || 0).toLocaleString('es-CO')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 py-10">Este préstamo no tiene un plan de pagos definido (es de libre abono).</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Componente del Modal de Pagos --- 
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
            const res = await fetch(`/api/pagos?prestamoId=${prestamo.id}`);
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

            const response = await fetch(`/api/pagos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    monto: montoPago, 
                    fechaPago: formState.fechaPago, 
                    capital, 
                    interes, 
                    socioId: prestamo.socioId, 
                    prestamoId: prestamo.id 
                }),
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
                        <p className='mb-1'><strong>Socio:</strong> {prestamo.socio?.nombreCompleto || 'Socio no disponible'}</p>
                        <p><strong>Préstamo:</strong> ${prestamo.monto.toLocaleString('es-CO')} <span className={`ml-2 px-3 py-1 text-xs font-bold rounded-full ${prestamo.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{prestamo.estado}</span></p>
                    </div>
                     <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                </div>
                 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 flex-grow overflow-y-auto">
                    <div className='md:border-r md:pr-8'>
                        <h4 className='text-lg font-semibold mb-4 border-b pb-2'>Registrar Nuevo Pago</h4>
                        {prestamo.estado === 'Pagado' ? (
                            <div className='text-center p-10 bg-gray-100 rounded-lg'>
                                <p className='font-bold text-lg text-green-700'>Este préstamo ya ha sido saldado.</p>
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
                                <p className='text-xl font-bold text-blue-900'>${totalCapitalPagado.toLocaleString('es-CO', {minimumFractionDigits: 2})}</p>
                            </div>
                            <div className='bg-red-100 p-3 rounded-lg'>
                                <p className='text-sm text-red-800'>Saldo de Capital</p>
                                <p className='text-xl font-bold text-red-900'>${saldoCapital.toLocaleString('es-CO', {minimumFractionDigits: 2})}</p>
                            </div>
                        </div>
                        {isLoading ? <p>Cargando pagos...</p> : (
                            <ul className="space-y-3 max-h-72 overflow-y-auto pr-2">
                                {pagos.length === 0 && <p className='text-center text-gray-500 pt-8'>No hay pagos registrados.</p>}
                                {pagos.map(pago => (
                                    <li key={pago.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                            <div>
                                                <p className="font-semibold">${pago.monto.toLocaleString('es-CO', {minimumFractionDigits: 2})}</p>
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

// --- Formulario de Préstamos --- 
const PrestamoForm = ({ socios, onSave, onCancel, apiError }) => {
  const initialFormState = {
    monto: '',
    interes: '',
    cuotas: '',
    socioId: null,
    fechaOtorgamiento: new Date().toISOString().split('T')[0],
    tipoPrestamo: 'Diario',
    tipoInteres: 'Porcentual',
    esLibreAbono: false,
  };

  const [formState, setFormState] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [localError, setLocalError] = useState('');

  const filteredSocios = useMemo(() => {
    if (!searchTerm || !Array.isArray(socios)) return [];
    return socios.filter(s => s.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, socios]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setLocalError('');
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

  const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
      setSelectedSocio(null);
      setFormState(prev => ({...prev, socioId: null}));
      setIsSearching(e.target.value.length > 0);
  };

  const selectSocio = (socio) => {
      setSelectedSocio(socio);
      setSearchTerm(socio.nombreCompleto);
      setFormState(prev => ({...prev, socioId: socio.id}));
      setIsSearching(false);
  }

  const handleSubmit = (e) => {
      e.preventDefault();
      setLocalError('');
      if (!formState.socioId) {
          setLocalError('Debe seleccionar un socio para registrar el préstamo.');
          return;
      }
      onSave(formState, () => {
        setFormState(initialFormState);
        setSearchTerm('');
        setSelectedSocio(null);
      });
  }

  const handleCancel = () => {
    setFormState(initialFormState);
    setSearchTerm('');
    setSelectedSocio(null);
    setLocalError('');
    onCancel();
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg mb-10">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Registrar Nuevo Préstamo</h3>
        {(apiError || localError) && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4 text-sm font-mono">{`Error: ${apiError || localError}`}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             
            <div className="col-span-1 space-y-4 relative">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Socio</label>
                    <input type="text" placeholder="Buscar socio..." value={searchTerm} onChange={handleSearchChange} className="w-full p-2 bg-gray-100 rounded-lg border" />
                    {isSearching && filteredSocios.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                            {filteredSocios.map(s => <li key={s.id} onClick={() => selectSocio(s)} className="p-2 hover:bg-gray-100 cursor-pointer">{s.nombreCompleto}</li>)}
                        </ul>
                    )}
                     {isSearching && filteredSocios.length === 0 && searchTerm && (
                         <p className="absolute z-10 w-full bg-white border rounded-lg mt-1 p-2 text-gray-500">No se encontraron socios.</p>
                     )}
                    {selectedSocio && <p className="text-green-600 font-semibold mt-2 text-sm">Socio: {selectedSocio.nombreCompleto}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto del Préstamo ($)</label>
                    <input type="number" name="monto" value={formState.monto} onChange={handleFormChange} placeholder="Ej: 1,000,000" className="w-full p-2 bg-gray-100 rounded-lg border" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Otorgamiento</label>
                    <input type="date" name="fechaOtorgamiento" value={formState.fechaOtorgamiento} onChange={handleFormChange} className="w-full p-2 bg-gray-100 rounded-lg border" required/>
                </div>
            </div>

            <div className="col-span-1 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad de Préstamo</label>
                    <select name="tipoPrestamo" value={formState.tipoPrestamo} onChange={handleFormChange} className="w-full p-2 bg-gray-100 rounded-lg border">
                        <option value="Diario">Diario</option>
                        <option value="Semanal">Semanal</option>
                        <option value="Quincenal">Quincenal</option>
                        <option value="Mensual">Mensual</option>
                        <option value="Otro">Otro (Libre Abono)</option>
                    </select>
                </div>
                 {formState.tipoPrestamo !== 'Otro' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de Cuotas</label>
                        <input type="number" name="cuotas" value={formState.cuotas} onChange={handleFormChange} placeholder="Ej: 24" className="w-full p-2 bg-gray-100 rounded-lg border" disabled={formState.esLibreAbono}/>
                    </div>
                )}
                <div className="flex items-center pt-2">
                    <input type="checkbox" id="esLibreAbono" name="esLibreAbono" checked={formState.esLibreAbono} onChange={handleFormChange} className="h-4 w-4 text-green-600 border-gray-300 rounded"/>
                    <label htmlFor="esLibreAbono" className="ml-2 block text-sm text-gray-900">Permitir libre abono</label>
                </div>
            </div>

             <div className="col-span-1 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Interés</label>
                    <select name="tipoInteres" value={formState.tipoInteres} onChange={handleFormChange} className="w-full p-2 bg-gray-100 rounded-lg border">
                        <option value="Porcentual">Porcentual (%)</option>
                        <option value="Fijo">Monto Fijo ($)</option>
                        <option value="SinInteres">Sin Interés</option>
                    </select>
                </div>
                {formState.tipoInteres !== 'SinInteres' && (
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Valor del Interés</label>
                         <input type="number" step="0.01" name="interes" value={formState.interes} onChange={handleFormChange} placeholder={formState.tipoInteres === 'Porcentual' ? 'Ej: 3.5' : 'Ej: 50,000'} className="w-full p-2 bg-gray-100 rounded-lg border"/>
                    </div>
                )}
            </div>

            <div className="col-span-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md">Guardar Préstamo</button>
                    <button type="button" onClick={handleCancel} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                </div>
            </div>
        </form>
    </div>
  );
}


// --- Componente Principal del Módulo de Préstamos ---
const PrestamosModule = () => {
  const [socios, setSocios] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPagosModal, setSelectedPagosModal] = useState(null);
  const [selectedPlanModal, setSelectedPlanModal] = useState(null);
   
  const fetchData = async (isInitialLoad = false) => {
    if(isInitialLoad) setIsLoading(true);
    setApiError(null);
    try {
      const [sociosRes, prestamosRes] = await Promise.all([
          fetch('/api/socios'), 
          fetch('/api/prestamos')
      ]);

      if (!sociosRes.ok) {
          const errorData = await sociosRes.json();
          throw new Error(`Error al cargar socios: ${errorData.details || 'No hay detalles'}`);
      }
      if (!prestamosRes.ok) {
          const errorData = await prestamosRes.json();
          throw new Error(`Error al cargar préstamos: ${errorData.details || 'No hay detalles'}`);
      }

      const sociosData = await sociosRes.json();
      const prestamosData = await prestamosRes.json();
      
      setSocios(sociosData || []);
      setPrestamos(prestamosData || []);

    } catch (err) {
      setApiError(err.message);
    } finally {
      if(isInitialLoad) setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(true); }, []);

  const handleSave = async (prestamoData, onSuccess) => {
      setApiError(null);
      try {
          const response = await fetch('/api/prestamos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(prestamoData),
          });
          if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.details || errData.error || 'Error al guardar el préstamo.');
          }
          onSuccess(); 
          await fetchData();
      } catch (err) {
          setApiError(err.message);
      }
  };

  const handleDelete = async (prestamoId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este préstamo? Esta acción también eliminará todos los pagos asociados.')) {
      setApiError(null);
      try {
        const res = await fetch(`/api/prestamos/${prestamoId}`, { method: 'DELETE' });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Error al eliminar el préstamo');
        }
        fetchData();
      } catch (err) {
        setApiError(err.message);
      }
    }
  };

  const formatInteres = (p) => {
        if (!p || p.tipoInteres === 'SinInteres' || !p.interes) return "-";
        if (p.tipoInteres === 'Fijo') return `$${parseFloat(p.interes).toLocaleString('es-CO')}`;
        return `${p.interes}%`;
    }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Gestión de Préstamos</h1>
        
        <PrestamoForm 
            socios={socios}
            onSave={handleSave}
            onCancel={() => setApiError(null)}
            apiError={apiError}
        />

        {selectedPagosModal && <PagosModal prestamo={selectedPagosModal} onClose={() => setSelectedPagosModal(null)} onPaymentSuccess={() => fetchData()} />}
        {selectedPlanModal && <PlanDePagosModal prestamo={selectedPlanModal} onClose={() => setSelectedPlanModal(null)} />}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
             <h3 className="text-xl font-bold text-gray-800 p-6">Historial de Préstamos</h3>
             {apiError && !isLoading && <p className='px-6 pb-4 text-red-500 font-mono text-sm break-all'>{`Error: ${apiError}`}</p>}
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
                            {prestamos.length > 0 ? prestamos.map((p) => (
                                <tr key={p.id} className={`${p.estado === 'Pagado' ? 'bg-gray-50 text-gray-500' : 'hover:bg-green-50'}`}>
                                    <td className="py-3 px-4 text-left text-sm font-medium text-gray-900">{p.socio?.nombreCompleto || 'Socio Eliminado'}</td>
                                    <td className="py-3 px-4 text-left">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.estado === 'Pagado' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                                            {p.estado}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-left text-sm text-gray-500">{new Date(p.fechaOtorgamiento).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 text-right text-sm font-medium text-gray-900">${parseFloat(p.monto).toLocaleString('es-CO')}</td>
                                    <td className="py-3 px-4 text-right text-sm text-gray-500">{formatInteres(p)}</td>
                                    <td className="py-3 px-4 text-center text-sm text-gray-500">{p.cuotas || 'N/A'}</td>
                                    <td className="py-3 px-4 text-left text-sm font-medium space-x-2 whitespace-nowrap">
                                         <button onClick={() => setSelectedPagosModal(p)} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded">Pagos</button>
                                         <button onClick={() => setSelectedPlanModal(p)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded">Plan</button>
                                         <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded">Eliminar</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="py-8 text-center text-gray-500">No hay préstamos registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 }
             </div>
        </div>
      </div>
    </div>
  );
}

export default PrestamosModule;