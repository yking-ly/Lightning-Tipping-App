/**
 * Login Page
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { authAPI } from '../../lib/api';
import { formatError } from '../../lib/utils';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authAPI.login(formData.username, formData.password);
            const { access_token } = response.data;

            // Store token in cookie
            Cookies.set('token', access_token, { expires: 7 });

            toast.success('Login successful!');
            router.push('/dashboard');
        } catch (error) {
            toast.error(formatError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-dark-900 to-dark-800 p-4">
            <div className="bg-dark-900 border border-dark-700 rounded-xl shadow-2xl max-w-md w-full p-8 hover:border-lightning-green-500 transition-all duration-300">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4 inline-block animate-pulse">⚡</div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-lightning-green-400 to-lightning-green-600 bg-clip-text text-transparent">
                        Lightning Tipping
                    </h1>
                    <p className="text-gray-400">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-500 focus:border-lightning-green-500 focus:ring-2 focus:ring-lightning-green-500/20 transition-all outline-none"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-500 focus:border-lightning-green-500 focus:ring-2 focus:ring-lightning-green-500/20 transition-all outline-none"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-lightning-green-500 to-lightning-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-lightning-green-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                        Don't have an account?{' '}
                        <Link
                            href="/register"
                            className="text-lightning-green-500 font-semibold hover:text-lightning-green-400 transition-colors"
                        >
                            Register here
                        </Link>
                    </p>
                </div>

                <div className="mt-6 pt-6 border-t border-dark-700">
                    <div className="text-xs text-gray-500 text-center">
                        <p>🔒 Secure Lightning Network Payments</p>
                        <p className="mt-1">Built for Summer of Bitcoin 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
