
import prisma from '../../../lib/prisma';

export default async function handle(req, res) {
  if (req.method === 'POST') {
    try {
      // 1. Obtener todos los préstamos activos con interés porcentual
      const prestamosActivos = await prisma.prestamo.findMany({
        where: {
          estado: 'Activo',
          tipoInteres: 'Porcentual',
          interes: { gt: 0 },
        },
        include: {
          pagos: { where: { capital: { gt: 0 } } }, // Solo necesitamos pagos a capital para el saldo
        },
      });

      let updatedCount = 0;

      // Usar un array para las promesas de actualización
      const updatePromises = prestamosActivos.map(async (prestamo) => {
        // 2. Calcular el saldo de capital actual
        const totalCapitalPagado = prestamo.pagos.reduce((sum, pago) => sum + pago.capital, 0);
        const saldoCapital = prestamo.monto - totalCapitalPagado;

        if (saldoCapital > 0) {
          // 3. Calcular el interés mensual sobre el saldo de capital
          const tasaInteresMensual = prestamo.interes / 100;
          const interesCalculado = saldoCapital * tasaInteresMensual;

          // 4. Añadir el interés calculado al saldoInteres existente
          await prisma.prestamo.update({
            where: { id: prestamo.id },
            data: {
              saldoInteres: {
                increment: interesCalculado,
              },
            },
          });
          updatedCount++;
        }
      });

      // Ejecutar todas las actualizaciones en paralelo
      await Promise.all(updatePromises);

      res.status(200).json({ message: `Cálculo de interés completado. ${updatedCount} préstamos actualizados.` });

    } catch (error) {
      console.error("Error al calcular el interés mensual:", error);
      res.status(500).json({ error: 'Error interno al calcular el interés.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
