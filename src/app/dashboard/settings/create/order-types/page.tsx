"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";// React hooks
import Link from "next/link"; // Next.js Link component
import { useMutation } from "@apollo/client"; // Apollo Client for GraphQL
import Toast from "@/components/Toast"; // Custom Toast component for notifications
import { CREATE_ORDER_TYPE } from "@/graphql/mutations/settings"; // GraphQL mutation for creating an order type

/* =========================================================================
   1. CREATE ORDER TYPE PAGE
   ========================================================================*/
export default function CreateOrderType() {
    /* ---------- Form state ---------- */
    const [typeName, setTypeName] = useState("");          // Order‑type title
    const [description, setDescription] = useState("");    // Optional note

    /* ---------- Toast state ---------- */
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "warning" | "info"; } | null>(null);

    /* ---------- Mutation hook ---------- */
    const [createOrderType, { loading }] = useMutation(CREATE_ORDER_TYPE);

    /* ---------- Submit handler ---------- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await createOrderType({
                variables: { type_name: typeName, description },
            });

            if (data?.createOrderType) {
                /* Reset form + toast */
                setTypeName("");
                setDescription("");
                setToast({ message: data.createOrderType.message, type: "success" });
            }
        } catch (err: any) {
            /* Centralised GraphQL error handling */
            if (err?.graphQLErrors?.length) {
                err.graphQLErrors.forEach((gqlErr: any) => {
                    const valid = ["success", "danger", "warning", "info"] as const;
                    const code = gqlErr.extensions?.code;
                    const type = valid.includes(code) ? code : "danger";
                    setToast({ message: gqlErr.message, type });
                });
            } else {
                setToast({ message: err instanceof Error ? err.message : "حدث خطأ غير معروف", type: "danger", });
            }
        }
    };

    /* =========================================================================
       3. RENDER
       ========================================================================*/
    return (
        <>
            {/* ---------- Header ---------- */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold text-gray-700">إضافة نوع طلب جديد</h3>
                <Link href="/dashboard/settings" className="text-sm font-medium text-primary hover:text-second" >
                    العودة إلى الإعدادات
                </Link>
            </div>

            {/* ---------- Breadcrumb ---------- */}
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:text-second" >
                            لوحة التحكم
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <Link href="/dashboard/settings" className="inline-flex items-center text-sm font-medium text-primary hover:text-second" >
                            الإعدادات
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <span className="text-sm font-medium text-gray-700">إضافة</span>
                    </li>
                </ol>
            </nav>

            {/* ---------- Form ---------- */}
            <div className="p-6 bg-white shadow rounded-lg">
                <h4 className="text-xl font-bold text-primary mb-1">إنشاء نوع طلب</h4>
                <p className="text-xs text-gray-500 mb-5">فضلاً أدخل البيانات المطلوبة</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* --- Fields --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Type name */}
                            <div>
                                <label htmlFor="typeName" className="block mb-1 text-sm font-medium text-gray-700" >
                                    اسم النوع <span className="text-red-500">*</span>
                                </label>
                                <input id="typeName" type="text" value={typeName} onChange={(e: ChangeEvent<HTMLInputElement>) => setTypeName(e.target.value)} placeholder="مثال: ادوات حادة" required
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md block w-full px-2 py-1 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700" >
                                    الوصف <span className="text-red-500">*</span>
                                </label>
                                <textarea id="description" value={description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} rows={4} placeholder="وصف مختصر عن نوع الطلب"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md block w-full px-2 py-1 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" />
                            </div>
                        </div>
                    </div>


                    {/* --- Submit --- */}
                    <button type="submit" disabled={loading} className={`px-6 py-2 text-white rounded-md text-sm font-medium transition-all ${loading ? "bg-primary/60 cursor-not-allowed" : "bg-primary hover:bg-second"}`} >
                        {loading ? "جاري الحفظ..." : "إضافة النوع"}
                    </button>
                </form>
            </div>

            {/* ---------- Toast ---------- */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
}
