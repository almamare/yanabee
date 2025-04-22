"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useQuery, gql } from "@apollo/client";
import { debounce } from "lodash";
import Toast from "@/components/Toast"; // Import Toast component for notifications


// ====== استعلام GraphQL لجلب الأرصدة (Balances) ====== //
const BALANCES_QUERY = gql`
  query Balances($role: String, $search: String, $page: Int, $limit: Int) {
    balances(role: $role, search: $search, page: $page, limit: $limit) {
      total
      pages
      items {
        id
        amount
        currency
        role
        user
        address
        created_at
        updated_at
      }
    }
  }
`;

// خريطة الأدوار الأربعة
const roleMap: Record<string, string> = {
    manager: "مدير",
    client: "عميل",
    branch: "فرع",
    rep: "مندوب",
};

// التبويبات التي تظهر للمستخدم
const tabs = [
    { id: "manager", label: "المدراء" },
    { id: "client", label: "العملاء" },
    { id: "branch", label: "الفروع" },
    { id: "rep", label: "المندوبين" },
];

// أنواع البيانات (لو تستخدم TypeScript يمكن أن تكون مفيدة)
interface Balance {
    id: number;
    amount: number;
    currency: string;
    role: string;
    user: string;
    address: string;
    created_at: string;
    updated_at: string;
}

interface BalancesResponse {
    balances: {
        total: number;
        pages: number;
        items: Balance[];
    };
}

export default function BalancesPage() {
    // تبويب نشط افتراضيًّا (مثلًا أوّل تبويب هو "manager")
    const [activeTab, setActiveTab] = useState<keyof typeof roleMap>("manager");

    // حالات البحث والترقيم
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);

    // تخزين النتائج
    const [balances, setBalances] = useState<Balance[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);

    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "warning" | "info" } | null>(null);

    // أعمدة الجدول
    const columns = [
        { id: "id", name: "المعرّف" },
        { id: "amount", name: "المبلغ" },
        { id: "currency", name: "العملة" },
        { id: "role", name: "الدور" },
        { id: "user", name: "المستخدم" },
        { id: "address", name: "العنوان" },
        { id: "created_at", name: "تاريخ الإنشاء" },
        { id: "updated_at", name: "تاريخ التعديل" },
    ];

    // استعلام الأرصدة مع المتغيرات: الدور، البحث، الصفحة، الحد
    const { data, loading, error } = useQuery<BalancesResponse>(BALANCES_QUERY, {
        variables: {
            role: roleMap[activeTab], // تمرير الدور بناءً على التبويب
            search: searchTerm || null,
            page,
            limit: itemsPerPage,
        },
        fetchPolicy: "network-only",
    });

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
        if (data?.balances) {
            setBalances(data.balances.items);
            setTotalPages(data.balances.pages);
            setTotalItems(data.balances.total);
        }

        if (error) {
            error.graphQLErrors.forEach((err) => {
                const validTypes: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info"];
                const toastType = validTypes.includes(err.extensions?.code as any) ? (err.extensions?.code as "success" | "danger" | "warning" | "info") : "danger";
                setToast({ message: err.message, type: toastType });
            });
        }
    }, [data, error]);

    // التبديل بين التبويبات (أدوار مختلفة)
    function handleTabChange(tabId: keyof typeof roleMap) {
        setActiveTab(tabId);
        setPage(1); // إعادة الصفحة للأولى عند تغيير الدور
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
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-700 mb-2">الصناديق</h3>
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
                    <li aria-current="page">
                        <div className="flex items-center">
                            <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                            <span className="text-sm font-medium text-gray-700">الصناديق</span>
                        </div>
                    </li>
                </ol>
            </nav>

            <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-300">
                <ul className="flex flex-wrap -mb-px">
                    {tabs.map((tab) => (
                        <li key={tab.id} className="me-2">
                            <button
                                onClick={() => handleTabChange(tab.id as keyof typeof roleMap)}
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

            <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
                <div className="flex items-center justify-between">
                    <h5 className="text-xl font-bold text-gray-700 mb-5">
                        دور: {roleMap[activeTab]}
                    </h5>
                    <h5 className="text-xl font-bold text-gray-700 mb-5">
                        جدول الصناديق
                    </h5>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <select
                            id="entries"
                            className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-right mx-2"
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
                            placeholder="ابحث عن رصيد..."
                            onChange={(e) => debouncedSearch(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" />
                    </div>
                </div>

                <div className="relative overflow-x-auto rounded-lg">
                    {loading && (
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
                            {!loading && (error || balances.length === 0) ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-2 text-gray-500" >
                                        لا توجد بيانات
                                    </td>
                                </tr>
                            ) : (
                                balances.map((balance) => (
                                    <tr
                                        key={balance.id}
                                        className="border-b odd:bg-white even:bg-gray-50"
                                    >
                                        <td className="py-2 px-2 border border-slate-200">
                                            {balance.id}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {balance.amount}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {balance.currency}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {balance.role}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {balance.user}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {balance.address}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(balance.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(balance.updated_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

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
                    <span>المجموع ( {totalItems} )</span>
                </div>
            </div>

            {/* Toast notification for errors or success messages */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
}
