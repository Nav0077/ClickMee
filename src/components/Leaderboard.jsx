import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Leaderboard = (props) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchLeaderboard();

        // Real-time subscription
        const subscription = supabase
            .channel('public:users')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
                // Update local state if the user is in the list or needs to be added
                setUsers(currentUsers => {
                    const updated = [...currentUsers];
                    const index = updated.findIndex(u => u.id === payload.new.id);

                    if (index !== -1) {
                        updated[index] = payload.new;
                    } else {
                        updated.push(payload.new);
                    }

                    // Re-sort and take top 10
                    return updated.sort((a, b) => b.score - a.score).slice(0, 10);
                });
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, () => {
                fetchLeaderboard(); // Easier to just refetch on new user
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchLeaderboard = async () => {
        const { data } = await supabase
            .from('users')
            .select('*')
            .order('score', { ascending: false })
            .limit(10);

        if (data) setUsers(data);
    };

    return (
        <>
            {/* Mobile Drawer Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${props.isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={props.onClose}
            />

            <aside className={`
                fixed left-0 top-0 h-full w-80 
                glass-panel bg-[#0a0a0c]/80 border-l-0 border-y-0 rounded-none
                flex flex-col p-6 overflow-hidden z-40
                transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                md:translate-x-0 cursor-default shadow-2xl shadow-black/50
                ${props.isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white">
                            LEADERBOARD
                        </h2>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Top Players</div>
                    </div>
                    <button
                        onClick={props.onClose}
                        className="md:hidden p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {users.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            layout // Smooth reordering
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                        >
                            <span className={`
                                font-bold w-6 text-center
                                ${index === 0 ? 'text-yellow-400 text-lg shadow-yellow-500/50 drop-shadow-sm' : ''}
                                ${index === 1 ? 'text-gray-300' : ''}
                                ${index === 2 ? 'text-amber-600' : ''}
                                ${index > 2 ? 'text-gray-500' : ''}
                            `}>
                                {index + 1}
                            </span>

                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs overflow-hidden border border-white/10">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{user.username?.substring(0, 2).toUpperCase()}</span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="truncate text-sm font-medium text-gray-200">{user.username}</div>
                            </div>

                            <div className="font-mono text-blue-400 font-bold">
                                {user.score.toLocaleString()}
                            </div>
                        </motion.div>
                    ))}

                    {users.length === 0 && (
                        <div className="text-center text-gray-500 text-sm py-10">
                            Be the first to click!
                        </div>
                    )}
                </div>

                <Link
                    to="/leaderboard"
                    className="mt-6 w-full py-3 text-center rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 transition-all text-sm font-medium text-blue-200 border border-white/10 hover:border-blue-500/30"
                >
                    View Global Leaderboard
                </Link>
            </aside>
        </>
    );
};

export default Leaderboard;
