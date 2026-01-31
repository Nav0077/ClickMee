
import { supabase } from '../supabaseClient';

const Navbar = ({ score, session, userProfile, onOpenMenu, onOpenProfile, onOpenAuth }) => {
    // Level System Logic
    const currentScore = parseInt(score || 0);
    const level = Math.floor(Math.sqrt(currentScore) / 5) + 1; // Simple progression check
    const nextLevelScore = Math.pow((level) * 5, 2);
    const prevLevelScore = Math.pow((level - 1) * 5, 2);
    const progress = Math.min(100, Math.max(0, ((currentScore - prevLevelScore) / (nextLevelScore - prevLevelScore)) * 100));

    // Rank Names
    const getRankName = (lvl) => {
        if (lvl > 50) return 'LEGEND';
        if (lvl > 30) return 'TITAN';
        if (lvl > 20) return 'MASTER';
        if (lvl > 10) return 'COMMANDER';
        if (lvl > 5) return 'VETERAN';
        return 'NOVICE';
    };

    return (
        <header className="absolute top-6 left-6 right-6 flex items-center justify-between z-50 pointer-events-none">
            <button
                onClick={onOpenMenu}
                className="pointer-events-auto md:hidden p-3 rounded-full glass-button text-white hover:bg-white/10 transition-colors"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>

            <div className="flex items-center gap-2 md:gap-4 ml-auto pointer-events-auto">
                {/* Level Badge - Visible on Mobile now */}
                <div className="flex flex-col items-end mr-1 md:mr-2">
                    <div className="text-[8px] md:text-[10px] font-bold text-gray-500 tracking-widest uppercase">{getRankName(level)}</div>
                    <div className="text-white font-['Orbitron'] font-bold text-xs md:text-sm tracking-wider">LVL {level}</div>
                    {/* Progress Bar - Hidden on very small mobile */}
                    <div className="hidden sm:block w-16 md:w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div
                            className="h-full bg-white shadow-[0_0_10px_white]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="glass-panel px-3 py-1 md:px-4 md:py-2 rounded-full border border-white/10 text-xs md:text-sm font-medium flex items-center gap-2">
                    <span className="text-gray-400 uppercase text-[10px] md:text-xs tracking-wider">Score</span>
                    <span className="text-white font-['Orbitron'] font-bold text-sm md:text-lg tracking-wide">{currentScore.toLocaleString()}</span>
                </div>

                {session ? (
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:block text-right cursor-pointer group" onClick={onOpenProfile}>
                            <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">ID</div>
                            <div className="text-sm font-bold text-white leading-none group-hover:text-white transition-colors">
                                {userProfile?.username || 'Player'}
                            </div>
                        </div>
                        <button
                            onClick={() => supabase.auth.signOut()}
                            className="glass-button p-2 sm:px-4 sm:py-2 rounded-full transition-colors font-medium text-xs sm:text-sm text-gray-300 hover:text-white"
                        >
                            <span className="hidden sm:inline">Logout</span>
                            <span className="sm:hidden">Exit</span>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onOpenAuth}
                        className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-full transition-all font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95 text-sm uppercase tracking-wide"
                    >
                        Login
                    </button>
                )}
            </div>
        </header>
    );
};

export default Navbar;
