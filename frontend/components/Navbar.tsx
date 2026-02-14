/**
 * Navigation Bar Component
 * Main navigation with user info and balance display
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { userAPI } from '../lib/api';
import { formatSats } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
        // Refresh balance every 30 seconds
        const interval = setInterval(fetchUserProfile, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await userAPI.getProfile();
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Cookies.remove('token');
        toast.success('Logged out successfully');
        router.push('/login');
    };

    return (
        <nav className="bg-gradient-to-r from-black via-dark-900 to-black border-b border-lightning-green-500/20 shadow-lg shadow-lightning-green-500/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and brand */}
                    <div className="flex items-center space-x-3">
                        <div className="text-3xl animate-pulse">⚡</div>
                        <Link href="/dashboard" className="text-white font-bold text-xl hover:text-lightning-green-400 transition">
                            LN Tipping
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link
                            href="/dashboard"
                            className="text-gray-300 hover:text-lightning-green-400 transition font-medium"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/send"
                            className="text-gray-300 hover:text-lightning-green-400 transition font-medium"
                        >
                            Send Tip
                        </Link>
                        <Link
                            href="/deposit"
                            className="text-gray-300 hover:text-lightning-green-400 transition font-medium"
                        >
                            Deposit
                        </Link>
                        <Link
                            href="/withdraw"
                            className="text-gray-300 hover:text-lightning-green-400 transition font-medium"
                        >
                            Withdraw
                        </Link>
                        <Link
                            href="/leaderboard"
                            className="text-gray-300 hover:text-lightning-green-400 transition font-medium"
                        >
                            Leaderboard
                        </Link>
                    </div>

                    {/* User info and balance */}
                    <div className="flex items-center space-x-4">
                        {loading ? (
                            <div className="animate-pulse bg-dark-800 h-8 w-32 rounded"></div>
                        ) : user ? (
                            <>
                                <div className="bg-dark-800 border border-lightning-green-600 px-4 py-2 rounded-lg shadow-lg shadow-lightning-green-500/20">
                                    <div className="text-xs text-gray-400">Balance</div>
                                    <div className="text-lg font-bold text-lightning-green-500">
                                        {formatSats(user.balance)} ⚡
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="text-white font-medium">{user.username}</div>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden bg-dark-900 border-t border-dark-700">
                <div className="px-2 pt-2 pb-3 space-y-1">
                    <Link
                        href="/dashboard"
                        className="block px-3 py-2 text-gray-300 hover:bg-dark-800 hover:text-lightning-green-400 rounded-md transition"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/send"
                        className="block px-3 py-2 text-gray-300 hover:bg-dark-800 hover:text-lightning-green-400 rounded-md transition"
                    >
                        Send Tip
                    </Link>
                    <Link
                        href="/deposit"
                        className="block px-3 py-2 text-gray-300 hover:bg-dark-800 hover:text-lightning-green-400 rounded-md transition"
                    >
                        Deposit
                    </Link>
                    <Link
                        href="/withdraw"
                        className="block px-3 py-2 text-gray-300 hover:bg-dark-800 hover:text-lightning-green-400 rounded-md transition"
                    >
                        Withdraw
                    </Link>
                    <Link
                        href="/leaderboard"
                        className="block px-3 py-2 text-gray-300 hover:bg-dark-800 hover:text-lightning-green-400 rounded-md transition"
                    >
                        Leaderboard
                    </Link>
                </div>
            </div>
        </nav>
    );
}
