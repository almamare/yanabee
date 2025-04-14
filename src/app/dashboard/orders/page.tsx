"use client";

import React, { useEffect, useState, useMemo } from "react"; // Import React and necessary hooks
import Link from "next/link"; // Import Link for navigation
import { useQuery } from "@apollo/client"; // Import useQuery from Apollo Client for GraphQL queries
import { debounce } from "lodash"; // Import debounce from lodash for debouncing search input
import { SHIPMENTS_QUERY } from "@/graphql/queries/shipments"; // Import the SHIPMENTS_QUERY from your GraphQL queries
import { ShipmentsResponse, Shipments } from "@/graphql/types/shipments"; // Import types for shipments
import Toast from "@/components/Toast";  // Import Toast component for notifications


// Define the statuses for in-progress and archived shipments
const inProgressStatuses = ["قيد الانتظار", "مؤكد", "غير مؤكد", "تم التنفيذ", "قيد التوصيل", "قيد الارجاع", "مرتجعة", "مكتملة", "ملغاة", "مستلم جزئي"];
// Define the archived statuses
const archivedStatuses = ["مرتجعة", "مكتملة", "ملغاة", "مستلم جزئي"];
// Define the shipment types
const ShipmentType = { inProgress: "قيد العمل", archived: "مؤرشفة" }

// Define the columns for the table
const columns = [
    { id: "order_no", name: "رقم الطلب" },
    { id: "tracking_no", name: "رقم التتبع" },
    { id: "note", name: "ملاحظة" },
    { id: "amount", name: "المبلغ" },
    { id: "status", name: "الحالة" },
    { id: "type", name: "نوع التوصيل" },
    { id: "order_type", name: "نوع البريد" },
    { id: "created_by", name: "المستخدم" },
    { id: "created_at", name: "تاريخ الإنشاء" },
    { id: "updated_at", name: "تاريخ التحديث" },
    { id: "delivered_date", name: "تاريخ التسليم" },
];

export default function OrdersPage() {
    // Initialize state variables
    const [mode, setMode] = useState<"inProgress" | "archived">("inProgress");

    // Set the initial active status based on the mode
    const [activeStatus, setActiveStatus] = useState<string>(inProgressStatuses[0]);

    // Toast state for notifications (success, error, warning, info)
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "warning" | "info" } | null>(null);

    // State variables for managing shipments, pagination, and search
    const [shipments, setShipments] = useState<Shipments[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [page, setPage] = useState<number>(1);

    // Debounce the search input to avoid excessive API calls
    const debouncedSearch = useMemo(
        () =>
            debounce((query: string) => {
                setSearchQuery(query);
                setPage(1);
            }, 300),
        []
    );

    // Cleanup the debounce function on component unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    // Fetch shipments data using GraphQL query
    const { data, loading: queryLoading, error } = useQuery<{ shipments: ShipmentsResponse; }>(SHIPMENTS_QUERY, {
        variables: {
            search: searchQuery,
            status: activeStatus,
            page,
            limit: itemsPerPage,
            shipment_type: ShipmentType[mode],
        },
        fetchPolicy: "network-only",
    });

    // Update the shipments state when data is fetched
    useEffect(() => {
        if (data?.shipments) {
            setShipments(data.shipments.items);
            setTotalPages(data.shipments.pages);
            setTotalItems(data.shipments.total);
        }
        if (error) {
            error.graphQLErrors.forEach((err) => {
                setToast({ message: err.message, type: "warning" });
            });
        }
    }, [data, error, queryLoading]);

    // Update the active status when the mode changes
    const handleModeChange = (newMode: "inProgress" | "archived") => {
        setMode(newMode);
        setPage(1);
        if (newMode === "inProgress") {
            setActiveStatus(inProgressStatuses[0]);
        } else {
            setActiveStatus(archivedStatuses[0]);
        }
    };

    // Set the status list based on the current mode
    const statusList = mode === "inProgress" ? inProgressStatuses : archivedStatuses;

    // Pagination functions
    const nextPage = () => {
        if (page < totalPages) setPage((prev) => prev + 1);
    };
    // Set the page to the previous page if it exists
    const prevPage = () => {
        if (page > 1) setPage((prev) => prev - 1);
    };

    return (
        <>
            {/* Header and Breadcrumb */}
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-700 mb-2">الطلبات</h3>

                {/* Mode Selection Dropdown */}
                <div className="flex items-center">
                    <label className="text-sm font-medium text-gray-700">التصنيف</label>
                    <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md w-full focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-3 py-1 mx-2"
                        value={mode} onChange={(e) => handleModeChange(e.target.value as "inProgress" | "archived")}>
                        <option value="inProgress">قيد العمل</option>
                        <option value="archived">مؤرشفة</option>
                    </select>
                </div>
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
                            <span className="text-sm font-medium text-gray-700">الطلبات</span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* Status Tabs */}
            <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-300 mb-5">
                <ul className="flex flex-wrap -mb-px">
                    {statusList.map((statusItem) => (
                        <li key={statusItem} className="me-2">
                            <button onClick={() => { setActiveStatus(statusItem); setPage(1); }}
                                className={`inline-block px-4 py-2 border-b-2 rounded-t-lg font-bold transition-colors duration-300 ${activeStatus === statusItem
                                    ? "bg-primary border-primary text-white" : "border-transparent hover:text-primary hover:border-gray-300"}`}
                                aria-current={activeStatus === statusItem ? "page" : undefined} >
                                {statusItem}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Table Container */}
            <div className="p-4 bg-white shadow-sm rounded-lg">
                <div className="flex items-center justify-between">
                    <h5 className="text-xl font-bold text-gray-700 mb-5">
                        الحالة الحالية: {activeStatus}
                    </h5>
                    <h5 className="text-xl font-bold text-gray-700 mb-5">جدول الطلبات</h5>
                </div>

                {/* Items per page and search input */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <select id="entries" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-3 py-1 mx-2" value={itemsPerPage}
                            onChange={(e) => { setPage(1); setItemsPerPage(Number(e.target.value)); }} >
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="50">50</option>
                        </select>
                        <label htmlFor="entries" className="text-sm font-medium text-gray-700">
                            العرض
                        </label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <label htmlFor="search" className="text-sm font-medium text-gray-700 mx-2">
                            البحث
                        </label>
                        <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" placeholder="ORD-1234567" onChange={(e) => debouncedSearch(e.target.value)} />
                    </div>
                </div>

                {/* Table for displaying shipments */}
                <div className="relative overflow-x-auto rounded-lg">
                    {queryLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                            <div className="loader"></div>
                        </div>
                    )}

                    <table className="min-w-full whitespace-nowrap border-collapse border border-slate-100 rounded-md text-right text-sm text-gray-600">
                        {/* Table Header */}
                        <thead className="text-xs text-gray-700 uppercase bg-second">
                            <tr>
                                {columns.map((column) => (
                                    <th key={column.id} scope="col" className="py-2 px-3 border border-slate-200">
                                        {column.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody className="text-gray-600 text-sm font-medium">
                            {error ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-2 text-gray-500">
                                        لا توجد بيانات
                                    </td>
                                </tr>

                            ) : (
                                shipments.map((shipment) => (
                                    <tr key={shipment.id} className="border-b odd:bg-white even:bg-gray-50">
                                        {/* order_no */}
                                        <td className="py-2 px-2 border border-slate-200">
                                            <Link href={`/dashboard/orders/details/${shipment.id}`} className="px-3 py-1 text-xs font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md">
                                                {shipment.order_no}
                                            </Link>
                                        </td>
                                        {/* tracking_no */}
                                        <td className="py-2 px-2 border border-slate-200">
                                            {shipment.tracking_no}
                                        </td>
                                        {/* note */}
                                        <td className="py-2 px-2 border border-slate-200">
                                            {shipment.note}
                                        </td>
                                        {/* amount */}
                                        <td className="py-2 px-2 border border-slate-200">
                                            {shipment.amount}
                                        </td>
                                        {/* status */}
                                        <td className="py-2 px-2 border border-slate-200">
                                            {shipment.status}
                                        </td>
                                        {/* shipment_type */}
                                        <td className="py-2 px-2 border border-slate-200">
                                            {shipment.shipment_type}
                                        </td>
                                        {/* order_type */}
                                        <td className="py-2 px-2 border border-slate-200">
                                            {shipment.order_type}
                                        </td>
                                        {/* created_by */}
                                        <td className="py-2 px-2 border border-slate-200">
                                            {shipment.created_by}
                                        </td>
                                        {/* created_at */}
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(shipment.created_at).toLocaleString()}
                                        </td>
                                        {/* updated_at */}
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(shipment.updated_at).toLocaleString()}
                                        </td>
                                        {/* delivered_date */}
                                        <td className="py-2 px-2 border border-slate-200">
                                            {shipment.delivered_date}
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
