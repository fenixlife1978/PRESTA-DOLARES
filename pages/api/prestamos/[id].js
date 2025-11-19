
import prisma from '../../../lib/prisma';

export default async function handle(req, res) {
  const prestamoId = req.query.id;

  if (req.method === 'GET') {
    try {
      const prestamo = await prisma.prestamo.findUnique({
        where: { id: parseInt(prestamoId) },
        include: { socio: true },
      });
      if (prestamo) {
        res.json(prestamo);
      } else {
        res.status(404).json({ error: 'Préstamo no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el préstamo' });
    }
  } else if (req.method === 'PUT') {
    const { monto, interes, cuotas, estado, socioId } = req.body;
    try {
      const result = await prisma.prestamo.update({
        where: { id: parseInt(prestamoId) },
        data: {
          monto: parseFloat(monto),
          interes: parseFloat(interes),
          cuotas: parseInt(cuotas),
          estado: estado,
          socio: {
            connect: { id: parseInt(socioId) },
          },
        },
      });
      res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al modificar el préstamo' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.prestamo.delete({
        where: { id: parseInt(prestamoId) },
      });
      res.status(204).end(); // No content
    } catch (error) {
        if (error.code === 'P2003') { // Foreign key constraint
             res.status(400).json({ error: 'No se puede eliminar, el préstamo tiene pagos asociados.' });
        } else {
             res.status(500).json({ error: 'Error al eliminar el préstamo' });
        }
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
