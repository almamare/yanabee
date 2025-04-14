"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";

// GraphQL Queries & Mutations
import { GET_USER_QUERY } from "@/graphql/queries/queries";
import {
    UPDATE_PASSWORD_MUTATION,
    UPDATE_ADDRESS_MUTATION,
} from "@/graphql/mutations/userMutation";

// Types
import {
    UserResponse,
    User,
    Address as AddressServerType,
    Balance,
    Client,
    UpdatePasswordResponse,
    UpdatePasswordVariables,
} from "@/graphql/types/userType";
import { Branch } from "@/graphql/types/statesType";

// Components
import Toast from "@/components/Toast";
import Tooltip from "@/components/Tooltip";
import UpdateAddressModal from "@/components/users/update/UpdateAddressModal";

/**
 * Interface used to store/update address details in local state.
 * If your server returns exactly the same shape as `Address`,
 * you can reuse that type. Otherwise define a new one, ensuring
 * it matches the form in `UpdateAddressModal`.
 */
export interface AddressUpdate {
    id: string;
    name: string;
    phone: string;
    address_type: string;
    state: string;
    city: string;
    district: string;
    address: string;
    created_at: string;
    updated_at: string;
}

export default function UserDetailsPage({ params }: { params: { userId: string } }) {
    const userId = params.userId;

    // Modal open state
    const [updateModalOpen, setUpdateModalOpen] = useState(false);

    // Store user-related data
    const [user, setUser] = useState<User | null>(null);
    /**
     * We allow `null` here to handle the period before data is fetched.
     * When data arrives, we'll map it to `AddressUpdate` shape.
     */
    const [address, setAddress] = useState<AddressUpdate | null>(null);
    const [balance, setBalance] = useState<Balance | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);

    // Toast notifications
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "danger" | "warning" | "info";
    } | null>(null);

    // Query to get user details & branches
    const {
        data,
        loading: queryLoading,
        error,
    } = useQuery<{
        branches: Branch[];
        user: UserResponse;
    }>(GET_USER_QUERY, {
        variables: {
            user_id: userId,
            stateCode: null,
            cityCode: null,
            // If address is null, we pass null or empty
            stateName: address?.state ?? null,
        },
        fetchPolicy: "network-only",
    });

    // Mutations
    const [updatePassword] = useMutation<UpdatePasswordResponse, UpdatePasswordVariables>(
        UPDATE_PASSWORD_MUTATION
    );

    const [updateAddressMutation] = useMutation(UPDATE_ADDRESS_MUTATION);

    /**
     * When data arrives from the query, update local state:
     * - user
     * - address (converted to AddressUpdate shape)
     * - balance
     * - client
     * - branches
     */
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

            // If the server returns `addressData`, ensure we map it to AddressUpdate shape
            if (addressData) {
                setAddress({
                    id: addressData.id || "",
                    name: addressData.name || "",
                    phone: addressData.phone || "",
                    address_type: addressData.address_type || "",
                    state: addressData.state || "",
                    city: addressData.city || "",
                    district: addressData.district || "",
                    address: addressData.address || "",
                    created_at: addressData.created_at || "",
                    updated_at: addressData.updated_at || "",
                });
            }
        }
    }, [data]);

    // Format date strings
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleString();
    };

    // Update password handler
    const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newPassword = (e.currentTarget.password as HTMLInputElement).value;

        try {
            const result = await updatePassword({
                variables: { user_id: userId, password: newPassword },
            });

            if (result.data?.updatePassword) {
                setToast({
                    message: result.data.updatePassword.message,
                    type: "success",
                });
            }
        } catch (err: any) {
            if (err instanceof Error) {
                setToast({ message: err.message, type: "danger" });
            } else {
                setToast({ message: "An unknown error occurred", type: "danger" });
            }
        }
    };

    /**
     * Update address both in the server (via mutation)
     * and in local state if successful.
     */
    const handleAddressUpdate = async (updated: AddressUpdate) => {
        try {
            const { data } = await updateAddressMutation({
                variables: {
                    user_id: userId,
                    name: updated.name,
                    phone: updated.phone,
                    state: updated.state,
                    city: updated.city,
                    district: updated.district,
                    address: updated.address,
                },
            });

            // Depending on your GraphQL schema, check the result
            if (data?.updateAddress) {
                // Update local address
                setAddress(updated);
                // Show success toast
                setToast({ message: "Address updated successfully!", type: "success" });
            }
        } catch (error: any) {
            setToast({
                message: error.message || "Failed to update address",
                type: "danger",
            });
        } finally {
            setUpdateModalOpen(false);
        }
    };

    // Show a loading state if query is still in progress
    // Skeleton Loading UI
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
                    <div className="p-4 bg-white shadow-sm rounded-lg space-y-3 animate-pulse">
                        <div className="h-5 w-1/2 bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                    </div>
                    <div className="p-4 bg-white shadow-sm rounded-lg space-y-3 animate-pulse">
                        <div className="h-5 w-1/2 bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                    </div>
                    <div className="p-4 bg-white shadow-sm rounded-lg space-y-3 animate-pulse">
                        <div className="h-5 w-1/2 bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-6 w-full bg-gray-200 rounded-md"></div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Page Title & Breadcrumbs */}
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-700 mb-2">Users</h3>
            </div>

            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center text-sm font-medium text-primary hover:text-second"
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li className="inline-flex items-center">
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <Link
                            href="/dashboard/users"
                            className="inline-flex items-center text-sm font-medium text-primary hover:text-second"
                        >
                            Users
                        </Link>
                    </li>
                    <li aria-current="page">
                        <div className="flex items-center">
                            <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                            <span className="text-sm font-medium text-gray-700">
                                User Details
                            </span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* Top Info Cards (Balance, Branch/Client, Status) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Balance Info */}
                <div className="p-4 bg-white shadow-sm rounded-lg">
                    <h4 className="text-xl font-bold text-primary mb-4">Balance Info</h4>
                    <ul className="divide-y divide-gray-200">
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Amount</span>
                            <div className="text-base font-semibold text-gray-900">
                                <span className="text-gray-700 text-md me-2">
                                    {balance?.currency}
                                </span>
                                <span className="text-2xl text-primary">{balance?.amount}</span>
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Created At</span>
                            <div className="text-base font-semibold text-gray-900">
                                {formatDate(balance?.created_at ?? "")}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Updated At</span>
                            <div className="text-base font-semibold text-gray-900">
                                {formatDate(balance?.updated_at ?? "")}
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Branch Info (if client data exists) */}
                {client && (
                    <div className="p-4 bg-white shadow-sm rounded-lg">
                        <h4 className="text-xl font-bold text-primary mb-4">Branch Info</h4>
                        <ul className="divide-y divide-gray-200">
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">State</span>
                                <div className="text-base font-semibold text-gray-900">
                                    {address?.state}
                                </div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">
                                    Branch Name
                                </span>
                                <div className="text-base font-semibold text-gray-900">
                                    {client.branch_name}
                                </div>
                            </li>

                            {/* Placeholder form to change branch */}
                            <li className="py-2">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center flex-1">
                                        <span className="text-sm font-medium text-gray-700 ml-2">
                                            Change Branch
                                        </span>
                                        <Tooltip text="If you want to switch to another state's branch, you have to change the state first. Old orders remain in the old branch, new orders go to the new branch.">
                                            <i className="fas fa-info-circle"></i>
                                        </Tooltip>
                                    </div>

                                    <form
                                        className="flex-1 max-w-xs"
                                        dir="rtl"
                                        onSubmit={(e) => e.preventDefault()}
                                    >
                                        <div className="flex gap-2 flex-row-reverse">
                                            <button
                                                type="submit"
                                                className="px-4 py-1 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                                            >
                                                Change
                                            </button>
                                            <select
                                                id="branches"
                                                className="flex-1 px-3 py-1 border border-gray-300 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                                dir="rtl"
                                            >
                                                <option value="">Select branch</option>
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
                    <h4 className="text-xl font-bold text-primary mb-4">Account Status</h4>
                    <ul className="divide-y divide-gray-200">
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">
                                Account Number
                            </span>
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
                                        Change Status
                                    </span>
                                </div>
                                <form
                                    className="flex-1 max-w-xs"
                                    dir="rtl"
                                    onSubmit={(e) => e.preventDefault()}
                                >
                                    <div className="flex gap-2 flex-row-reverse">
                                        <button
                                            type="submit"
                                            className="px-4 py-1 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                                        >
                                            Change
                                        </button>
                                        <select
                                            id="userStatus"
                                            className="flex-1 px-3 py-1 border border-gray-300 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                            dir="rtl"
                                            defaultValue={user?.status}
                                        >
                                            <option value="">Select status</option>
                                            <option value="نشط">Active</option>
                                            <option value="غير نشط">Inactive</option>
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
                                        Change Password
                                    </span>
                                </div>
                                <form
                                    className="flex-1 max-w-xs"
                                    dir="rtl"
                                    onSubmit={changePassword}
                                >
                                    <div className="flex gap-2 flex-row-reverse">
                                        <button
                                            type="submit"
                                            className="px-4 py-1 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                                        >
                                            Change
                                        </button>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            placeholder="New password"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md w-full focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                                            required
                                        />
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
                        <h4 className="text-xl font-bold text-primary mb-4">User Details</h4>
                        <button
                            onClick={() => alert("Edit user details...")}
                            className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-600/90 transition-colors"
                        >
                            Edit
                        </button>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Status</span>
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
                            <span className="text-sm font-medium text-gray-900">Name</span>
                            <div className="text-base font-semibold text-gray-900">
                                {user?.name}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Surname</span>
                            <div className="text-base font-semibold text-gray-900">
                                {user?.surname}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Phone</span>
                            <div className="text-base font-semibold text-gray-900">
                                {user?.phone}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Email</span>
                            <div className="text-base font-semibold text-gray-900">
                                {user?.email}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Role</span>
                            <div className="text-base font-semibold text-gray-900">
                                {user?.role}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">User Type</span>
                            <div className="text-base font-semibold text-gray-900">
                                {user?.user_type}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Created At</span>
                            <div className="text-base font-semibold text-gray-900">
                                {formatDate(user?.created_at ?? "")}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Updated At</span>
                            <div className="text-base font-semibold text-gray-900">
                                {formatDate(user?.updated_at ?? "")}
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Address Details */}
                <div className="p-4 bg-white shadow-sm rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xl font-bold text-primary mb-4">Address Details</h4>
                        <button
                            onClick={() => setUpdateModalOpen(true)}
                            className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-600/90 transition-colors"
                            disabled={!address} // In case address is null
                        >
                            Edit
                        </button>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Name</span>
                            <div className="text-base font-semibold text-gray-900">
                                {address?.name}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Phone</span>
                            <div className="text-base font-semibold text-gray-900">
                                {address?.phone}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Type</span>
                            <div className="text-base font-semibold text-gray-900">
                                {address?.address_type}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">State</span>
                            <div className="text-base font-semibold text-gray-900">
                                {address?.state}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">City</span>
                            <div className="text-base font-semibold text-gray-900">
                                {address?.city}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">District</span>
                            <div className="text-base font-semibold text-gray-900">
                                {address?.district}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Full Address</span>
                            <div className="text-base font-semibold text-gray-900">
                                {address?.address}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Created At</span>
                            <div className="text-base font-semibold text-gray-900">
                                {formatDate(address?.created_at ?? "")}
                            </div>
                        </li>
                        <li className="py-2 flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Updated At</span>
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
                            <h4 className="text-xl font-bold text-primary mb-4">Client Details</h4>
                            <button
                                onClick={() => alert("Edit client...")}
                                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-600/90 transition-colors"
                            >
                                Edit
                            </button>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">Name</span>
                                <div className="text-base font-semibold text-gray-900">
                                    {client.name}
                                </div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">Number</span>
                                <div className="text-base font-semibold text-gray-900">
                                    {client.number}
                                </div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">Level</span>
                                <div className="text-base font-semibold text-gray-900">
                                    {client.level}
                                </div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">Client Type</span>
                                <div className="text-base font-semibold text-gray-900">
                                    {client.client_type}
                                </div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">Parent Name</span>
                                <div className="text-base font-semibold text-gray-900">
                                    {client.parent_name}
                                </div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">Parent Number</span>
                                <div className="text-base font-semibold text-gray-900">
                                    {client.parent_number}
                                </div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">Parent Level</span>
                                <div className="text-base font-semibold text-gray-900">
                                    {client.parent_level}
                                </div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">Created At</span>
                                <div className="text-base font-semibold text-gray-900">
                                    {formatDate(client.created_at ?? "")}
                                </div>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-900">Updated At</span>
                                <div className="text-base font-semibold text-gray-900">
                                    {formatDate(client.updated_at ?? "")}
                                </div>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Toast notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Update Address Modal */}
            {address && (
                <UpdateAddressModal
                    isOpen={updateModalOpen}
                    onClose={() => setUpdateModalOpen(false)}
                    address={address}
                    onUpdate={handleAddressUpdate}
                />
            )}
        </>
    );
}
