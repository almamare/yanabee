"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react"; // React and hooks
import Link from "next/link"; // Navigation
import { useRouter } from "next/navigation"; // Router helpers (App Router)
import { useQuery, useMutation } from "@apollo/client"; // Apollo Client
import Toast from "@/components/Toast"; // Toast notifications
import { GET_TUTORIAL } from "@/graphql/queries/settings"; // Import GraphQL query for fetching tutorials
import { UPDATE_TUTORIAL } from "@/graphql/mutations/settings"; // Import GraphQL mutation for updating tutorials


// GraphQL queries and mutations 
export default function UpdateTutorial({ params }: { params: { tutorialId: string } }) {
    const router = useRouter();
    const tutorialId = params.tutorialId; // Get tutorial ID from URL

    //* ---------- Local state ---------- */
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [url, setUrl] = useState("");

    const [toast, setToast] = useState<
        | { message: string; type: "success" | "danger" | "warning" | "info" }
        | null
    >(null);

    /* ---------- Fetch current tutorial ---------- */
    const { data: tutorialData, loading: queryLoading, error: queryError, } = useQuery(GET_TUTORIAL, {
        variables: { id: tutorialId },
        fetchPolicy: "network-only",
    });

    // Populate form once data is fetched
    useEffect(() => {
        if (tutorialData?.tutorial) {
            const { title, content, url } = tutorialData.tutorial;
            setTitle(title);
            setContent(content);
            setUrl(url);
        }
    }, [tutorialData]);

    /* ---------- Mutation hook ---------- */
    const [updateTutorial, { loading: mutateLoading }] = useMutation(UPDATE_TUTORIAL);

    /* ---------- Submit handler ---------- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await updateTutorial({
                variables: { id: tutorialId, title, content, url },
            });

            if (data?.updateTutorial) {
                // Show success toast
                setToast({ message: data.updateTutorial.message ?? "تم تعديل التعليمة بنجاح", type: "success", });

                // Redirect back after a short delay
                setTimeout(() => router.push("/dashboard/tutorials"), 1500);
            }
        } catch (err: any) {
            // ----- Error handling (same pattern you used in CreateTutorial) ----- //
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

    return (
        <>
            {/* ===== Header ===== */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">تعديل التعليمة</h3>
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
                        <span className="text-sm font-medium text-gray-700">تعديل</span>
                    </li>
                </ol>
            </nav>

            {/* ===== Form ===== */}
            <div className="p-6 bg-white shadow rounded-lg">
                <h3 className="text-2xl font-bold text-primary">تعديل التعليمة</h3>
                <p className="text-xs text-gray-500 mb-5">
                    قم بتحديث بيانات التعليمة ثم اضغط حفظ
                </p>

                {/* Handle possible query‑level errors */}
                {queryError && (
                    <p className="text-center text-red-500 text-sm mb-4">
                        {queryError.message}
                    </p>
                )}

                {queryLoading ? (
                    <p className="text-center text-sm text-gray-500">
                        جاري تحميل بيانات التعليمة...
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ---------- Fields ---------- */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {/* Title */}
                                <div>
                                    <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-700" >
                                        العنوان <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" id="title" value={title} onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder="مثال: إنشاء حساب جديد"
                                        className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" required />
                                </div>

                                {/* URL */}
                                <div>
                                    <label htmlFor="url" className="block mb-1 text-sm font-medium text-gray-700" >
                                        رابط الفيديو / المقال <span className="text-red-500">*</span>
                                    </label>
                                    <input type="url" id="url" value={url} onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)} placeholder="https://example.com/tutorial"
                                        className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" required />
                                </div>

                                {/* Content (full‑width) */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="content" className="block mb-1 text-sm font-medium text-gray-700" >
                                        المحتوى / الوصف <span className="text-red-500">*</span>
                                    </label>
                                    <textarea id="content" value={content} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)} placeholder="وصف تفصيلي للتعليمة..."
                                        className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 h-32 resize-none" required />
                                </div>
                            </div>
                        </div>


                        {/* ---------- Submit ---------- */}
                        <button type="submit"
                            className={`px-6 py-2 text-white bg-primary hover:bg-second rounded-md text-sm font-medium transition-all ${mutateLoading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={mutateLoading}>
                            {mutateLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
                        </button>
                    </form>
                )}
            </div>

            {/* ===== Toast ===== */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
}
