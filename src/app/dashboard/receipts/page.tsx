"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useQuery, gql } from "@apollo/client";
import { debounce } from "lodash";
import Toast from "@/components/Toast";

// استعلام GraphQL لجلب الإيصالات
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

// تعريف نوع بيانات الإيصال (Receipt) واستجابة الاستعلام (ReceiptsResponse)
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

interface ReceiptsResponse {
  receipts: {
    total: number;
    pages: number;
    items: Receipt[];
  };
}

// التبويبات الخاصة بحالات الإيصالات
const statusTabs = [
  { id: "in_possession", label: "بحوزة المندوب", value: "بحوزة المندوب" },
  { id: "paid", label: "مدفوع", value: "مدفوع" },
  { id: "cancelled", label: "ملغاة", value: "ملغاة" },
  { id: "pending", label: "قيد الانتظار", value: "قيد الانتظار" },
  { id: "unpaid", label: "غير مدفوع", value: "غير مدفوع" },
];

// قائمة الخيارات الخاصة بالأدوار في القائمة المنسدلة
const roleOptions = [
  { id: "branch", label: "فرع", value: "فرع" },
  { id: "manager", label: "مدير", value: "مدير" },
  { id: "client", label: "عميل", value: "عميل" },
  { id: "agent", label: "مندوب", value: "مندوب" },
];

export default function ReceiptsPage() {
  // الحالة للتبويب النشط (حالة الإيصال)؛ القيمة الافتراضية "بحوزة المندوب"
  const [activeStatus, setActiveStatus] = useState<string>("بحوزة المندوب");
  // الحالة للقائمة المنسدلة لتحديد الدور؛ القيمة الافتراضية "فرع"
  const [selectedRole, setSelectedRole] = useState<string>("فرع");

  // حالات البحث والترقيم
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // حالات تخزين بيانات الإيصالات والصفحات وإجمالي النتائج
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // حالة التنبيه (Toast)
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger" | "warning" | "info";
  } | null>(null);

  // تعريف أعمدة الجدول (الترتيب والأسماء بالعربي)
  const columns = [
    { id: "id", name: "المعرّف" },
    { id: "user", name: "المستخدم" },
    { id: "payment", name: "الدفع" },
    { id: "number", name: "الرقم" },
    { id: "account_number", name: "رقم الحساب" },
    { id: "payment_method", name: "طريقة الدفع" },
    { id: "amount", name: "المبلغ" },
    { id: "currency", name: "العملة" },
    { id: "note", name: "الملاحظة" },
    { id: "status", name: "الحالة" },
    { id: "created_at", name: "تاريخ الإنشاء" },
    { id: "updated_at", name: "تاريخ التعديل" },
  ];

  // تنفيذ استعلام الإيصالات باستخدام المتغيرات المختارة
  const { data, loading: queryLoading, error } = useQuery<ReceiptsResponse>(
    RECEIPTS_QUERY,
    {
      variables: {
        role: selectedRole,
        status: activeStatus,
        search: searchTerm || null,
        page,
        limit: itemsPerPage,
      },
      fetchPolicy: "network-only",
    }
  );

  // استخدام دالة "debounce" لتحديد البحث دون تنفيذ الاستعلام في كل تغيير سريع
  const debouncedSearch = useCallback(
    debounce((val: string) => {
      setSearchTerm(val);
      setPage(1);
    }, 400),
    []
  );

  // تحديث بيانات الإيصالات عند تغير الاستعلام
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

  // تغيير حالة التبويب (حالة الإيصال)
  const handleStatusTabChange = (statusValue: string) => {
    setActiveStatus(statusValue);
    setPage(1);
  };

  // الدوال الخاصة بالترقيم (الصفحة التالية والسابقة)
  const nextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  return (
    <>
      {/* العنوان الرئيسي وخيار إضافة إيصال */}
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-bold text-gray-700 mb-2">الإيصالات</h3>
        <Link
          href="/dashboard/receipts/create"
          className="px-3 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md"
        >
          <i className="fas fa-plus"></i> إضافة إيصال
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
              <span className="text-sm font-medium text-gray-700">الإيصالات</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* القائمة المنسدلة لتحديد الدور */}
      <div className="flex items-center justify-end mb-4">
        <label htmlFor="roleSelect" className="mr-2 text-sm font-medium text-gray-700">
          الفرز حسب الدور:
        </label>
        <select
          id="roleSelect"
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary"
        >
          {roleOptions.map(option => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* تبويبات حالات الإيصالات */}
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-300">
        <ul className="flex flex-wrap -mb-px">
          {statusTabs.map(tab => (
            <li key={tab.id} className="me-2">
              <button
                onClick={() => handleStatusTabChange(tab.value)}
                className={`inline-block px-4 py-2 border-b-2 rounded-t-lg font-bold transition-colors duration-300 ${
                  activeStatus === tab.value
                    ? "bg-primary border-primary text-white"
                    : "border-transparent hover:text-primary hover:border-gray-300"
                }`}
                aria-current={activeStatus === tab.value ? "page" : undefined}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* المحتوى الرئيسي الذي يعرض جدول الإيصالات */}
      <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
        {/* عنوان القسم */}
        <div className="flex items-center justify-between mb-5">
          <h5 className="text-xl font-bold text-gray-700">{activeStatus}</h5>
          <h5 className="text-xl font-bold text-gray-700">جدول الإيصالات</h5>
        </div>

        {/* أدوات البحث واختيار عدد العناصر */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <select
              id="entries"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary text-right mx-2"
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

        {/* جدول عرض الإيصالات */}
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
              {error || receipts.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-2 text-gray-500">
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                receipts.map((receipt) => (
                  <tr key={receipt.id} className="border-b odd:bg-white even:bg-gray-50">
                    <td className="py-2 px-2 border border-slate-200">{receipt.id}</td>
                    <td className="py-2 px-2 border border-slate-200">{receipt.user}</td>
                    <td className="py-2 px-2 border border-slate-200">{receipt.payment}</td>
                    <td className="py-2 px-2 border border-slate-200">{receipt.number}</td>
                    <td className="py-2 px-2 border border-slate-200">{receipt.account_number}</td>
                    <td className="py-2 px-2 border border-slate-200">{receipt.payment_method}</td>
                    <td className="py-2 px-2 border border-slate-200">{receipt.amount}</td>
                    <td className="py-2 px-2 border border-slate-200">{receipt.currency}</td>
                    <td className="py-2 px-2 border border-slate-200">{receipt.note}</td>
                    <td className="py-2 px-2 border border-slate-200">{receipt.status}</td>
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

      {/* تنبيهات النظام (Toast) */}
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
