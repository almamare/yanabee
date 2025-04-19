"use client";

import React, { useState, useCallback, useEffect } from "react"; // Import React and hooks
import Link from "next/link"; // Import Link for navigation
import { useQuery, useMutation } from "@apollo/client"; // Import Apollo Client for GraphQL queries
import { debounce } from "lodash"; // Import lodash for debouncing
import Toast from "@/components/Toast"; // Import Toast component for notifications
import { ADVERTISEMENTS_QUERY } from "@/graphql/queries/settings"; // Import GraphQL query for advertisements
import { AdvertisementsResponse, Advertisement } from "@/graphql/types/settings"; // Import types for advertisements
import ConfirmDialog from "@/components/ConfirmDialog"; // Import ConfirmDialog component for confirmation dialogs
import { DELETE_ADVERTISEMENT } from "@/graphql/mutations/settings"; // Import GraphQL mutation for deleting advertisements


// Define a mapping for roles to their Arabic translations
const roleMap: Record<string, string> = { client: "عميل", branch: "فرع", rep: "مندوب", customer: "زبون", };
// Define a mapping for roles to their English translations
const tabs = [{ id: "client", label: "العملاء" }, { id: "branch", label: "الفروع" }, { id: "rep", label: "المندوبين" }, { id: "customer", label: "الزبائن" }];

export default function AdvertisementsPage() {
    // Initialize state variables
    const [activeTab, setActiveTab] = useState<keyof typeof roleMap>("client");
    // Initialize state for search term, pagination, and advertisements
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);

    // Initialize state for advertisements, total pages, and total items
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);

    // Initialize state for selected advertisement ID and confirmation dialog
    const [showConfirm, setShowConfirm] = useState(false);

    // Initialize state for selected advertisement ID
    const [selectId, setSelectId] = useState<string | null>(null);

    // Initialize mutation for deleting advertisements
    const [deleteAdvertisement] = useMutation(DELETE_ADVERTISEMENT)

    // Initialize state for toast notifications
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "warning" | "info" } | null>(null);

    // Define columns for the table
    const columns = [
        { id: "title", name: "العنوان" },
        { id: "img", name: "الصورة" },
        { id: "role", name: "الدور" },
        { id: "created_at", name: "تاريخ الإنشاء" },
        { id: "updated_at", name: "تاريخ التعديل" },
        { id: "actions", name: "الإجراءات" },
    ];

    // Fetch advertisements data using Apollo Client
    const { data, loading: queryLoading, error } = useQuery<AdvertisementsResponse>(
        ADVERTISEMENTS_QUERY,
        {
            variables: {
                role: roleMap[activeTab], // Get the role based on the active tab
                search: searchTerm || null, // Use the search term for filtering
                page, // Current page for pagination
                limit: itemsPerPage, // Number of items per page
            },
            fetchPolicy: "network-only",
        }
    );

    // Handle delete advertisement
    const handleDeleteAdvertisement = async (id: string) => {
        try {
            const { data } = await deleteAdvertisement({
                variables: { id },
            });

            if (data?.deleteAdvertisement?.status === true) {
                setShowConfirm(false);
                setToast({ message: data.deleteAdvertisement.message, type: "success" });

                // Remove the deleted ad from the local state
                setAds((prev) => prev.filter((ad) => ad.id.toString() !== id));
            }
        } catch (err: any) {
            if (err?.graphQLErrors && Array.isArray(err.graphQLErrors)) {
                err.graphQLErrors.forEach((graphqlError: any) => {
                    const validTypes: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info"];
                    const toastType = validTypes.includes(graphqlError.extensions?.code)
                        ? (graphqlError.extensions.code as "success" | "danger" | "warning" | "info")
                        : "danger";
                    setToast({ message: graphqlError.message, type: toastType });
                });
            } else if (err instanceof Error) {
                setToast({ message: err.message, type: "danger" });
            } else {
                setToast({ message: "An unknown error occurred", type: "danger" });
            }
        }
    };

    // Debounce the search input to avoid excessive API calls
    const debouncedSearch = useCallback(
        debounce((val: string) => {
            setSearchTerm(val);
            setPage(1);
        }, 400),
        []
    );

    // Effect to handle data and error from the query
    useEffect(() => {
        if (data?.advertisements) {
            setAds(data.advertisements.items);
            setTotalPages(data.advertisements.pages);
            setTotalItems(data.advertisements.total);
        }

        if (error) {
            error.graphQLErrors.forEach((err) => {
                const validTypes: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info"];
                const toastType = validTypes.includes(err.extensions?.code as any) ? (err.extensions?.code as "success" | "danger" | "warning" | "info") : "danger";
                setToast({ message: err.message, type: toastType });
            });
        }
    }, [data, error]);

    // Handle tab change and reset pagination
    function handleTabChange(tabId: keyof typeof roleMap) {
        setActiveTab(tabId);
        setPage(1);
    }

    // Function to handle page change
    const nextPage = () => {
        if (page < totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    // Function to handle previous page change
    const prevPage = () => {
        if (page > 1) {
            setPage((prev) => prev - 1);
        }
    };

    return (
        <>
            {/* Sidebar component can be included here if needed */}
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-700 mb-2">الإعلانات</h3>
                <Link href="/dashboard/advertisements/create" className="px-3 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md">
                    <i className="fas fa-plus"></i> إضافة إعلان
                </Link>
            </div>

            {/* Breadcrumb navigation for better UX */}
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
                            <span className="text-sm font-medium text-gray-700">الإعلانات</span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* Tabs for different roles */}
            <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-300">
                <ul className="flex flex-wrap -mb-px">
                    {tabs.map((tab) => (
                        <li key={tab.id} className="me-2">
                            <button onClick={() => handleTabChange(tab.id as keyof typeof roleMap)} className={`inline-block px-4 py-2 border-b-2 rounded-t-lg font-bold transition-colors duration-300 ${activeTab === tab.id
                                ? "bg-primary border-primary text-white" : "border-transparent hover:text-primary hover:border-gray-300"}`} aria-current={activeTab === tab.id ? "page" : undefined}>
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Table for displaying advertisements */}
            <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
                {/* Header for the table */}
                <div className="flex items-center justify-between">
                    <h5 className="text-xl font-bold text-gray-700 mb-5">
                        الدور الحالي: {roleMap[activeTab]}
                    </h5>
                    <h5 className="text-xl font-bold text-gray-700 mb-5">
                        جدول الإعلانات
                    </h5>
                </div>

                {/* Pagination and search controls */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <select id="entries" className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-right mx-2"
                            value={itemsPerPage} onChange={(e) => { setPage(1); setItemsPerPage(Number(e.target.value)); }}>
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
                        <input id="search" type="text" placeholder="ابحث عن إعلان..." onChange={(e) => debouncedSearch(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" />
                    </div>
                </div>

                {/* Table for displaying advertisements */}
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
                            {error || ads.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-2 text-gray-500">
                                        لا توجد بيانات
                                    </td>
                                </tr>
                            ) : (
                                ads.map((ad) => (
                                    <tr key={ad.id} className="border-b odd:bg-white even:bg-gray-50" >
                                        <td className="py-2 px-2 border border-slate-200">
                                            {ad.title}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            <img src={ad.img} alt={ad.title} className="w-16 h-16 object-cover rounded" />
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {ad.role}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(ad.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(ad.updated_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            <button className="px-3 py-1 text-xs font-medium text-center text-white bg-red-600 hover:bg-red-700 rounded-md" onClick={() => { setSelectId(ad.id.toString()); setShowConfirm(true); }}>
                                                حذف
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination controls */}
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

            {/* Confirmation dialog for deleting an advertisement */}
            {showConfirm && (<ConfirmDialog message="هل تريد حذف هذا العنصر؟ اضغط على موافق للتأكيد." onConfirm={() => { if (selectId) { handleDeleteAdvertisement(selectId); } }} onCancel={() => setShowConfirm(false)} />)}


            {/* Toast notification for errors or success messages */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
}
