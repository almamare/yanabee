"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_SHIPMENTS } from "@/graphql/queries/shipments";
import Toast from "@/components/Toast";

/* ------------- ثابت بأسماء الأعمدة ------------- */
const columns = [
    { id: "order_no", name: "رقم الطلب" },
    { id: "tracking_no", name: "رقم التتبع" },
    { id: "note", name: "ملاحظة" },
    { id: "amount", name: "المبلغ" },
    { id: "status", name: "الحالة" },
    { id: "role", name: "الدور" },
    { id: "shipment_type", name: "نوع التوصيل" },
    { id: "archives", name: "التصنيف" },
    { id: "order_type", name: "نوع البريد" },
    { id: "created_at", name: "تاريخ الإنشاء" },
    { id: "updated_at", name: "تاريخ التحديث" },
    { id: "delivered_date", name: "تاريخ التسليم" },
];

export default function InquiryPage() {
    /* ---------- حالات البحث ---------- */
    const [orderNo, setOrderNo] = useState("");
    const [trackingNo, setTrackingNo] = useState("");
    const [createdAt, setCreatedAt] = useState("");

    /* ---------- إشعارات ---------- */
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "danger" | "warning" | "info";
    } | null>(null);

    /* ---------- استدعاء GraphQL ---------- */
    const [runSearch, { data, loading }] = useLazyQuery(SEARCH_SHIPMENTS, {
        fetchPolicy: "network-only",
        onError: (err) =>
            err.graphQLErrors.forEach((e) =>
                setToast({ message: e.message, type: "warning" })
            ),
    });

    /* ---------- تنفيذ البحث ---------- */
    const handleSearch = () => {
        if (!orderNo && !trackingNo && !createdAt) {
            setToast({ message: "أدخل معياراً واحداً على الأقل", type: "info" });
            return;
        }
        runSearch({
            variables: {
                order_no: orderNo || null,
                tracking_no: trackingNo || null,
                created_at: createdAt || null,
            },
        });
    };

    /* ---------- البيانات ---------- */
    const shipments = data?.searchShipment ?? [];
    const resultsCount = shipments.length;

    return (
        <>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700"> الستعلام</h3>
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
                        <span className="text-sm font-medium text-gray-700">الستعلام</span>
                    </li>
                </ol>
            </nav>

            <div className="p-6 bg-white shadow-sm rounded-lg mb-4">
                <h3 className="text-2xl font-bold text-primary">استعلام الطلبات</h3>
                <p className="text-xs text-gray-500 mb-6">
                    يمكنك البحث عن الطلبات باستخدام رقم الطلب، رقم التتبع، أو تاريخ الإنشاء.
                </p>
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    رقم الطلب
                                </label>
                                <input
                                    type="text"
                                    value={orderNo}
                                    onChange={(e) => setOrderNo(e.target.value)}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                    placeholder="ORD-0001"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    رقم التتبع
                                </label>
                                <input
                                    type="text"
                                    value={trackingNo}
                                    onChange={(e) => setTrackingNo(e.target.value)}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                    placeholder="TRK-123456"
                                />
                            </div>

                            <div >
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    التاريخ
                                </label>
                                <input
                                    type="date"
                                    value={createdAt}
                                    onChange={(e) => setCreatedAt(e.target.value)}
                                    className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* زرّ البحث */}
                    <button type="submit" className="bg-primary hover:bg-second transition-colors rounded-md px-6 py-2 text-sm font-bold text-white shadow-sm" >
                        <i className="fas fa-search ml-1" /> بحث
                    </button>
                </form>
            </div>

            <div className="p-4 bg-white shadow-sm rounded-lg">
                <div className="flex flex-wrap items-center justify-between mb-4">
                    <h5 className="text-xl font-bold text-gray-700">جدول الطلبات</h5>
                    <span className="font-semibold text-gray-700">
                        عدد النتائج <span className="text-primary text-lg">({resultsCount})</span>
                    </span>
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
                                {columns.map((c) => (
                                    <th key={c.id} scope="col" className="py-2 px-3 border border-slate-200">
                                        {c.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {shipments.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="text-center py-2 text-gray-500">
                                        لا توجد بيانات مطابقة
                                    </td>
                                </tr>
                            ) : (
                                shipments.map((s: any, idx: number) => (
                                    <tr key={s.id} className="border-b odd:bg-white even:bg-gray-50">
                                        <td className="py-2 px-2 border border-slate-200">
                                            <Link href={`/dashboard/orders/details/${s.id}`} className="px-3 py-1 text-xs font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md">
                                                {s.order_no}
                                            </Link>
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {s.tracking_no}</td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {s.note}</td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {s.amount}</td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {s.status}</td>
                                            <td className="py-2 px-2 border border-slate-200">
                                            {s.role}</td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {s.shipment_type}</td>
                                            <td className="py-2 px-2 border border-slate-200">
                                            {s.archives}</td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {s.order_type}</td>
                                        <td className="py-2 px-2 border border-slate-200">

                                            {new Date(s.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">

                                            {new Date(s.updated_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {s.delivered_date}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
