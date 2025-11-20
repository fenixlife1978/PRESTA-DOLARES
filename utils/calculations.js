/**
 * Calcula un plan de pagos usando el sistema de amortización alemán (capital fijo).
 * Este sistema calcula una porción de capital fija para cada cuota y el interés
 * se calcula sobre el saldo pendiente del préstamo.
 *
 * @param {number} monto - El monto total del préstamo.
 * @param {number | string} tasaInteres - La tasa de interés. Puede ser porcentual o un monto fijo total.
 * @param {number | string} numeroCuotas - El número total de cuotas.
 * @param {Date | string} fechaInicio - La fecha de inicio del préstamo (desembolso).
 * @param {string} tipoPrestamo - La periodicidad de las cuotas ('Diario', 'Semanal', 'Quincenal', 'Mensual').
 * @param {string} tipoInteres - El tipo de interés ('Porcentual', 'Fijo', 'SinInteres').
 * @returns {Array} Un array de objetos, donde cada objeto representa una cuota del plan de pagos.
 */
export function calcularPlanDePagos(monto, tasaInteres, numeroCuotas, fechaInicio, tipoPrestamo, tipoInteres) {
    const numCuotas = parseInt(numeroCuotas, 10);
    const montoTotal = parseFloat(monto);
    const interesValor = parseFloat(tasaInteres);

    // Requerimiento 3: No generar plan si no hay cuotas o interés.
    if (!numCuotas || numCuotas <= 0 || !interesValor || interesValor <= 0 || tipoInteres === 'SinInteres') {
        return [];
    }

    const plan = [];
    let saldoPendiente = montoTotal;

    // Requerimiento 1: Capital Fijo por Cuota.
    const capitalPorCuota = montoTotal / numCuotas;

    // Función para obtener la fecha de vencimiento de la siguiente cuota.
    const getNextDate = (currentDate, index) => {
        const newDate = new Date(currentDate);
        // La primera cuota es 1 período después de la fecha de inicio.
        const effectiveIndex = index;
        
        switch (tipoPrestamo) {
            case 'Diario':
                newDate.setDate(newDate.getDate() + effectiveIndex);
                break;
            case 'Semanal':
                newDate.setDate(newDate.getDate() + (effectiveIndex * 7));
                break;
            case 'Quincenal':
                newDate.setDate(newDate.getDate() + (effectiveIndex * 15));
                break;
            case 'Mensual':
            case 'Otro': // Asumimos 'Otro' como mensual si tiene cuotas
                newDate.setMonth(newDate.getMonth() + effectiveIndex);
                break;
            default:
                newDate.setMonth(newDate.getMonth() + effectiveIndex);
        }
        return newDate;
    };

    for (let i = 1; i <= numCuotas; i++) {
        let interesDeCuota;

        // Requerimiento 1: Cálculo de Interés Mensual.
        if (tipoInteres === 'Porcentual') {
            const tasa = interesValor / 100;
            interesDeCuota = saldoPendiente * tasa;
        } else { // 'Fijo'
            // Si el interés es un monto fijo total, se divide entre el número de cuotas.
            interesDeCuota = interesValor / numCuotas;
        }

        const capitalDeCuota = capitalPorCuota;
        
        // Requerimiento 1: Monto Total de Cuota.
        const montoCuota = capitalDeCuota + interesDeCuota;

        // El saldo pendiente se reduce por la porción de capital fija.
        saldoPendiente -= capitalDeCuota;

        // Para la última cuota, ajustamos por cualquier residuo de punto flotante
        // para asegurar que el saldo final sea exactamente 0.
        let capitalFinal = capitalDeCuota;
        if (i === numCuotas) {
            const ajuste = saldoPendiente;
            capitalFinal += ajuste;
            saldoPendiente = 0;
        }

        plan.push({
            numeroCuota: i,
            monto: montoCuota,
            capital: capitalFinal,
            interes: interesDeCuota,
            fechaVencimiento: getNextDate(fechaInicio, i),
            estado: "Pendiente",
        });
    }

    return plan;
}
