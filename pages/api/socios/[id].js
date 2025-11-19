
import { db } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const docRef = doc(db, "socios", id);

    switch (req.method) {
      case 'GET':
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          res.status(200).json({ id: docSnap.id, ...docSnap.data() });
        } else {
          res.status(404).json({ error: "Socio no encontrado" });
        }
        break;

      case 'PUT':
        await updateDoc(docRef, req.body);
        res.status(200).json({ id });
        break;

      case 'DELETE':
        await deleteDoc(docRef);
        res.status(204).end(); // No Content
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(`Error processing document ${id}:`, error);
    res.status(500).json({ error: `Error al procesar la solicitud para el socio ${id}` });
  }
}
