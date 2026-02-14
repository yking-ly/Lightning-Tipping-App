/**
 * QR Code Display Component
 * Shows Lightning invoice as QR code with copy functionality
 */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getQRCodeURL, copyToClipboard, truncate } from '../lib/utils';
import toast from 'react-hot-toast';

interface QRCodeDisplayProps {
    data: string;
    title?: string;
    subtitle?: string;
}

export default function QRCodeDisplay({
    data,
    title = 'Lightning Invoice',
    subtitle,
}: QRCodeDisplayProps) {
    const [copied, setCopied] = useState(false);
    const qrUrl = getQRCodeURL(data);

    const handleCopy = async () => {
        const success = await copyToClipboard(data);
        if (success) {
            setCopied(true);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } else {
            toast.error('Failed to copy');
        }
    };

    return (
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 text-center max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
            {subtitle && <p className="text-gray-400 mb-4">{subtitle}</p>}

            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <Image
                    src={qrUrl}
                    alt="QR Code"
                    width={300}
                    height={300}
                    className="rounded-lg"
                />
            </div>

            {/* Invoice String */}
            <div className="bg-dark-800 border border-dark-600 p-3 rounded-lg mb-4">
                <code className="text-xs text-gray-400 break-all font-mono">
                    {truncate(data, 50)}
                </code>
            </div>

            {/* Copy Button */}
            <button
                onClick={handleCopy}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${copied
                    ? 'bg-lightning-green-500 text-white'
                    : 'bg-gradient-to-r from-lightning-green-500 to-lightning-green-600 text-white hover:shadow-lg hover:shadow-lightning-green-500/50 transform hover:scale-105 active:scale-95'
                    }`}
            >
                {copied ? (
                    <>
                        <span className="mr-2">✓</span>
                        Copied!
                    </>
                ) : (
                    <>
                        <span className="mr-2">📋</span>
                        Copy Invoice
                    </>
                )}
            </button>

            <p className="text-xs text-gray-500 mt-3">
                Scan with your Lightning wallet or copy the invoice
            </p>
        </div>
    );
}
