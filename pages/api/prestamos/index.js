
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handle(req, res) {
    if (req.method === 'GET') {
        try {
            const prestamos = await prisma.prestamo.findMany({
                include: {
                    socio: true, // Incluir los datos del socio relacionado
                },
            });
            res.status(200).json(prestamos);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los préstamos' });
        }
    } else if (req.method === 'POST') {
        try {
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

            const nuevoPrestamo = await prisma.prestamo.create({
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
            res.status(201).json(nuevoPrestamo);
        } catch (error) {
            console.error("Error al crear el préstamo:", error);
            res.status(500).json({ error: 'Error al crear el préstamo' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Método ${req.method} no permitido`);
    }
}
