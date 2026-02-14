/**
 * Transaction Card Component
 * Displays individual transaction with type indicators
 */
'use client';

import { formatSats, formatDate } from '../lib/utils';

interface TransactionCardProps {
    transaction: {
        id: number;
        sender_username: string;
        receiver_username: string;
        amount: number;
        message?: string;
        created_at: string;
    };
    currentUsername: string;
}

export default function TransactionCard({ transaction, currentUsername }: TransactionCardProps) {
    const isSent = transaction.sender_username === currentUsername;
    const isReceived = transaction.receiver_username === currentUsername;

    return (
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 hover:scale-[1.02] hover:border-lightning-green-500 transition-all">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        {isSent ? (
                            <>
                                <span className="text-2xl">↗️</span>
                                <div>
                                    <div className="text-sm text-gray-500">Sent to</div>
                                    <div className="font-semibold text-white">
                                        @{transaction.receiver_username}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="text-2xl">↙️</span>
                                <div>
                                    <div className="text-sm text-gray-500">Received from</div>
                                    <div className="font-semibold text-white">
                                        @{transaction.sender_username}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {transaction.message && (
                        <div className="mt-2 p-3 bg-dark-800 border border-dark-600 rounded-lg">
                            <div className="text-sm text-gray-400 italic">
                                "{transaction.message}"
                            </div>
                        </div>
                    )}

                    <div className="mt-2 text-xs text-gray-500">
                        {formatDate(transaction.created_at)}
                    </div>
                </div>

                <div className="text-right">
                    <div
                        className={`text-2xl font-bold ${isSent ? 'text-red-500' : 'text-lightning-green-500'
                            }`}
                    >
                        {isSent ? '-' : '+'}
                        {formatSats(transaction.amount)}
                    </div>
                    <div className="text-xs text-gray-500">sats</div>
                </div>
            </div>
        </div>
    );
}
