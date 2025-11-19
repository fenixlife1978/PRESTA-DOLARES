
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handle(req, res) {
    if (req.method === 'GET') {
        const { prestamoId } = req.query;
        try {
            const pagos = await prisma.pago.findMany({
                where: {
                    prestamoId: prestamoId ? parseInt(prestamoId) : undefined,
                },
                orderBy: {
                    fechaPago: 'desc',
                },
            });
            res.status(200).json(pagos);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los pagos' });
        }
    } else if (req.method === 'POST') {
        const { monto, capital, interes, fechaPago, socioId, prestamoId, esLibreAbono } = req.body;

        try {
            const nuevoPago = await prisma.$transaction(async (prisma) => {
                const pago = await prisma.pago.create({
                    data: {
                        monto: parseFloat(monto),
                        capital: parseFloat(capital),
                        interes: parseFloat(interes),
                        fechaPago: new Date(fechaPago),
                        socioId: parseInt(socioId),
                        prestamoId: parseInt(prestamoId),
                        esLibreAbono: esLibreAbono || false,
                    },
                });

                const prestamo = await prisma.prestamo.findUnique({ where: { id: parseInt(prestamoId) } });
                if (!prestamo) throw new Error("Préstamo no encontrado");

                const totalPagado = await prisma.pago.aggregate({
                    _sum: { capital: true },
                    where: { prestamoId: parseInt(prestamoId) },
                });

                const capitalPagado = totalPagado._sum.capital || 0;

                if (capitalPagado >= prestamo.monto) {
                    await prisma.prestamo.update({
                        where: { id: parseInt(prestamoId) },
                        data: { estado: 'Pagado' },
                    });
                }

                return pago;
            });

            res.status(201).json(nuevoPago);
        } catch (error) {
            console.error("Error al crear el pago:", error);
            res.status(500).json({ error: `Error al crear el pago: ${error.message}` });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Método ${req.method} no permitido`);
    }
}
