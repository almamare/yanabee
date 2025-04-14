"use client";

import React, { useState, useCallback, useEffect } from "react";  // Import React and necessary hooks
import Link from "next/link"; // Import Link for navigation
import { useQuery, useMutation } from "@apollo/client"; // Import useQuery from Apollo Client for GraphQL queries
import { debounce } from "lodash";  // Import debounce from lodash for debouncing search input
import Toast from "@/components/Toast"; // Import Toast component for notifications
import { RATINGS_QUERY } from "@/graphql/queries/settings"; // Adjust the import path as necessary
import { DELETE_RATING } from "@/graphql/mutations/settings"; // Adjust the import path as necessary
import { Ratings } from "@/graphql/types/settings"; // Adjust the import path as necessary
import StarRating from "@/components/StarRating"; // Import StarRating component for displaying ratings
import ConfirmDialog from "@/components/ConfirmDialog"; // Import ConfirmDialog component for confirmation dialogs

// Define the role map for tab labels
const roleMap = { client: "عميل", branch: "فرع", coruser: "مندوب" };

// Define the tabs for the ratings page
const tabs = [{ id: "client", label: "العملاء" }, { id: "branch", label: "الفروع" }, { id: "coruser", label: "المندوبين" }];

export default function RatingsPage() {
    // State to manage the active tab, search term, pagination, and ratings data
    const [activeTab, setActiveTab] = useState<keyof typeof roleMap>("client");

    // State to manage the search term, current page, items per page, ratings data, total pages, and total items
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1); // Current page for pagination
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // State to manage the ratings data, total pages, and total items
    const [ratings, setRatings] = useState<Ratings[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    // State to handle the confirm dialog
    const [showConfirm, setShowConfirm] = useState(false);
    // Store the currently selected rating ID for deletion
    const [selectedRatingId, setSelectedRatingId] = useState<string | null>(null);

    // State to manage toast notifications 
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "warning" | "info"; } | null>(null);
    const [deleteRating] = useMutation(DELETE_RATING); // Mutation to delete a rating

    // GraphQL query to fetch ratings data based on the active tab, search term, and pagination
    const columns = [
        { id: "user", name: "المستخدم" },
        { id: "role", name: "الدور" },
        { id: "rating", name: "التقييم" },
        { id: "feedback", name: "التعليق" },
        { id: "created_at", name: "تاريخ الإنشاء" },
        { id: "id", name: "الإجراءات" },
    ];

    // GraphQL query to fetch ratings data
    const { data, loading: queryLoading, error } = useQuery(RATINGS_QUERY, {
        variables: {
            role: roleMap[activeTab],
            search: searchTerm,
            page,
            limit: itemsPerPage,
        },
        fetchPolicy: "network-only",
    });

    const handleDeleteRating = async (ratingId: string) => {
        try {
            const { data } = await deleteRating({
                variables: { id: ratingId },
            });
            if (data.deleteRating.status === true) {
                setShowConfirm(false);
                setToast({ message: data.deleteRating.message, type: "success" });
                setRatings((prev) => prev.filter((rating) => rating.id !== ratingId));
            }
        } catch (err) {
            if (err instanceof Error) {
                // Handle specific error messages based on your GraphQL server response
                setToast({ message: err.message, type: "danger" });
            } else {
                // Handle unknown errors
                setToast({ message: "An unknown error occurred", type: "danger" });
            }
        }
    }

    // Debounce the search input to avoid excessive API calls
    const debouncedSearch = useCallback(
        debounce((val) => {
            setSearchTerm(val);
            setPage(1);
        }, 400),
        []
    );

    // Effect to handle the data and error from the GraphQL query
    useEffect(() => {
        if (data?.ratings) {
            setRatings(data.ratings.items);
            setTotalPages(data.ratings.pages);
            setTotalItems(data.ratings.total);
        }

        if (error) {
            error.graphQLErrors.forEach((err) => {
                setToast({ message: err.message, type: "warning" });
            });
        }
    }, [data, error]);

    // Effect to set the initial active tab based on the URL
    function handleTabChange(tabId: keyof typeof roleMap) {
        setActiveTab(tabId);
        setPage(1);
    }

    // Function to handle pagination
    const nextPage = () => {
        if (page < totalPages) {
            setPage((prev) => prev + 1);
        }
    };
    // Function to handle pagination
    const prevPage = () => {
        if (page > 1) {
            setPage((prev) => prev - 1);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-700 mb-2">التقييمات</h3>
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
                                التقييمات
                            </span>
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
                                ? "bg-primary border-primary text-white" : "border-transparent hover:text-primary hover:border-gray-300"}`} aria-current={activeTab === tab.id ? "page" : undefined} >
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Ratings Table */}
            <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
                {/* Current role and ratings table header */}
                <div className="flex items-center justify-between">
                    <h5 className="text-xl font-bold text-gray-700 mb-5">
                        الدور الحالي: {roleMap[activeTab]}
                    </h5>
                    <h5 className="text-xl font-bold text-gray-700 mb-5">
                        جدول التقييمات
                    </h5>
                </div>

                {/* Items per page and search input */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <select id="entries" className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-right mx-2"
                            value={itemsPerPage} onChange={(e) => { setPage(1); setItemsPerPage(Number(e.target.value)); }} >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                        <label htmlFor="entries" className="text-sm font-medium text-gray-700">
                            العرض
                        </label>
                    </div>

                    {/* Search input */}
                    <div className="flex items-center space-x-3">
                        <label htmlFor="search" className="text-sm font-medium text-gray-700 mx-2">
                            البحث
                        </label>
                        <input id="search" type="text" placeholder="ابحث..." onChange={(e) => debouncedSearch(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" />
                    </div>
                </div>

                {/* Ratings table */}
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
                                    <th key={column.id} scope="col" className="py-2 px-3 border border-slate-200" >
                                        {column.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-medium">
                            {error || ratings.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-2 text-gray-500" >
                                        لا توجد بيانات
                                    </td>
                                </tr>
                            ) : (
                                ratings.map((item) => (
                                    <tr key={item.id} className="border-b odd:bg-white even:bg-gray-50">
                                        <td className="py-2 px-2 border border-slate-200">
                                            {item.user}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {item.role}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            <StarRating rating={item.rating} readOnly />
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {item.feedback}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(item.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            <button className="px-3 py-1 text-xs font-medium text-center text-white bg-red-600 hover:bg-gray-600 rounded-md" onClick={() => { setSelectedRatingId(item.id); setShowConfirm(true); }}>
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

            {/* Confirm Dialog */}
            {showConfirm && (<ConfirmDialog message="هل تريد حذف هذا العنصر؟ اضغط على موافق للتأكيد." onConfirm={() => { if (selectedRatingId) { handleDeleteRating(selectedRatingId); } }} onCancel={() => setShowConfirm(false)} />)}

            {/* Toast notification for errors or success messages */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
}
