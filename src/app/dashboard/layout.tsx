'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import Sidebar from '@/components/Sidebar';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.replace('/login');
        } else if (!validateToken(token)) {
            Cookies.remove('token');
            router.replace('/login');
        } else {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen" dir="rtl">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <nav className="fixed top-0 left-0 right-0 bg-white border border-slate-300 py-3 px-5 z-50">
                    <div className="mx-auto flex justify-between items-center">
                        <button
                            className="lg:hidden text-gray-600 focus:outline-none"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {sidebarOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                        <Link href="/">
                            <img src="https://cdn.yanabie.com/assets/images/min-logo.png" width={120} alt="Yanabie Logo" />
                        </Link>
                    </div>
                </nav>
                <main className="mt-[60px] p-4 overflow-y-auto duration-300 ease-in-out lg:ms-[222px] bg-gray-100 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
