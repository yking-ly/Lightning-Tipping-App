/**
 * Deposit Page
 * Generate Lightning invoices to deposit funds
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import LoadingSpinner from '../../components/LoadingSpinner';
import { lightningAPI } from '../../lib/api';
import { formatSats, formatError } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function DepositPage() {
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [memo, setMemo] = useState('');
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
            return;
        }
    }, []);

    useEffect(() => {
        if (invoice && invoice.status === 'pending') {
            // Poll for payment every 5 seconds
            const interval = setInterval(checkPayment, 5000);
            return () => clearInterval(interval);
        }
    }, [invoice]);

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();

        const amountNum = parseInt(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setLoading(true);

        try {
            const response = await lightningAPI.createInvoice({
                amount: amountNum,
                memo: memo || undefined,
            });

            setInvoice(response.data);
            toast.success('Invoice created! Scan to pay.');
        } catch (error) {
            toast.error(formatError(error));
        } finally {
            setLoading(false);
        }
    };

    const checkPayment = async () => {
        if (!invoice) return;

        setChecking(true);
        try {
            const response = await lightningAPI.checkInvoice(invoice.id);

            if (response.data.paid) {
                toast.success(`✨ Payment received! ${formatSats(invoice.amount)} sats added to your balance.`);
                setInvoice({ ...invoice, status: 'paid' });
                setTimeout(() => router.push('/dashboard'), 2000);
            } else if (response.data.expired) {
                toast.error('Invoice expired');
                setInvoice({ ...invoice, status: 'expired' });
            }
        } catch (error) {
            console.error('Check payment failed');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-dark-800">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Deposit Funds 📥
                    </h1>
                    <p className="text-gray-400">
                        Add funds to your account via Lightning Network
                    </p>
                </div>

                {!invoice ? (
                    /* Create Invoice Form */
                    <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
                        <form onSubmit={handleCreateInvoice} className="space-y-6">
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
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                <div className="flex gap-2 mt-2">
                                    {[1000, 5000, 10000, 50000].map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setAmount(amt.toString())}
                                            className="px-3 py-1 bg-dark-700 hover:bg-lightning-green-600 text-white rounded-lg text-sm transition"
                                        >
                                            {formatSats(amt)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Memo (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-500 focus:border-lightning-green-500 focus:ring-2 focus:ring-lightning-green-500/20 transition-all outline-none"
                                    placeholder="Description for this deposit"
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    maxLength={200}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-lightning-green-500 to-lightning-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-lightning-green-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center text-lg"
                            >
                                {loading ? <LoadingSpinner size="sm" /> : 'Generate Invoice'}
                            </button>
                        </form>

                        <div className="bg-dark-800 border border-lightning-green-600 rounded-xl p-6 mt-6">
                            <div className="text-sm text-gray-300">
                                <p className="font-semibold mb-2 text-lightning-green-500">📱 Supported Wallets:</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-400">
                                    <li>Phoenix Wallet</li>
                                    <li>Wallet of Satoshi</li>
                                    <li>Muun Wallet</li>
                                    <li>Blue Wallet</li>
                                    <li>Any Lightning-enabled wallet</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Display Invoice */
                    <div className="space-y-6">
                        <QRCodeDisplay
                            data={invoice.payment_request}
                            title={`Deposit ${formatSats(invoice.amount)} sats`}
                            subtitle="Scan with your Lightning wallet"
                        />

                        {invoice.status === 'pending' && (
                            <div className="bg-dark-900 border border-yellow-500 rounded-xl p-6 text-center">
                                <div className="text-yellow-400">
                                    <div className="text-lg font-semibold mb-2">
                                        ⏳ Waiting for payment...
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        We'll automatically detect when the payment is received.
                                    </p>
                                    {checking && (
                                        <div className="mt-4">
                                            <LoadingSpinner size="sm" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {invoice.status === 'paid' && (
                            <div className="bg-dark-900 border border-lightning-green-600 rounded-xl p-6 text-center">
                                <div className="text-lightning-green-500">
                                    <div className="text-5xl mb-3">✅</div>
                                    <div className="text-xl font-bold mb-2 text-white">
                                        Payment Received!
                                    </div>
                                    <p className="text-gray-400">Redirecting to dashboard...</p>
                                </div>
                            </div>
                        )}

                        {invoice.status === 'expired' && (
                            <div className="bg-dark-900 border border-red-600 rounded-xl p-6 text-center">
                                <div className="text-red-500">
                                    <div className="text-5xl mb-3">⏰</div>
                                    <div className="text-xl font-bold mb-2 text-white">
                                        Invoice Expired
                                    </div>
                                    <button
                                        onClick={() => setInvoice(null)}
                                        className="bg-gradient-to-r from-lightning-green-500 to-lightning-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-lightning-green-500/50 transition-all mt-4"
                                    >
                                        Create New Invoice
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setInvoice(null)}
                            className="w-full bg-dark-800 hover:bg-dark-700 text-gray-300 py-3 px-6 rounded-lg transition-all"
                        >
                            ← Create Another Invoice
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
