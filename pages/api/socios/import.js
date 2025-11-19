
import prisma from '../../../lib/prisma';
import formidable from 'formidable';
import xlsx from 'xlsx';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Desactivamos el parser por defecto para usar formidable
  },
};

export default async function handle(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: 'Error al procesar el archivo.' });
        return;
      }

      const filePath = files.file.filepath;
      
      try {
        // Leer el archivo de la ruta temporal
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir la hoja a JSON - header: 1 para obtener un array de arrays
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        if (data.length < 2) {
            return res.status(400).json({ error: 'El archivo Excel está vacío o no tiene filas de datos.' });
        }

        // Asumimos que la primera columna (índice 0) es 'Nombre y Apellido'
        // Empezamos desde la segunda fila (índice 1) para saltar el encabezado
        const sociosToCreate = data
          .slice(1) // Saltar encabezado
          .map(row => ({ nombreCompleto: row[0] })) // Mapear la primera columna
          .filter(socio => socio.nombreCompleto && socio.nombreCompleto.trim() !== ''); // Filtrar filas vacías

        if (sociosToCreate.length === 0) {
            return res.status(400).json({ error: 'No se encontraron nombres válidos en la primera columna del archivo.' });
        }

        // Crear los socios en la base de datos
        const result = await prisma.socio.createMany({
          data: sociosToCreate,
          skipDuplicates: true, // No crear socios si ya existen (basado en campos unique, en este caso ninguno)
        });

        // Eliminar el archivo temporal después de procesarlo
        fs.unlinkSync(filePath);

        res.status(201).json({ message: `Se importaron ${result.count} nuevos socios.` });

      } catch (error) {
        console.error(error);
        // Asegurarse de que el archivo temporal se elimine incluso si hay un error
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        res.status(500).json({ error: 'Ocurrió un error al leer o procesar el archivo Excel.' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
