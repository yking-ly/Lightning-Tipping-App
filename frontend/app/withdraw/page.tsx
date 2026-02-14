/**
 * Withdraw Page
 * Send funds to external Lightning wallet
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { userAPI, lightningAPI } from '../../lib/api';
import { formatSats, formatError, isValidLightningInvoice } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function WithdrawPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [paymentRequest, setPaymentRequest] = useState('');
    const [loading, setLoading] = useState(false);

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

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedInvoice = paymentRequest.trim();

        if (!isValidLightningInvoice(trimmedInvoice)) {
            toast.error('Invalid Lightning invoice format');
            return;
        }

        setLoading(true);

        try {
            const response = await lightningAPI.createWithdrawal(trimmedInvoice);

            toast.success(
                `✅ Withdrawal successful! ${formatSats(response.data.amount)} sats sent.`
            );

            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (error: any) {
            const errorMsg = formatError(error);
            if (errorMsg.includes('Insufficient balance')) {
                toast.error('Insufficient balance for this withdrawal');
            } else {
                toast.error(errorMsg);
            }
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
                        Withdraw Funds 📤
                    </h1>
                    <p className="text-gray-400">
                        Send funds to your Lightning wallet
                    </p>
                </div>

                {/* Balance Display */}
                <div className="bg-gradient-to-r from-lightning-green-500 to-lightning-green-600 text-white p-6 rounded-xl shadow-lg mb-6">
                    <div className="text-sm opacity-90 mb-1">Available Balance</div>
                    <div className="text-3xl font-bold">
                        {formatSats(profile?.balance || 0)} sats ⚡
                    </div>
                </div>

                {/* Withdraw Form */}
                <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
                    <form onSubmit={handleWithdraw} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Lightning Invoice
                            </label>
                            <textarea
                                required
                                className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-500 focus:border-lightning-green-500 focus:ring-2 focus:ring-lightning-green-500/20 transition-all outline-none min-h-[150px] font-mono text-sm"
                                placeholder="Paste your Lightning invoice (lnbc...)"
                                value={paymentRequest}
                                onChange={(e) => setPaymentRequest(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Generate an invoice from your Lightning wallet and paste it here
                            </p>
                        </div>

                        <div className="p-4 bg-dark-800 border border-yellow-500 rounded-lg">
                            <div className="text-sm text-yellow-400">
                                <p className="font-semibold mb-1">⚠️ Important:</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-400">
                                    <li>Double-check the invoice before submitting</li>
                                    <li>Withdrawals are instant and irreversible</li>
                                    <li>Small network fees may apply</li>
                                    <li>Invoice must not be expired</li>
                                </ul>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !paymentRequest.trim()}
                            className="w-full bg-gradient-to-r from-lightning-green-500 to-lightning-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-lightning-green-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center text-lg"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <>
                                    <span className="mr-2">⚡</span>
                                    Withdraw Funds
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* How to Guide */}
                <div className="bg-dark-900 border border-lightning-green-600 rounded-xl p-6 mt-6">
                    <div className="text-sm text-gray-300">
                        <p className="font-semibold mb-3 text-lightning-green-500">📖 How to withdraw:</p>
                        <ol className="list-decimal list-inside space-y-2 text-gray-400">
                            <li>Open your Lightning wallet (Phoenix, WoS, etc.)</li>
                            <li>Create a new invoice/receive request</li>
                            <li>Enter the amount you want to withdraw</li>
                            <li>Copy the invoice string (starts with lnbc)</li>
                            <li>Paste it above and click Withdraw</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
