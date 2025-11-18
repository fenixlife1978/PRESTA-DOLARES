
import { useState } from 'react';

const PrestamosModule = () => {
  const [socios] = useState([
    { id: 1, nombreCompleto: 'Juan Pérez', cedula: '12345678' },
    { id: 2, nombreCompleto: 'Ana Gómez', cedula: '87654321' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [prestamo, setPrestamo] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'estandar',
    monto: '',
    interes: '',
    cuotas: '',
    interesPersonalizado: '',
    tipoInteresPersonalizado: 'porcentaje', // 'porcentaje' o 'fijo'
    libreAbono: false,
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedSocio(null);
  };

  const filteredSocios = searchTerm
    ? socios.filter(s =>
        s.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cedula.includes(searchTerm)
      )
    : [];

  const selectSocio = (socio) => {
    setSelectedSocio(socio);
    setSearchTerm(socio.nombreCompleto);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrestamo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSocio) {
      alert('Por favor, seleccione un socio.');
      return;
    }
    // Logic to save the loan
    console.log({ socio: selectedSocio, ...prestamo });
    alert('Préstamo registrado!');
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gestión de Préstamos</h2>
      <div className="mb-4 p-4 border rounded shadow-sm">
        <h3 className="text-xl font-semibold mb-2">Nuevo Préstamo</h3>
        <form onSubmit={handleSubmit}>
          {/* Socio Search */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="socio-search">
              Buscar Socio
            </label>
            <input
              id="socio-search"
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre o cédula"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {filteredSocios.length > 0 && searchTerm && !selectedSocio && (
              <ul className="border bg-white w-full">
                {filteredSocios.map(s => (
                  <li
                    key={s.id}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => selectSocio(s)}
                  >
                    {s.nombreCompleto} ({s.cedula})
                  </li>
                ))}
              </ul>
            )}
            {selectedSocio && <div className="p-2 text-green-700">Socio seleccionado: {selectedSocio.nombreCompleto}</div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha del Préstamo */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fecha">
                Fecha del Préstamo
              </label>
              <input
                id="fecha"
                type="date"
                name="fecha"
                value={prestamo.fecha}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            {/* Tipo de Préstamo */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tipo">
                Tipo de Préstamo
              </label>
              <select
                id="tipo"
                name="tipo"
                value={prestamo.tipo}
                onChange={handleInputChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="estandar">Estándar</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>
          </div>

          {prestamo.tipo === 'estandar' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="monto">Monto</label>
                <input id="monto" type="number" name="monto" value={prestamo.monto} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="interes">Interés (%)</label>
                <input id="interes" type="number" name="interes" value={prestamo.interes} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cuotas">Cuotas</label>
                <input id="cuotas" type="number" name="cuotas" value={prestamo.cuotas} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
              </div>
            </div>
          )}

          {prestamo.tipo === 'personalizado' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="monto">Monto</label>
                    <input id="monto" type="number" name="monto" value={prestamo.monto} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Interés Personalizado</label>
                  <div className="flex items-center">
                    <input type="number" name="interesPersonalizado" value={prestamo.interesPersonalizado} onChange={handleInputChange} className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700" />
                    <select name="tipoInteresPersonalizado" value={prestamo.tipoInteresPersonalizado} onChange={handleInputChange} className="shadow appearance-none border-t border-b border-r rounded-r py-2 px-3 text-gray-700">
                      <option value="porcentaje">%</option>
                      <option value="fijo">$ (fijo)</option>
                    </select>
                  </div>
                   <p className="text-xs text-gray-600 mt-1">Ingrese 0 para un préstamo sin interés.</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cuotas">Cuotas (opcional)</label>
                <input id="cuotas" type="number" name="cuotas" value={prestamo.cuotas} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input type="checkbox" name="libreAbono" checked={prestamo.libreAbono} onChange={handleInputChange} className="mr-2" />
                  <span className="text-sm">Opción de Libre Abono</span>
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Registrar Préstamo
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrestamosModule;
