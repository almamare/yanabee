"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useQuery, gql } from "@apollo/client";
import { debounce } from "lodash";
import Toast from "@/components/Toast";

// ===================== استعلام GraphQL ===================== //
const RECEIPTS_QUERY = gql`
  query Receipts($role: String, $status: String, $search: String, $page: Int, $limit: Int) {
    receipts(role: $role, status: $status, search: $search, page: $page, limit: $limit) {
      total
      pages
      items {
        id
        user
        payment
        number
        account_number
        payment_method
        amount
        currency
        note
        status
        created_at
        updated_at
      }
    }
  }
`;

// =============== التبويبات (Tabs) لحالة الإيصال =============== //
const statusMap = {
  receive: "سند قبض",
  spend: "سند صرف",
};

// مُعرّفات التبويبات لسهولة العرض
const tabs = [
  { id: "receive", label: "سند قبض" },
  { id: "spend", label: "سند صرف" },
];

// =============== الأدوار الممكنة في القائمة المنسدلة =============== //
const roles = ["فرع", "مدير", "عميل", "مندوب"];

// =============== تعريف واجهات (إن كنت تستخدم TypeScript) =============== //
// يمكن حذفها في حال عدم استخدام TypeScript
interface Receipt {
  id: number;
  user: string;
  payment: string;
  number: string;
  account_number: string;
  payment_method: string;
  amount: number;
  currency: string;
  note: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ReceiptsData {
  receipts: {
    total: number;
    pages: number;
    items: Receipt[];
  };
}

// =============== مكوّن صفحة الإيصالات =============== //
export default function ReceiptsPage() {
  // === حالة التبويب النشط (سند قبض / سند صرف) === //
  const [activeTab, setActiveTab] = useState<keyof typeof statusMap>("receive");

  // === حالة الدور (فرع، مدير، عميل، مندوب) === //
  const [selectedRole, setSelectedRole] = useState<string>(roles[0]); // افتراضي: "فرع"

  // === البحث والترقيم === //
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // === تخزين النتائج === //
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // === تنبيهات (Toast) === //
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger" | "warning" | "info";
  } | null>(null);

  // === الأعمدة باللغة العربية === //
  const columns = [
    { id: "id", name: "المعرّف" },
    { id: "user", name: "المستخدم" },
    { id: "payment", name: "نوع العملية" },
    { id: "number", name: "الرقم" },
    { id: "account_number", name: "رقم الحساب" },
    { id: "payment_method", name: "طريقة الدفع" },
    { id: "amount", name: "المبلغ" },
    { id: "currency", name: "العملة" },
    { id: "note", name: "ملاحظة" },
    { id: "status", name: "الحالة" },
    { id: "created_at", name: "تاريخ الإنشاء" },
    { id: "updated_at", name: "تاريخ التعديل" },
  ];

  // === استعلام الإيصالات === //
  const {
    data,
    loading: queryLoading,
    error,
  } = useQuery<ReceiptsData>(RECEIPTS_QUERY, {
    variables: {
      role: selectedRole,                // الدور المختار من القائمة
      status: statusMap[activeTab],      // سند قبض أو سند صرف
      search: searchTerm || null,        // حقل البحث
      page,
      limit: itemsPerPage,
    },
    fetchPolicy: "network-only",
  });

  // === البحث المبدّد (debounce) === //
  const debouncedSearch = useCallback(
    debounce((val: string) => {
      setSearchTerm(val);
      setPage(1);
    }, 400),
    []
  );

  // === تحديث الحالة عند وصول النتائج === //
  useEffect(() => {
    if (data?.receipts) {
      setReceipts(data.receipts.items);
      setTotalPages(data.receipts.pages);
      setTotalItems(data.receipts.total);
    }
    if (error) {
      error.graphQLErrors.forEach((err) => {
        setToast({ message: err.message, type: "warning" });
      });
    }
  }, [data, error]);

  // === تغيير التبويب النشط === //
  function handleTabChange(tabId: keyof typeof statusMap) {
    setActiveTab(tabId);
    setPage(1); // إعادة الصفحة للأولى
  }

  // === دوال الترقيم (الصفحات) === //
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
      {/* ======== العنوان الرئيسي + زر إضافة إيصال (اختياري) ======== */}
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-bold text-gray-700 mb-2">الإيصالات</h3>
        <Link
          href="/dashboard/receipts/create"
          className="px-3 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md"
        >
          <i className="fas fa-plus"></i> إضافة إيصال
        </Link>
      </div>

      {/* ======== شريط التوجيه (Breadcrumb) ======== */}
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
              <span className="text-sm font-medium text-gray-700">الإيصالات</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* ======== التبويبات لسند قبض/سند صرف ======== */}
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

      {/* ======== الحاوية الأساسية لعرض البيانات ======== */}
      <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
        {/* ======== العنوان داخل القسم ======== */}
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-bold text-gray-700 mb-5">
            {statusMap[activeTab]}
          </h5>
          <h5 className="text-xl font-bold text-gray-700 mb-5">
            جدول الإيصالات
          </h5>
        </div>

        {/* ======== اختيار الدور والبحث وعدد العناصر ======== */}
        <div className="flex items-center justify-between mb-3">
          {/* === اختيار الدور === */}
          <div className="flex items-center space-x-3">
            <label htmlFor="roleSelect" className="text-sm font-medium text-gray-700 mx-2">
              الدور
            </label>
            <select
              id="roleSelect"
              className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary text-right"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(1);
              }}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* === عدد العرض والبحث === */}
          <div className="flex items-center space-x-3">
            <label htmlFor="entries" className="text-sm font-medium text-gray-700 mx-2">
              العرض
            </label>
            <select
              id="entries"
              className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary text-right"
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

            <label htmlFor="search" className="text-sm font-medium text-gray-700 mx-2">
              البحث
            </label>
            <input
              id="search"
              type="text"
              placeholder="ابحث عن إيصال..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1"
            />
          </div>
        </div>

        {/* ======== جدول عرض الإيصالات ======== */}
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
              {error || receipts.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-2 text-gray-500"
                  >
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                receipts.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className="border-b odd:bg-white even:bg-gray-50"
                  >
                    <td className="py-2 px-2 border border-slate-200">
                      {receipt.id}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {receipt.user}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {receipt.payment}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {receipt.number}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {receipt.account_number}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {receipt.payment_method}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {receipt.amount}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {receipt.currency}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {receipt.note}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      <span
                        className={`px-2 py-0.5 rounded-md ${
                          receipt.status === "نشط"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {receipt.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {new Date(receipt.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {new Date(receipt.updated_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ======== أدوات الترقيم (Pagination) ======== */}
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

      {/* ======== تنبيهات (Toast) في حال وجود رسائل ======== */}
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
