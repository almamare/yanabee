"use client";

import React, { useState, useEffect } from "react";  // "use client" is used to indicate that this component should be rendered on the client side.
import Link from "next/link"; // Link is used for client-side navigation in Next.js.
import { useQuery, useMutation } from "@apollo/client"; // Apollo Client is used for GraphQL queries and mutations.
import { GET_USER_QUERY } from "@/graphql/queries/queries"; // GraphQL query to get user details.
import { UPDATE_PASSWORD_MUTATION, UPDATE_BRANCH_MUTATION, UPDATE_STATUS_MUTATION } from "@/graphql/mutations/users"; // GraphQL mutations for updating user password and address.
import { UserResponse, User, Address, Balance, Client, UpdatePasswordResponse, UpdatePasswordVariables, } from "@/graphql/types/users"; // TypeScript types for user-related data.
import { Branch } from "@/graphql/types/statesType"; // TypeScript type for branches.
import Toast from "@/components/Toast"; // Toast component for displaying notifications.
import Tooltip from "@/components/Tooltip"; // Tooltip component for displaying additional information.


// GraphQL imports 
export default function UserDetailsPage({ params }: { params: { userId: string } }) {
    const userId = params.userId;

    // Store user-related data
    const [user, setUser] = useState<User | null>(null);
    const [address, setAddress] = useState<Address | null>(null);
    const [balance, setBalance] = useState<Balance | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);

    // Toast notifications
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "warning" | "info"; } | null>(null);

    // Query to get user details & branches
    const { data, loading: queryLoading, error, } = useQuery<{ branches: Branch[]; user: UserResponse }>(GET_USER_QUERY, {
        variables: {
            user_id: userId,
            stateCode: null,
            cityCode: null,
            stateName: address?.state ?? null,
        },
        fetchPolicy: "network-only",
    });

    // Mutations
    const [updatePassword] = useMutation<UpdatePasswordResponse, UpdatePasswordVariables>(
        UPDATE_PASSWORD_MUTATION
    );

    // Update user status mutation (not used in this example)
    const [updateBranch] = useMutation(UPDATE_BRANCH_MUTATION);
    // Update user status mutation (not used in this example)
    const [updateStatus] = useMutation(UPDATE_STATUS_MUTATION);

    useEffect(() => {
        if (data?.user) {
            const userData = data.user.user;
            const addressData = data.user.address; // from server
            const balanceData = data.user.balance;
            const clientData = data.user.client;

            setUser(userData || null);
            setBalance(balanceData || null);
            setClient(clientData || null);
            setBranches(data.branches || []);
            setAddress(addressData || null); // from server
        }
    }, [data]);

    // Format date strings
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleString();
    };

    // Update user status handler (not used in this example)
    const handleStatusChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const status = (e.currentTarget.userStatus as HTMLSelectElement).value;

        try {
            const result = await updateStatus({ variables: { user_id: userId, status } });

            if (result.data?.updateStatus) {
                setToast({ message: result.data.updateStatus.message, type: "success", });
            }
        } catch (err: any) {
            if (err?.graphQLErrors && Array.isArray(err.graphQLErrors)) {
                err.graphQLErrors.forEach((graphqlError: any) => {
                    const validTypes: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info"];
                    const toastType = validTypes.includes(graphqlError.extensions?.code) ? (graphqlError.extensions.code as "success" | "danger" | "warning" | "info") : "danger";
                    setToast({ message: graphqlError.message, type: toastType });
                });
            } else if (err instanceof Error) {
                setToast({ message: err.message, type: "danger" });
            } else {
                setToast({ message: "An unknown error occurred", type: "danger" });
            }
        }
    }

    // Update branch handler
    const handleBranchChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const branchId = (e.currentTarget.branches as HTMLSelectElement).value;

        try {
            const result = await updateBranch({ variables: { user_id: userId, branch_id: branchId } });

            if (result.data?.updateBranch) {
                setToast({ message: result.data.updateBranch.message, type: "success", });
            }
        } catch (err: any) {
            if (err?.graphQLErrors && Array.isArray(err.graphQLErrors)) {
                err.graphQLErrors.forEach((graphqlError: any) => {
                    const validTypes: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info"];
                    const toastType = validTypes.includes(graphqlError.extensions?.code) ? (graphqlError.extensions.code as "success" | "danger" | "warning" | "info") : "danger";
                    setToast({ message: graphqlError.message, type: toastType });
                });
            } else if (err instanceof Error) {
                setToast({ message: err.message, type: "danger" });
            } else {
                setToast({ message: "An unknown error occurred", type: "danger" });
            }
        }
    }

    // Update password handler
    const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newPassword = (e.currentTarget.password as HTMLInputElement).value;

        try {
            const result = await updatePassword({ variables: { user_id: userId, password: newPassword } });

            if (result.data?.updatePassword) {
                setToast({ message: result.data.updatePassword.message, type: "success", });
            }
        } catch (err: any) {
            if (err?.graphQLErrors && Array.isArray(err.graphQLErrors)) {
                err.graphQLErrors.forEach((graphqlError: any) => {
                    const validTypes: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info"];
                    const toastType = validTypes.includes(graphqlError.extensions?.code) ? (graphqlError.extensions.code as "success" | "danger" | "warning" | "info") : "danger";
                    setToast({ message: graphqlError.message, type: toastType });
                });
            } else if (err instanceof Error) {
                setToast({ message: err.message, type: "danger" });
            } else {
                setToast({ message: "An unknown error occurred", type: "danger" });
            }
        }
    };


    if (queryLoading) {
        return (
            <>
                {/* Skeleton for page title & breadcrumbs */}
                <div className="h-7 w-1/4 bg-gray-200 rounded-md animate-pulse mb-4"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded-md animate-pulse mb-4"></div>

                {/* Skeleton for the top 3 “cards” */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {/* Card */}
                    <div className="p-4 bg-white shadow-sm rounded-lg space-y-3 animate-pulse">
                        <div className="h-5 w-1/2 bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                    </div>
                    <div className="p-4 bg-white shadow-sm rounded-lg space-y-3 animate-pulse">
                        <div className="h-5 w-1/2 bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                    </div>
                    <div className="p-4 bg-white shadow-sm rounded-lg space-y-3 animate-pulse">
                        <div className="h-5 w-1/2 bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                    </div>
                </div>

                {/* Skeleton for the bottom 3 “cards” */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="p-4 bg-white shadow-sm rounded-lg space-y-3 animate-pulse"
                        >
                            <div className="h-5 w-1/2 bg-gray-200 rounded-md"></div>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="h-6 w-full bg-gray-200 rounded-md"></div>
                            ))}
                        </div>
                    ))}
                </div>
            </>
        );
    }

    return (
        <>
            {/* Page Title & Breadcrumbs */}
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-700 mb-2">المستخدمين</h3>
            </div>

            {/* Breadcrumbs */}
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:text-second" >
                            لوحة التحكم
                        </Link>
                    </li>
                    <li className="inline-flex items-center">
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <Link href="/dashboard/users" className="inline-flex items-center text-sm font-medium text-primary hover:text-second" >
                            المستخدمين
                        </Link>
                    </li>
                    <li aria-current="page">
                        <div className="flex items-center">
                            <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                            <span className="text-sm font-medium text-gray-700">تفاصيل المستخدم</span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* Top Info Cards (Balance, Branch/Client, Status) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Balance Info */}
                <div className="p-4 bg-white shadow-sm rounded-lg">
                    <h4 className="text-xl font-bold text-primary mb-4">معلومات الرصيد</h4>
                    <ul className="divide-y divide-gray-200">
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">المبلغ</span>
                            <div className="text-base font-semibold text-gray-900">
                                <span className="text-gray-700 text-md me-2"> {balance?.currency} </span>
                                <span className="text-2xl text-primary mx-1"> {balance?.amount} </span>
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">تاريخ الإنشاء</span>
                            <div className="text-base font-semibold text-gray-900">
                                {formatDate(balance?.created_at ?? "")}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">تاريخ التعديل</span>
                            <div className="text-base font-semibold text-gray-900">
                                {formatDate(balance?.updated_at ?? "")}
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Branch Info (if client data exists) */}
                {client && (
                    <div className="p-4 bg-white shadow-sm rounded-lg">
                        <h4 className="text-xl font-bold text-primary mb-4">معلومات الفرع</h4>
                        <ul className="divide-y divide-gray-200">
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">المحافظة</span>
                                <div className="text-base font-semibold text-gray-900">
                                    {address?.state}
                                </div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">اسم الفرع</span>
                                <div className="text-base font-semibold text-gray-900">
                                    {client.branch_name}
                                </div>
                            </li>

                            {/* Placeholder form to change branch */}
                            <li className="py-2">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center flex-1">
                                        <span className="text-sm font-medium text-gray-700 ml-2">
                                            تغيير الفرع
                                        </span>
                                        <Tooltip text="إذا كنت تريد التبديل إلى فرع تابع لمحافظة أخرى، يجب عليك تغيير المحافظة أولاً. الطلبات القديمة ستبقى في الفرع القديم، والطلبات الجديدة ستذهب إلى الفرع الجديد.">
                                            <i className="fas fa-info-circle"></i>
                                        </Tooltip>
                                    </div>
                                    <form className="flex-1 max-w-xs" dir="rtl" onSubmit={(e) => { e.preventDefault(); handleBranchChange(e); }}>
                                        <div className="flex gap-2 flex-row-reverse">
                                            <button type="submit" className="px-4 py-1 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors" >
                                                تغيير
                                            </button>
                                            <select
                                                id="branches"
                                                className="flex-1 px-3 py-1 border border-gray-300 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                                dir="rtl"
                                            >
                                                <option value="">اختر الفرع</option>
                                                {branches.map((branch) => (
                                                    <option key={branch.user_id} value={branch.user_id}>
                                                        {branch.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </form>
                                </div>
                            </li>
                        </ul>
                    </div>
                )}

                {/* User Status / Password */}
                <div className="p-4 bg-white shadow-sm rounded-lg">
                    <h4 className="text-xl font-bold text-primary mb-4">حالة الحساب</h4>
                    <ul className="divide-y divide-gray-200">
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">رقم الحساب</span>
                            <div className="text-base font-semibold text-gray-900">
                                {user?.code}
                                {user?.number}
                            </div>
                        </li>
                        {/* Change User Status (placeholder) */}
                        <li className="py-2">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center flex-1">
                                    <span className="text-sm font-medium text-gray-700 ml-3">
                                        تغيير الحالة
                                    </span>
                                </div>
                                <form className="flex-1 max-w-xs" dir="rtl" onSubmit={(e) => { e.preventDefault(), handleStatusChange(e); }} >
                                    <div className="flex gap-2 flex-row-reverse">
                                        <button type="submit" className="px-4 py-1 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors" >
                                            تغيير
                                        </button>
                                        <select id="userStatus" className="flex-1 px-3 py-1 border border-gray-300 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" dir="rtl" defaultValue={user?.status} >
                                            <option value="">اختر الحالة</option>
                                            <option value="نشط">نشط</option>
                                            <option value="غير نشط">غير نشط</option>
                                        </select>
                                    </div>
                                </form>
                            </div>
                        </li>
                        {/* Change Password */}
                        <li className="py-2">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center flex-1">
                                    <span className="text-sm font-medium text-gray-700 ml-3">
                                        تغيير كلمة المرور
                                    </span>
                                </div>
                                <form className="flex-1 max-w-xs" dir="rtl" onSubmit={changePassword}>
                                    <div className="flex gap-2 flex-row-reverse">
                                        <button type="submit" className="px-4 py-1 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors" >
                                            تغيير
                                        </button>
                                        <input type="password" id="password" name="password" placeholder="كلمة مرور جديدة" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md w-full focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" required />
                                    </div>
                                </form>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Info: User, Address, Client */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* User Details */}
                <div className="p-4 bg-white shadow-sm rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xl font-bold text-primary mb-4">تفاصيل المستخدم</h4>
                        <Link href={`/dashboard/users/update/user/${userId}`} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-600/90 transition-colors">
                            تعديل
                        </Link>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">الحالة</span>
                            <div className="text-base font-semibold text-gray-900">
                                <span
                                    className={`px-2 py-0.5 rounded-md ${user?.status === "نشط"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {user?.status}
                                </span>
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">الاسم</span>
                            <div className="text-base font-semibold text-gray-900">{user?.name}</div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">اللقب</span>
                            <div className="text-base font-semibold text-gray-900">{user?.surname}</div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">الهاتف</span>
                            <div className="text-base font-semibold text-gray-900">{user?.phone}</div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">البريد الإلكتروني</span>
                            <div className="text-base font-semibold text-gray-900">{user?.email}</div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">الدور</span>
                            <div className="text-base font-semibold text-gray-900">{user?.role}</div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">نوع المستخدم</span>
                            <div className="text-base font-semibold text-gray-900">{user?.user_type}</div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">تاريخ الإنشاء</span>
                            <div className="text-base font-semibold text-gray-900">
                                {formatDate(user?.created_at ?? "")}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">تاريخ التعديل</span>
                            <div className="text-base font-semibold text-gray-900">
                                {formatDate(user?.updated_at ?? "")}
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Address Details */}
                <div className="p-4 bg-white shadow-sm rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xl font-bold text-primary mb-4">تفاصيل العنوان</h4>
                        <Link href={`/dashboard/users/update/address/${userId}`} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-600/90 transition-colors">
                            تعديل
                        </Link>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">الاسم</span>
                            <div className="text-base font-semibold text-gray-900">{address?.name}</div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">الهاتف</span>
                            <div className="text-base font-semibold text-gray-900">{address?.phone}</div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">النوع</span>
                            <div className="text-base font-semibold text-gray-900">{address?.address_type}</div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">المحافظة</span>
                            <div className="text-base font-semibold text-gray-900">{address?.state}</div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">المدينة</span>
                            <div className="text-base font-semibold text-gray-900">{address?.city}</div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">الحي</span>
                            <div className="text-base font-semibold text-gray-900">{address?.district}</div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">العنوان الكامل</span>
                            <div className="text-base font-semibold text-gray-900">{address?.address}</div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">تاريخ الإنشاء</span>
                            <div className="text-base font-semibold text-gray-900">
                                {formatDate(address?.created_at ?? "")}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">تاريخ التعديل</span>
                            <div className="text-base font-semibold text-gray-900">
                                {formatDate(address?.updated_at ?? "")}
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Client Details */}
                {client && (
                    <div className="p-4 bg-white shadow-sm rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xl font-bold text-primary mb-4">تفاصيل العميل</h4>
                            <button
                                onClick={() => alert("Edit client...")}
                                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-600/90 transition-colors"
                            >
                                تعديل
                            </button>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">الاسم</span>
                                <div className="text-base font-semibold text-gray-900">{client.name}</div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">الرقم</span>
                                <div className="text-base font-semibold text-gray-900">{client.number}</div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">المستوى</span>
                                <div className="text-base font-semibold text-gray-900">{client.level}</div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">نوع العميل</span>
                                <div className="text-base font-semibold text-gray-900">{client.client_type}</div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">اسم المُنشئ</span>
                                <div className="text-base font-semibold text-gray-900">{client.parent_name}</div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">رقم المُنشئ</span>
                                <div className="text-base font-semibold text-gray-900">{client.parent_number}</div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">مستوى المُنشئ</span>
                                <div className="text-base font-semibold text-gray-900">{client.parent_level}</div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">تاريخ الإنشاء</span>
                                <div className="text-base font-semibold text-gray-900">
                                    {formatDate(client.created_at ?? "")}
                                </div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">تاريخ التعديل</span>
                                <div className="text-base font-semibold text-gray-900">
                                    {formatDate(client.updated_at ?? "")}
                                </div>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Toast notification */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
}
