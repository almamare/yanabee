"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { debounce } from "lodash";
import { SHIPMENTS_QUERY } from "@/graphql/queries/queries";
import { ShipmentsResponse, Shipment } from "@/graphql/types/shipmentsTypes";

const statusMap: Record<string, string> = {
  pending: "قيد الانتظار",
  done: "تم التنفيذ",
  shipping: "قيد التوصيل",
  returned: "مرتجعة",
  canceled: "ملغاة",
  completed: "مكتملة",
};

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
  { id: "id", name: "الفاتورة" },
  { id: "label", name: "الملصق" },
];

const tabs = [
  { id: "pending", label: "قيد الانتظار" },
  { id: "done", label: "تم التنفيذ" },
  { id: "shipping", label: "قيد التوصيل" },
  { id: "returned", label: "مرتجعة" },
  { id: "canceled", label: "ملغاة" },
  { id: "completed", label: "مكتملة" },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<keyof typeof statusMap>("pending");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // Debounce the search input changes
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query);
        setPage(1);
      }, 300),
    []
  );

  // Cleanup the debounced function when component unmounts
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Fetch data with Apollo useQuery
  const { data, loading: queryLoading, error } = useQuery<{
    shipments: ShipmentsResponse;
  }>(SHIPMENTS_QUERY, {
    variables: {
      search: searchQuery || null,
      status: statusMap[activeTab],
      page,
      limit: itemsPerPage,
    },
    fetchPolicy: "network-only",
  });

  // Update local states when data changes
  useEffect(() => {
    if (data?.shipments) {
      setShipments(data.shipments.items);
      setTotalPages(data.shipments.pages);
      setTotalItems(data.shipments.total);
    }
    if (error) {
      console.error("Error fetching shipments:", error);
    };
  }, [data, error]);

  // Handle tab changes
  const handleTabChange = (tab: keyof typeof statusMap) => {
    setActiveTab(tab);
    setPage(1);
  };

  // Pagination
  const nextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };
  const prevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-bold text-gray-700 mb-2">الطلبات</h3>
      </div>

      {/* Breadcrumb */}
      <nav className="flex mb-5" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-primary hover:text-second">
              لوحة التحكم
            </Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="rtl:rotate-180 w-3 h-3 text-gray-700 mx-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">الطلبات</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Tabs */}
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-300">
        <ul className="flex flex-wrap -mb-px">
          {tabs.map((tab) => (
            <li key={tab.id} className="me-2">
              <button
                onClick={() => handleTabChange(tab.id as keyof typeof statusMap)}
                className={`inline-block px-4 py-2 border-b-2 rounded-t-lg font-bold transition-colors duration-300 ${
                  activeTab === tab.id
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

      {/* Table Container */}
      <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-bold text-gray-700 mb-5">
            الحالة: {statusMap[activeTab]}
          </h5>
          <h5 className="text-xl font-bold text-gray-700 mb-5">جدول الطلبات</h5>
        </div>

        {/* Entries & Search */}
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
            <label htmlFor="entries" className="text-sm font-medium text-gray-700 mx-2">
              البحث
            </label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 z-50 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1"
              placeholder="ORD-1234567"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md mb-3">
            <p>خطأ أثناء جلب البيانات:</p>
            <p>{error.message}</p>
          </div>
        )}

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
              {shipments.length > 0 ? (
                shipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b odd:bg-white even:bg-gray-50">
                    <td className="py-2 px-2 border border-slate-200">
                      <Link
                        href={`/dashboard/orders/details/${shipment.id}`}
                        className="px-3 py-1 text-xs font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md"
                      >
                        {shipment.order_no}
                      </Link>
                    </td>
                    <td className="py-2 px-2 border border-slate-200">{shipment.tracking_no}</td>
                    <td className="py-2 px-2 border border-slate-200">{shipment.note}</td>
                    <td className="py-2 px-2 border border-slate-200">{shipment.amount}</td>
                    <td className="py-2 px-2 border border-slate-200">{shipment.status}</td>
                    <td className="py-2 px-2 border border-slate-200">{shipment.shipment_type}</td>
                    <td className="py-2 px-2 border border-slate-200">{shipment.order_type}</td>
                    <td className="py-2 px-2 border border-slate-200">{shipment.created_by}</td>
                    <td className="py-2 px-2 border border-slate-200">{shipment.created_at}</td>
                    <td className="py-2 px-2 border border-slate-200">{shipment.updated_at}</td>
                    <td className="py-2 px-2 border border-slate-200">{shipment.delivered_date}</td>
                    <td className="py-2 px-2 border border-slate-200">
                      <Link
                        href={`/dashboard/orders/details/${shipment.id}`}
                        className="px-3 py-1 text-xs font-medium text-center text-white bg-blue-600 hover:bg-gray-600 rounded-md"
                      >
                        <i className="far fa-download"></i> تنزيل
                      </Link>
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      <Link
                        href={`/dashboard/orders/label/${shipment.id}`}
                        className="px-3 py-1 text-xs font-medium text-center text-white bg-green-600 hover:bg-gray-600 rounded-md"
                      >
                        <i className="far fa-download"></i> تنزيل
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4 text-gray-500">
                    لا توجد بيانات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
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
    </>
  );
}
