"use client";

import React, { useState, useCallback, useEffect } from "react";    // Import React
import Link from "next/link";                                       // Import Link from Next.js
import { useQuery } from "@apollo/client";                          // Import useQuery hook from Apollo Client
import { debounce } from "lodash";                                  // Import debounce from lodash
import { UsersResponse, User } from "@/graphql/types/UsersTypes";   // Import User and UsersResponse types
import { USERS_QUERY } from "@/graphql/queries/queries";            // Import the USERS_QUERY
import Toast from "@/components/Toast";                             // Import the Toast component


// Tabs: role-based filters
const roleMap: Record<string, string> = {
    client: "عميل",
    manager: "مدير",
    branch: "فرع",
    coruser: "مندوب",
    coustemr: "زبون",
};

// Tabs: role-based filters with labels
const tabs = [
    { id: "client", label: "العملاء" },
    { id: "manager", label: "المدراء" },
    { id: "branch", label: "الفروع" },
    { id: "coruser", label: "المندوبين" },
    { id: "coustemr", label: "الزبائن" },
];

export default function UsersPage() {
    // Active role tab
    const [activeTab, setActiveTab] = useState<keyof typeof roleMap>("client");

    // Pagination & Search states
    const [page, setPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [users, setUsers] = useState<User[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);

    // Toast state for notifications (success, error, warning, info)
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "warning" | "info" } | null>(null);

    // Handle tab changes (updates the role filter)
    function handleTabChange(tab: keyof typeof roleMap) {
        setActiveTab(tab);
        setPage(1); // Reset to page 1 when changing the role filter
    }

    // Debounced search change
    const debouncedSearch = useCallback(
        debounce((val: string) => {
            setSearchTerm(val);
            setPage(1);
        }, 400),
        []
    );

    // Our columns for users
    const columns = [
        { id: "id", name: "المعرف" },
        { id: "name", name: "الاسم" },
        { id: "surname", name: "اللقب" },
        { id: "phone", name: "الهاتف" },
        { id: "email", name: "البريد الإلكتروني" },
        { id: "code", name: "الرمز" },
        { id: "number", name: "الرقم" },
        { id: "role", name: "الدور" },
        { id: "user_type", name: "نوع المستخدم" },
        { id: "status", name: "الحالة" },
        { id: "created_at", name: "تاريخ الإنشاء" },
        { id: "updated_at", name: "تاريخ التعديل" },
    ];

    // Execute the query – using activeTab for role filter
    const { data, loading: queryLoading, error} = useQuery<{ users: UsersResponse }>(
        USERS_QUERY,
        {
            variables: {
                role: roleMap[activeTab], // Convert the role ID to the role name
                search: searchTerm,       // Search term
                page,                     // Current page
                limit: itemsPerPage,      // Items per page
            },
            fetchPolicy: "network-only",
        });

    // Update users when data is fetched
    useEffect(() => {
        if (data?.users) {
            setUsers(data.users.items); // Update users
            setTotalPages(data.users.pages); // Update total pages
            setTotalItems(data.users.total); // Update total items

        }
        if (error) {
            error.graphQLErrors.forEach((err) => {
                setToast({ message: err.message, type: "warning" });
            });
        }
    }, [data, error])

    // Pagination helpers
    const nextPage = () => {
        if (page < totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    // Previous page
    const prevPage = () => {
        if (page > 1) {
            setPage((prev) => prev - 1);
        }
    };

    return (
        <>
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-700 mb-2">المستخدمين</h3>
                <Link href="/dashboard/users/create" className="px-3 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md">
                    <i className="fas fa-plus"></i> إضافة مستخدم
                </Link>
            </div>

            {/* Breadcrumb */}
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:text-second">
                            لوحة التحكم
                        </Link>
                    </li>
                    <li aria-current="page">
                        <div className="flex items-center">
                            <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                            <span className="text-sm font-medium text-gray-700">
                                المستخدمين
                            </span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* Tabs */}
            <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-300">
                <ul className="flex flex-wrap -mb-px">
                    {tabs.map((tab) => (
                        <li key={tab.id} className="me-2">
                            <button onClick={() => handleTabChange(tab.id as keyof typeof roleMap)}
                                className={`inline-block px-4 py-2 border-b-2 rounded-t-lg font-bold transition-colors duration-300 ${activeTab === tab.id ? "bg-primary border-primary text-white" : "border-transparent hover:text-primary hover:border-gray-300"}`}
                                aria-current={activeTab === tab.id ? "page" : undefined}>
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Table Container */}
            <div className="p-4 bg-white shadow-sm rounded-lg mt-5">

                {/* Page Title */}
                <div className="flex items-center justify-between">
                    <h5 className="text-xl font-bold text-gray-700 mb-5">
                        الدور الحالي: {roleMap[activeTab]}
                    </h5>
                    <h5 className="text-xl font-bold text-gray-700 mb-5">
                        جدول المستخدمين
                    </h5>
                </div>

                {/* Entries & Search */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <select id="entries" className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-right mx-2" value={itemsPerPage}
                            onChange={(e) => { setPage(1); setItemsPerPage(Number(e.target.value)); }}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                        <label htmlFor="entries" className="text-sm font-medium text-gray-700">
                            العرض
                        </label>
                    </div>

                    <div className="flex items-center space-x-3">
                        <label htmlFor="search" className="text-sm font-medium text-gray-700 mx-2">
                            البحث
                        </label>
                        <input id="search" type="text" placeholder="أكتب رقم..." onChange={(e) => debouncedSearch(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"/>
                    </div>
                </div>

                {/* Data Table */}
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
                                    <th key={column.id} scope="col" className="py-2 px-3 border border-slate-200">
                                        {column.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-medium">
                            {error ? (
                                    <tr>
                                        <td colSpan={columns.length} className="text-center py-2 text-gray-500">
                                            لا توجد بيانات
                                        </td>
                                    </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b odd:bg-white even:bg-gray-50">
                                        <td className="py-2 px-2 border border-slate-200">
                                            <Link href={`/dashboard/users/details/${user.id}`}
                                                className="px-3 py-1 text-xs font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md">
                                                {user.code}{user.number}
                                            </Link>
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">{user.name}</td>
                                        <td className="py-2 px-2 border border-slate-200">{user.surname}</td>
                                        <td className="py-2 px-2 border border-slate-200">{user.phone}</td>
                                        <td className="py-2 px-2 border border-slate-200">{user.email}</td>
                                        <td className="py-2 px-2 border border-slate-200">{user.code}</td>
                                        <td className="py-2 px-2 border border-slate-200">{user.number}</td>
                                        <td className="py-2 px-2 border border-slate-200">{user.role}</td>
                                        <td className="py-2 px-2 border border-slate-200">{user.user_type}</td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            <span className={`px-2 py-0.5 rounded-md ${user.status === "نشط" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(user.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(user.updated_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="py-3 flex items-center justify-between">
                    <span>
                        <button onClick={prevPage} disabled={page <= 1} className="text-white bg-primary hover:bg-primary disabled:bg-gray-400 px-4 py-1 rounded-md">
                            <i className="fas fa-angle-right"></i> السابق
                        </button>
                        <span className="mx-3">
                            {page} / {totalPages}
                        </span>
                        <button onClick={nextPage} disabled={page >= totalPages} className="text-white bg-primary hover:bg-primary disabled:bg-gray-400 px-4 py-1 rounded-md">
                            التالي <i className="fas fa-angle-left"></i>
                        </button>
                    </span>
                    <span>المجموع ( {totalItems} )</span>
                </div>
            </div>

            {/* Toast notifications */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}
