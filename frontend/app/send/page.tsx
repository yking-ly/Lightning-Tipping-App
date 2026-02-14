/**
 * Send Tip Page
 * Interface for sending tips to other users
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { userAPI, transactionAPI } from '../../lib/api';
import { formatSats, formatError } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function SendTipPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [formData, setFormData] = useState({
        receiver_username: '',
        amount: '',
        message: '',
    });
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await userAPI.getProfile();
            setProfile(response.data);
        } catch (error) {
            toast.error('Failed to load profile');
        }
    };

    const handleSearch = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await userAPI.searchUsers(query);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Search failed');
        } finally {
            setSearching(false);
        }
    };

    const selectUser = (username: string) => {
        setFormData({ ...formData, receiver_username: username });
        setSearchResults([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const amount = parseInt(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (amount > profile?.balance) {
            toast.error('Insufficient balance');
            return;
        }

        setLoading(true);

        try {
            await transactionAPI.sendTip({
                receiver_username: formData.receiver_username,
                amount: amount,
                message: formData.message || undefined,
            });

            toast.success(`✨ Sent ${formatSats(amount)} sats to @${formData.receiver_username}!`);

            // Reset form
            setFormData({ receiver_username: '', amount: '', message: '' });

            // Redirect to dashboard after 2 seconds
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (error) {
            toast.error(formatError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-dark-800">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Send a Tip ⚡
                    </h1>
                    <p className="text-gray-400">
                        Tip another user instantly with Lightning Network
                    </p>
                </div>

                {/* Balance Display */}
                <div className="bg-gradient-to-r from-lightning-green-500 to-lightning-green-600 text-white p-6 rounded-xl shadow-lg mb-6">
                    <div className="text-sm opacity-90 mb-1">Your Balance</div>
                    <div className="text-3xl font-bold">
                        {formatSats(profile?.balance || 0)} sats ⚡
                    </div>
                </div>

                {/* Send Tip Form */}
                <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Receiver Username */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Recipient Username
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-500 focus:border-lightning-green-500 focus:ring-2 focus:ring-lightning-green-500/20 transition-all outline-none"
                                placeholder="Enter username"
                                value={formData.receiver_username}
                                onChange={(e) => {
                                    setFormData({ ...formData, receiver_username: e.target.value });
                                    handleSearch(e.target.value);
                                }}
                            />

                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {searchResults.map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => selectUser(user.username)}
                                            className="w-full px-4 py-2 text-left hover:bg-dark-700 transition text-white"
                                        >
                                            <div className="font-medium">@{user.username}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {searching && (
                                <div className="absolute right-3 top-10">
                                    <LoadingSpinner size="sm" />
                                </div>
                            )}
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Amount (sats)
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-500 focus:border-lightning-green-500 focus:ring-2 focus:ring-lightning-green-500/20 transition-all outline-none"
                                placeholder="Enter amount in satoshis"
                                value={formData.amount}
                                onChange={(e) =>
                                    setFormData({ ...formData, amount: e.target.value })
                                }
                            />
                            <div className="flex gap-2 mt-2">
                                {[100, 500, 1000, 5000].map((amount) => (
                                    <button
                                        key={amount}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                                        className="px-3 py-1 bg-dark-700 hover:bg-lightning-green-600 text-white rounded-lg text-sm transition"
                                    >
                                        {formatSats(amount)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Message (Optional)
                            </label>
                            <textarea
                                className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-500 focus:border-lightning-green-500 focus:ring-2 focus:ring-lightning-green-500/20 transition-all outline-none min-h-[100px]"
                                placeholder="Add a message with your tip"
                                value={formData.message}
                                onChange={(e) =>
                                    setFormData({ ...formData, message: e.target.value })
                                }
                                maxLength={500}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {formData.message.length}/500 characters
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-lightning-green-500 to-lightning-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-lightning-green-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center text-lg"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <>
                                    <span className="mr-2">⚡</span>
                                    Send Tip
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Info Card */}
                <div className="bg-dark-900 border border-lightning-green-600 rounded-xl p-6 mt-6">
                    <div className="text-sm text-gray-300">
                        <p className="font-semibold mb-2 text-lightning-green-500">💡 Tips:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>Tips are instant and irreversible</li>
                            <li>Minimum tip: 1 sat</li>
                            <li>You can add an optional message</li>
                            <li>Recipient will see your username</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
