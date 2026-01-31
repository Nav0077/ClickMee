import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import GlassCard from '../components/ui/GlassCard';

const LeaderboardFull = () => {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 50;
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchUsers(0);
    }, []);

    const fetchUsers = async (pageIndex) => {
        const from = pageIndex * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data } = await supabase
            .from('users')
            .select('*', { count: 'exact' })
            .order('score', { ascending: false })
            .range(from, to);

        if (data) {
            if (pageIndex === 0) setUsers(data);
            else setUsers(prev => [...prev, ...data]);

            if (data.length < PAGE_SIZE) setHasMore(false);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchUsers(nextPage);
    };

    return (
        <div className="min-h-screen bg-[#0f0f13] text-white p-6 md:p-12">
            <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 font-medium">
                ← Back to Game
            </Link>

            <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Global Leaderboard
            </h1>

            <GlassCard className="max-w-4xl mx-auto p-0 overflow-hidden">
                <div className="grid grid-cols-12 gap-2 md:gap-4 p-4 border-b border-white/10 font-bold text-gray-400 text-xs md:text-sm uppercase tracking-wider bg-white/5">
                    <div className="col-span-2 md:col-span-1">Rank</div>
                    <div className="col-span-6 md:col-span-7">Player</div>
                    <div className="col-span-4 text-right">Score</div>
                </div>

                <div className="divide-y divide-white/5 p-4">
                    {users.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index % 10 * 0.05 }}
                            className="grid grid-cols-12 gap-2 md:gap-4 p-3 md:p-4 hover:bg-white/5 transition-colors items-center rounded-lg"
                        >
                            <div className={`
                                col-span-2 md:col-span-1 font-bold text-sm md:text-base
                                ${index === 0 ? 'text-yellow-400 drop-shadow-sm' : ''}
                                ${index === 1 ? 'text-gray-300' : ''}
                                ${index === 2 ? 'text-amber-600' : ''}
                                ${index > 2 ? 'text-gray-500' : ''}
                            `}>
                                #{index + 1}
                            </div>
                            <div className="col-span-6 md:col-span-7 flex items-center gap-2 md:gap-3">
                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] md:text-xs overflow-hidden border border-white/10 shrink-0">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        user.username?.substring(0, 2).toUpperCase()
                                    )}
                                </div>
                                <span className="text-sm md:text-base truncate">{user.username}</span>
                            </div>
                            <div className="col-span-4 text-right font-mono text-blue-400 font-bold text-sm md:text-base">
                                {user.score.toLocaleString()}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {hasMore && (
                    <div className="p-4 text-center border-t border-white/10">
                        <button
                            onClick={loadMore}
                            className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                            Load More...
                        </button>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default LeaderboardFull;
