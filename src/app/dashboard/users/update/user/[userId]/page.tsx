"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent,} from "react"; // React core + hooks
import { useRouter } from "next/navigation"; // Router helpers (App Router)
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client"; // Apollo hooks
import Toast from "@/components/Toast"; // Re‑usable toast
import { GET_USER } from "@/graphql/queries/users"; // ⭐️ استعلام جلب مستخدم
import { UPDATE_USER } from "@/graphql/mutations/users"; // ⭐️ طفرة تعديل مستخدم

export interface User {
    name: string;
    surname: string;
    phone: string;
    email: string;
}

export interface UserData {
    user: User;
}

export default function UpdateUser({ params }: { params: { userId: string }}) {
    /* ---------- Router + URL param ---------- */
    const user_id = params.userId; 
    const router = useRouter();


    /* ---------- Local state ---------- */
    const [name, setName] = useState<string>("");
    const [surname, setSurname] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    const [toast, setToast] = useState< | { message: string; type: "success" | "danger" | "warning" | "info"; } | null>(null);

    /* ---------- Fetch user data ---------- */
    const { data: userData, loading: userLoading, error: userError} = useQuery(GET_USER, {
        variables: { user_id },
        skip: !user_id, 
        fetchPolicy: "network-only", 
    });


    /* ---------- Populate form when data arrives ---------- */
    useEffect(() => {
        if (userData) {
            const { name, surname, phone, email } = userData.user.user;
            setName(name ?? "");
            setSurname(surname ?? "");
            setPhone(phone ?? "");
            setEmail(email ?? "");
        }
    }, [userData]);

    /* ---------- Mutation ---------- */
    const [updateUser, { loading: updating }] = useMutation(UPDATE_USER);

    /* ---------- Form submit handler ---------- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await updateUser({
                variables: {
                    user_id,
                    name,
                    surname,
                    phone,
                    email,
                },
            });

            if (data?.updateUser) {
                setToast({ message: data.updateUser.message, type: "success" });
                setTimeout(() => router.back(), 1200);
            }
        } catch (error: any) {
            // رسائل أخطاء GraphQL
            if (error?.graphQLErrors?.length) {
                error.graphQLErrors.forEach((gErr: any) =>
                    setToast({ message: gErr.message, type: "danger" })
                );
            } else {
                setToast({
                    message: error.message ?? "Unknown error",
                    type: "danger",
                });
            }
        }
    };

    /* ---------- JSX ---------- */
    return (
        <>
            {/* ===== Header & breadcrumb ===== */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">تحديث المستخدم</h3>
                <Link
                    href="/dashboard/users"
                    className="text-sm text-primary hover:text-second font-medium"
                >
                    العودة إلى المستخدمين
                </Link>
            </div>

            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center text-sm font-medium text-primary hover:text-second"
                        >
                            لوحة التحكم
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <Link
                            href="/dashboard/users"
                            className="inline-flex items-center text-sm font-medium text-primary hover:text-second"
                        >
                            المستخدمون
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <span className="text-sm font-medium text-gray-700">
                            تحديث مستخدم
                        </span>
                    </li>
                </ol>
            </nav>

            {/* ===== Form ===== */}
            <div className="p-6 bg-white shadow rounded-lg">
                <h3 className="text-2xl font-bold text-primary">تحديث بيانات المستخدم</h3>
                <p className="text-xs text-gray-500 mb-5">
                    عدّل الحقول ثم اضغط حفظ لحفظ التغييرات
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ---- Full Name ---- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                الاسم الأول <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary px-2 py-1 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="surname"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                الاسم الأخير <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="surname"
                                type="text"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary px-2 py-1 outline-none"
                                required
                            />
                        </div>

                        {/* ---- Phone ---- */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                رقم الهاتف <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="bg-gray-50 border w-full border-gray-300 text-right text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary px-2 py-1 outline-none"
                            />
                        </div>

                        {/* ---- Email ---- */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                البريد الإلكتروني <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary px-2 py-1 outline-none"
                            />
                        </div>
                    </div>
                    </div>

                    {/* ---- Submit ---- */}
                    <button
                        type="submit"
                        className={`px-6 py-2 text-white bg-primary hover:bg-second rounded-md text-sm font-medium transition-all ${updating ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={updating}
                    >
                        {updating ? "جاري التحديث..." : "حفظ التعديلات"}
                    </button>
                </form>
            </div>

            {/* ===== Toast ===== */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
}
