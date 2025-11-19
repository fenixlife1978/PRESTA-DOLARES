
import prisma from '../../../lib/prisma';

export default async function handle(req, res) {
  const socioId = req.query.id;

  if (req.method === 'GET') {
    try {
      const socio = await prisma.socio.findUnique({
        where: { id: parseInt(socioId) },
      });
      if (socio) {
        res.json(socio);
      } else {
        res.status(404).json({ error: 'Socio no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el socio' });
    }
  } else if (req.method === 'PUT') {
    const { nombreCompleto, cedula, telefono, direccion } = req.body;
    try {
      const result = await prisma.socio.update({
        where: { id: parseInt(socioId) },
        data: {
          nombreCompleto,
          cedula,
          telefono,
          direccion,
        },
      });
      res.json(result);
    } catch (error) {
        if (error.code === 'P2002') { // Prisma unique constraint violation
            res.status(409).json({ error: 'La cédula ya está registrada por otro socio.' });
        } else {
            res.status(500).json({ error: 'Error al modificar el socio' });
        }
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.socio.delete({
        where: { id: parseInt(socioId) },
      });
      res.status(204).end(); // No content
    } catch (error) {
        if (error.code === 'P2003') { // Foreign key constraint failed
            res.status(400).json({ error: 'No se puede eliminar el socio porque tiene préstamos o pagos asociados.' });
        } else {
            res.status(500).json({ error: 'Error al eliminar el socio' });
        }
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
