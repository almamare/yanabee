"use client";

import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Users } from "lucide-react"; // icons for user stats
import Spinner from "@/components/Spinner"; // loading indicator
import Toast from "@/components/Toast"; // toast notifications

/**
 * Dashboard Component
 * -------------------
 * Arabic UI labels for end‑users; English comments for developers.
 */

/* =====================
   GraphQL – Dashboard Query
   ===================== */
 const GET_DASHBOARD = gql`
  query Dashboard {
    dashboard {
      users {
        manager
        client
        branch
        courier
        customer
      }
      shipments {
        work {
          pending
          confirmed
          unconfirmed
          processed
          delivering
          returned
          returning
          completed
          partial_received
          canceled
        }
        archive {
          pending
          confirmed
          unconfirmed
          processed
          delivering
          returned
          returning
          completed
          partial_received
          canceled
        }
      }
      invoicesData {
        pending
        paid
        unpaid
        canceled
        withCourier
      }
    }
  }
`;

/* ===============
   TypeScript Interfaces
   =============== */
interface UsersStats {
  manager: number;
  client: number;
  branch: number;
  courier: number;
  customer: number;
}

interface ShipmentsStatus {
  pending: number;
  confirmed: number;
  unconfirmed: number;
  processed: number;
  delivering: number;
  returned: number;
  returning: number;
  completed: number;
  partial_received: number;
  canceled: number;
  __typename?: string;
}

interface InvoicesStats {
  pending: number;
  paid: number;
  unpaid: number;
  canceled: number;
  withCourier: number;
  __typename?: string;
}

interface DashboardData {
  dashboard: {
    users: UsersStats;
    shipments: {
      work: ShipmentsStatus;
      archive: ShipmentsStatus;
    };
    invoicesData: InvoicesStats;
  };
}

/* =====================
   UI Helper Constants
   ===================== */
// Colors for shipment statuses
const STATUS_COLORS: Record<string, string> = {
  pending: "#6366f1",
  confirmed: "#10b981",
  unconfirmed: "#f59e0b",
  processed: "#0ea5e9",
  delivering: "#4f46e5",
  returned: "#f97316",
  returning: "#fb923c",
  completed: "#22c55e",
  partial_received: "#a855f7",
  canceled: "#ef4444",
};

// Arabic labels for shipment statuses
const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  unconfirmed: "غير مؤكد",
  processed: "تم التنفيذ",
  delivering: "قيد التوصيل",
  returned: "مرتجعة",
  returning: "قيد الارجاع",
  completed: "مكتملة",
  partial_received: "مستلم جزئي",
  canceled: "ملغاة",
};

// Colors for invoice statuses
const INVOICE_COLORS: Record<string, string> = {
  pending: "#6366f1", // same as shipment pending
  paid: "#10b981", // green
  unpaid: "#f59e0b", // amber
  canceled: "#ef4444", // red
  withCourier: "#4f46e5", // indigo
};

// Arabic labels for invoice statuses
const INVOICE_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  paid: "مدفوع",
  unpaid: "غير مدفوع",
  canceled: "ملغاة",
  withCourier: "بحوزة المندوب",
};

/* =====================
   Re‑usable Card Component
   ===================== */
function StatsCard({
  title,
  value,
  color,
  icon: Icon,
}: {
  title: string;
  value: number;
  color: string;
  icon: React.FC<any>;
}) {
  return (
    <div
      className="flex items-center gap-4 p-4 bg-white shadow rounded-lg"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div
        className="p-2 rounded-full"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-xl font-bold text-gray-800 rtl:text-right ltr:text-left">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

/* =====================
   Main Dashboard Component
   ===================== */
export default function DashboardPage() {
  // Fetch dashboard data using Apollo Client
  const { data, loading, error } = useQuery<DashboardData>(GET_DASHBOARD, {
    fetchPolicy: "cache-and-network",
  });

  // Handle loading & error states early
  if (loading) return <Spinner className="mt-20 flex justify-center" />;
  if (error)
    return <Toast message={error.message} type="danger" onClose={() => {}} />;

  const { users, shipments, invoicesData } = data!.dashboard;

  return (
    <div className="space-y-10">
      {/* === Page Header === */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
      </header>

      {/* === Users Section === */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">
          إحصائيات المستخدمين
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="المدراء"
            value={users.manager}
            color="#6366f1"
            icon={Users}
          />
          <StatsCard
            title="العملاء"
            value={users.client}
            color="#10b981"
            icon={Users}
          />
          <StatsCard
            title="الفروع"
            value={users.branch}
            color="#0ea5e9"
            icon={Users}
          />
          <StatsCard
            title="المندوبين"
            value={users.courier}
            color="#f97316"
            icon={Users}
          />
          <StatsCard
            title="الزبائن"
            value={users.customer}
            color="#a855f7"
            icon={Users}
          />
        </div>
      </section>

      {/* === Shipments – Work === */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">
          إحصائيات الشحنات (قيد العمل)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Object.entries(shipments.work)
            .filter(([status]) => status !== "__typename")
            .map(([status, count]) => (
              <div
                key={status}
                className="p-4 bg-white shadow rounded-lg"
                style={{ borderLeft: `4px solid ${STATUS_COLORS[status]}` }}
              >
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {STATUS_LABELS[status] ?? status}
                </p>
                <p className="text-xl font-bold text-gray-800 rtl:text-right ltr:text-left">
                  {count.toLocaleString()}
                </p>
              </div>
            ))}
        </div>
      </section>

      {/* === Shipments – Archive === */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">
          إحصائيات الشحنات (الأرشيف)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Object.entries(shipments.archive)
            .filter(([status]) => status !== "__typename")
            .map(([status, count]) => (
              <div
                key={status}
                className="p-4 bg-white shadow rounded-lg"
                style={{ borderLeft: `4px solid ${STATUS_COLORS[status]}` }}
              >
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {STATUS_LABELS[status] ?? status}
                </p>
                <p className="text-xl font-bold text-gray-800 rtl:text-right ltr:text-left">
                  {count.toLocaleString()}
                </p>
              </div>
            ))}
        </div>
      </section>

      {/* === Invoices Section === */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">
          إحصائيات الفواتير
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Object.entries(invoicesData)
            .filter(([status]) => status !== "__typename")
            .map(([status, count]) => (
              <div
                key={status}
                className="p-4 bg-white shadow rounded-lg"
                style={{ borderLeft: `4px solid ${INVOICE_COLORS[status]}` }}
              >
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {INVOICE_LABELS[status] ?? status}
                </p>
                <p className="text-xl font-bold text-gray-800 rtl:text-right ltr:text-left">
                  {count.toLocaleString()}
                </p>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
