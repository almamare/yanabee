"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, gql } from "@apollo/client";
import Toast from "@/components/Toast";

/* =======================
   GraphQL – Query & Mutation
   ======================= */

// 1) Get single package by ID (for editing)
export const GET_PACKAGE = gql`
  query Package($id: String!) {
    package(id: $id) {
      id
      name
      states_price
      regional_price
    }
  }
`;

// 2) Update existing package / pricing record
export const UPDATE_PACKAGE = gql`
  mutation UpdatePackage(
    $id: String!
    $name: String
    $states_price: String
    $regional_price: String
  ) {
    updatePackage(
      id: $id
      name: $name
      states_price: $states_price
      regional_price: $regional_price
    ) {
      id
      number
      message
    }
  }
`;

export default function UpdatePackage({ params }: { params: { packageId: string } }) {
    const router = useRouter();
    const { packageId } = params;

    /* ---------- Local state ---------- */
    const [name, setName] = useState("");
    const [statesPrice, setStatesPrice] = useState<string>("");
    const [regionalPrice, setRegionalPrice] = useState<string>("");
    const [toast, setToast] = useState<
        | { message: string; type: "success" | "danger" | "warning" | "info" }
        | null
    >(null);

    /* ---------- Fetch existing data ---------- */
    const {
        data: packageData,
        loading: packageLoading,
        error: packageError,
    } = useQuery(GET_PACKAGE, { variables: { id: packageId } });

    /* ---------- Fill form when data arrives ---------- */
    useEffect(() => {
        if (packageData?.package) {
            setName(packageData.package.name || "");
            setStatesPrice(packageData.package.states_price || "");
            setRegionalPrice(packageData.package.regional_price || "");
        }
    }, [packageData]);

    /* ---------- Mutation ---------- */
    const [updatePackage, { loading: updating }] = useMutation(UPDATE_PACKAGE);

    /* ---------- Handlers ---------- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await updatePackage({
                variables: {
                    id: packageId,
                    name,
                    states_price: statesPrice,
                    regional_price: regionalPrice,
                },
            });

            if (data?.updatePackage) {
                setToast({ message: data.updatePackage.message, type: "success" });
                // بعد ثوانٍ قليلة يمكن إعادة التوجيه إلى قائمة التسعيرات إن أردت
                setTimeout(() => router.push("/dashboard/packages"), 1500);
            }
        } catch (err: any) {
            if (err?.graphQLErrors && Array.isArray(err.graphQLErrors)) {
                err.graphQLErrors.forEach((graphqlError: any) => {
                    const validTypes = ["success", "danger", "warning", "info"] as const;
                    const toastType = validTypes.includes(graphqlError.extensions?.code)
                        ? (graphqlError.extensions.code as (typeof validTypes)[number])
                        : "danger";
                    setToast({ message: graphqlError.message, type: toastType });
                });
            } else if (err instanceof Error) {
                setToast({ message: err.message, type: "danger" });
            } else {
                setToast({ message: "An unknown error occurred", type: "danger" });
            }
        }
    };

    /* ---------- Render ---------- */
    return (
        <>
            {/* ===== Header & breadcrumb ===== */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">تعديل تسعيرة / باكج</h3>
                <Link
                    href="/dashboard/packages"
                    className="text-sm text-primary hover:text-second font-medium"
                >
                    العودة إلى التسعيرات
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
                            href="/dashboard/packages"
                            className="inline-flex items-center text-sm font-medium text-primary hover:text-second"
                        >
                            التسعيرات
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <span className="text-sm font-medium text-gray-700">تعديل تسعيرة</span>
                    </li>
                </ol>
            </nav>

            {/* ===== Form ===== */}
            <div className="p-6 bg-white shadow rounded-lg">
                {packageLoading && <p>جاري تحميل البيانات...</p>}
                {packageError && <p className="text-red-600">تعذّر جلب بيانات التسعيرة.</p>}

                {!packageLoading && !packageError && (
                    <>
                        <h3 className="text-2xl font-bold text-primary">بيانات التسعيرة</h3>
                        <p className="text-xs text-gray-500 mb-5">
                            حدِّث البيانات ثم اضغط &quot;حفظ&quot;
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                                    {/* ---- Package Name ---- */}
                                    <div>
                                        <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                                            اسم الباكج <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 w-full"
                                        />
                                    </div>

                                    {/* ---- States price ---- */}
                                    <div>
                                        <label
                                            htmlFor="statesPrice"
                                            className="block mb-1 text-sm font-medium text-gray-700"
                                        >
                                            سعر داخل المحافظة (د.ع)
                                        </label>
                                        <input
                                            id="statesPrice"
                                            type="text"
                                            min="0"
                                            step="0.01"
                                            value={statesPrice}
                                            onChange={(e) => setStatesPrice(e.target.value)}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 w-full"
                                        />
                                    </div>

                                    {/* ---- Regional price ---- */}
                                    <div>
                                        <label
                                            htmlFor="regionalPrice"
                                            className="block mb-1 text-sm font-medium text-gray-700"
                                        >
                                            سعر بين المحافظات (د.ع)
                                        </label>
                                        <input
                                            id="regionalPrice"
                                            type="text"
                                            min="0"
                                            step="0.01"
                                            value={regionalPrice}
                                            onChange={(e) => setRegionalPrice(e.target.value)}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ---- Required fields note ---- */}

                            {/* ---- Submit ---- */}
                            <button
                                type="submit"
                                className={`px-6 py-2 text-white bg-primary hover:bg-second rounded-md text-sm font-medium transition-all ${updating ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                disabled={updating}
                            >
                                {updating ? "جاري الحفظ..." : "حفظ"}
                            </button>
                        </form>
                    </>
                )}
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
