"use client";

import React, { useState, FormEvent } from "react";                 // React core + hooks
import { useRouter } from "next/navigation";                         // App Router helpers
import Link from "next/link";                                        // Client‑side navigation
import { useQuery, useMutation, gql } from "@apollo/client";         // Apollo hooks + gql tag
import Toast from "@/components/Toast";                              // Re‑usable toast component

/* =======================
   GraphQL – Queries & Mutations
   ======================= */

// 1) Fetch all users (we’ll filter in the UI if needed)
 const GET_USERS = gql`
    query Users ($role: String!, $limit: Int) {
        users(role: $role, limit: $limit) {
            items {
                id
                name
                surname
            }
        }
    }
`;

// 2) Create a new package / pricing record
 const CREATE_PACKAGE = gql`
    mutation CreatePackage(
        $user_id: String
        $name: String
        $package_type: String
        $role: String
        $states_price: String
        $regional_price: String
    ) {
        createPackage(
        user_id: $user_id
        name: $name
        package_type: $package_type
        role: $role
        states_price: $states_price
        regional_price: $regional_price
        ) {
            id
            number
            message
        }
    }
`;


export default function CreatePackage() {
    const router = useRouter();

    /* ---------- Local state ---------- */
    const [userId, setUserId] = useState("");               // Selected branch / client
    const [name, setName] = useState("");               // Package name
    const [packageType, setPackageType] = useState<"سريع" | "عادي">("سريع");
    const [role, setRole] = useState<"فرع" | "عميل">("فرع");
    const [statesPrice, setStatesPrice] = useState<string>("");       // Price inside same state
    const [regionalPrice, setRegionalPrice] = useState<string>("");   // Price to other states
    const [toast, setToast] = useState<
        | { message: string; type: "success" | "danger" | "warning" | "info" }
        | null
    >(null);

    /* ---------- Data fetching ---------- */
    const { data, loading: usersLoading, error: usersError } = useQuery(GET_USERS, {
        variables: { role: role, limit: 100 },                     // Fetch all branches
        fetchPolicy: "cache-and-network",
    }
    );

    /* ---------- Mutation ---------- */
    const [createPackage, { loading: creating }] = useMutation(CREATE_PACKAGE);

    /* ---------- Handlers ---------- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await createPackage({
                variables: {
                    user_id: userId,
                    name,
                    package_type: packageType,
                    role,
                    states_price: statesPrice,
                    regional_price: regionalPrice,
                },
            });

            if (data?.createPackage) {
                setToast({ message: data.createPackage.message, type: "success" });
                setRole("فرع");
                setUserId("");
                setName("");
                setPackageType("سريع");
                setStatesPrice("");
                setRegionalPrice("");
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

    /* ---------- Render ---------- */
    return (
        <>
            {/* ===== Header & breadcrumb ===== */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">إنشاء تسعيرة / باكج جديد</h3>
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
                        <span className="text-sm font-medium text-gray-700">إنشاء تسعيرة</span>
                    </li>
                </ol>
            </nav>

            {/* ===== Form ===== */}
            <div className="p-6 bg-white shadow rounded-lg">
                <h3 className="text-2xl font-bold text-primary">بيانات التسعيرة</h3>
                <p className="text-xs text-gray-500 mb-5">
                    أدخل البيانات التالية ثم اضغط &quot;حفظ&quot;
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                            {/* ---- User (branch / client) ---- */}

                            <div className="sm:col-span-1">
                                <label
                                    htmlFor="role"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    الدور <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as "فرع" | "عميل")}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                >
                                    <option value="فرع">فرع</option>
                                    <option value="عميل">عميل</option>
                                </select>
                            </div>
                            <div className="sm:col-span-1">
                                <label
                                    htmlFor="user"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    اختر الفرع أو العميل <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="user"
                                    required
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                >
                                    <option value="">-- اختر --</option>
                                    {usersLoading && <option value="">جاري التحميل...</option>}
                                    {usersError && (
                                        <option value="">حدث خطأ في جلب المستخدمين</option>
                                    )}
                                    {data?.users.items.map((u: any) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} {u.surname}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ---- Package Name ---- */}
                            <div className="sm:col-span-1">
                                <label
                                    htmlFor="name"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    اسم الباكج <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="مثال: باكج VIP"
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                />
                            </div>



                            {/* ---- Package Type ---- */}
                            <div className="sm:col-span-1">
                                <label
                                    htmlFor="packageType"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    نوع الباكج <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="packageType"
                                    value={packageType}
                                    onChange={(e) =>
                                        setPackageType(e.target.value as "سريع" | "عادي")
                                    }
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                >
                                    <option value="سريع">سريع</option>
                                    <option value="عادي">عادي</option>
                                </select>
                            </div>

                            {/* ---- States price ---- */}
                            <div className="sm:col-span-1">
                                <label
                                    htmlFor="statesPrice"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    سعر داخل المحافظة (د.ع)
                                </label>
                                <input
                                    id="statesPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={statesPrice}
                                    onChange={(e) => setStatesPrice(e.target.value)}
                                    placeholder="0"
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                />
                            </div>

                            {/* ---- Regional price ---- */}
                            <div className="sm:col-span-1">
                                <label
                                    htmlFor="regionalPrice"
                                    className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                    سعر بين المحافظات (د.ع)
                                </label>
                                <input
                                    id="regionalPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={regionalPrice}
                                    onChange={(e) => setRegionalPrice(e.target.value)}
                                    placeholder="0"
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ---- Submit button ---- */}

                    {/* ---- Submit ---- */}
                    <button
                        type="submit"
                        className={`px-6 py-2 text-white bg-primary hover:bg-second rounded-md text-sm font-medium transition-all ${creating ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={creating}
                    >
                        {creating ? "جاري الحفظ..." : "حفظ"}
                    </button>
                </form>
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
