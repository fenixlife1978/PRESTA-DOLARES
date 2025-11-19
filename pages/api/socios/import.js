
import { PrismaClient } from '@prisma/client';
import { IncomingForm } from 'formidable';
import xlsx from 'xlsx';

const prisma = new PrismaClient();

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handle(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error al procesar el archivo.' });
        }

        const file = files.file;

        if (!file) {
            return res.status(400).json({ error: 'No se encontró ningún archivo.' });
        }

        try {
            const workbook = xlsx.readFile(file[0].filepath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

            // Validar que el archivo tiene las columnas esperadas
            const headers = data[0];
            if (!headers.includes('nombreCompleto')) {
                return res.status(400).json({ error: 'El archivo debe tener una columna "nombreCompleto".' });
            }

            const sociosToCreate = data.slice(1).map(row => {
                const socioData = {};
                headers.forEach((header, index) => {
                    socioData[header] = row[index];
                });
                return socioData;
            }).filter(socio => socio.nombreCompleto); // Filtrar filas sin nombre

            await prisma.socio.createMany({
                data: sociosToCreate,
                skipDuplicates: true, // No importar socios con cédula duplicada si se añade esa lógica
            });

            res.status(200).json({ message: `${sociosToCreate.length} socios importados correctamente.` });
        } catch (error) {
            res.status(500).json({ error: 'Error al leer o guardar los datos del archivo.' });
        }
    });
}
