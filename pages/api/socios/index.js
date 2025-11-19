
import { db } from '../../../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { nombreCompleto, cedula, telefono, direccion } = req.body;
      if (!nombreCompleto || !cedula) {
        return res.status(400).json({ error: 'Nombre completo y cédula son requeridos' });
      }
      const docRef = await addDoc(collection(db, "socios"), {
        nombreCompleto,
        cedula,
        telefono,
        direccion,
        fechaCreacion: new Date().toISOString(),
      });
      res.status(201).json({ id: docRef.id });
    } catch (error) {
      console.error("Error adding document: ", error);
      res.status(500).json({ error: 'Error al guardar en la base de datos' });
    }
  } else if (req.method === 'GET') {
    try {
      const querySnapshot = await getDocs(collection(db, "socios"));
      const socios = [];
      querySnapshot.forEach((doc) => {
        socios.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(socios);
    } catch (error) {
      console.error("Error getting documents: ", error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
