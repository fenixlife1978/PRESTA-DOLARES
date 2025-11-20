
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handle(req, res) {
    if (req.method === 'GET') {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ error: 'Los parámetros "month" y "year" son obligatorios.' });
        }

        try {
            const monthNumber = parseInt(month, 10);
            const yearNumber = parseInt(year, 10);

            // Validar que mes y año sean números válidos
            if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12 || isNaN(yearNumber)) {
                return res.status(400).json({ error: 'Mes o año inválido.' });
            }

            // Calcular el primer y último día del mes solicitado
            const startDate = new Date(yearNumber, monthNumber - 1, 1);
            const endDate = new Date(yearNumber, monthNumber, 0);
            endDate.setHours(23, 59, 59, 999); // Asegurar que cubra todo el día

            // Requerimiento 2: Filtrar cuotas por cobrar para el mes y año solicitados
            const cuotasPorCobrar = await prisma.cuota.findMany({
                where: {
                    // Condición 1: El préstamo no está 'Pagado'
                    prestamo: {
                        estado: {
                            not: 'Pagado'
                        }
                    },
                    // Condición 2: La fecha de vencimiento está en el rango del mes y año
                    fechaVencimiento: {
                        gte: startDate,
                        lte: endDate,
                    },
                    // Condición 3: La cuota no ha sido pagada
                    estado: 'Pendiente',
                },
                include: {
                    // Incluir información del socio a través del préstamo
                    prestamo: {
                        include: {
                            socio: true,
                        },
                    },
                },
                orderBy: {
                    fechaVencimiento: 'asc',
                },
            });

            res.status(200).json(cuotasPorCobrar);
        } catch (error) {
            console.error("Error al obtener el reporte de cuotas por cobrar:", error);
            res.status(500).json({
                error: 'Error al obtener el reporte',
                details: error.message || 'No hay detalles adicionales.',
            });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Método ${req.method} no permitido`);
    }
}
