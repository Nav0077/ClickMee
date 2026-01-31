
import { supabase } from '../supabaseClient';

const Navbar = ({ score, session, userProfile, onOpenMenu, onOpenProfile, onOpenAuth }) => {
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

            <div className="flex items-center gap-3 ml-auto pointer-events-auto">
                <div className="glass-panel px-4 py-2 rounded-full border border-white/10 text-sm font-medium flex items-center gap-2">
                    <span className="text-gray-400">Score</span>
                    <span className="text-blue-400 font-bold text-lg">{parseInt(score || 0).toLocaleString()}</span>
                </div>

                {session ? (
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:block text-right cursor-pointer group" onClick={onOpenProfile}>
                            <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Playing as</div>
                            <div className="text-sm font-bold text-white leading-none group-hover:text-blue-400 transition-colors">
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
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full transition-all font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95 text-sm"
                    >
                        Login
                    </button>
                )}
            </div>
        </header>
    );
};

export default Navbar;
