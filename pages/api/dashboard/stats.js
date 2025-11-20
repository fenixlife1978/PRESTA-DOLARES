import prisma from '../../../lib/prisma';

export default async function handle(req, res) {
  if (req.method === 'GET') {
    try {
      // Usamos una sintaxis más robusta para asegurar que los valores sean siempre números,
      // incluso si la tabla está vacía.

      const [totalPrestadoResult, pagosAgregadosResult, numeroSocios, numeroPrestamos] = await prisma.$transaction([
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

      // Aseguramos que si no hay datos, el valor sea 0
      const totalPrestado = totalPrestadoResult?._sum?.monto ?? 0;
      const totalRecuperado = pagosAgregadosResult?._sum?.monto ?? 0;
      const capitalRecuperado = pagosAgregadosResult?._sum?.capital ?? 0;
      const interesGanado = pagosAgregadosResult?._sum?.interes ?? 0;

      const stats = {
        totalPrestado,
        totalRecuperado,
        capitalRecuperado,
        interesGanado,
        numeroSocios: numeroSocios ?? 0,
        numeroPrestamos: numeroPrestamos ?? 0,
        // Agregamos un campo de Saldo Pendiente
        saldoPendiente: totalPrestado - capitalRecuperado,
      };

      res.status(200).json(stats);

    } catch (error) {
      console.error("Error al calcular las estadísticas del dashboard:", error);
      // Devolvemos un 500 con un mensaje más detallado para el frontend
      res.status(500).json({ 
          error: 'Error al obtener las estadísticas del Dashboard.',
          details: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
