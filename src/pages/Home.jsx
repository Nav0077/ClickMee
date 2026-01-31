import { useState, useEffect } from 'react';
import ClickButton from '../components/ClickButton';
import Leaderboard from '../components/Leaderboard';
import Auth from '../components/Auth';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import ProfileModal from '../components/ProfileModal';

import TopPlayerSpotlight from '../components/TopPlayerSpotlight';

const Home = () => {
    const [score, setScore] = useState(0);
    const [clickEffect, setClickEffect] = useState(false);
    const [session, setSession] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [topUser, setTopUser] = useState(null);

    const [showAuth, setShowAuth] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        // Fetch Top #1 Player
        const fetchTopPlayer = async () => {
            const { data } = await supabase
                .from('users')
                .select('username, score, avatar_url')
                .order('score', { ascending: false })
                .limit(1)
                .single();
            if (data) setTopUser(data);
        };
        fetchTopPlayer();

        // Subscribe to changes for realtime updates on the spotlight (optional, but nice)
        const channel = supabase
            .channel('top-player-changes')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'users' },
                () => {
                    // Simple refresh if we see high scores, or just re-fetch periodically
                    // For now, just re-fetching on mount is safe enough or we can add polling
                }
            )
            .subscribe();

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

        return () => {
            subscription.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchUserProfile = async (userId) => {
        const { data } = await supabase.from('users').select('*').eq('id', userId).single();
        if (data) {
            if (data.is_suspended) {
                setIsCheater(true);
                // Don't return, let profile load so we show name, but cheater modal covers everything
            }

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

    const [combo, setCombo] = useState(0);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [motivationMsg, setMotivationMsg] = useState(null);
    const [clickHistory, setClickHistory] = useState([]);
    const [isCheater, setIsCheater] = useState(false);

    const handleClick = async (e) => {
        if (!session) {
            setShowAuth(true);
            return;
        }

        // 0. Check if already suspended
        if (isCheater || userProfile?.is_suspended) {
            return;
        }

        // 1. Trusted Event Check
        if (!e.isTrusted) {
            handleCheatDetection();
            return;
        }

        const now = Date.now();

        // 2. Speed Check (CPS)
        // Keep clicks from the last 1000ms
        const newHistory = [...clickHistory, now].filter(time => now - time < 1000);
        setClickHistory(newHistory);

        if (newHistory.length > 18) {
            handleCheatDetection();
            return;
        }

        // Combo Logic
        const timeDiff = now - lastClickTime;

        let newCombo = 1;
        if (timeDiff < 500) {
            newCombo = combo + 1;
        }
        setCombo(newCombo);
        setLastClickTime(now);

        // Motivational Messages
        if (newCombo % 10 === 0 && newCombo > 0) {
            const msgs = ["GREAT! 🔥", "AMAZING! ⚡", "UNSTOPPABLE! 🚀", "COSMIC! 🌌", "GODLIKE! 👑"];
            const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
            setMotivationMsg({ text: randomMsg, id: now });
            setTimeout(() => setMotivationMsg(null), 1500);
        }

        // Optimistic update
        setScore(prev => prev + 1);

        // Visual effect
        setClickEffect({ x: e.clientX, y: e.clientY, id: Date.now() });
        setTimeout(() => setClickEffect(null), 500);

        // DB Update
        const { error } = await supabase.rpc('increment_score');
        if (error) console.error(error);
    };

    const handleCheatDetection = async () => {
        setIsCheater(true);
        if (session?.user?.id) {
            // Suspend User
            await supabase.from('users').update({ is_suspended: true }).eq('id', session.user.id);
            // Trigger Email Notification (simulated here, would require Edge Function for actual mail)
            console.error("CHEAT DETECTED. Emailing details to basnetnavraj4@gmail.com...");
        }
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

                    {/* Spotlight for #1 Player */}
                    <TopPlayerSpotlight topUser={topUser} />

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

                    {/* Motivational Popup */}
                    <AnimatePresence>
                        {motivationMsg && (
                            <motion.div
                                key={motivationMsg.id}
                                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                                animate={{ scale: 1.2, opacity: 1, y: 0 }}
                                exit={{ scale: 1.5, opacity: 0, y: -50 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 whitespace-nowrap"
                            >
                                <span className="text-4xl md:text-5xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] font-['Orbitron']">
                                    {motivationMsg.text}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
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

                {/* CHEAT DETECTION MODAL */}
                <AnimatePresence>
                    {isCheater && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 z-[100] bg-red-900/90 backdrop-blur-md flex items-center justify-center p-4 cursor-not-allowed"
                        >
                            <motion.div
                                initial={{ scale: 0.8, rotate: -5 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="bg-black border-4 border-red-600 p-8 rounded-3xl max-w-lg text-center shadow-[0_0_100px_rgba(220,38,38,0.8)]"
                            >
                                <div className="text-6xl mb-4">🤬</div>
                                <h2 className="text-4xl font-black text-red-500 mb-4 font-['Orbitron'] tracking-widest uppercase">
                                    CHEAT DETECTED!
                                </h2>
                                <p className="text-white text-xl font-bold font-mono leading-relaxed uppercase border-2 border-red-500/50 p-4 rounded bg-red-500/10">
                                    &quot;yOU ARE USING A UNKNOWN EXTENSION TO AUTO CILICK AND YOU ARE A BIG GAY!!!!!&quot;
                                </p>
                                <div className="mt-8 bg-red-900/50 p-4 rounded-xl border border-red-500/30">
                                    <h3 className="text-red-400 font-bold mb-2 uppercase text-sm tracking-wider">Account Suspended</h3>
                                    <p className="text-white text-xs font-mono">
                                        Details have been sent to admin.
                                        <br />
                                        <span className="block mt-2 font-bold text-yellow-400">
                                            Contact basnetnavraj4@gmail.com to unsuspend.
                                        </span>
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Home;

