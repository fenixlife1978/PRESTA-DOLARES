
import { db } from '../../../lib/firebase';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const prestamoData = req.body;
      // Validacion basica
      if (!prestamoData.socioId || !prestamoData.monto) {
        return res.status(400).json({ error: 'Faltan datos esenciales para el préstamo.' });
      }

      // Asegurarse de que el socio existe
      const socioRef = doc(db, "socios", prestamoData.socioId);
      const socioSnap = await getDoc(socioRef);
      if (!socioSnap.exists()) {
          return res.status(404).json({ error: "El socio seleccionado no existe." });
      }

      const docRef = await addDoc(collection(db, "prestamos"), {
        ...prestamoData,
        fechaCreacion: new Date().toISOString(),
      });
      res.status(201).json({ id: docRef.id });
    } catch (error) {
      console.error("Error al crear el préstamo: ", error);
      res.status(500).json({ error: 'Error al guardar el préstamo en la base de datos' });
    }
  } else if (req.method === 'GET') {
    try {
      const querySnapshot = await getDocs(collection(db, "prestamos"));
      const prestamos = [];
      querySnapshot.forEach((doc) => {
        prestamos.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(prestamos);
    } catch (error) {
      console.error("Error al obtener los préstamos: ", error);
      res.status(500).json({ error: 'Error al obtener los datos de préstamos' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
