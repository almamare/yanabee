"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react"; // React core + hooks
import { useRouter } from "next/navigation"; // App Router helpers
import Link from "next/link"; // Client‑side navigation
import { useQuery, useMutation } from "@apollo/client"; // Apollo hooks + gql tag
import Toast from "@/components/Toast"; // Re‑usable toast component
import { GET_CATEGORY } from "@/graphql/queries/categories"; // GraphQL query to fetch a single category
import { UPDATE_CATEGORY } from "@/graphql/mutations/categories"; // GraphQL mutation to update a category



export default function UpdateCategory({ params, }: { params: { categoryId: string }; }) {
    const id = params.categoryId;
    const router = useRouter();

    // ---------- Local state ---------- //
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "warning" | "info"; } | null>(null);

    // ---------- Fetch existing data ---------- //
    const { data: catData, loading: catLoading, error: catError, } = useQuery(GET_CATEGORY, {
        variables: { id },
        skip: !id,
        fetchPolicy: "network-only",
    });

    // Populate form when data arrives
    useEffect(() => {
        if (catData?.category) {
            const { name, description, img } = catData.category;
            setName(name ?? "");
            setDescription(description ?? "");
            setImageBase64(img ?? null);
        }
    }, [catData]);

    // ---------- Mutation ---------- //
    const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY);

    // ---------- Handlers ---------- //
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? catData?.category?.img;
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImageBase64(reader.result as string);
        reader.readAsDataURL(file); // Convert to Base‑64
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await updateCategory({
                variables: {
                    id,
                    name,
                    img: imageBase64,
                    description,
                },
            });

            if (data?.updateCategory) {
                setToast({ message: data.updateCategory.message, type: "success" });
                setTimeout(() => router.push("/dashboard/categories"), 1200);
            }
        } catch (error: any) {
            if (error?.graphQLErrors?.length) {
                error.graphQLErrors.forEach((gErr: any) =>
                    setToast({ message: gErr.message, type: "danger" })
                );
            } else {
                setToast({
                    message: error.message ?? "Unknown error",
                    type: "danger",
                });
            }
        }
    };

    return (
        <>
            {/* ===== Header & breadcrumb ===== */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">تحديث الفئة</h3>
                <Link href="/dashboard/categories" className="text-sm text-primary hover:text-second font-medium" >
                    العودة إلى الفئات
                </Link>
            </div>

            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:text-second" >
                            لوحة التحكم
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <Link href="/dashboard/categories" className="inline-flex items-center text-sm font-medium text-primary hover:text-second" >
                            الفئات
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <span className="text-sm font-medium text-gray-700">تحديث فئة</span>
                    </li>
                </ol>
            </nav>

            {/* ===== Form ===== */}
            <div className="p-6 bg-white shadow rounded-lg">
                <h3 className="text-2xl font-bold text-primary">تحديث بيانات الفئة</h3>
                <p className="text-xs text-gray-500 mb-5">قم بتعديل الحقول ثم اضغط حفظ</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* ---- Name ---- */}
                            <div className="sm:col-span-2">
                                <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700" >
                                    اسم الفئة <span className="text-red-500">*</span>
                                </label>
                                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: إلكترونيات"
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" required />
                            </div>

                            {/* ---- Description ---- */}
                            <div className="sm:col-span-2">
                                <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700" >
                                    الوصف
                                </label>
                                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" placeholder="وصف مختصر عن الفئة" />
                            </div>

                            {/* ---- Image ---- */}
                            <div className="sm:col-span-2">
                                <label  htmlFor="image" className="block mb-1 text-sm font-medium text-gray-700" >
                                    صورة الفئة
                                </label>
                                <input id="image" type="file" accept="image/png, image/gif, image/jpeg, image/jpg" onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-900 file:py-1 file:px-5 file:border file:rounded-md file:border-gray-300 file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"/>

                                {imageBase64 && (
                                    <img src={imageBase64} alt="معاينة الفئة"  className="mt-3 max-w-xs rounded shadow-sm" />
                                )}
                            </div>
                        </div>
                    </div>


                    {/* ---- Submit ---- */}
                    <button
                        type="submit"
                        className={`px-6 py-2 text-white bg-primary hover:bg-second rounded-md text-sm font-medium transition-all ${updating ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={updating}
                    >
                        {updating ? "جاري التحديث..." : "حفظ التعديلات"}
                    </button>
                </form>
            </div>

            {/* ===== Toast ===== */}
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </>
    );
}
