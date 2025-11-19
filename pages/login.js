
import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../lib/firebase'; // Importa la instancia de auth
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importa la función de inicio de sesión

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // Inicia sesión con correo electrónico y contraseña usando Firebase
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/admin'); // Redirige a la página de administración si el inicio de sesión es exitoso
        } catch (err) {
            // Maneja los errores de autenticación
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Credenciales incorrectas. Inténtalo de nuevo.');
            } else {
                setError('Ocurrió un error inesperado. Por favor, inténtalo más tarde.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-green-800">Acceso de Administrador</h1>
                    <p className="text-md text-gray-600 mt-2">Inicia sesión para gestionar la plataforma</p>
                </header>

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
