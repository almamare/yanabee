"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react"; // Import React and hooks
import Link from "next/link"; // For navigation
import { useQuery, useMutation } from "@apollo/client"; // For GraphQL queries and mutations
import Toast from "@/components/Toast"; // Custom toast notification component
import { Setting } from "@/graphql/types/settings"; // Import settings type
import { GET_SETTINGS } from "@/graphql/queries/settings"; // Import the query to fetch settings
import { UPDATE_SETTINGS } from "@/graphql/mutations/settings"; // Import the mutation to update settings

/* ================= Component ================= */
export default function EditSettings({ params }: { params: { settingId: string } }) {

    const settingId = params.settingId;

    /* ---------- Local form state ---------- */
    const [form, setForm] = useState({
        id: settingId,
        title: "",
        support_phone: "",
        support_email: "",
        description: "",
        privacy_policy: "",
        terms_of_use: "",
        content: "",
        about: "",
    });

    /* ---------- Toast state ---------- */
    const [toast, setToast] = useState<| { message: string; type: "success" | "danger" | "warning" | "info" } | null>(null);

    /* ---------- Fetch current settings ---------- */
    const { data, loading: queryLoading, error: queryError } = useQuery(GET_SETTINGS);

    useEffect(() => {
        if (data?.settings?.length) {
            // find() will return the setting whose id matches the route param
            const current = data.settings.find(
                (s: Setting) => String(s.id) === String(settingId)   // comparison as string to avoid type issues
            );

            // If found, populate the form with that record
            if (current) setForm({ ...current });
            else {
                // Optional: show a toast or redirect if the ID does not exist
                setToast({ message: "الإعداد المطلوب غير موجود", type: "warning", });
            }
        }
    }, [data, settingId]);

    /* ---------- Mutation hook ---------- */
    const [updateSettings, { loading: mutateLoading }] = useMutation(UPDATE_SETTINGS);

    /* ---------- Input change handler ---------- */
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    /* ---------- Submit handler ---------- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const { id, ...rest } = form;
            const { data } = await updateSettings({
                variables: { setting_id: id, ...rest },
            });

            if (data?.updateSettings) {
                setToast({ message: data.updateSettings.message || "تم تحديث الإعدادات بنجاح", type: "success", });
            }
        } catch (err: any) {
            // Same robust error handling pattern
            if (err?.graphQLErrors && Array.isArray(err.graphQLErrors)) {
                err.graphQLErrors.forEach((gErr: any) => {
                    const valid: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info",];
                    const toastType = valid.includes(gErr.extensions?.code) ? (gErr.extensions.code as any) : "danger";
                    setToast({ message: gErr.message, type: toastType });
                });
            } else if (err instanceof Error) {
                setToast({ message: err.message, type: "danger" });
            } else {
                setToast({ message: "An unknown error occurred", type: "danger" });
            }
        }
    };

    return (
        <>
            {/* -------- Page header -------- */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">تعديل الإعدادات</h3>
                <Link href="/dashboard/settings" className="text-sm font-medium text-primary hover:text-second">
                    العودة إلى الإعدادات
                </Link>
            </div>

            {/* -------- Breadcrumb -------- */}
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link href="/dashboard" className="text-sm font-medium text-primary hover:text-second" >
                            لوحة التحكم
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <Link href="/dashboard/settings" className="text-sm font-medium text-primary hover:text-second">
                            الإعدادات
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <span className="text-sm font-medium text-gray-700">تحديث</span>
                    </li>
                </ol>
            </nav>

            {/* -------- Form -------- */}
            <div className="p-6 bg-white shadow rounded-lg">
                <h3 className="text-2xl font-bold text-primary">تحديث الإعدادات</h3>
                <p className="text-xs text-gray-500 mb-5">يمكنك تعديل الحقول أدناه</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Grid of inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-700" >
                                    العنوان <span className="text-red-500">*</span>
                                </label>
                                <input type="text" id="title" name="title" value={form.title} onChange={handleChange}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                    required />
                            </div>

                            {/* Support Phone */}
                            <div>
                                <label htmlFor="support_phone" className="block mb-1 text-sm font-medium text-gray-700" >
                                    هاتف الدعم <span className="text-red-500">*</span>
                                </label>
                                <input type="text" id="support_phone" name="support_phone" value={form.support_phone} onChange={handleChange}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" required />
                            </div>

                            {/* Support Email */}
                            <div>
                                <label htmlFor="support_email" className="block mb-1 text-sm font-medium text-gray-700" >
                                    بريد الدعم <span className="text-red-500">*</span>
                                </label>
                                <input type="email" id="support_email" name="support_email" value={form.support_email} onChange={handleChange}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" required />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                        <label
                            htmlFor="description"
                            className="block mb-1 text-sm font-medium text-gray-700"
                        >
                            الوصف
                        </label>
                        <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3}
                            className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 resize-none" />
                    </div>

                    {/* Privacy Policy */}
                    <div className="sm:col-span-2">
                        <label htmlFor="privacy_policy" className="block mb-1 text-sm font-medium text-gray-700" >
                            سياسة الخصوصية
                        </label>
                        <textarea id="privacy_policy" name="privacy_policy" value={form.privacy_policy} onChange={handleChange} rows={3}
                            className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 resize-none" />
                    </div>

                    {/* Terms of Use */}
                    <div className="sm:col-span-2">
                        <label htmlFor="terms_of_use" className="block mb-1 text-sm font-medium text-gray-700" >
                            شروط الاستخدام
                        </label>
                        <textarea id="terms_of_use" name="terms_of_use" value={form.terms_of_use} onChange={handleChange} rows={3}
                            className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 resize-none" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-6">
                        {/* Content */}
                        <div>
                            <label htmlFor="content" className="block mb-1 text-sm font-medium text-gray-700" >
                                المحتوى
                            </label>
                            <textarea id="content" name="content" value={form.content} onChange={handleChange} rows={3}
                                className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 resize-none" />
                        </div>

                        {/* About */}
                        <div>
                            <label htmlFor="about" className="block mb-1 text-sm font-medium text-gray-700" >
                                حول الموقع
                            </label>
                            <textarea id="about" name="about" value={form.about} onChange={handleChange} rows={3}
                                className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 resize-none" />
                        </div>
                    </div>


                    {/* Submit */}
                    <button type="submit" className={`px-6 py-2 text-white bg-primary hover:bg-second rounded-md text-sm font-medium transition-all ${mutateLoading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={mutateLoading} >
                        {mutateLoading ? "جاري التحديث..." : "حفظ التغييرات"}
                    </button>
                </form>
            </div>

            {/* -------- Toast -------- */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
}
