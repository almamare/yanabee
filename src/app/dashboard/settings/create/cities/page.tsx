"use client";

import React, { useState, ChangeEvent, FormEvent } from "react"; // Import React and hooks for state management
import Link from "next/link"; // Import Link for navigation
import { useQuery, useMutation, gql } from "@apollo/client"; // Import Apollo Client hooks for GraphQL queries and mutations
import Toast from "@/components/Toast"; // Import Toast component for notifications
import { GET_STATES } from "@/graphql/queries/settings"; // Import GraphQL query for fetching states
import { CREATE_CITY } from "@/graphql/mutations/settings"; // Import GraphQL mutation for creating a city

export default function CreateCity() {
    /* ----- Local state for form fields ----- */
    const [stateCode, setStateCode] = useState(""); // State code
    const [cityName, setCityName] = useState(""); // City name

    /* ----- Toast state ----- */
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "warning" | "info" } | null>(null);

    /* ----- Fetch governorates on mount ----- */
    const { data: statesData, loading: statesLoading, error: statesError } = useQuery(GET_STATES);

    /* ----- Create‑city mutation hook ----- */
    const [createCity, { loading: creating }] = useMutation(CREATE_CITY);

    /* ---------- Submit handler ---------- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        /* Guard‑clauses: simple client‑side validation           */
        if (stateCode === "" || cityName.trim() === "") {
            setToast({ message: "يرجى ملء جميع الحقول المطلوبة.", type: "warning", });
            return;
        }

        try {
            const { data } = await createCity({
                variables: { state_code: stateCode, city_name: cityName.trim(), },
            });

            if (data?.createCity) {
                /* Reset fields on success */
                setStateCode("");
                setCityName("");
                setToast({ message: data.createCity.message, type: "success" });
            }
        } catch (err: any) {
            /* ---------- GraphQL + network error handling ---------- */
            if (err?.graphQLErrors?.length) {
                err.graphQLErrors.forEach((gErr: any) =>
                    setToast({ message: gErr.message, type: ["success", "danger", "warning", "info"].includes(gErr.extensions?.code,) ? (gErr.extensions.code as any) : "danger", }),);
            } else {
                setToast({ message: err.message ?? "Unknown error", type: "danger" });
            }
        }
    };

    return (
        <>
            {/* ===== Header ===== */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">إضافة مدينة جديدة</h3>
                <Link href="/dashboard/settings" className="text-sm font-medium text-primary hover:text-second">
                    العودة إلى الإعدادات
                </Link>
            </div>

            {/* ===== Breadcrumb ===== */}
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
                        <span className="text-sm font-medium text-gray-700">إضافة</span>
                    </li>
                </ol>
            </nav>

            {/* ===== Form card ===== */}
            <div className="p-6 bg-white shadow rounded-lg">
                <h3 className="text-2xl font-bold text-primary">إنشاء مدينة</h3>
                <p className="mb-5 text-xs text-gray-500">أدخل البيانات التالية</p>

                {/* ---------- Form ---------- */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Select governorate */}
                            <div>
                                <label htmlFor="stateSelect" className="block mb-1 text-sm font-medium text-gray-700" >
                                    المحافظة <span className="text-red-500">*</span>
                                </label>

                                {/* Dropdown loaded from server */}
                                <select id="stateSelect" value={stateCode} onChange={(e: ChangeEvent<HTMLSelectElement>) => setStateCode(e.target.value)} required disabled={statesLoading || !!statesError}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary px-2 py-1">
                                    {/* Placeholder option */}
                                    <option value="">اختر محافظة...</option>

                                    {/* Render governorates */}
                                    {statesData?.states?.map((state: any) => (
                                        <option key={state.state_code} value={state.state_code}>
                                            {state.state_name}
                                        </option>
                                    ))}
                                </select>

                                {/* Show tiny error if list failed */}
                                {statesError && (
                                    <p className="mt-1 text-xs text-red-600">
                                        تعذر تحميل قائمة المحافظات
                                    </p>
                                )}
                            </div>

                            {/* City name */}
                            <div>
                                <label htmlFor="cityName" className="block mb-1 text-sm font-medium text-gray-700" >
                                    اسم المدينة <span className="text-red-500">*</span>
                                </label>
                                <input type="text" id="cityName" value={cityName} onChange={(e: ChangeEvent<HTMLInputElement>) => setCityName(e.target.value)} placeholder="مثال: الرمادي" required
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary px-2 py-1" />
                            </div>
                        </div>
                    </div>


                    {/* Submit button */}
                    <button type="submit" disabled={creating} className={`px-6 py-2 text-white rounded-md text-sm font-medium transition-all ${creating ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-second"}`} >
                        {creating ? "جارٍ الإضافة..." : "إضافة المدينة"}
                    </button>
                </form>
            </div>

            {/* ===== Toast ===== */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
}
