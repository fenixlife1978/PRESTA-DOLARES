
import prisma from '../../../../lib/prisma';

export default async function handle(req, res) {
  const { id: prestamoId } = req.query;
  const prestamoIdInt = parseInt(prestamoId);

  if (req.method === 'GET') {
    try {
      const pagos = await prisma.pago.findMany({
        where: { prestamoId: prestamoIdInt },
        orderBy: { fechaPago: 'desc' },
      });
      res.json(pagos);
    } catch (error) {
      res.status(500).json({ error: `Error al obtener los pagos del préstamo ${prestamoIdInt}` });
    }

  } else if (req.method === 'POST') {
    const { monto, fechaPago, capital, interes } = req.body;

    if (!monto || !fechaPago) {
        return res.status(400).json({ error: 'Monto y fecha son obligatorios.' });
    }

    try {
        // Usar una transacción para asegurar la integridad de los datos
        const result = await prisma.$transaction(async (tx) => {
            // 1. Obtener el préstamo para validación y datos
            const prestamo = await tx.prestamo.findUnique({
                where: { id: prestamoIdInt },
                include: { socio: true }
            });
            if(!prestamo) throw new Error('Préstamo no encontrado');
            if(prestamo.estado === 'Pagado') throw new Error('Este préstamo ya ha sido saldado.');

            // 2. Crear el nuevo pago
            const nuevoPago = await tx.pago.create({
                data: {
                    monto: parseFloat(monto),
                    fechaPago: new Date(fechaPago),
                    capital: parseFloat(capital) || 0,
                    interes: parseFloat(interes) || 0,
                    esLibreAbono: prestamo.esLibreAbono,
                    prestamo: { connect: { id: prestamoIdInt } },
                    socio: { connect: { id: prestamo.socioId } }
                },
            });

            // 3. Calcular el total del capital pagado para este préstamo
            const pagosAgregados = await tx.pago.aggregate({
                where: { prestamoId: prestamoIdInt },
                _sum: { capital: true },
            });
            const totalCapitalPagado = pagosAgregados._sum.capital || 0;

            // 4. Verificar y actualizar el estado del préstamo si está saldado
            if (totalCapitalPagado >= prestamo.monto) {
                await tx.prestamo.update({
                    where: { id: prestamoIdInt },
                    data: { estado: 'Pagado' },
                });
            }
            
            return nuevoPago;
        });

        res.status(201).json(result);

    } catch (error) {
        console.error("Error al registrar el pago:", error.message);
        res.status(500).json({ error: error.message || 'Error interno al registrar el pago.' });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
