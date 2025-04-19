"use client";

import React, { useState, ChangeEvent, FormEvent } from "react"; // Import React and required hooks
import Link from "next/link"; // For navigation
import { useMutation } from "@apollo/client"; // For calling GraphQL mutations
import { CREATE_ADVERTISEMENT } from "@/graphql/mutations/settings"; // GraphQL mutation
import Toast from "@/components/Toast"; // Custom toast notification component

// Component to create a new advertisement
export default function CreateAdvertisement() {
    // State variables for form fields
    const [title, setTitle] = useState(""); // Advertisement title
    const [role, setRole] = useState(""); // User role
    const [imageBase64, setImageBase64] = useState<string | null>(null); // Image as base64 string

    // State for toast notifications
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "warning" | "info"; } | null>(null);

    // GraphQL mutation hook
    const [createAdvertisement, { loading }] = useMutation(CREATE_ADVERTISEMENT);

    // Convert selected image file to base64
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Check if image is selected
        if (!imageBase64) return;

        try {
            // Execute mutation
            const { data } = await createAdvertisement({
                variables: { title, img: imageBase64, role, },
            });

            // If success, reset form
            if (data?.createAdvertisement) {
                const fileInput = document.getElementById("image") as HTMLInputElement;
                if (fileInput) fileInput.value = "";

                setTitle("");
                setRole("");
                setImageBase64(null);
                setToast({ message: data.createAdvertisement.message, type: "success" });
            }
        } catch (err: any) {
            // GraphQL error handling
            if (err?.graphQLErrors && Array.isArray(err.graphQLErrors)) {
                err.graphQLErrors.forEach((graphqlError: any) => {
                    const validTypes: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info"];
                    const toastType = validTypes.includes(graphqlError.extensions?.code) ? (graphqlError.extensions.code as "success" | "danger" | "warning" | "info") : "danger";
                    setToast({ message: graphqlError.message, type: toastType });
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
            {/* Page header and navigation */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">إضافة إعلان جديد</h3>
                <Link href="/dashboard/advertisements" className="text-sm text-primary hover:text-second font-medium">
                    العودة إلى الإعلانات
                </Link>
            </div>

            {/* Breadcrumb navigation */}
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:text-second">
                            لوحة التحكم
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <Link href="/dashboard/advertisements" className="inline-flex items-center text-sm font-medium text-primary hover:text-second">
                            الإعلانات
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <span className="text-sm font-medium text-gray-700">إضافة إعلان</span>
                    </li>
                </ol>
            </nav>

            {/* Form container */}
            <div className="p-6 bg-white shadow rounded-lg">
                <h3 className="text-2xl font-bold text-primary">إنشاء إعلان</h3>
                <p className="text-xs text-gray-500 mb-5">أدخال البيانات</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                            {/* Title input */}
                            <div>
                                <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-700">
                                    عنوان الإعلان <span className="text-red-500">*</span>
                                </label>
                                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: إعلان عن منتج جديد"
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                    required />
                            </div>

                            {/* Role selection */}
                            <div>
                                <label htmlFor="role" className="block mb-1 text-sm font-medium text-gray-700">
                                    الدور <span className="text-red-500">*</span>
                                </label>
                                <select id="role" value={role} onChange={(e) => setRole(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 w-full"
                                    required >
                                    <option value="">اختر الدور</option>
                                    <option value="مدير">مدير</option>
                                    <option value="فرع">فرع</option>
                                    <option value="عميل">عميل</option>
                                    <option value="مندوب">مندوب</option>
                                    <option value="زبون">زبون</option>
                                </select>
                            </div>

                            {/* Image upload */}
                            <div>
                                <label htmlFor="image" className="block mb-1 text-sm font-medium text-gray-700">
                                    صورة الإعلان <span className="text-red-500">*</span>
                                </label>
                                <input type="file" id="image" accept="image/png, image/gif, image/jpeg, image/jpg" onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-900 file:py-1 file:px-5 file:border file:rounded-md file:border-gray-300 file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                                    required />
                                {/* Preview the image if selected */}
                                {imageBase64 && (
                                    <img src={imageBase64} alt="معاينة الإعلان" className="mt-3 max-w-xs rounded shadow-sm" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        className={`px-6 py-2 text-white bg-primary hover:bg-second rounded-md text-sm font-medium transition-all ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={loading}
                    >
                        {loading ? "جاري التحميل..." : "إضافة الإعلان"}
                    </button>
                </form>
            </div>

            {/* Display toast message */}
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </>
    );
}
