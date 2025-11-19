
import prisma from '../../../lib/prisma';

export default async function handle(req, res) {
  if (req.method === 'GET') {
    try {
      // Calcular agregaciones de préstamos y pagos en paralelo
      const [totalPrestado, pagosAgregados, numeroSocios, numeroPrestamos] = await prisma.$transaction([
        prisma.prestamo.aggregate({
          _sum: {
            monto: true,
          },
        }),
        prisma.pago.aggregate({
          _sum: {
            monto: true,
            capital: true,
            interes: true,
          },
        }),
        prisma.socio.count(),
        prisma.prestamo.count(),
      ]);

      const stats = {
        totalPrestado: totalPrestado._sum.monto || 0,
        totalRecuperado: pagosAgregados._sum.monto || 0,
        capitalRecuperado: pagosAgregados._sum.capital || 0,
        interesGanado: pagosAgregados._sum.interes || 0,
        numeroSocios: numeroSocios || 0,
        numeroPrestamos: numeroPrestamos || 0,
      };

      res.status(200).json(stats);

    } catch (error) {
      console.error("Error al calcular las estadísticas del dashboard:", error);
      res.status(500).json({ error: 'Error al obtener las estadísticas' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
