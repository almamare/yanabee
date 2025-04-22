'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function HomePage() {
    const router = useRouter();
    const [checkingToken, setCheckingToken] = useState(true);

    useEffect(() => {
        const token = Cookies.get('token');

        if (!token || !validateToken(token)) {
            // Token missing or invalid → Redirect to login
            Cookies.remove('token');
            router.replace('/login');
        } else {
            // Token is valid → Redirect to dashboard
            router.replace('/dashboard');
        }

        setCheckingToken(false);
    }, [router]);

    const validateToken = (token: string): boolean => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000;
            return Date.now() < expirationTime;
        } catch {
            return false;
        }
    };

    return checkingToken ? (
        <div className="flex justify-center items-center h-screen bg-white">
            <div className="loader"></div>
        </div>
    ) : null;
}
