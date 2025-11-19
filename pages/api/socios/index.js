
import prisma from '../../../lib/prisma';

export default async function handle(req, res) {
  if (req.method === 'GET') {
    try {
      const socios = await prisma.socio.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      res.json(socios);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener socios' });
    }
  } else if (req.method === 'POST') {
    const { nombreCompleto, cedula, telefono, direccion } = req.body;

    try {
      const result = await prisma.socio.create({
        data: {
          nombreCompleto,
          cedula,
          telefono,
          direccion,
        },
      });
      res.status(201).json(result);
    } catch (error) {
        if (error.code === 'P2002') { // Prisma unique constraint violation
            res.status(409).json({ error: 'La cédula ya está registrada.' });
        } else {
            res.status(500).json({ error: 'Error al crear el socio' });
        }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
