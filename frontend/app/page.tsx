'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard if logged in, else to login
        const token = Cookies.get('token');
        if (token) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-dark-900 to-dark-800">
            <div className="text-center">
                <div className="text-6xl mb-4 animate-pulse">⚡</div>
                <div className="text-lightning-green-500 text-2xl font-bold">Loading...</div>
            </div>
        </div>
    );
}
