
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handle(req, res) {
    const prestamoId = req.query.id;

    if (req.method === 'GET') {
        try {
            const prestamo = await prisma.prestamo.findUnique({
                where: { id: parseInt(prestamoId) },
                include: { socio: true, pagos: true },
            });
            if (prestamo) {
                res.status(200).json(prestamo);
            } else {
                res.status(404).json({ error: 'Préstamo no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el préstamo' });
        }
    } else if (req.method === 'PUT') {
        try {
            const prestamoActualizado = await prisma.prestamo.update({
                where: { id: parseInt(prestamoId) },
                data: req.body,
            });
            res.status(200).json(prestamoActualizado);
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el préstamo' });
        }
    } else if (req.method === 'DELETE') {
        try {
            // Eliminar pagos asociados antes de eliminar el préstamo
            await prisma.pago.deleteMany({
                where: { prestamoId: parseInt(prestamoId) },
            });

            await prisma.prestamo.delete({
                where: { id: parseInt(prestamoId) },
            });

            res.status(204).end(); // No content
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el préstamo' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Método ${req.method} no permitido`);
    }
}
