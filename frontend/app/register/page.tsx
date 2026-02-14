/**
 * Registration Page
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { authAPI } from '../../lib/api';
import { formatError, isValidUsername, isValidEmail } from '../../lib/utils';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (!isValidUsername(formData.username)) {
            toast.error('Username must be 3-50 characters, alphanumeric with underscores/hyphens');
            return false;
        }

        if (!isValidEmail(formData.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            await authAPI.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            toast.success('Registration successful! Logging you in...');

            // Auto-login after registration
            const loginResponse = await authAPI.login(formData.username, formData.password);
            const { access_token } = loginResponse.data;
            Cookies.set('token', access_token, { expires: 7 });

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
                        Join Lightning Tipping
                    </h1>
                    <p className="text-gray-400">Create your account and start tipping</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-500 focus:border-lightning-green-500 focus:ring-2 focus:ring-lightning-green-500/20 transition-all outline-none"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            3-50 characters, alphanumeric with _ or -
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-500 focus:border-lightning-green-500 focus:ring-2 focus:ring-lightning-green-500/20 transition-all outline-none"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
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
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Minimum 8 characters
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-500 focus:border-lightning-green-500 focus:ring-2 focus:ring-lightning-green-500/20 transition-all outline-none"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                                setFormData({ ...formData, confirmPassword: e.target.value })
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-lightning-green-500 to-lightning-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-lightning-green-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
                    >
                        {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-lightning-green-500 font-semibold hover:text-lightning-green-400 transition-colors"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
