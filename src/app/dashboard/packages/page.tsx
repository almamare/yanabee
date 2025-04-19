"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useQuery, gql } from "@apollo/client";
import { debounce } from "lodash";
import Toast from "@/components/Toast";

// ====== استعلام GraphQL لجلب الباقات (التسعيرات) ====== //
const PACKAGES_QUERY = gql`
  query Packages($role: String, $type: String, $search: String, $page: Int, $limit: Int) {
    packages(role: $role, type: $type, search: $search, page: $page, limit: $limit) {
      total
      pages
      items {
        id
        user
        name
        role
        package_type
        states_price
        regional_price
        created_at
        updated_at
      }
    }
  }
`;

// (اختياري) تعريف الواجهات إذا كنت تستخدم TypeScript
interface Package {
    id: number;
    user: string;
    name: string;
    role: string;
    package_type: string;
    states_price: number;
    regional_price: number;
    created_at: string;
    updated_at: string;
}

interface PackagesResponse {
    packages: {
        total: number;
        pages: number;
        items: Package[];
    };
}

// التبويبات الخاصة بأنواع الباقات: "عادي" و "سريع"
const typeMap: Record<string, string> = {
    normal: "عادي",
    fast: "سريع",
};

const tabs = [
    { id: "normal", label: "عادي" },
    { id: "fast", label: "سريع" },
];

// قائمة الأدوار المتاحة في القائمة المنسدلة
const rolesList = ["فرع", "عميل"];

// المكوّن الرئيسي
export default function PackagesPage() {
    // حالة التبويب النشط (نوع الباقة)
    const [activeTab, setActiveTab] = useState<keyof typeof typeMap>("normal");

    // حالة الدور (فرع أو عميل)
    const [selectedRole, setSelectedRole] = useState<string>("فرع");

    // حالات البحث والترقيم
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);

    // حالة تخزين النتائج وعدد الصفحات والعناصر
    const [packages, setPackages] = useState<Package[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);

    // حالة التنبيه (Toast)
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "danger" | "warning" | "info";
    } | null>(null);

    // أعمدة الجدول باللغة العربية وبالترتيب المطلوب
    const columns = [
        { id: "id", name: "المعرف" },
        { id: "user", name: "المستخدم" },
        { id: "name", name: "الاسم" },
        { id: "role", name: "الدور" },
        { id: "package_type", name: "نوع الباقة" },
        { id: "states_price", name: "سعر المحافظات" },
        { id: "regional_price", name: "السعر الإقليمي" },
        { id: "created_at", name: "تاريخ الإنشاء" },
        { id: "updated_at", name: "تاريخ التعديل" },
    ];

    // استعلام Apollo
    const { data, loading: queryLoading, error } = useQuery<PackagesResponse>(
        PACKAGES_QUERY,
        {
            variables: {
                role: selectedRole,       // القيمة من القائمة المنسدلة
                type: typeMap[activeTab], // القيمة من التبويب المختار
                search: searchTerm || null,
                page,
                limit: itemsPerPage,
            },
            fetchPolicy: "network-only",
        }
    );

    // دالة مبددة (debounce) للبحث
    const debouncedSearch = useCallback(
        debounce((val: string) => {
            setSearchTerm(val);
            setPage(1);
        }, 400),
        []
    );

    // تحديث البيانات عند وصول نتيجة الاستعلام
    useEffect(() => {
        if (data?.packages) {
            setPackages(data.packages.items);
            setTotalPages(data.packages.pages);
            setTotalItems(data.packages.total);
        }

        if (error) {
            // عرض الأخطاء (إن وجدت) في Toast
            error.graphQLErrors.forEach((err) => {
                setToast({ message: err.message, type: "warning" });
            });
        }
    }, [data, error]);

    // التبديل بين التبويبين (عادي / سريع)
    function handleTabChange(tabId: keyof typeof typeMap) {
        setActiveTab(tabId);
        setPage(1); // إعادة الصفحة للأولى عند تغيير النوع
    }

    // وظائف التنقل بين الصفحات
    const nextPage = () => {
        if (page < totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    const prevPage = () => {
        if (page > 1) {
            setPage((prev) => prev - 1);
        }
    };

    return (
        <>
            {/* العنوان الرئيسي */}
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-700 mb-2">التسعيرات</h3>
                <Link
                    href="/dashboard/packages/create"
                    className="px-3 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md"
                >
                    <i className="fas fa-plus"></i> إضافة تسعيرة
                </Link>
            </div>

            {/* شريط التوجيه (Breadcrumb) */}
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
                    <li aria-current="page">
                        <div className="flex items-center">
                            <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                            <span className="text-sm font-medium text-gray-700">التسعيرات</span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* تبويبات لاختيار نوع التسعيرة (عادي / سريع) */}
            <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-300">
                <ul className="flex flex-wrap -mb-px">
                    {tabs.map((tab) => (
                        <li key={tab.id} className="me-2">
                            <button
                                onClick={() => handleTabChange(tab.id as keyof typeof typeMap)}
                                className={`inline-block px-4 py-2 border-b-2 rounded-t-lg font-bold transition-colors duration-300 ${activeTab === tab.id
                                        ? "bg-primary border-primary text-white"
                                        : "border-transparent hover:text-primary hover:border-gray-300"
                                    }`}
                                aria-current={activeTab === tab.id ? "page" : undefined}
                            >
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* بطاقة عرض البيانات */}
            <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
                {/* العنوان داخل القسم */}
                <div className="flex items-center justify-between mb-5">
                    <h5 className="text-xl font-bold text-gray-700">
                        {typeMap[activeTab]} - {selectedRole}
                    </h5>
                    <h5 className="text-xl font-bold text-gray-700">
                        جدول التسعيرات
                    </h5>
                </div>

                {/* اختيار الدور (فرع / عميل) والقائمة المنسدلة */}
                <div className="flex items-center mb-3">
                    <label htmlFor="roleSelect" className="text-sm font-medium text-gray-700 me-2">
                        حدد الدور:
                    </label>
                    <select
                        id="roleSelect"
                        value={selectedRole}
                        onChange={(e) => {
                            setSelectedRole(e.target.value);
                            setPage(1);
                        }}
                        className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary text-right"
                    >
                        {rolesList.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>
                </div>

                {/* اختيار عدد العناصر والبحث */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <select
                            id="entries"
                            className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary text-right mx-2"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setPage(1);
                                setItemsPerPage(Number(e.target.value));
                            }}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                        <label
                            htmlFor="entries"
                            className="text-sm font-medium text-gray-700"
                        >
                            العرض
                        </label>
                    </div>

                    <div className="flex items-center space-x-3">
                        <label
                            htmlFor="search"
                            className="text-sm font-medium text-gray-700 mx-2"
                        >
                            البحث
                        </label>
                        <input
                            id="search"
                            type="text"
                            placeholder="ابحث عن تسعيرة..."
                            onChange={(e) => debouncedSearch(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1"
                        />
                    </div>
                </div>

                {/* عرض الجدول */}
                <div className="relative overflow-x-auto rounded-lg">
                    {queryLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                            <div className="loader"></div>
                        </div>
                    )}

                    <table className="min-w-full whitespace-nowrap border-collapse border border-slate-100 rounded-md text-right text-sm text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-second">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.id}
                                        scope="col"
                                        className="py-2 px-3 border border-slate-200"
                                    >
                                        {column.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-medium">
                            {error || packages.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="text-center py-2 text-gray-500"
                                    >
                                        لا توجد بيانات
                                    </td>
                                </tr>
                            ) : (
                                packages.map((pkg) => (
                                    <tr
                                        key={pkg.id}
                                        className="border-b odd:bg-white even:bg-gray-50"
                                    >
                                        <td className="py-2 px-2 border border-slate-200">
                                            {pkg.id}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {pkg.user}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {pkg.name}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {pkg.role}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {pkg.package_type}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {pkg.states_price}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {pkg.regional_price}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(pkg.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(pkg.updated_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* أدوات الترقيم (Pagination) */}
                <div className="py-3 flex items-center justify-between">
                    <span>
                        <button
                            onClick={prevPage}
                            disabled={page <= 1}
                            className="text-white bg-primary hover:bg-primary disabled:bg-gray-400 px-4 py-1 rounded-md"
                        >
                            <i className="fas fa-angle-right"></i> السابق
                        </button>
                        <span className="mx-3">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={nextPage}
                            disabled={page >= totalPages}
                            className="text-white bg-primary hover:bg-primary disabled:bg-gray-400 px-4 py-1 rounded-md"
                        >
                            التالي <i className="fas fa-angle-left"></i>
                        </button>
                    </span>
                    <span>إجمالي النتائج: {totalItems}</span>
                </div>
            </div>

            {/* تنبيهات (Toast) في حال وجود رسائل */}
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
