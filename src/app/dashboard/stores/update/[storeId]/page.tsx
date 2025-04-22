"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react"; // React hooks
import Link from "next/link"; // Next.js Link component
import { useQuery, useMutation, gql } from "@apollo/client"; // Apollo Client for GraphQL queries and mutations
import Toast from "@/components/Toast"; // Custom Toast component for notifications
import { UPDATE_STORE } from "@/graphql/mutations/stores"; // GraphQL mutations
import { GET_STORE } from "@/graphql/queries/stores"; // GraphQL queries


/* =========[ 1. GraphQL Queries ]========== */
export default function EditStore({ params }: { params: { storeId: string } }) {
    const storeId = params.storeId;

    /* ----- Local form state ----- */
    const [form, setForm] = useState({
        id: storeId,
        parent_name: "",
        product_name: "",
        total: 0,
        damaged: 0,
        returned: 0,
        sold: 0,
        available: 0,
    });

    /* ----- Toast state ----- */
    const [toast, setToast] = useState<
        | { message: string; type: "success" | "danger" | "warning" | "info" }
        | null
    >(null);

    /* ----- Fetch current store record ----- */
    const {
        data,
        loading: queryLoading,
        error: queryError,
    } = useQuery(GET_STORE, { variables: { id: storeId } });

    useEffect(() => {
        if (data?.store) {
            setForm({ ...data.store });
        } else if (queryError) {
            setToast({
                message: "المخزن المطلوب غير موجود",
                type: "warning",
            });
        }
    }, [data, queryError]);

    /* ----- Mutation hook ----- */
    const [updateStore, { loading: mutateLoading }] =
        useMutation(UPDATE_STORE);

    /* ----- Input change handler ----- */
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            // تحويل الحقول الرقمية إلى أرقام
            [name]:
                ["total", "damaged", "returned", "sold", "available"].includes(
                    name
                ) && value !== ""
                    ? Number(value)
                    : value,
        }));
    };

    /* ----- Submit handler ----- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const { id, ...rest } = form;
            const { data } = await updateStore({
                variables: { id, ...rest },
            });

            if (data?.updateStore) {
                setToast({
                    message:
                        data.updateStore.message ||
                        "تم تحديث بيانات المخزن بنجاح",
                    type: "success",
                });
            }
        } catch (err: any) {
            // Robust GraphQL / network error handling
            if (err?.graphQLErrors && Array.isArray(err.graphQLErrors)) {
                err.graphQLErrors.forEach((gErr: any) => {
                    const valid: Array<
                        "success" | "danger" | "warning" | "info"
                    > = ["success", "danger", "warning", "info"];
                    const toastType = valid.includes(
                        gErr.extensions?.code
                    )
                        ? (gErr.extensions.code as any)
                        : "danger";
                    setToast({ message: gErr.message, type: toastType });
                });
            } else if (err instanceof Error) {
                setToast({ message: err.message, type: "danger" });
            } else {
                setToast({ message: "An unknown error occurred", type: "danger" });
            }
        }
    };

    /* =========[ 3. UI ]========== */
    return (
        <>
            {/* ---- Page header ---- */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">
                    تعديل بيانات المخزن
                </h3>
                <Link
                    href="/dashboard/stores"
                    className="text-sm font-medium text-primary hover:text-second"
                >
                    العودة إلى المخازن
                </Link>
            </div>

            {/* ---- Breadcrumb ---- */}
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-primary hover:text-second"
                        >
                            لوحة التحكم
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <Link
                            href="/dashboard/stores"
                            className="text-sm font-medium text-primary hover:text-second"
                        >
                            المخازن
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <span className="text-sm font-medium text-gray-700">
                            تحديث
                        </span>
                    </li>
                </ol>
            </nav>

            {/* ---- Form ---- */}
            <div className="p-6 bg-white shadow rounded-lg">
                <h3 className="text-2xl font-bold text-primary">
                    تحديث بيانات المخزن
                </h3>
                <p className="text-xs text-gray-500 mb-5">
                    يُمكنك تعديل الحقول أدناه
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">


                            {/* Product Name */}
                            <div>
                                <label
                                    htmlFor="product_name"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    اسم المنتج <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="product_name"
                                    name="product_name"
                                    value={form.product_name}
                                    onChange={handleChange}
                                    required
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                />
                            </div>

                            {/* Total */}
                            <div>
                                <label
                                    htmlFor="total"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    الإجمالي <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="total"
                                    name="total"
                                    value={form.total}
                                    onChange={handleChange}
                                    required
                                    min={0}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                />
                            </div>

                            {/* Damaged */}
                            <div>
                                <label
                                    htmlFor="damaged"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    التالف
                                </label>
                                <input
                                    type="number"
                                    id="damaged"
                                    name="damaged"
                                    value={form.damaged}
                                    onChange={handleChange}
                                    min={0}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                />
                            </div>

                            {/* Returned */}
                            <div>
                                <label
                                    htmlFor="returned"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    المُرجَع
                                </label>
                                <input
                                    type="number"
                                    id="returned"
                                    name="returned"
                                    value={form.returned}
                                    onChange={handleChange}
                                    min={0}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                />
                            </div>

                            {/* Sold */}
                            <div>
                                <label
                                    htmlFor="sold"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    المباع
                                </label>
                                <input
                                    type="number"
                                    id="sold"
                                    name="sold"
                                    value={form.sold}
                                    onChange={handleChange}
                                    min={0}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                />
                            </div>

                            {/* Available */}
                            <div>
                                <label
                                    htmlFor="available"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    المتاح
                                </label>
                                <input
                                    type="number"
                                    id="available"
                                    name="available"
                                    value={form.available}
                                    onChange={handleChange}
                                    min={0}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className={`px-6 py-2 text-white bg-primary hover:bg-second rounded-md text-sm font-medium transition-all ${mutateLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={mutateLoading}
                    >
                        {mutateLoading ? "جاري التحديث..." : "حفظ التغييرات"}
                    </button>
                </form>
            </div>

            {/* ---- Toast ---- */}
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
