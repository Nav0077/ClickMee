import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TopPlayerSpotlight = ({ topUser }) => {
    const [messageIndex, setMessageIndex] = useState(0);
    const messages = [
        "SEE HE/SHE IS PRO 👑",
        "SHOW YOUR POTENTIAL 🔥",
        "CAN YOU BEAT THEM? 👀",
        "CURRENT #1 CHAMPION 🏆"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    if (!topUser) return null;

    return (
        <div className="relative mb-6 z-20 w-64 text-center pointer-events-none">
            {/* Cloud Bubble Container */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
            >
                {/* The Cloud/Bubble */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative">
                    {/* Tail of the bubble pointing down */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/10 backdrop-blur-md border-r border-b border-white/20 rotate-45 transform"></div>

                    {/* Animated Text */}
                    <div className="h-6 overflow-hidden relative mb-1">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={messageIndex}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <span className="text-[10px] sm:text-xs font-bold text-blue-200 tracking-widest font-['Orbitron']">
                                    {messages[messageIndex]}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Player Name */}
                    <div className="flex flex-col items-center gap-1 mt-1">
                        <div className="w-8 h-8 rounded-full border border-yellow-400 p-0.5 shadow-[0_0_10px_rgba(250,204,21,0.3)]">
                            {topUser.avatar_url ? (
                                <img src={topUser.avatar_url} alt="Pro" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-yellow-400/20 flex items-center justify-center text-[10px] text-yellow-400">
                                    👑
                                </div>
                            )}
                        </div>
                        <span className="text-white font-bold text-sm drop-shadow-md">
                            {topUser.username}
                        </span>
                        <span className="text-[10px] text-yellow-400/80 font-mono">
                            {parseInt(topUser.score).toLocaleString()}
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TopPlayerSpotlight;
