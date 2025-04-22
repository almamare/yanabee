"use client";

import React, { useState, useCallback, useEffect } from "react"; // Import React and necessary hooks
import Link from "next/link"; // Import Link for navigation
import { useQuery } from "@apollo/client"; // Import useQuery from Apollo Client for GraphQL queries
import { debounce } from "lodash"; // Import debounce from lodash for debouncing input changes
import Toast from "@/components/Toast"; // Import Toast component for displaying messages
import { PRODUCTS_QUERY } from "@/graphql/queries/products";  // Import the GraphQL query for fetching products
import { ProductsResponse, Product } from "@/graphql/types/products";  // Import the types for the products response and product

// Define the GraphQL query to fetch products
const roleMap: Record<string, string> = { levels: "عميل مستويات", normal: "عميل عادي" };
// Define the roleMap object with keys as tab IDs and values as role types
const tabs = [{ id: "levels", label: "عميل مستويات" }, { id: "normal", label: "عميل عادي" }];

// Define the ProductsPage component
export default function ProductsPage() {
    // State variables for managing the component's state
    const [activeTab, setActiveTab] = useState<keyof typeof roleMap>("levels");
    // Set the initial active tab to "levels"
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    // Set the initial items per page to 10
    const [products, setProducts] = useState<Product[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    // Set the initial total pages and total items to 0
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "warning" | "info"; } | null>(null);

    const columns = [
        { id: "name", name: "الاسم" },
        { id: "number", name: "الرقم" },
        { id: "short_desc", name: "وصف قصير" },
        { id: "description", name: "الوصف" },
        { id: "discount_price", name: "السعر المخفض" },
        { id: "regular_price", name: "السعر العادي" },
        { id: "discount", name: "الخصم" },
        { id: "status", name: "الحالة" },
        { id: "barcode", name: "الباركود" },
        { id: "created_at", name: "تاريخ الإنشاء" },
        { id: "updated_at", name: "تاريخ التعديل" },
        { id: "actions", name: "الإجراءات" },
    ];

    // Use the useQuery hook to fetch products data from the GraphQL API
    const { data, loading: queryLoading, error } = useQuery<ProductsResponse>(
        PRODUCTS_QUERY,
        {
            variables: {
                role_type: roleMap[activeTab],
                search: searchTerm || null,
                page,
                limit: itemsPerPage,
            },
            fetchPolicy: "network-only",
        }
    );

    const debouncedSearch = useCallback(
        debounce((val: string) => {
            setSearchTerm(val);
            setPage(1);
        }, 400),
        []
    );

    useEffect(() => {
        if (data?.products) {
            setProducts(data.products.items);
            setTotalPages(data.products.pages);
            setTotalItems(data.products.total);
        }

        if (error) {
            error.graphQLErrors.forEach((err) => {
                setToast({ message: err.message, type: "warning" });
            });
        }
    }, [data, error]);

    function handleTabChange(tabId: keyof typeof roleMap) {
        setActiveTab(tabId);
        setPage(1);
    }

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
                <h3 className="text-3xl font-bold text-gray-700 mb-2">المنتجات</h3>
                <Link
                    href="/dashboard/products/create"
                    className="px-3 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md"
                >
                    <i className="fas fa-plus"></i> إضافة منتج
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
                    <li aria-current="page">
                        <div className="flex items-center">
                            <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                            <span className="text-sm font-medium text-gray-700">المنتجات</span>
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
                        {roleMap[activeTab]}
                    </h5>
                    <h5 className="text-xl font-bold text-gray-700 mb-5">
                        جدول المنتجات
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
                        <label htmlFor="entries" className="text-sm font-medium text-gray-700">
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
                            placeholder="ابحث عن منتج..."
                            onChange={(e) => debouncedSearch(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                        />
                    </div>
                </div>

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
                            {error || products.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="text-center py-2 text-gray-500"
                                    >
                                        لا توجد بيانات
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b odd:bg-white even:bg-gray-50"
                                    >
                                        <td className="py-2 px-2 border border-slate-200">
                                            {product.name}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {product.number}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {product.short_desc}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {product.description}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {product.discount_price}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {product.regular_price}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {product.discount}%
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            <span
                                                className={`px-2 py-0.5 rounded-md ${product.status === "متوفر"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {product.barcode}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(product.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(product.updated_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            <Link href={`/dashboard/products/update/${product.id}`} className="px-2 py-1 text-xs ml-2 font-medium text-center text-white bg-blue-600 hover:bg-blue-700 rounded-md" >
                                                تعديل
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* أدوات الترقيم */}
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
