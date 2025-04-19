"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useQuery, gql } from "@apollo/client";
import { debounce } from "lodash";
import Toast from "@/components/Toast";

// =========== استعلام GraphQL =========== //
const INVOICES_QUERY = gql`
  query Invoices($role: String, $status: String, $search: String, $page: Int, $limit: Int) {
    invoices(role: $role, status: $status, search: $search, page: $page, limit: $limit) {
      total
      pages
      items {
        id
        order_no
        invoice_no
        payment_method
        currency
        amount
        shipping_price
        total
        status
        received
        created_at
        updated_at
      }
    }
  }
`;

// نوع الفاتورة (اختياري إذا تستخدم TypeScript)
interface Invoice {
  id: number;
  order_no: string;
  invoice_no: string;
  payment_method: string;
  currency: string;
  amount: number;
  shipping_price: number;
  total: number;
  status: string;
  received: boolean;
  created_at: string;
  updated_at: string;
}

interface InvoicesResponse {
  invoices: {
    total: number;
    pages: number;
    items: Invoice[];
  };
}

// =========== التبويبات لحالات الفواتير =========== //
const statusMap: Record<string, string> = {
  pending: "قيد الانتظار",
  paid: "مدفوع",
  unpaid: "غير مدفوع",
  canceled: "ملغاة",
  withCourier: "بحوزة المندوب",
};

const statusTabs = [
  { id: "pending", label: "قيد الانتظار" },
  { id: "paid", label: "مدفوع" },
  { id: "unpaid", label: "غير مدفوع" },
  { id: "canceled", label: "ملغاة" },
  { id: "withCourier", label: "بحوزة المندوب" },
];

// =========== قائمة الأدوار للفلترة (Dropdown) =========== //
const roles = [
  { value: "فرع", label: "فرع" },
  { value: "مدير", label: "مدير" },
  { value: "عميل", label: "عميل" },
  { value: "مندوب", label: "مندوب" },
];

export default function InvoicesPage() {
  // تبويب الحالة المختار
  const [activeTab, setActiveTab] = useState<keyof typeof statusMap>("pending");
  // الدور المختار من القائمة المنسدلة
  const [selectedRole, setSelectedRole] = useState<string>("عميل");

  // حالات البحث والترقيم
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // حالات تخزين النتائج
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // حالة التنبيه (Toast)
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger" | "warning" | "info";
  } | null>(null);

  // الأعمدة باللغة العربية وبالترتيب المطلوب
  const columns = [
    { id: "id", name: "المعرّف" },
    { id: "order_no", name: "رقم الطلب" },
    { id: "invoice_no", name: "رقم الفاتورة" },
    { id: "payment_method", name: "طريقة الدفع" },
    { id: "currency", name: "العملة" },
    { id: "amount", name: "المبلغ" },
    { id: "shipping_price", name: "تكلفة الشحن" },
    { id: "total", name: "الإجمالي" },
    { id: "status", name: "الحالة" },
    { id: "received", name: "مستلم؟" },
    { id: "created_at", name: "تاريخ الإنشاء" },
    { id: "updated_at", name: "تاريخ التعديل" },
  ];

  // استعلام جلب الفواتير بناءً على الدور والحالة والبحث والترقيم
  const { data, loading: queryLoading, error } = useQuery<InvoicesResponse>(
    INVOICES_QUERY,
    {
      variables: {
        role: selectedRole,
        status: statusMap[activeTab],
        search: searchTerm || null,
        page,
        limit: itemsPerPage,
      },
      fetchPolicy: "network-only",
    }
  );

  // دالة مبددة للبحث
  const debouncedSearch = useCallback(
    debounce((val: string) => {
      setSearchTerm(val);
      setPage(1);
    }, 400),
    []
  );

  // تحديث حالة الفواتير عند جلب بيانات جديدة
  useEffect(() => {
    if (data?.invoices) {
      setInvoices(data.invoices.items);
      setTotalPages(data.invoices.pages);
      setTotalItems(data.invoices.total);
    }

    // في حال وجود خطأ
    if (error) {
      error.graphQLErrors.forEach((err) => {
        setToast({ message: err.message, type: "warning" });
      });
    }
  }, [data, error]);

  // التغيير بين التبويبات (حالة الفاتورة)
  function handleTabChange(tabId: keyof typeof statusMap) {
    setActiveTab(tabId);
    setPage(1);
  }

  // تغيير الدور من القائمة المنسدلة
  function handleRoleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedRole(event.target.value);
    setPage(1);
  }

  // وظائف الترقيم
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
      {/* العنوان الرئيسي */}
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-bold text-gray-700 mb-2">الفواتير</h3>
        <Link
          href="/dashboard/invoices/create"
          className="px-3 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md"
        >
          <i className="fas fa-plus"></i> إضافة فاتورة
        </Link>
      </div>

      {/* شريط التوجيه (Breadcrumb) */}
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
              <span className="text-sm font-medium text-gray-700">الفواتير</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* تبويبات الحالة */}
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-300">
        <ul className="flex flex-wrap -mb-px">
          {statusTabs.map((tab) => (
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

      {/* محتوى الصفحة: فلترة وعرض الجدول */}
      <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
        {/* اختيار الدور */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
          <label className="text-sm font-medium text-gray-700" htmlFor="roleSelect">
            اختر الدور:
          </label>
          <select
            id="roleSelect"
            className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary"
            value={selectedRole}
            onChange={handleRoleChange}
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* العنوانان داخل القسم */}
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-bold text-gray-700 mb-5">
            الدور الحالي: {selectedRole}
          </h5>
          <h5 className="text-xl font-bold text-gray-700 mb-5">
            جدول الفواتير
          </h5>
        </div>

        {/* اختيار عدد العرض والبحث */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <select
              id="entries"
              className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary text-right mx-2"
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

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <label
              htmlFor="search"
              className="text-sm font-medium text-gray-700 mx-2"
            >
              البحث
            </label>
            <input
              id="search"
              type="text"
              placeholder="ابحث عن فاتورة..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1"
            />
          </div>
        </div>

        {/* عرض الجدول */}
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
              {error || invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-2 text-gray-500"
                  >
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b odd:bg-white even:bg-gray-50"
                  >
                    <td className="py-2 px-2 border border-slate-200">
                      {inv.id}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {inv.order_no}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {inv.invoice_no}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {inv.payment_method}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {inv.currency}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {inv.amount}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {inv.shipping_price}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {inv.total}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      <span
                        className={`px-2 py-0.5 rounded-md ${
                          inv.status === "مدفوع" || inv.status === "قيد الانتظار"
                            ? "bg-green-100 text-green-700"
                            : inv.status === "ملغاة"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {inv.received ? "نعم" : "لا"}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {new Date(inv.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {new Date(inv.updated_at).toLocaleString()}
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
          <span>إجمالي النتائج: {totalItems}</span>
        </div>
      </div>

      {/* تنبيهات (Toast) */}
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
