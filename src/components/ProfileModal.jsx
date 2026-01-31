import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './ui/GlassCard';

const ProfileModal = ({ isOpen, onClose, session, userProfile, onProfileUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatar_url || null);
    const [username, setUsername] = useState(userProfile?.username || '');
    const [isEditingName, setIsEditingName] = useState(false);
    const [message, setMessage] = useState('');

    const updateUsername = async () => {
        try {
            setUploading(true);
            const { error } = await supabase
                .from('users')
                .update({ username: username })
                .eq('id', session.user.id);

            if (error) throw error;

            setMessage('Username updated!');
            setIsEditingName(false);
            // We need to notify parent component to refresh stats, but for now we just rely on local state or page refresh
            // If onProfileUpdate supported full object, we'd use that.
            // Ideally onProfileUpdate should just trigger a re-fetch in Home.
            if (onProfileUpdate) onProfileUpdate(avatarUrl); // Keeping avatarUrl or maybe we change onProfileUpdate signature later

        } catch (error) {
            setMessage(error.message);
        } finally {
            setUploading(false);
        }
    };

    const uploadAvatar = async (event) => {
        try {
            setUploading(true);
            setMessage('');

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            // Update Users Table
            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar_url: publicUrl })
                .eq('id', session.user.id);

            if (updateError) {
                throw updateError;
            }

            setAvatarUrl(publicUrl);
            setMessage('Avatar updated successfully!');
            if (onProfileUpdate) onProfileUpdate(publicUrl);

        } catch (error) {
            setMessage(error.message);
        } finally {
            setUploading(false);
        }
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
                    <div className="fixed inset-0 m-auto w-full max-w-sm h-fit p-6 z-50 pointer-events-none">
                        <div className="pointer-events-auto">
                            <GlassCard className="flex flex-col items-center">

                                <h2 className="text-xl font-bold mb-6">Edit Profile</h2>

                                <div className="relative w-24 h-24 mb-6 group">
                                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-blue-500/50 flex items-center justify-center bg-white/5">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-gray-500">{userProfile?.username?.substring(0, 2).toUpperCase()}</span>
                                        )}
                                    </div>
                                    {/* Overlay for hover effect */}
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer pointer-events-none">
                                        <span className="text-xs font-medium text-white">Change</span>
                                    </div>
                                </div>

                                {message && (
                                    <div className={`w-full p-2 mb-4 text-center text-xs rounded ${message.includes('success') ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                                        {message}
                                    </div>
                                )}

                                <div className="w-full">
                                    <label className="block w-full cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg text-center transition-colors shadow-lg">
                                        {uploading ? 'Uploading...' : 'Upload New Photo'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={uploadAvatar}
                                            disabled={uploading}
                                            className="hidden"
                                        />
                                    </label>
                                </div>


                                <div className="mt-6 w-full pt-4 border-t border-white/10 text-center">
                                    <div className="text-gray-400 text-sm mb-2">Username</div>

                                    {!isEditingName ? (
                                        <div className="flex items-center justify-center gap-2 group">
                                            <div className="font-mono text-lg">{username}</div>
                                            <button
                                                onClick={() => setIsEditingName(true)}
                                                className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all p-1"
                                                title="Edit Username"
                                            >
                                                ✎
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="bg-white/5 border border-white/20 rounded px-2 py-1 text-center font-mono w-full focus:outline-none focus:border-blue-500"
                                            />
                                            <button
                                                onClick={updateUsername}
                                                className="bg-green-600/20 text-green-400 hover:bg-green-600/40 p-1 rounded transition-colors"
                                                title="Save"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditingName(false);
                                                    setUsername(userProfile?.username || '');
                                                }}
                                                className="text-gray-500 hover:text-white p-1"
                                                title="Cancel"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                                    ✕
                                </button>

                            </GlassCard>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence >
    );
};

export default ProfileModal;
