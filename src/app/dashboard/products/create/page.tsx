"use client";

import React, { useState, FormEvent } from "react"; // React hooks
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import Toast from "@/components/Toast";
import { GET_MAIN_CATEGORIES } from "@/graphql/queries/categories";
import { CREATE_PRODUCT } from "@/graphql/mutations/products";

/* ---------- Toast type ---------- */
type ToastState =
    | { message: string; type: "success" | "danger" | "warning" | "info" }
    | null;

/* ---------- Component ---------- */
export default function CreateProduct() {
    /* ---------- Form state ---------- */
    const [name, setName] = useState("");
    const [shortDesc, setShortDesc] = useState("");
    const [description, setDescription] = useState("");
    const [discountPrice, setDiscountPrice] = useState("");
    const [regularPrice, setRegularPrice] = useState("");
    const [discount, setDiscount] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [damaged, setDamaged] = useState<number>(0);
    const [returned, setReturned] = useState<number>(0);
    const [sold, setSold] = useState<number>(0);

    /* ---------- Category selection ---------- */
    const [mainCatId, setMainCatId] = useState("");

    /* ---------- Toast ---------- */
    const [toast, setToast] = useState<ToastState>(null);

    /* ---------- Queries ---------- */
    const {
        data: mainCatsData,
        loading: mainCatsLoading,
        error: mainCatsError,
    } = useQuery(GET_MAIN_CATEGORIES, {
        variables: { category_type: "فرعي", limit: 100 },
        fetchPolicy: "network-only",
    });

    /* ---------- Mutation ---------- */
    const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT);

    /* ---------- Submit ---------- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await createProduct({
                variables: {
                    name,
                    category_id: mainCatId,
                    short_desc: shortDesc || null,
                    description: description || null,
                    discount_price: discountPrice,
                    regular_price: regularPrice,
                    discount: discount,
                    total: total ?? 0,
                    damaged: damaged ?? 0,
                    returned: returned ?? 0,
                    sold: sold ?? 0,
                },
            });

            if (data?.createProduct) {
                /* --- Reset form --- */
                setName("");
                setShortDesc("");
                setDescription("");
                setDiscountPrice("");
                setRegularPrice("");
                setDiscount(0);
                setTotal(0);
                setDamaged(0);
                setReturned(0);
                setSold(0);
                setMainCatId("");
                setToast({ message: data.createProduct.message, type: "success" });
            }
        } catch (err: any) {
            const message =
                err?.graphQLErrors?.[0]?.message || err.message || "Unknown error";
            setToast({ message, type: "danger" });
        }
    };

    /* ---------- Shared input styles ---------- */
    const inputStyle =
        "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 w-full";

    /* ---------- Render ---------- */
    return (
        <>
            {/* 🟡 Header */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">إضافة منتج جديد</h3>
                <Link
                    href="/dashboard/products"
                    className="text-sm text-primary hover:text-second font-medium"
                >
                    العودة إلى المنتجات
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
                    <li className="inline-flex items-center">
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>

                        <Link
                            href="/dashboard/products"
                            className="ml-1 text-sm font-medium text-primary hover:text-second"
                        >
                            المنتجات
                        </Link>
                    </li>
                    <li aria-current="page">
                        <div className="flex items-center">
                            <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                            <span className="text-sm font-medium text-gray-700">إضافة منتج</span>
                        </div>
                    </li>

                </ol>
            </nav>

            {/* 🟡 Form wrapper */}
            <div className="p-6 bg-white shadow rounded-lg">
                <h4 className="text-xl font-bold text-primary mb-1">إنشاء منتج</h4>
                <p className="text-xs text-gray-500 mb-5">أدخل بيانات المنتج</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ========= Basic info ========= */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Product name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    اسم المنتج <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={inputStyle}
                                    required
                                />
                            </div>

                            {/* Main category */}
                            <div>
                                <label
                                    htmlFor="mainCat"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    الفئة الرئيسية <span className="text-red-500">*</span>
                                </label>

                                {mainCatsLoading ? (
                                    <p className="text-sm text-gray-500">جاري التحميل...</p>
                                ) : mainCatsError ? (
                                    <p className="text-sm text-red-500">خطأ في تحميل الفئات</p>
                                ) : (
                                    <select
                                        id="mainCat"
                                        value={mainCatId}
                                        onChange={(e) => setMainCatId(e.target.value)}
                                        className={inputStyle}
                                        required
                                    >
                                        <option value="">اختر فئة</option>
                                        {mainCatsData?.categories?.items?.map(
                                            (cat: { id: string; name: string }) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                )}
                            </div>

                            {/* Short description */}
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label
                                    htmlFor="shortDesc"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    وصف مختصر
                                </label>
                                <input
                                    id="shortDesc"
                                    type="text"
                                    value={shortDesc}
                                    onChange={(e) => setShortDesc(e.target.value)}
                                    className={inputStyle}
                                    placeholder="نبذة سريعة عن المنتج"
                                />
                            </div>

                            {/* Full description */}
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label
                                    htmlFor="description"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    وصف تفصيلي
                                </label>
                                <textarea
                                    id="description"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={inputStyle}
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    السعر الأصلي
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={regularPrice ?? ""}
                                    onChange={(e) =>
                                        setRegularPrice(e.target.value)
                                    }
                                    className={inputStyle}
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    سعر الخصم
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={discountPrice ?? ""}
                                    onChange={(e) =>
                                        setDiscountPrice(e.target.value)
                                    }
                                    className={inputStyle}
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    نسبة الخصم (%)
                                </label>
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={(e) =>
                                        setDiscount(parseInt(e.target.value || "0", 10))
                                    }
                                    className={inputStyle}
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    الكمية الإجمالية <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={total}
                                    onChange={(e) => setTotal(parseInt(e.target.value || "0", 10))}
                                    className={inputStyle}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    تالف
                                </label>
                                <input
                                    type="number"
                                    value={damaged}
                                    onChange={(e) =>
                                        setDamaged(parseInt(e.target.value || "0", 10))
                                    }
                                    className={inputStyle}
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    مرتجع
                                </label>
                                <input
                                    type="number"
                                    value={returned}
                                    onChange={(e) =>
                                        setReturned(parseInt(e.target.value || "0", 10))
                                    }
                                    className={inputStyle}
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    مُباع
                                </label>
                                <input
                                    type="number"
                                    value={sold}
                                    onChange={(e) => setSold(parseInt(e.target.value || "0", 10))}
                                    className={inputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ========= Submit ========= */}
                    <button
                        type="submit"
                        disabled={creating}
                        className={`px-6 py-2 text-white rounded-md text-sm font-medium transition-all ${creating
                            ? "bg-primary/50 cursor-not-allowed"
                            : "bg-primary hover:bg-second"
                            }`}
                    >
                        {creating ? "جاري الحفظ..." : "إضافة المنتج"}
                    </button>
                </form>
            </div>

            {/* 🟡 Toast */}
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
