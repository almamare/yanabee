'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie'; // For cookie-based token storage
import Sidebar from '@/components/Sidebar'; // Ensure this component exists

interface LayoutProps {
    children: ReactNode; // This will hold the page content
}

export default function Layout({ children }: LayoutProps) {
    // State to manage sidebar visibility
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // Loading state
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('token');

        if (!token) {
            // Redirect to login if no token is found
            router.replace('/login');
        } else {
            // Validate token expiration (if it's a JWT)
            if (!validateToken(token)) {
                // Clear invalid token and redirect
                Cookies.remove('token');
                router.replace('/login');
            } else {
                // Token is valid; allow access
                setLoading(false);
            }
        }
    }, [router]);

    // Function to validate token (example for JWT)
    const validateToken = (token: string): boolean => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            return Date.now() < expirationTime; // Check if token is still valid
        } catch (error) {
            console.error('Invalid token:', error);
            return false;
        }
    };

    // Show a simple loading screen if we're still checking the token
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen" dir="rtl">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <nav className="fixed top-0 left-0 right-0 bg-white  border border-slate-300 py-3 px-5 z-50">
                    <div className="mx-auto flex justify-between items-center">
                        {/* Sidebar Toggle Button (for mobile) */}
                        <button
                            className="lg:hidden text-gray-600 focus:outline-none"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {sidebarOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>

                        {/* Logo */}
                        <Link href="/">
                            <img
                                src="https://cdn.yanabie.com/assets/images/min-logo.png"
                                width={120}
                                alt="Yanabie Logo"
                            />
                        </Link>
                    </div>
                </nav>

                {/* Page Content */}
                {/* 
                    Note: If you truly want margin-left for large screens, change `lg:ms-[222px]`
                    to `lg:ml-[222px]`. Currently, `ms` is margin-inline-start. 
                */}
                <main className="mt-[60px] p-4 overflow-y-auto duration-300 ease-in-out lg:ms-[222px] bg-gray-100 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
