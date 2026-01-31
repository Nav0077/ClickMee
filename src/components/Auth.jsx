import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './ui/GlassCard';

const Auth = ({ isOpen, onClose, initialView = 'login' }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(initialView === 'login');
    const [message, setMessage] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onClose();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            }
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) setMessage(error.message);
        else setMessage('Check your email for the magic link!');
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
        if (error) setMessage(error.message);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <div className="fixed inset-0 m-auto w-full max-w-md h-fit p-6 z-50 pointer-events-none">
                        <div className="pointer-events-auto">
                            <GlassCard>
                                <h2 className="text-2xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                                <p className="text-gray-400 mb-6">{isLogin ? 'Login to save your score.' : 'Join to compete on the leaderboard.'}</p>

                                {message && (
                                    <div className={`p-3 rounded-lg text-sm mb-4 ${message.includes('Check') ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                                        {message}
                                    </div>
                                )}

                                <button
                                    onClick={handleGoogleLogin}
                                    className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mb-4"
                                >
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                                    Continue with Google
                                </button>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-[#1a1a1a] text-gray-500 rounded">Or with email</span>
                                    </div>
                                </div>

                                <form onSubmit={handleAuth} className="space-y-4">
                                    <div>
                                        <input
                                            type="email"
                                            placeholder="Email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors text-white placeholder:text-gray-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors text-white placeholder:text-gray-500"
                                            required
                                            minLength={6}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20"
                                    >
                                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                                    </button>
                                </form>

                                <div className="mt-4 text-center text-sm">
                                    <button
                                        onClick={handleMagicLink}
                                        type="button"
                                        className="text-blue-400 hover:underline mb-4 block w-full"
                                    >
                                        Send me a Magic Link instead
                                    </button>

                                    <div className="text-gray-400">
                                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                                        <button
                                            onClick={() => setIsLogin(!isLogin)}
                                            className="text-white font-medium hover:underline"
                                        >
                                            {isLogin ? 'Sign Up' : 'Sign In'}
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Auth;
