
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handle(req, res) {
    const socioId = req.query.id;

    if (req.method === 'GET') {
        try {
            const socio = await prisma.socio.findUnique({
                where: { id: parseInt(socioId) },
            });
            if (socio) {
                res.status(200).json(socio);
            } else {
                res.status(404).json({ error: 'Socio no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el socio' });
        }
    } else if (req.method === 'PUT') {
        try {
            const socioActualizado = await prisma.socio.update({
                where: { id: parseInt(socioId) },
                data: req.body,
            });
            res.status(200).json(socioActualizado);
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el socio' });
        }
    } else if (req.method === 'DELETE') {
        try {
            await prisma.socio.delete({
                where: { id: parseInt(socioId) },
            });
            res.status(204).end(); // No content
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el socio' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Método ${req.method} no permitido`);
    }
}
