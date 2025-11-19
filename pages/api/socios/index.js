
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handle(req, res) {
    if (req.method === 'GET') {
        try {
            const socios = await prisma.socio.findMany();
            res.status(200).json(socios);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los socios' });
        }
    } else if (req.method === 'POST') {
        try {
            const nuevoSocio = await prisma.socio.create({
                data: req.body,
            });
            res.status(201).json(nuevoSocio);
        } catch (error) {
            res.status(500).json({ error: 'Error al crear el socio' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Método ${req.method} no permitido`);
    }
}
