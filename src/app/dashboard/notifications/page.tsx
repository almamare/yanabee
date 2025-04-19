"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useQuery, gql } from "@apollo/client";
import { debounce } from "lodash";
import Toast from "@/components/Toast";

// ==================== استعلام GraphQL ==================== //
const NOTIFICATIONS_QUERY = gql`
  query Notifications($role: String, $search: String, $page: Int, $limit: Int) {
    notifications(role: $role, search: $search, page: $page, limit: $limit) {
      total
      pages
      items {
        id
        title
        message
        notification_type
        role
        user
        is_read
        created_at
      }
    }
  }
`;

// (اختياري) واجهات TypeScript لتعريف نوع البيانات
interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  role: string;
  user: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsResponse {
  notifications: {
    total: number;
    pages: number;
    items: NotificationItem[];
  };
}

// خريطة تربط المفتاح الإنجليزي بالقيمة بالعربي.
// ستُمرَّر القيمة العربية في متغير الاستعلام (role).
const roleMap: Record<string, string> = {
  client: "عميل",
  branch: "فرع",
  coruser: "مندوب",
  manager: "مدير",
};

// التبويبات المتاحة للعرض
const tabs = [
  { id: "client", label: "العميل" },
  { id: "branch", label: "الفرع" },
  { id: "coruser", label: "المندوب" },
  { id: "manager", label: "المدير" },
];

export default function NotificationsPage() {
  // التحكم بالتبويب النشط
  const [activeTab, setActiveTab] = useState<keyof typeof roleMap>("branch"); // مثلاً افتراضيًا "فرع"

  // حالات البحث والترقيم
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // لحفظ الإشعارات وعدد الصفحات
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // حالة التنبيه (Toast)
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger" | "warning" | "info";
  } | null>(null);

  // الأعمدة باللغة العربية
  const columns = [
    { id: "id", name: "المعرّف" },
    { id: "title", name: "العنوان" },
    { id: "message", name: "الرسالة" },
    { id: "notification_type", name: "نوع الإشعار" },
    { id: "role", name: "الدور" },
    { id: "user", name: "اسم المستخدم" },
    { id: "is_read", name: "تمّت القراءة؟" },
    { id: "created_at", name: "تاريخ الإشعار" },
  ];

  // تنفيذ الاستعلام حسب الدور + البحث + الصفحة + العدد
  const { data, loading: queryLoading, error } = useQuery<NotificationsResponse>(
    NOTIFICATIONS_QUERY,
    {
      variables: {
        role: roleMap[activeTab],
        search: searchTerm || null,
        page,
        limit: itemsPerPage,
      },
      fetchPolicy: "network-only",
    }
  );

  // دالة مبددة (debounce) للبحث
  const debouncedSearch = useCallback(
    debounce((val: string) => {
      setSearchTerm(val);
      setPage(1);
    }, 400),
    []
  );

  // تحديث البيانات عند وصول نتيجة الاستعلام
  useEffect(() => {
    if (data?.notifications) {
      setNotifications(data.notifications.items);
      setTotalPages(data.notifications.pages);
      setTotalItems(data.notifications.total);
    }

    if (error) {
      error.graphQLErrors.forEach((err) => {
        setToast({ message: err.message, type: "warning" });
      });
    }
  }, [data, error]);

  // تبديل التبويب
  function handleTabChange(tabId: keyof typeof roleMap) {
    setActiveTab(tabId);
    setPage(1); // إعادة الصفحة للأولى عند تغيير التبويب
  }

  // التقدم والترجع في الترقيم
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
        <h3 className="text-3xl font-bold text-gray-700 mb-2">الإشعارات</h3>
        <Link
          href="/dashboard/notifications/create"
          className="px-3 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md"
        >
          <i className="fas fa-plus"></i> إضافة إشعار
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
              <span className="text-sm font-medium text-gray-700">الإشعارات</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* التبويبات لتحديد الدور (عميل - فرع - مندوب - مدير) */}
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-300">
        <ul className="flex flex-wrap -mb-px">
          {tabs.map((tab) => (
            <li key={tab.id} className="me-2">
              <button
                onClick={() => handleTabChange(tab.id as keyof typeof roleMap)}
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

      {/* محتوى الصفحة */}
      <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
        {/* عناوين الأقسام الداخلية */}
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-bold text-gray-700 mb-5">
            الدور الحالي: {roleMap[activeTab]}
          </h5>
          <h5 className="text-xl font-bold text-gray-700 mb-5">
            جدول الإشعارات
          </h5>
        </div>

        {/* اختيار عدد العناصر والبحث */}
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
              placeholder="ابحث عن إشعار..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1"
            />
          </div>
        </div>

        {/* جدول الإشعارات */}
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
              {error || notifications.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-2 text-gray-500"
                  >
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                notifications.map((notif) => (
                  <tr
                    key={notif.id}
                    className="border-b odd:bg-white even:bg-gray-50"
                  >
                    <td className="py-2 px-2 border border-slate-200">
                      {notif.id}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {notif.title}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {notif.message}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {notif.notification_type}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {notif.role}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {notif.user}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {notif.is_read ? "نعم" : "لا"}
                    </td>
                    <td className="py-2 px-2 border border-slate-200">
                      {new Date(notif.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* الترقيم */}
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

      {/* تنبيهات (Toast) في حال وجود رسائل أو أخطاء */}
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
