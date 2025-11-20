
import { PrismaClient } from '@prisma/client';
import { calcularPlanDePagos } from '../../../utils/calculations';

const prisma = new PrismaClient();

export default async function handle(req, res) {
    if (req.method === 'GET') {
        try {
            const prestamos = await prisma.prestamo.findMany({
                include: {
                    socio: true,
                    planDePagos: {
                        orderBy: {
                            numeroCuota: 'asc'
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            res.status(200).json(prestamos);
        } catch (error) {
            console.error("Error detallado al obtener los préstamos:", error);
            res.status(500).json({ 
                error: 'Error al obtener los préstamos',
                details: error.message || 'No hay detalles adicionales.'
            });
        }
    } else if (req.method === 'POST') {
        const {
            monto,
            interes,
            cuotas,
            socioId,
            fechaOtorgamiento,
            tipoPrestamo,
            tipoInteres,
            esLibreAbono
        } = req.body;

        try {
            if (!monto || !socioId || !fechaOtorgamiento) {
                return res.status(400).json({ error: 'Faltan campos obligatorios: monto, socioId, fechaOtorgamiento.' });
            }
            if (!esLibreAbono && (!cuotas || cuotas <= 0)) {
                 return res.status(400).json({ error: 'El número de cuotas es obligatorio para préstamos que no son de libre abono.' });
            }

            const planDePagos = !esLibreAbono 
                ? calcularPlanDePagos(monto, interes, cuotas, fechaOtorgamiento, tipoPrestamo, tipoInteres)
                : [];

            const nuevoPrestamoConPlan = await prisma.$transaction(async (tx) => {
                const nuevoPrestamo = await tx.prestamo.create({
                    data: {
                        monto: parseFloat(monto),
                        interes: interes ? parseFloat(interes) : null,
                        cuotas: cuotas ? parseInt(cuotas) : null,
                        socioId: parseInt(socioId),
                        fechaOtorgamiento: new Date(fechaOtorgamiento),
                        tipoPrestamo,
                        tipoInteres,
                        esLibreAbono: esLibreAbono || false,
                        estado: 'Activo',
                    },
                });

                if (planDePagos.length > 0) {
                    const cuotasParaCrear = planDePagos.map(cuota => ({
                        ...cuota,
                        prestamoId: nuevoPrestamo.id,
                    }));
                    
                    await tx.cuota.createMany({
                        data: cuotasParaCrear,
                    });
                }

                // Devolver el préstamo con sus relaciones
                return tx.prestamo.findUnique({
                    where: { id: nuevoPrestamo.id },
                    include: { 
                        socio: true, 
                        planDePagos: {
                            orderBy: { numeroCuota: 'asc' }
                        } 
                    },
                });
            });

            res.status(201).json(nuevoPrestamoConPlan);
        } catch (error) {
            console.error("Error detallado al crear el préstamo:", error);
            res.status(500).json({ 
                error: `Error al crear el préstamo`,
                details: error.message || 'No hay detalles adicionales.'
            });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Método ${req.method} no permitido`);
    }
}
