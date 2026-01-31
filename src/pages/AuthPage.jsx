import { useNavigate, useLocation } from 'react-router-dom';
import Auth from '../components/Auth';
import { useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isRegister = location.pathname === '/register';
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate('/');
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) navigate('/');
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center p-4">
            {/* We force specific view (login/register) but keep it as a 'modal' generic look centered on screen */}
            <Auth
                isOpen={true}
                onClose={() => navigate('/')}
                initialView={isRegister ? 'register' : 'login'}
            />
        </div>
    );
};

export default AuthPage;
