
import { db } from '../../../lib/firebase';
import { collection, addDoc, getDocs, doc, getDoc, runTransaction, writeBatch } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { prestamoId, monto, fecha } = req.body;

      if (!prestamoId || !monto) {
        return res.status(400).json({ error: 'El ID del préstamo y el monto son requeridos.' });
      }

      const prestamoRef = doc(db, "prestamos", prestamoId);
      
      // Usar una transacción para asegurar la atomicidad de la operación
      const nuevoSaldo = await runTransaction(db, async (transaction) => {
        const prestamoSnap = await transaction.get(prestamoRef);
        if (!prestamoSnap.exists()) {
          throw new Error("El préstamo no existe.");
        }

        const prestamoData = prestamoSnap.data();
        const saldoActual = prestamoData.saldoPendiente ?? prestamoData.monto;
        const nuevoSaldoPendiente = saldoActual - monto;

        // Crear el documento de pago
        const pagoRef = doc(collection(db, "pagos")); // Generar referencia para el nuevo pago
        transaction.set(pagoRef, {
            prestamoId,
            monto: parseFloat(monto),
            fecha: fecha || new Date().toISOString(),
            socioId: prestamoData.socioId, // Guardar el id del socio para facilitar consultas
        });

        // Actualizar el saldo pendiente del préstamo
        transaction.update(prestamoRef, { saldoPendiente: nuevoSaldoPendiente });

        // Si el saldo es 0 o menos, actualizar estado a 'pagado'
        if (nuevoSaldoPendiente <= 0) {
            transaction.update(prestamoRef, { estado: 'pagado' });
        }

        return nuevoSaldoPendiente;
      });

      res.status(201).json({ success: true, nuevoSaldo });

    } catch (error) {
      console.error("Error al procesar el pago: ", error);
      res.status(500).json({ error: error.message || 'Error al guardar el pago.' });
    }
  
  } else if (req.method === 'GET') {
    // Lógica para obtener todos los pagos (opcional, si se necesita una lista global)
    try {
        const { prestamoId } = req.query; // Filtrar pagos por préstamo si se provee el ID
        let querySnapshot;
        if (prestamoId) {
            const q = query(collection(db, "pagos"), where("prestamoId", "==", prestamoId));
            querySnapshot = await getDocs(q);
        } else {
            querySnapshot = await getDocs(collection(db, "pagos"));
        }
        
        const pagos = [];
        querySnapshot.forEach((doc) => {
            pagos.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(pagos);
    } catch (error) {
        console.error("Error al obtener los pagos: ", error);
        res.status(500).json({ error: 'Error al obtener los datos de pagos' });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
