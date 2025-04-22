"use client";

import React, { useState, useCallback, useEffect } from "react"; // React core + hooks
import Link from "next/link"; // Client‑side navigation
import { useQuery } from "@apollo/client"; // Apollo Client hooks + gql tag
import { debounce } from "lodash"; // Debounce helper
import Toast from "@/components/Toast"; // Re‑usable toast component
import { STORES_QUERY } from "@/graphql/queries/stores"; // GraphQL query for stores
import { StoresResponse, StoreItem } from "@/graphql/types/stores"; // Type definitions for stores


// ============================== //
//         GraphQL query         //
const storeTypeMap: Record<string, string | null> = { warehouse: "عميل مستويات", branch: "عميل عادي", };

const tabs = [{ id: "warehouse", label: "المخزن العام" },
{ id: "branch", label: "المخزن الخاص" },];

// ====== 4. Table columns ====== //
const columns = [
    { id: "parent_name", name: "المخزن الأب" },
    { id: "product_name", name: "المنتج" },
    { id: "total", name: "الإجمالي" },
    { id: "damaged", name: "تالف" },
    { id: "returned", name: "مرتجع" },
    { id: "sold", name: "مباع" },
    { id: "available", name: "متاح" },
    { id: "created_at", name: "تاريخ الإنشاء" },
    { id: "updated_at", name: "تاريخ التعديل" },
    { id: "actions", name: "الإجراءات" },
];

// ============================== //
//        StoresPage component    //
// ============================== //
export default function StoresPage() {
    // Active tab (default = all)
    const [activeTab, setActiveTab] = useState<keyof typeof storeTypeMap>("warehouse");

    // Search & pagination state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);

    // Data state
    const [stores, setStores] = useState<StoreItem[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);

    // Toast state
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "danger" | "warning" | "info";
    } | null>(null);

    // ====== Apollo useQuery ====== //
    const { data, loading: queryLoading, error } = useQuery<StoresResponse>(
        STORES_QUERY,
        {
            variables: {
                store_type: storeTypeMap[activeTab],
                search: searchTerm || null,
                page,
                limit: itemsPerPage,
            },
            fetchPolicy: "network-only", // Always hit the network for fresh data
        },
    );

    // ====== Debounced search ====== //
    const debouncedSearch = useCallback(
        debounce((val: string) => {
            setSearchTerm(val);
            setPage(1);
        }, 400),
        [],
    );

    // ====== Handle incoming data / errors ====== //
    useEffect(() => {
        if (data?.stores) {
            setStores(data.stores.items);
            setTotalPages(data.stores.pages);
            setTotalItems(data.stores.total);
        }

        if (error) {
            error.graphQLErrors.forEach(err => {
                setToast({ message: err.message, type: "warning" });
            });
        }
    }, [data, error]);

    // ====== Pagination helpers ====== //
    const nextPage = () => page < totalPages && setPage(prev => prev + 1);
    const prevPage = () => page > 1 && setPage(prev => prev - 1);

    // ====== Component render ====== //
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-700 mb-2">المخازن</h3>
            </div>

            {/* Breadcrumb */}
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
                            <span className="text-sm font-medium text-gray-700">المخازن</span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* Tabs */}
            <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-300">
                <ul className="flex flex-wrap -mb-px">
                    {tabs.map(tab => (
                        <li key={tab.id} className="me-2">
                            <button
                                onClick={() => {
                                    setActiveTab(tab.id as keyof typeof storeTypeMap);
                                    setPage(1);
                                }}
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

            {/* Container */}
            <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
                {/* Section titles */}
                <div className="flex items-center justify-between">
                    <h5 className="text-xl font-bold text-gray-700 mb-5">
                        {storeTypeMap[activeTab] ?? "كل الأنواع"}
                    </h5>
                    <h5 className="text-xl font-bold text-gray-700 mb-5">جدول المخازن</h5>
                </div>

                {/* Controls: entries + search */}
                <div className="flex items-center justify-between mb-3">
                    {/* Items per page */}
                    <div className="flex items-center space-x-3">
                        <select
                            id="entries"
                            className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-right mx-2"
                            value={itemsPerPage}
                            onChange={e => {
                                setPage(1);
                                setItemsPerPage(Number(e.target.value));
                            }}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                        <label htmlFor="entries" className="text-sm font-medium text-gray-700">
                            العرض
                        </label>
                    </div>

                    {/* Search */}
                    <div className="flex items-center space-x-3">
                        <label htmlFor="search" className="text-sm font-medium text-gray-700 mx-2">
                            البحث
                        </label>
                        <input
                            id="search"
                            type="text"
                            placeholder="ابحث في المخازن..."
                            onChange={e => debouncedSearch(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="relative overflow-x-auto rounded-lg">
                    {queryLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                            <div className="loader" />
                        </div>
                    )}

                    <table className="min-w-full whitespace-nowrap border-collapse border border-slate-100 rounded-md text-right text-sm text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-second">
                            <tr>
                                {columns.map(col => (
                                    <th key={col.id} scope="col" className="py-2 px-3 border border-slate-200">
                                        {col.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-medium">
                            {error || stores.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-2 text-gray-500">
                                        لا توجد بيانات
                                    </td>
                                </tr>
                            ) : (
                                stores.map(store => (
                                    <tr key={store.id} className="border-b odd:bg-white even:bg-gray-50">
                                        <td className="py-2 px-2 border border-slate-200">{store.parent_name}</td>
                                        <td className="py-2 px-2 border border-slate-200">{store.product_name}</td>
                                        <td className="py-2 px-2 border border-slate-200">{store.total}</td>
                                        <td className="py-2 px-2 border border-slate-200">{store.damaged}</td>
                                        <td className="py-2 px-2 border border-slate-200">{store.returned}</td>
                                        <td className="py-2 px-2 border border-slate-200">{store.sold}</td>
                                        <td className="py-2 px-2 border border-slate-200">{store.available}</td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(store.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(store.updated_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            <Link href={`/dashboard/stores/update/${store.id}`} className="px-2 py-1 text-xs ml-2 font-medium text-center text-white bg-blue-600 hover:bg-blue-700 rounded-md" >
                                                تعديل
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="py-3 flex items-center justify-between">
                    <span>
                        <button
                            onClick={prevPage}
                            disabled={page <= 1}
                            className="text-white bg-primary hover:bg-primary disabled:bg-gray-400 px-4 py-1 rounded-md"
                        >
                            <i className="fas fa-angle-right" /> السابق
                        </button>
                        <span className="mx-3">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={nextPage}
                            disabled={page >= totalPages}
                            className="text-white bg-primary hover:bg-primary disabled:bg-gray-400 px-4 py-1 rounded-md"
                        >
                            التالي <i className="fas fa-angle-left" />
                        </button>
                    </span>
                    <span>المجموع ( {totalItems} )</span>
                </div>
            </div>

            {/* Toast */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
}
