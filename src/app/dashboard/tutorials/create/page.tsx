"use client";

import React, { useState, ChangeEvent, FormEvent } from "react"; // Import React and hooks for state management
import Link from "next/link"; // Import Link for navigation
import { useMutation } from "@apollo/client"; // Import Apollo Client's useMutation hook for GraphQL mutations
import Toast from "@/components/Toast"; // Import Toast component for notifications
import { CREATE_TUTORIAL } from "@/graphql/mutations/settings"; // Import the CREATE_TUTORIAL mutation


export default function CreateTutorial() {
    /* ---------- Local state ---------- */
    const [title, setTitle] = useState("");        // Tutorial title
    const [content, setContent] = useState("");    // Tutorial content/description
    const [url, setUrl] = useState("");            // Video or article URL
    const [role, setRole] = useState("client");    // Selected role (default: client)

    // Toast notification state for success/error messages 
    const [toast, setToast] = useState<| { message: string; type: "success" | "danger" | "warning" | "info" } | null>(null);

    /* ---------- Mutation hook ---------- */
    const [createTutorial, { loading }] = useMutation(CREATE_TUTORIAL);

    /* ---------- Submit handler ---------- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await createTutorial({
                variables: { title, content, url, role },
            });

            if (data?.createTutorial) {
                // Reset form
                setTitle("");
                setContent("");
                setUrl("");
                setRole("client");
                // Show success toast
                setToast({ message: data.createTutorial.message ?? "تم إنشاء التعليمة بنجاح", type: "success", });
            }
        } catch (err: any) {
            if (err?.graphQLErrors && Array.isArray(err.graphQLErrors)) {
                err.graphQLErrors.forEach((graphqlError: any) => {
                    const validTypes = ["success", "danger", "warning", "info"] as const;
                    const toastType = validTypes.includes(graphqlError.extensions?.code) ? (graphqlError.extensions.code as (typeof validTypes)[number]) : "danger";
                    setToast({ message: graphqlError.message, type: toastType });
                });
            } else if (err instanceof Error) {
                setToast({ message: err.message, type: "danger" });
            } else {
                setToast({ message: "حدث خطأ غير معروف", type: "danger" });
            }
        }
    };

    /* =====================[ Render ]===================== */
    return (
        <>
            {/* ===== Header ===== */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">
                    إضافة تعليمة جديدة
                </h3>
                <Link href="/dashboard/tutorials" className="text-sm text-primary hover:text-second font-medium" >
                    العودة إلى التعليمات
                </Link>
            </div>

            {/* ===== Breadcrumb ===== */}
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:text-second" >
                            لوحة التحكم
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <Link href="/dashboard/tutorials" className="inline-flex items-center text-sm font-medium text-primary hover:text-second" >
                            التعليمات
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <span className="text-sm font-medium text-gray-700">إضافة</span>
                    </li>
                </ol>
            </nav>

            {/* ===== Form ===== */}
            <div className="p-6 bg-white shadow rounded-lg">
                <h3 className="text-2xl font-bold text-primary">إنشاء تعليمة</h3>
                <p className="text-xs text-gray-500 mb-5">أدخل بيانات التعليمة</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ---------- Fields ---------- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-700" >
                                    العنوان <span className="text-red-500">*</span>
                                </label>
                                <input type="text" id="title" value={title} onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                                    placeholder="مثال: إنشاء حساب جديد" className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" required />
                            </div>

                            {/* URL */}
                            <div>
                                <label htmlFor="url" className="block mb-1 text-sm font-medium text-gray-700" >
                                    رابط الفيديو / المقال <span className="text-red-500">*</span>
                                </label>
                                <input type="url" id="url" value={url} onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                                    placeholder="https://example.com/tutorial" className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" required />
                            </div>

                            {/* Role dropdown */}
                            <div>
                                <label htmlFor="role" className="block mb-1 text-sm font-medium text-gray-700" >
                                    الدور <span className="text-red-500">*</span>
                                </label>
                                <select id="role" value={role} onChange={(e: ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" required >
                                    <option value="">أختر الدور</option>
                                    <option value="عميل">العملاء</option>
                                    <option value="فرع">الفروع</option>
                                    <option value="مندوب">المندوبين</option>
                                    <option value="زبون">الزبائن</option>
                                </select>
                            </div>

                            {/* Content (full‑width) */}
                            <div className="sm:col-span-2">
                                <label htmlFor="content" className="block mb-1 text-sm font-medium text-gray-700" >
                                    المحتوى / الوصف <span className="text-red-500">*</span>
                                </label>
                                <textarea id="content" value={content} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                                    placeholder="وصف تفصيلي للتعليمة..." className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 h-32 resize-none" required />
                            </div>
                        </div>
                    </div>

                    {/* ---------- Submit ---------- */}
                    <button type="submit" className={`px-6 py-2 text-white bg-primary hover:bg-second rounded-md text-sm font-medium transition-all ${loading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={loading} >
                        {loading ? "جاري التحميل..." : "إضافة التعليمة"}
                    </button>
                </form>
            </div>

            {/* ===== Toast ===== */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
}
