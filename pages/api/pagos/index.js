
import prisma from '../../../lib/prisma';

export default async function handle(req, res) {
  // La creación de un pago ahora se maneja en /api/prestamos/[id]/pagos
  if (req.method === 'GET') {
    try {
      const pagos = await prisma.pago.findMany({
        include: {
          prestamo: {
            include: {
              socio: true,
            },
          },
        },
        orderBy: {
          fecha: 'desc',
        },
      });
      res.json(pagos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los pagos' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
