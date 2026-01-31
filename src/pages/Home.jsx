import { useState, useEffect } from 'react';
import ClickButton from '../components/ClickButton';
import Leaderboard from '../components/Leaderboard';
import Auth from '../components/Auth';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import ProfileModal from '../components/ProfileModal';

const Home = () => {
    const [score, setScore] = useState(0);
    const [clickEffect, setClickEffect] = useState(false);
    const [session, setSession] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    const [showAuth, setShowAuth] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchUserProfile(session.user.id);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchUserProfile(session.user.id);
            else {
                setScore(0);
                setUserProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (userId) => {
        const { data } = await supabase.from('users').select('*').eq('id', userId).single();
        if (data) {
            // Identity Sync: Check if we have a generic name but better info from metadata
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user?.user_metadata?.full_name && data.username.startsWith('User_')) {
                const googleName = session.user.user_metadata.full_name;
                const googleAvatar = session.user.user_metadata.avatar_url;

                const { error } = await supabase
                    .from('users')
                    .update({
                        username: googleName,
                        avatar_url: googleAvatar || data.avatar_url
                    })
                    .eq('id', userId);

                if (!error) {
                    setUserProfile({ ...data, username: googleName, avatar_url: googleAvatar || data.avatar_url });
                    setScore(data.score || 0);
                    return;
                } else if (error.code === '23505') {
                    // Name taken, try appending random number
                    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                    const newName = `${googleName}_${randomSuffix}`;

                    const { error: retryError } = await supabase
                        .from('users')
                        .update({
                            username: newName,
                            avatar_url: googleAvatar || data.avatar_url
                        })
                        .eq('id', userId);

                    if (!retryError) {
                        setUserProfile({ ...data, username: newName, avatar_url: googleAvatar || data.avatar_url });
                        setScore(data.score || 0);
                        return;
                    }
                }
            }

            setUserProfile(data);
            setScore(data.score || 0);
        }
    };

    const handleClick = async (e) => {
        if (!session) {
            setShowAuth(true);
            return;
        }

        // Optimistic update
        setScore(prev => prev + 1);

        // Visual effect
        // const rect = e.target.getBoundingClientRect(); // Unused
        setClickEffect({ x: e.clientX, y: e.clientY, id: Date.now() });
        setTimeout(() => setClickEffect(null), 500);

        // DB Update
        // Using RPC for atomic increment
        const { error } = await supabase.rpc('increment_score');

        if (error) console.error(error);
    };

    return (
        <div className="h-screen w-screen bg-[#050507] text-white overflow-hidden relative selection:bg-blue-500/30 font-sans">

            {/* Cosmic Background Particles (CSS only for performance) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-50 shadow-[0_0_10px_white]" />
                <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-700 opacity-60 shadow-[0_0_15px_blue]" />
                <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-blue-900/10 rounded-full blur-[100px] animate-pulse-glow pointer-events-none" />
            </div>

            <Leaderboard isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* HUD Layer */}
            <main className="relative z-10 w-full h-full flex items-center justify-center">

                {/* Top HUD */}
                <Navbar
                    score={score}
                    session={session}
                    userProfile={userProfile}
                    onOpenMenu={() => setIsMenuOpen(true)}
                    onOpenProfile={() => setShowProfile(true)}
                    onOpenAuth={() => setShowAuth(true)}
                />

                {/* Left Dock - Quick Access Leaderboard */}
                <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => setIsMenuOpen(true)}
                    className="fixed left-0 top-1/2 -translate-y-1/2 glass-panel border-l-0 rounded-l-none rounded-r-xl p-4 hidden md:flex flex-col items-center gap-4 hover:bg-white/10 transition-colors group"
                >
                    <span className="writing-vertical-rl text-xs font-bold tracking-[0.3em] text-gray-400 group-hover:text-white transition-colors rotate-180">
                        LEADERBOARD
                    </span>
                    <div className="w-1 h-12 bg-white/10 rounded-full group-hover:bg-blue-500/50 transition-colors" />
                </motion.button>

                {/* Center Reactor */}
                <div className="relative flex flex-col items-center gap-8">
                    {/* Site Description */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-center space-y-2 pointer-events-none relative z-20"
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] font-['Orbitron']">
                            CLICKMEE
                        </h1>
                        <p className="text-gray-400 font-medium tracking-[0.15em] md:tracking-[0.2em] text-[10px] sm:text-xs md:text-sm uppercase max-w-xs md:max-w-md mx-auto leading-relaxed px-4">
                            YOU ARE LOOSER, SHOW YOUR TALENT
                        </p>
                    </motion.div>

                    <ClickButton onClick={handleClick} disabled={false} />

                    {/* Floating Particles on Click */}
                    {clickEffect && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 1, y: 0 }}
                            animate={{ scale: 2, opacity: 0, y: -200 }}
                            className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center"
                        >
                            <span className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] font-['Orbitron']">
                                +1
                            </span>
                        </motion.div>
                    )}
                </div>

                {!session && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-20 left-1/2 -translate-x-1/2 glass-panel px-8 py-4 rounded-full border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.1)] z-40"
                    >
                        <p className="text-yellow-100/80 text-sm font-medium tracking-wide">
                            ⚠ SYSTEM NOTICE: LOG IN TO SAVE PROGRESS
                        </p>
                    </motion.div>
                )}

                {/* Credits Footer */}
                <div className="fixed bottom-4 left-0 right-0 text-center pointer-events-none opacity-50 text-[10px] md:text-xs font-mono tracking-widest text-gray-500">
                    <span className="text-blue-400/80">MYYANI TECHNOLOGY</span> <span className="mx-2">|</span> <span>MADE BY NAV</span>
                </div>

                <Auth isOpen={showAuth} onClose={() => setShowAuth(false)} />
                <ProfileModal
                    isOpen={showProfile}
                    onClose={() => setShowProfile(false)}
                    session={session}
                    userProfile={userProfile}
                    onProfileUpdate={(newUrl) => setUserProfile({ ...userProfile, avatar_url: newUrl })}
                />
            </main>
        </div>
    );
};

export default Home;

