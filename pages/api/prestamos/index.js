
import prisma from '../../../lib/prisma';

export default async function handle(req, res) {
  if (req.method === 'GET') {
    try {
      const prestamos = await prisma.prestamo.findMany({
        include: {
          socio: true, // Incluir los datos del socio relacionado
        },
        orderBy: {
          fecha: 'desc',
        },
      });
      res.json(prestamos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los préstamos' });
    }
  } else if (req.method === 'POST') {
    const { monto, interes, cuotas, socioId } = req.body;

    try {
      const result = await prisma.prestamo.create({
        data: {
          monto: parseFloat(monto),
          interes: parseFloat(interes),
          cuotas: parseInt(cuotas),
          socio: {
            connect: { id: parseInt(socioId) },
          },
        },
      });
      res.status(201).json(result);
    } catch (error) {
      console.error(error); // Log el error para debugging
      res.status(500).json({ error: 'Error al crear el préstamo' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
