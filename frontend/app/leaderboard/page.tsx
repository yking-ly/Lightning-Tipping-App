/**
 * Leaderboard Page
 * Display top tippers and most tipped users
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { userAPI } from '../../lib/api';
import { formatSats } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function LeaderboardPage() {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState<'tippers' | 'receivers'>('tippers');
    const [tippers, setTippers] = useState<any[]>([]);
    const [receivers, setReceivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchLeaderboards();
    }, []);

    const fetchLeaderboards = async () => {
        try {
            const [tippersRes, receiversRes] = await Promise.all([
                userAPI.getTopTippers(),
                userAPI.getTopReceivers(),
            ]);

            setTippers(tippersRes.data);
            setReceivers(receiversRes.data);
        } catch (error) {
            toast.error('Failed to load leaderboards');
        } finally {
            setLoading(false);
        }
    };

    const getRankEmoji = (rank: number) => {
        switch (rank) {
            case 0:
                return '🥇';
            case 1:
                return '🥈';
            case 2:
                return '🥉';
            default:
                return `#${rank + 1}`;
        }
    };

    const renderLeaderboard = (data: any[], type: 'tippers' | 'receivers') => {
        if (loading) {
            return (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <div className="text-gray-400">No data yet</div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {data.map((entry, index) => (
                    <div
                        key={entry.username}
                        className={`bg-dark-900 border ${index < 3 ? 'border-lightning-green-500 shadow-lg shadow-lightning-green-500/20' : 'border-dark-700'} rounded-xl p-6 flex items-center justify-between hover:border-lightning-green-500 transition-all`}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="text-3xl font-bold w-12 text-lightning-green-500">
                                {getRankEmoji(index)}
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-white">@{entry.username}</div>
                                <div className="text-sm text-gray-400">
                                    {entry.transaction_count} transaction
                                    {entry.transaction_count !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-lightning-green-500">
                                {formatSats(entry.total_amount)}
                            </div>
                            <div className="text-sm text-gray-400">sats</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-dark-800">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Leaderboard 🏆
                    </h1>
                    <p className="text-gray-400">
                        Top contributors in the Lightning tipping community
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 mb-6">
                    <button
                        onClick={() => setSelectedTab('tippers')}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${selectedTab === 'tippers'
                            ? 'bg-gradient-to-r from-lightning-green-500 to-lightning-green-600 text-white shadow-lg shadow-lightning-green-500/50'
                            : 'bg-dark-800 text-gray-300 hover:bg-dark-700 border border-dark-600'
                            }`}
                    >
                        Top Tippers 💸
                    </button>
                    <button
                        onClick={() => setSelectedTab('receivers')}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${selectedTab === 'receivers'
                            ? 'bg-gradient-to-r from-lightning-green-500 to-lightning-green-600 text-white shadow-lg shadow-lightning-green-500/50'
                            : 'bg-dark-800 text-gray-300 hover:bg-dark-700 border border-dark-600'
                            }`}
                    >
                        Most Tipped 🌟
                    </button>
                </div>

                {/* Leaderboard Content */}
                {selectedTab === 'tippers'
                    ? renderLeaderboard(tippers, 'tippers')
                    : renderLeaderboard(receivers, 'receivers')}

                {/* Info Card */}
                <div className="bg-dark-900 border border-lightning-green-600 rounded-xl p-6 mt-8">
                    <div className="text-sm text-gray-300">
                        <p className="font-semibold mb-2 text-lightning-green-500">🎯 How Ranking Works:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>Rankings are based on total satoshis sent/received</li>
                            <li>Only completed transactions count</li>
                            <li>Updated in real-time</li>
                            <li>Start tipping to climb the ranks!</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
