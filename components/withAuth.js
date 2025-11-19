
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';

const withAuth = (WrappedComponent) => {
    const Wrapper = (props) => {
        const [user, loading, error] = useAuthState(auth);
        const router = useRouter();

        useEffect(() => {
            if (!loading && !user) {
                router.push('/login');
            }
        }, [user, loading, router]);

        if (loading) {
            return <div className="flex justify-center items-center min-h-screen"><p>Cargando...</p></div>;
        }

        if (user) {
            return <WrappedComponent {...props} />;
        }

        return null;
    };

    return Wrapper;
};

export default withAuth;
