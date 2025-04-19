"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react"; // Import React and hooks
import Link from "next/link"; // Import Link from Next.js for navigation
import { useQuery, useLazyQuery, useMutation, gql } from "@apollo/client"; // Import Apollo Client hooks for GraphQL queries and mutations
import Toast from "@/components/Toast"; // Import Toast component for notifications
import { GET_STATES, CITIES_QUERY } from "@/graphql/queries/settings"; // Import GraphQL query for states
import { CREATE_DISTRICT } from "@/graphql/mutations/settings"; // Import GraphQL mutation for creating a district


export default function CreateDistrict() {
    /* ----- Local state ----- */
    const [selectedState, setSelectedState] = useState(""); // State for selected state
    const [selectedCity, setSelectedCity] = useState(0); // State for selected city
    const [districtName, setDistrictName] = useState(""); // State for district name

    /* ----- Toast helper ----- */
    const [toast, setToast] = useState<| { message: string; type: "success" | "danger" | "warning" | "info" } | null>(null);

    /* ----- Fetch states (auto) ----- */
    const { data: statesData, loading: statesLoading, error: statesError, } = useQuery(GET_STATES);

    /* ----- Fetch cities (lazy) ----- */
    const [fetchCities, { data: citiesData, loading: citiesLoading, error: citiesError },] = useLazyQuery(CITIES_QUERY);

    /* Trigger cities query whenever `selectedState` changes */
    useEffect(() => {
        if (selectedState) {
            fetchCities({ variables: { state_code: selectedState } });
            setSelectedCity(0); // Reset previously‑selected city
        }
    }, [selectedState, fetchCities]);

    /* ----- Create district mutation ----- */
    const [createDistrict, { loading: createLoading }] = useMutation(CREATE_DISTRICT);

    /* ──────────── Submit handler ──────────── */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await createDistrict({
                variables: {
                    city_code: selectedCity,
                    district_name: districtName.trim(),
                },
            });

            if (data?.createDistrict) {
                /* Reset form + success toast */
                setSelectedState("");
                setSelectedCity(0);
                setDistrictName("");
                setToast({ message: data.createDistrict.message, type: "success" });
            }
        } catch (err: any) {
            /* GraphQL / network errors → toast */
            if (err?.graphQLErrors?.length) {
                err.graphQLErrors.forEach((gqlErr: any) => {
                    const code = gqlErr?.extensions?.code as | "success" | "danger" | "warning" | "info";
                    setToast({ message: gqlErr.message, type: code ?? "danger", });
                });
            } else {
                setToast({ message: "حدث خطأ غير متوقع", type: "danger" });
            }
        }
    };

    /* ──────────────────────── ❸ Render ────────────────────────── */
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">إضافة حي جديد</h3>
                <Link href="/dashboard/settings" className="text-sm text-primary hover:text-second font-medium" >
                    العودة إلى الاعدادات
                </Link>
            </div>

            {/* Breadcrumb */}
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
                            الاعدادات
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <span className="text-sm font-medium text-gray-700">إضافة</span>
                    </li>
                </ol>
            </nav>

            {/* Form */}
            <div className="p-6 bg-white shadow rounded-lg">
                <h3 className="text-2xl font-bold text-primary">إنشاء حي</h3>
                <p className="text-xs text-gray-500 mb-5">أدخل البيانات</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Selects & input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Governorate select */}
                            <div>
                                <label htmlFor="state" className="block mb-1 text-sm font-medium text-gray-700" >
                                    المحافظة <span className="text-red-500">*</span>
                                </label>
                                <select id="state" value={selectedState} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedState(e.target.value)}
                                    required
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 w-full" >
                                    <option value="">اختر المحافظة</option>
                                    {statesLoading && <option>جاري التحميل...</option>}
                                    {statesError && <option disabled>تعذر تحميل المحافظات</option>}
                                    {statesData?.states?.map((st: any) => (
                                        <option key={st.state_code} value={st.state_code}>
                                            {st.state_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* City select */}
                            <div>
                                <label htmlFor="city" className="block mb-1 text-sm font-medium text-gray-700" >
                                    المدينة <span className="text-red-500">*</span>
                                </label>
                                <select id="city" value={selectedCity} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCity(Number(e.target.value))} required disabled={!selectedState || citiesLoading}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 w-full" >
                                    <option value="">اختر المدينة</option>
                                    {citiesLoading && <option>جاري التحميل...</option>}
                                    {citiesError && <option disabled>تعذر تحميل المدن</option>}
                                    {citiesData?.cities?.map((ct: any) => (
                                        <option key={ct.city_code} value={ct.city_code}>
                                            {ct.city_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* District name */}
                            <div>
                                <label htmlFor="districtName" className="block mb-1 text-sm font-medium text-gray-700" >
                                    اسم الحي <span className="text-red-500">*</span>
                                </label>
                                <input type="text" id="districtName" value={districtName} onChange={(e: ChangeEvent<HTMLInputElement>) => setDistrictName(e.target.value)} placeholder="مثال: حي الجامعة" required
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" />
                            </div>
                        </div>
                    </div>

                    {/* Submit button */}
                    <button type="submit" disabled={createLoading || statesLoading || citiesLoading || !selectedCity}
                        className={`px-6 py-2 text-white rounded-md text-sm font-medium transition-all ${createLoading ? "bg-primary/60 cursor-not-allowed" : "bg-primary hover:bg-second"}`} >
                        {createLoading ? "جاري الإضافة..." : "إضافة الحي"}
                    </button>
                </form>
            </div>

            {/* Toast notifications */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
}
