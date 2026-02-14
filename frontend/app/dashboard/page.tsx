/**
 * Dashboard Page
 * Main user dashboard with balance, stats, and recent transactions
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import TransactionCard from '../../components/TransactionCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { userAPI, transactionAPI } from '../../lib/api';
import { formatSats } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [publicFeed, setPublicFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, transactionsRes, feedRes] = await Promise.all([
                userAPI.getProfile(),
                transactionAPI.getHistory(),
                transactionAPI.getPublicFeed(10),
            ]);

            setProfile(profileRes.data);
            setTransactions(transactionsRes.data.slice(0, 5));
            setPublicFeed(feedRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-dark-800">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-dark-800">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Welcome back, {profile?.username}! 👋
                    </h1>
                    <p className="text-gray-400">
                        Manage your Lightning Network tips and transactions
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-lightning-green-500 to-lightning-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-lightning-green-500/50 transition-all">
                        <div className="text-sm opacity-90 mb-1">Balance</div>
                        <div className="text-3xl font-bold">
                            {formatSats(profile?.balance || 0)} ⚡
                        </div>
                    </div>

                    <div className="bg-dark-800 border border-dark-600 text-white p-6 rounded-xl shadow-lg hover:border-lightning-green-500 transition-all">
                        <div className="text-sm text-gray-400 mb-1">Total Received</div>
                        <div className="text-3xl font-bold text-lightning-green-500">
                            {formatSats(profile?.total_received || 0)}
                        </div>
                    </div>

                    <div className="bg-dark-800 border border-dark-600 text-white p-6 rounded-xl shadow-lg hover:border-lightning-green-500 transition-all">
                        <div className="text-sm text-gray-400 mb-1">Total Sent</div>
                        <div className="text-3xl font-bold text-white">
                            {formatSats(profile?.total_sent || 0)}
                        </div>
                    </div>

                    <div className="bg-dark-800 border border-dark-600 text-white p-6 rounded-xl shadow-lg hover:border-lightning-green-500 transition-all">
                        <div className="text-sm text-gray-400 mb-1">Transactions</div>
                        <div className="text-3xl font-bold text-white">
                            {profile?.transaction_count || 0}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <button
                        onClick={() => router.push('/send')}
                        className="p-6 bg-dark-900 border border-dark-700 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:border-lightning-green-500"
                    >
                        <div className="text-4xl mb-3">💸</div>
                        <div className="text-xl font-bold text-white mb-2">Send Tip</div>
                        <div className="text-gray-400">Tip another user instantly</div>
                    </button>

                    <button
                        onClick={() => router.push('/deposit')}
                        className="p-6 bg-dark-900 border border-dark-700 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:border-lightning-green-500"
                    >
                        <div className="text-4xl mb-3">📥</div>
                        <div className="text-xl font-bold text-white mb-2">Deposit</div>
                        <div className="text-gray-400">Add funds via Lightning</div>
                    </button>

                    <button
                        onClick={() => router.push('/withdraw')}
                        className="p-6 bg-dark-900 border border-dark-700 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:border-lightning-green-500"
                    >
                        <div className="text-4xl mb-3">📤</div>
                        <div className="text-xl font-bold text-white mb-2">Withdraw</div>
                        <div className="text-gray-400">Send to your wallet</div>
                    </button>
                </div>

                {/* Recent Transactions & Public Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Your Recent Transactions */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-white">
                                Recent Transactions
                            </h2>
                            <button
                                onClick={() => router.push('/transactions')}
                                className="text-lightning-green-500 hover:text-lightning-green-400 text-sm transition-colors"
                            >
                                View All
                            </button>
                        </div>

                        {transactions.length > 0 ? (
                            <div className="space-y-4">
                                {transactions.map((txn) => (
                                    <TransactionCard
                                        key={txn.id}
                                        transaction={txn}
                                        currentUsername={profile?.username}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 text-center py-12">
                                <div className="text-6xl mb-4">💭</div>
                                <div className="text-gray-400">No transactions yet</div>
                                <button
                                    onClick={() => router.push('/send')}
                                    className="bg-gradient-to-r from-lightning-green-500 to-lightning-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-lightning-green-500/50 transition-all mt-4"
                                >
                                    Send Your First Tip
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Public Feed */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Public Feed 🌍
                        </h2>

                        {publicFeed.length > 0 ? (
                            <div className="space-y-4">
                                {publicFeed.map((txn) => (
                                    <div key={txn.id} className="bg-dark-900 border border-dark-700 rounded-xl p-6 hover:border-lightning-green-500 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-gray-400">
                                                    @{txn.sender_username} → @{txn.receiver_username}
                                                </div>
                                                {txn.message && (
                                                    <div className="text-sm text-gray-300 italic mt-1">
                                                        "{txn.message}"
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-lightning-green-500">
                                                    {formatSats(txn.amount)} ⚡
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 text-center py-12">
                                <div className="text-6xl mb-4">📡</div>
                                <div className="text-gray-400">No activity yet</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
