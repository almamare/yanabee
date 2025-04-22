"use client";


import React, { useState, ChangeEvent, FormEvent } from "react"; // Import React and required hooks
import Link from "next/link"; // For navigation
import { useQuery, useMutation } from "@apollo/client"; // For calling GraphQL queries and mutations
import { GET_MAIN_CATEGORIES } from "@/graphql/queries/categories"; // GraphQL query to get main categories
import Toast from "@/components/Toast"; // Custom toast notification component
import { CREATE_CATEGORY } from "@/graphql/mutations/categories"; // GraphQL mutation to create a category


const MAIN_TYPE = "رئيسي";  // Category type for main categories
const SUB_TYPE = "فرعي";    // Category type for subcategories

export default function CreateCategory() {

    // State variables for form fields
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [categoryType, setCategoryType] = useState<string>("");
    const [parentId, setParentId] = useState<string>("");
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [toast, setToast] = useState<| { message: string; type: "success" | "danger" | "warning" | "info" } | null>(null);

    // GraphQL query to get main categories
    const { data: mainCatsData, loading: mainCatsLoading, refetch: refetchMainCats, } = useQuery(GET_MAIN_CATEGORIES, {
        variables: { category_type: MAIN_TYPE, limit: 100 },
        skip: categoryType !== SUB_TYPE,
        fetchPolicy: "network-only",
    });

    const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY);

    /* ---------- Helpers ---------- */
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImageBase64(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleCategoryTypeChange = (value: string) => {
        setCategoryType(value);
        setParentId("");
        if (value === SUB_TYPE) {
            refetchMainCats();
        }
    };

    /* ---------- Submit form ---------- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await createCategory({
                variables: {
                    parent_id:
                        categoryType === SUB_TYPE && parentId ? parentId : null,
                    category_type: categoryType,
                    name,
                    img: imageBase64,
                    description,
                },
            });

            if (data?.createCategory) {
                // reset form
                setName("");
                setDescription("");
                setCategoryType("");
                setParentId("");
                setImageBase64(null);
                (document.getElementById("image") as HTMLInputElement | null)?.setAttribute("value", "");
                setToast({ message: data.createCategory.message, type: "success" });
            }
        } catch (error: any) {
            if (error?.graphQLErrors?.length) {
                error.graphQLErrors.forEach((gErr: any) =>
                    setToast({ message: gErr.message, type: ["success", "danger", "warning", "info"].includes(gErr.extensions?.code) ? gErr.extensions.code : "danger", })
                );
            } else {
                setToast({ message: error.message || "Unknown error", type: "danger" });
            }
        }
    };

    return (
        <>
            {/* Header + breadcrumb */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">إضافة فئة جديدة</h3>
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
                        <span className="text-sm font-medium text-gray-700">إضافة فئة</span>
                    </li>
                </ol>
            </nav>

            {/* Form container */}
            <div className="p-6 bg-white shadow rounded-lg">
                <h3 className="text-2xl font-bold text-primary">إنشاء فئة</h3>
                <p className="text-xs text-gray-500 mb-5">أدخل بيانات الفئة</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                                    اسم الفئة <span className="text-red-500">*</span>
                                </label>
                                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: إلكترونيات"
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" required />
                            </div>

                            <div>
                                <label htmlFor="categoryType" className="block mb-1 text-sm font-medium text-gray-700">
                                    نوع الفئة <span className="text-red-500">*</span>
                                </label>
                                <select id="categoryType" value={categoryType} onChange={(e) => handleCategoryTypeChange(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 w-full" required >
                                    <option value="">اختر النوع</option>
                                    <option value={MAIN_TYPE}>{MAIN_TYPE}</option>
                                    <option value={SUB_TYPE}>{SUB_TYPE}</option>
                                </select>
                            </div>

                            {/* ---- قائمة الفئات الرئيسية (للنوع فرعي فقط) ---- */}
                            {categoryType === SUB_TYPE && (
                                <div className="sm:col-span-2">
                                    <label htmlFor="parentId" className="block mb-1 text-sm font-medium text-gray-700">
                                        اختر الفئة الرئيسية <span className="text-red-500">*</span>
                                    </label>

                                    {mainCatsLoading ? (
                                        <p className="text-sm text-gray-500">جاري التحميل...</p>
                                    ) : (
                                        <select id="parentId" value={parentId} onChange={(e) => setParentId(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 w-full" required >
                                            <option value="">اختر فئة رئيسية</option>
                                            {mainCatsData?.categories?.items?.map(
                                                (cat: { id: number; name: string }) => (
                                                    <option key={cat.id} value={String(cat.id)}>
                                                        {cat.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    )}
                                </div>
                            )}

                            {/* ---- الوصف ---- */}
                            <div className="sm:col-span-2">
                                <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">
                                    الوصف
                                </label>
                                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" placeholder="وصف مختصر عن الفئة" />
                            </div>

                            {/* ---- رفع الصورة ---- */}
                            <div className="sm:col-span-2">
                                <label htmlFor="image" className="block mb-1 text-sm font-medium text-gray-700">
                                    صورة الفئة
                                </label>
                                <input id="image" type="file" accept="image/png, image/gif, image/jpeg, image/jpg" onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-900 file:py-1 file:px-5 file:border file:rounded-md file:border-gray-300 file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />

                                {imageBase64 && (<img src={imageBase64} alt="معاينة الفئة" className="mt-3 max-w-xs rounded shadow-sm" />)}
                            </div>
                        </div>
                    </div>

                    {/* Submit button */}
                    <button type="submit" className={`px-6 py-2 text-white bg-primary hover:bg-second rounded-md text-sm font-medium transition-all ${creating ? "opacity-50 cursor-not-allowed" : ""}`} disabled={creating} >
                        {creating ? "جاري التحميل..." : "إضافة الفئة"}
                    </button>
                </form>
            </div>

            {/* Display toast message */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
} 
