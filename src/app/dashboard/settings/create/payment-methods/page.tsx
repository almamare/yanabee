"use client";

import React, { useState, ChangeEvent, FormEvent } from "react"; // React and hooks
import Link from "next/link";      // Navigation
import { useMutation, gql } from "@apollo/client";  // GraphQL
import Toast from "@/components/Toast"; // Custom toast
import { CREATE_PAYMENT_METHOD } from "@/graphql/mutations/settings"; // GraphQL mutation

export default function CreatePaymentMethod() {

    // State variables for form fields
    const [methodName, setMethodName] = useState(""); // Payment method name       
    const [description, setDescription] = useState(""); // Description   

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "warning" | "info" } | null>(null);

    /* ---------- Mutation hook ---------- */
    const [createPaymentMethod, { loading }] = useMutation(
        CREATE_PAYMENT_METHOD
    );

    /* ---------- Submit handler ---------- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            // Execute mutation
            const { data } = await createPaymentMethod({
                variables: {
                    method_name: methodName,
                    description
                }
            });

            // Reset form & show toast
            if (data?.createPaymetMethod) {
                setMethodName("");
                setDescription("");
                setToast({ message: data.createPaymetMethod.message, type: "success" });
            }
        } catch (err: any) {
            /* ----- GraphQL error handling ----- */
            if (err?.graphQLErrors && Array.isArray(err.graphQLErrors)) {
                err.graphQLErrors.forEach((graphqlError: any) => {
                    const validTypes: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info"];
                    const toastType = validTypes.includes(graphqlError.extensions?.code) ? (graphqlError.extensions.code as | "success" | "danger" | "warning" | "info") : "danger";
                    setToast({ message: graphqlError.message, type: toastType });
                });
            } else if (err instanceof Error) {
                setToast({ message: err.message, type: "danger" });
            } else {
                setToast({ message: "An unknown error occurred", type: "danger" });
            }
        }
    };

    /* ---------- Render component ---------- */
    return (
        <>
            {/* -------- Page header -------- */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">
                    إضافة طريقة دفع جديدة
                </h3>
                <Link href="/dashboard/settings" className="text-sm text-primary hover:text-second font-medium" >
                    العودة إلى الاعدادات
                </Link>
            </div>

            {/* -------- Breadcrumb -------- */}
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:text-second" >
                            لوحة التحكم
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <Link href="/dashboard/settings" className="inline-flex items-center text-sm font-medium text-primary hover:text-second" >
                            الاعدادات
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <span className="text-sm font-medium text-gray-700">
                            إضافة
                        </span>
                    </li>
                </ol>
            </nav>

            {/* -------- Form -------- */}
            <div className="p-6 bg-white shadow rounded-lg">
                <h3 className="text-2xl font-bold text-primary">
                    إنشاء طريقة دفع
                </h3>
                <p className="text-xs text-gray-500 mb-5">أدخل البيانات</p>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Form fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                            {/* Method name */}
                            <div>
                                <label htmlFor="methodName" className="block mb-1 text-sm font-medium text-gray-700" >
                                    اسم الطريقة <span className="text-red-500">*</span>
                                </label>
                                <input type="text" id="methodName" value={methodName} onChange={(e: ChangeEvent<HTMLInputElement>) => setMethodName(e.target.value)} placeholder="مثال: نقدًا عند الاستلام"
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" required />
                            </div>

                            {/* Description (optional) */}
                            <div>
                                <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">
                                    الوصف <span className="text-red-500">*</span>
                                </label>
                                <textarea id="description" value={description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} placeholder="مثال: متاح في جميع المدن داخل العراق"
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 h-24 resize-none" />
                            </div>

                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" className={`px-6 py-2 text-white bg-primary hover:bg-second rounded-md text-sm font-medium transition-all ${loading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={loading} >
                        {loading ? "جاري التحميل..." : "إضافة الطريقة"}
                    </button>
                </form>
            </div>

            {/* -------- Toast -------- */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
}
