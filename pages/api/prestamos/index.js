
import prisma from '../../../lib/prisma';

export default async function handle(req, res) {
  if (req.method === 'GET') {
    try {
      const prestamos = await prisma.prestamo.findMany({
        include: {
          socio: true, // Incluir los datos del socio relacionado
        },
        orderBy: {
          fechaOtorgamiento: 'desc',
        },
      });
      res.json(prestamos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los préstamos' });
    }
  } else if (req.method === 'POST') {
    const {
      monto,
      interes,
      cuotas,
      socioId,
      fechaOtorgamiento,
      tipoPrestamo,
      tipoInteres,
      esLibreAbono
    } = req.body;

    // --- Validación de datos ---
    if (!monto || !socioId || !fechaOtorgamiento || !tipoPrestamo || !tipoInteres) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }
    if (tipoPrestamo === 'Estandar' && (cuotas === null || cuotas === undefined)) {
        return res.status(400).json({ error: 'El campo "cuotas" es obligatorio para préstamos estándar.' });
    }
    if (tipoInteres !== 'SinInteres' && (interes === null || interes === undefined)){
        return res.status(400).json({ error: 'El campo "interés" es obligatorio si el tipo de interés no es cero.' });
    }
    // --- Fin Validación ---

    try {
      const result = await prisma.prestamo.create({
        data: {
          monto: parseFloat(monto),
          interes: interes ? parseFloat(interes) : null,
          cuotas: cuotas ? parseInt(cuotas) : null,
          socio: {
            connect: { id: parseInt(socioId) },
          },
          fechaOtorgamiento: new Date(fechaOtorgamiento),
          tipoPrestamo: tipoPrestamo,
          tipoInteres: tipoInteres,
          esLibreAbono: esLibreAbono || false,
        },
      });
      res.status(201).json(result);
    } catch (error) {
      console.error("Error al crear el préstamo:", error); 
      res.status(500).json({ error: 'Error interno al crear el préstamo' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
