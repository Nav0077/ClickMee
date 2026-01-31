import { motion } from 'framer-motion';

const ClickButton = ({ onClick, disabled }) => {
    return (
        <div className="relative group">
            {/* Outer Rotating Ring */}
            <div className="absolute inset-0 rounded-full border border-blue-500/30 border-dashed animate-orbit-slow pointer-events-none" />

            {/* Middle Rotating Ring (Counter-clockwise) */}
            <div className="absolute inset-4 rounded-full border border-purple-500/30 border-t-transparent border-l-transparent animate-orbit-medium pointer-events-none" style={{ animationDirection: 'reverse' }} />

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                disabled={disabled}
                className="
                    relative w-48 h-48 sm:w-56 sm:h-56 rounded-full 
                    bg-[#0a0a0c]
                    shadow-[0_0_50px_rgba(59,130,246,0.2)]
                    text-white
                    border border-white/10
                    flex flex-col items-center justify-center
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300
                    z-10
                    animate-pulse-glow
                    group-hover:shadow-[0_0_80px_rgba(139,92,246,0.5)]
                "
            >
                {/* Core Gradient */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-900/50 via-purple-900/30 to-black pointer-events-none" />

                {/* Inner Glow Info */}
                <div className="relative z-20 flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-lg group-hover:from-white group-hover:to-blue-200 transition-all duration-300 font-['Orbitron']">
                        CLICK
                    </span>
                    <span className="text-[10px] text-blue-300/60 font-mono tracking-[0.4em] mt-1 group-hover:text-blue-200/80">
                        INITIATE
                    </span>
                </div>

                {/* Decorative Tech Lines */}
                <div className="absolute top-0 bottom-0 w-[1px] bg-white/5" />
                <div className="absolute left-0 right-0 h-[1px] bg-white/5" />
            </motion.button>
        </div>
    );
};

export default ClickButton;
