
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = false, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={hoverEffect ? { y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)" } : {}}
            className={`glass-panel rounded-2xl p-6 relative overflow-hidden ${className}`}
            {...props}
        >
            {/* Subtle shine effect on top border */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Decoration */}
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl rounded-full pointer-events-none" />
        </motion.div>
    );
};

export default GlassCard;
