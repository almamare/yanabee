'use client';

import { LOGIN_MUTATION } from '@/graphql/mutations/loginMutation';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, ApolloError } from '@apollo/client';
import Cookies from 'js-cookie';

// Interfaces for GraphQL response and variables
interface LoginData {
    login: {
        token: string;
        expires: string;
        manager: {
            manager_no: string;
            name: string;
            surname: string;
            email: string;
            phone: string;
            role: string;
            status: string;
            created_at: string;
        };
    };
}

interface LoginVars {
    phone: string;
    password: string;
}


export default function LoginPage() {

    const router = useRouter();
    const [phone, setPhone] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [login, { loading, error }] = useMutation<LoginData, LoginVars>(LOGIN_MUTATION);
    const [errorMessage, setErrorMessage] = useState<string[]>([]);

    // Handle form submission
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const { data } = await login({
                variables: { phone, password },
                onError: (err) => {
                    if (err instanceof ApolloError) {
                        const errors = err.graphQLErrors.map((error) => error.message);
                        if (err.networkError) {
                            errors.push('Network error. Please check your connection.');
                        }
                        setErrorMessage(errors);
                    } else {
                        setErrorMessage(['An unexpected error occurred. Please try again.']);
                    }
                },
            });
            if (data && data.login.token) {
                const auth = {
                    expires: data.login.expires,
                    isLoggedIn: true,
                    admin: data.login.manager,
                };
                sessionStorage.setItem('auth', JSON.stringify(auth));
                Cookies.set('token', data.login.token, { expires: new Date(data.login.expires), path: '/' });
                router.push('/dashboard');
            }
        } catch (err) {
            console.error(err);
            setErrorMessage(['An unexpected error occurred. Please try again.']);
        }
    };

    return (
        <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-md shadow-sm border border-slate-200">
                {/* Logo */}
                <img src="https://cdn.yanabie.com/assets/images/min-logo.png" alt="Logo" className="w-40 mx-auto" />
                {/* Title */}
                <h1 className="text-2xl font-bold text-center text-gray-800">تسجيل الدخول</h1>
                {/* Error Messages */}
                {error && (
                    <div className="space-y-2">
                        {errorMessage.map((error, index) => (
                            <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md" key={index} role="alert">
                                {error || 'حدث خطأ ما، يرجى المحاولة مرة أخرى'}
                            </div>
                        ))}
                    </div>
                )}
                {/* Login Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Phone Input */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            رقم الهاتف
                        </label>
                        <input
                            id="phone"
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="block w-full px-4 py-1.5 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-right"
                            placeholder="أدخل رقم الهاتف"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            كلمة المرور
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-4 py-1.5 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-right"
                            placeholder="أدخل كلمة المرور"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className={`w-full px-4 py-2 font-medium text-white bg-primary rounded-md ${loading ? 'bg-second text-gray-700 cursor-not-allowed' : 'hover:bg-second hover:text-gray-700'
                                } focus:outline-none`} disabled={loading} >
                            {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
                        </button>
                    </div>

                    {/* Signup Link */}
                    <div className="text-sm text-center text-gray-600">
                        ليس لديك حساب؟{' '}
                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                            إنشاء حساب
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}