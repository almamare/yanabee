"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, gql } from "@apollo/client";
import Toast from "@/components/Toast";

/* ========== GraphQL ========== */

// 1) جلب بيانات الباكج المطلوب تعديله
 const GET_PACKAGE = gql`
  query Package($id: String!) {
    package(id: $id) {
      id
      user          # (معرّف الفرع/العميل – للعرض فقط)
      name
      role
      package_type
      states_price
      regional_price
      created_at
      updated_at
    }
  }
`;

// 2) تحديث التسعير
 const UPDATE_PACKAGE = gql`
  mutation UpdatePackage(
    $id: String!
    $states_price: String
    $regional_price: String
  ) {
    updatePackage(
      id: $id
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
    const id = params.packageId;               // يمرَّر من المسار /dashboard/packages/[packageId]/edit

    /* ---------- Local state ---------- */
    const [name, setName] = useState("");
    const [packageType, setPackageType] = useState<"سريع" | "عادي">("سريع");
    const [role, setRole] = useState<"فرع" | "عميل">("فرع");
    const [statesPrice, setStatesPrice] = useState("");
    const [regionalPrice, setRegionalPrice] = useState("");
    const [toast, setToast] = useState<
        | { message: string; type: "success" | "danger" | "warning" | "info" }
        | null
    >(null);

    /* ---------- Fetch existing package ---------- */
    const { data, loading, error } = useQuery(GET_PACKAGE, { variables: { id } });

    /* ---------- Fill state after data arrives ---------- */
    useEffect(() => {
        if (data?.package) {
            const p = data.package;
            setName(p.name);
            setPackageType(p.package_type);
            setRole(p.role);
            setStatesPrice(p.states_price ?? "");
            setRegionalPrice(p.regional_price ?? "");
        }
    }, [data]);

    /* ---------- Mutation ---------- */
    const [updatePackage, { loading: saving }] = useMutation(UPDATE_PACKAGE);

    /* ---------- Submit ---------- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await updatePackage({
                variables: {
                    id,
                    states_price: statesPrice,
                    regional_price: regionalPrice,
                },
            });

            if (data?.updatePackage) {
                setToast({ message: data.updatePackage.message, type: "success" });
                // بعد النجاح يمكن العودة إلى قائمة الباكجات مثلاً:
                // router.push("/dashboard/packages");
            }
        } catch (err: any) {
            // GraphQL error handling
            if (err?.graphQLErrors) {
                err.graphQLErrors.forEach((gErr: any) =>
                    setToast({
                        message: gErr.message,
                        type:
                            ["success", "danger", "warning", "info"].includes(gErr.extensions?.code)
                                ? (gErr.extensions.code as any)
                                : "danger",
                    })
                );
            } else {
                setToast({ message: err.message ?? "Unexpected error", type: "danger" });
            }
        }
    };

    /* ---------- UI ---------- */
    return (
        <>
            {/* ===== Header ===== */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">تعديل تسعيرة باكج</h3>
                <Link href="/dashboard/packages" className="text-sm text-primary hover:text-second font-medium">
                    العودة إلى التسعيرات
                </Link>
            </div>

            {/* ===== Breadcrumb ===== */}
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:text-second">
                            لوحة التحكم
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <Link href="/dashboard/packages" className="inline-flex items-center text-sm font-medium text-primary hover:text-second">
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
                {/* بيانات أساسية (مقفلة) */}
                <h4 className="text-lg font-semibold text-gray-800 mb-4">بيانات الباكج</h4>
                {loading && <p>جاري التحميل...</p>}
                {error && <p className="text-red-500">فشل في جلب البيانات</p>}

                {!loading && !error && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Role (locked) */}
                            <div>
                                <label htmlFor="role" className="block mb-1 text-sm font-medium text-gray-700">
                                    الدور
                                </label>
                                <input
                                    id="role"
                                    type="text"
                                    disabled
                                    value={role}
                                    className="bg-gray-100 border w-full border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1"
                                />
                            </div>

                            {/* Package type (locked) */}
                            <div>
                                <label htmlFor="packageType" className="block mb-1 text-sm font-medium text-gray-700">
                                    نوع الباكج
                                </label>
                                <input
                                    id="packageType"
                                    type="text"
                                    disabled
                                    value={packageType}
                                    className="bg-gray-100 border w-full border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1"
                                />
                            </div>

                            {/* Package name (اختياري للعرض فقط) */}
                            <div>
                                <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                                    اسم الباكج
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    disabled
                                    value={name}
                                    className="bg-gray-100 border w-full border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1"
                                />
                            </div>

                            {/* States price (editable) */}
                            <div>
                                <label htmlFor="statesPrice" className="block mb-1 text-sm font-medium text-gray-700">
                                    سعر داخل المحافظة (د.ع)
                                </label>
                                <input
                                    id="statesPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={statesPrice}
                                    onChange={(e) => setStatesPrice(e.target.value)}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none px-2 py-1"
                                />
                            </div>

                            {/* Regional price (editable) */}
                            <div>
                                <label htmlFor="regionalPrice" className="block mb-1 text-sm font-medium text-gray-700">
                                    سعر بين المحافظات (د.ع)
                                </label>
                                <input
                                    id="regionalPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={regionalPrice}
                                    onChange={(e) => setRegionalPrice(e.target.value)}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none px-2 py-1"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className={`px-6 py-2 text-white bg-primary hover:bg-second rounded-md text-sm font-medium transition-all ${saving ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            disabled={saving}
                        >
                            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                        </button>
                    </form>
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
