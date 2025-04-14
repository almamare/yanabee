"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useQuery, gql } from "@apollo/client";
import { debounce } from "lodash";

// مكوّن Toast تنبيهي (مثال)
import Toast from "@/components/Toast"; // عدّله أو أزله حسب مشروعك

// استعلام الدفعات
const PAYMENTS_QUERY = gql`
  query Payments($role: String, $status: String, $search: String, $page: Int, $limit: Int) {
    payments(role: $role, status: $status, search: $search, page: $page, limit: $limit) {
      total
      pages
      items {
        id
        payment_method
        account_number
        amount
        currency
        status
        note
        document
        number
        created_at
        updated_at
        processed_at
        approvals {
          user
          role
          status
          note
          created_at
        }
      }
    }
  }
`;

/** خريطة الأدوار: المفتاح (key) داخلي، والقيمة (value) سترسل للسيرفر. */
const roleMap: Record<string, string> = {
  client: "عميل",
  branch: "فرع",
  courier: "مندوب",
  manager: "مدير",
};

/** التبويبات الخاصة بالحالات: المفتاح (key) داخلي، والقيمة (value) سترسل للسيرفر. */
const statusMap: Record<string, string> = {
  pending: "معلق",
  accepted: "مقبول",
  completed: "مكتملة",
  rejected: "مرفوض",
};

// مفاتيح الأدوار (للقائمة المنسدلة)
const roleOptions = [
  { id: "client", label: "عميل" },
  { id: "branch", label: "فرع" },
  { id: "courier", label: "مندوب" },
  { id: "manager", label: "مدير" },
];

// مفاتيح الحالات (تبويبات)
const statusTabs = [
  { id: "pending", label: "معلق" },
  { id: "accepted", label: "مقبول" },
  { id: "completed", label: "مكتملة" },
  { id: "rejected", label: "مرفوض" },
];

// نوع البيانات إن كنت تستخدم TypeScript (اختياري)
interface Payment {
  id: number;
  payment_method: string;
  account_number: string;
  amount: number;
  currency: string;
  status: string;
  note: string;
  document: string;
  number: string;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
  approvals: {
    user: string;
    role: string;
    status: string;
    note: string;
    created_at: string;
  }[];
}

interface PaymentsData {
  payments: {
    total: number;
    pages: number;
    items: Payment[];
  };
}

export default function PaymentsPage() {
  // حالة: الدور الحالي من القائمة المنسدلة
  const [selectedRole, setSelectedRole] = useState<keyof typeof roleMap>("branch");

  // حالة: التبويب النشط للحالة
  const [activeStatus, setActiveStatus] = useState<keyof typeof statusMap>("completed");

  // البحث والترقيم
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // لتخزين الدفعات
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // التنبيه (Toast)
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger" | "warning" | "info";
  } | null>(null);

  // أعمدة الجدول
  const columns = [
    { id: "id", name: "المعرف" },
    { id: "number", name: "رقم الدفعة" },
    { id: "payment_method", name: "طريقة الدفع" },
    { id: "account_number", name: "رقم الحساب" },
    { id: "amount", name: "المبلغ" },
    { id: "currency", name: "العملة" },
    { id: "status", name: "الحالة" },
    { id: "note", name: "ملاحظة" },
    { id: "document", name: "المستند" },
    { id: "created_at", name: "تاريخ الإنشاء" },
    { id: "updated_at", name: "تاريخ التحديث" },
    { id: "processed_at", name: "تاريخ المعالجة" },
  ];

  // استعلام Apollo
  const { data, loading: queryLoading, error } = useQuery<PaymentsData>(
    PAYMENTS_QUERY,
    {
      variables: {
        role: roleMap[selectedRole],         // الدور الحالي
        status: statusMap[activeStatus],     // الحالة الحالية
        search: searchTerm || null,
        page,
        limit: itemsPerPage,
      },
      fetchPolicy: "network-only",
    }
  );

  // دالة مبَدَّدة للبحث
  const debouncedSearch = useCallback(
    debounce((val: string) => {
      setSearchTerm(val);
      setPage(1);
    }, 400),
    []
  );

  // مراقبة نتائج الاستعلام
  useEffect(() => {
    if (data?.payments) {
      setPayments(data.payments.items);
      setTotalPages(data.payments.pages);
      setTotalItems(data.payments.total);
    }

    if (error) {
      // يمكن إظهار الخطأ في Toast أو أي تعامل آخر
      setToast({ message: "حصل خطأ عند جلب البيانات", type: "warning" });
    }
  }, [data, error]);

  // تغيير الدور (من القائمة المنسدلة)
  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as keyof typeof roleMap;
    setSelectedRole(newRole);
    setPage(1);
  }

  // تغيير الحالة (من التبويبات)
  function handleStatusTabChange(tabId: keyof typeof statusMap) {
    setActiveStatus(tabId);
    setPage(1);
  }

  // الترقيم
  function nextPage() {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }
  function prevPage() {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }

  return (
    <>
      {/* عنوان الصفحة */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-3xl font-bold text-gray-700">الدفعات</h3>
        <Link
          href="/dashboard/payments/create"
          className="px-3 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md"
        >
          <i className="fas fa-plus"></i> إضافة دفعة
        </Link>
      </div>

      {/* اختياري: Breadcrumb */}
      <nav className="flex mb-3" aria-label="Breadcrumb">
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
              <span className="text-sm font-medium text-gray-700">الدفعات</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* اختيار الدور (قائمة منسدلة) */}
      <div className="mb-3 flex items-center">
        <label htmlFor="roleSelect" className="text-sm font-medium text-gray-700 me-2">
          اختر الدور:
        </label>
        <select
          id="roleSelect"
          value={selectedRole}
          onChange={handleRoleChange}
          className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary text-right"
        >
          {roleOptions.map((role) => (
            <option key={role.id} value={role.id}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      {/* تبويبات الحالات */}
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-300 mb-4">
        <ul className="flex flex-wrap -mb-px">
          {statusTabs.map((tab) => (
            <li key={tab.id} className="me-2">
              <button
                onClick={() => handleStatusTabChange(tab.id as keyof typeof statusMap)}
                className={`inline-block px-4 py-2 border-b-2 rounded-t-lg font-bold transition-colors duration-300 ${
                  activeStatus === tab.id
                    ? "bg-primary border-primary text-white"
                    : "border-transparent hover:text-primary hover:border-gray-300"
                }`}
                aria-current={activeStatus === tab.id ? "page" : undefined}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* صندوق: جدول الدفعات */}
      <div className="p-4 bg-white shadow-sm rounded-lg">

        {/* ملخص */}
        <div className="flex items-center justify-between mb-5">
          <h5 className="text-xl font-bold text-gray-700">
            {`الدور: ${roleMap[selectedRole]} - الحالة: ${statusMap[activeStatus]}`}
          </h5>
          <h5 className="text-xl font-bold text-gray-700">جدول الدفعات</h5>
        </div>

        {/* عناصر البحث والترقيم في أعلى الجدول */}
        <div className="flex items-center justify-between mb-3">
          {/* اختيار عدد العناصر في الصفحة */}
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

          {/* البحث */}
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
              placeholder="أدخل كلمة للبحث..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1"
            />
          </div>
        </div>

        {/* الجدول نفسه */}
        <div className="relative overflow-x-auto rounded-lg">
          {/** في حال التحميل */}
          {queryLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <div className="loader" />
            </div>
          )}

          <table className="min-w-full whitespace-nowrap border-collapse border border-slate-100 rounded-md text-right text-sm text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-second">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    scope="col"
                    className="py-2 px-3 border border-slate-200"
                  >
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-medium">
              {(!payments || payments.length === 0) ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-2 text-gray-500">
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b odd:bg-white even:bg-gray-50"
                  >
                    <td className="py-2 px-2 border border-slate-200">
                      {payment.id}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {payment.number}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {payment.payment_method}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {payment.account_number}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {payment.amount}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {payment.currency}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      <span
                        className={`px-2 py-0.5 rounded-md ${
                          payment.status === "معلق"
                            ? "bg-yellow-100 text-yellow-700"
                            : payment.status === "مقبول"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "مكتملة"
                            ? "bg-blue-100 text-blue-700"
                            : payment.status === "مرفوض"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {payment.note}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {payment.document || "لا يوجد"}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {new Date(payment.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {new Date(payment.updated_at).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {payment.processed_at
                        ? new Date(payment.processed_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* أدوات الترقيم (Pagination) */}
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

      {/* Toast لتنبيه الأخطاء وغيرها */}
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
