"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react"; // React core + hooks
import { useRouter } from "next/navigation"; // App Router helpers
import Link from "next/link"; // Client‑side navigation
import { useQuery, useMutation, gql } from "@apollo/client"; // Apollo hooks + gql tag
import Toast from "@/components/Toast"; // Re‑usable toast component

/* =========[ GraphQL operations ]========= */

// 1) عناوين المستخدم (لجلب القيم الحالية)
export const GET_USER_ADDRESS = gql`
  query User($user_id: String!) {
    user(user_id: $user_id) {
      address {
        id
        name
        phone
        state    
        city     
        district      
        address
      }
    }
  }
`;

// 2) كل المحافظات
export const STATES_QUERY = gql`
  query States {
    states {
      state_code
      state_name
    }
  }
`;

// 3) مدن محافظة معيَّنة
export const CITIES_QUERY = gql`
  query Cities($state_code: String!) {
    cities(state_code: $state_code) {
      city_code
      city_name
    }
  }
`;

// 4) مناطق مدينة معيَّنة
export const DISTRICTS_QUERY = gql`
  query Districts($city_code: String!) {
    districts(city_code: $city_code) {
      district_id
      district_name
    }
  }
`;

// 5) تحديث العنوان
export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress(
    $user_id: String!
    $name: String!
    $phone: String!
    $state: String!
    $city: String!
    $district: String!
    $address: String!
  ) {
    updateAddress(
      user_id: $user_id
      name: $name
      phone: $phone
      state: $state
      city: $city
      district: $district
      address: $address
    ) {
      id
      number
      message
    }
  }
`;

/* =========[ Types ]========= */
// Type for the address object
export interface Address {
    id: string;
    name: string;
    phone: string;
    state: string;
    city: string;
    district: string;
    address: string;
}
// Type for the user object
export interface User {
    address: Address;
}
// Type for the GraphQL response
export interface UserResponse {
    user: User;
}


/* =========[ Component ]========= */

export default function UpdateAddress({ params }: { params: { userId: string }; }) {
    const userId = params.userId;   // user ID from URL params          
    const router = useRouter();     // Next.js router for navigation

    /* ---------- Local state ---------- */
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    // dependent selects
    const [stateCode, setStateCode] = useState<string | null>(null);
    const [cityCode, setCityCode] = useState<string | null>(null);
    const [districtId, setDistrictId] = useState<string | null>(null);

    const [toast, setToast] = useState<| { message: string; type: "success" | "danger" | "warning" | "info" } | null>(null);

    /* ---------- Fetch 1: current address ---------- */
    const { data: userData, loading: userLoading, error: userError } = useQuery<UserResponse>(GET_USER_ADDRESS, {
        variables: { user_id: userId },
        fetchPolicy: "network-only",
    });

    /* ---------- Fetch 2: static list of states ---------- */
    const { data: statesData } = useQuery(STATES_QUERY);

    /* ---------- Fetch 3: cities & districts dependents ---------- */
    const { data: citiesData, refetch: refetchCities, } = useQuery(CITIES_QUERY, {
        variables: { state_code: stateCode ?? "" },
        skip: !stateCode,
    });

    const { data: districtsData, refetch: refetchDistricts } = useQuery(DISTRICTS_QUERY, {
        variables: { city_code: cityCode ?? "" },
        skip: !cityCode,
    });

    /* ---------- Populate form with current values ---------- */
    useEffect(() => {
        if (userData?.user?.address) {
            const addr = userData.user.address;
            setName(addr.name ?? "");
            setPhone(addr.phone ?? "");
            setAddress(addr.address ?? "");
            setStateCode(addr.state ?? null);
            setCityCode(addr.city ?? null);
            setDistrictId(addr.district ?? null);
        }
    }, [userData]);

    /* ---------- Refetch dependents when parent changes ---------- */
    useEffect(() => {
        if (stateCode) {
            refetchCities({ state_code: stateCode });
            setCityCode(null);       // reset lower levels
            setDistrictId(null);
        }
    }, [stateCode, refetchCities]);

    useEffect(() => {
        if (cityCode) {
            refetchDistricts({ city_code: cityCode });
            setDistrictId(null);
        }
    }, [cityCode, refetchDistricts]);

    /* ---------- Mutation ---------- */
    const [updateAddress, { loading: updating }] = useMutation(UPDATE_ADDRESS);

    /* ---------- Handlers ---------- */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!stateCode || !cityCode || !districtId) {
            setToast({ message: "يجب اختيار المحافظة والمدينة والمنطقة", type: "warning" });
            return;
        }

        try {
            const { data } = await updateAddress({
                variables: {
                    user_id: userId,
                    name,
                    phone,
                    state: stateCode,
                    city: cityCode,
                    district: districtId,
                    address,
                },
            });

            if (data?.updateAddress) {
                setToast({ message: data.updateAddress.message, type: "success" });
                setTimeout(() => router.back(), 1200);
            }
        } catch (error: any) {
            const msg =
                error?.graphQLErrors?.[0]?.message ??
                error.message ??
                "Unknown error";
            setToast({ message: msg, type: "danger" });
        }
    };

    /* =========[ JSX ]========= */
    return (
        <>
            {/* ---- Header ---- */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">
                    تحديث عنوان المستخدم
                </h3>
                <Link
                    href="/dashboard/users"
                    className="text-sm text-primary hover:text-second font-medium"
                >
                    العودة إلى المستخدمين
                </Link>
            </div>

            {/* ---- Breadcrumb ---- */}
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-primary hover:text-second"
                        >
                            لوحة التحكم
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <Link
                            href="/dashboard/users"
                            className="text-sm font-medium text-primary hover:text-second"
                        >
                            المستخدمون
                        </Link>
                    </li>
                    <li>
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <span className="text-sm font-medium text-gray-700">
                            تحديث العنوان
                        </span>
                    </li>
                </ol>
            </nav>

            {/* ---- Current address preview ---- */}
            {userData?.user?.address && (
                <div className="mb-5 p-4 rounded-md bg-white shadow-sm">
                    <p className="text-sm text-gray-600">
                        العنوان الحالي:{" "}
                        <strong>
                            {userData.user.address.district} / {userData.user.address.city} /{" "}
                            {userData.user.address.state}
                        </strong>
                    </p>
                </div>
            )}

            {/* ---- Form ---- */}
            <div className="p-6 bg-white shadow-sm rounded-lg">
                <h3 className="text-2xl font-bold text-primary">
                    تعديل بيانات العنوان
                </h3>
                <p className="text-xs text-gray-500 mb-5">
                    قم بتعديل الحقول ثم اضغط <strong>حفظ</strong>
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700" >
                                اسم المستلم <span className="text-red-500">*</span>
                            </label>
                            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" required />
                        </div>

                        {/* Phone */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                رقم الهاتف <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" required />
                        </div>

                        {/* State Select */}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                المحافظة <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 w-full"
                                value={stateCode ?? ""}
                                onChange={(e) => setStateCode(e.target.value || null)}
                                required
                            >
                                <option value="">ـ اختر المحافظة ـ</option>
                                {statesData?.states?.map((st: any) => (
                                    <option key={st.state_code} value={st.state_code}>
                                        {st.state_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* City Select */}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                المدينة <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 w-full"
                                value={cityCode ?? ""}
                                onChange={(e) => setCityCode(e.target.value || null)}
                                disabled={!stateCode}
                                required
                            >
                                <option value="">ـ اختر المدينة ـ</option>
                                {citiesData?.cities?.map((ct: any) => (
                                    <option key={ct.city_code} value={ct.city_code}>
                                        {ct.city_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* District Select */}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                المنطقة <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1 w-full"
                                value={districtId ?? ""}
                                onChange={(e) => setDistrictId(e.target.value || null)}
                                disabled={!cityCode}
                                required
                            >
                                <option value="">ـ اختر المنطقة ـ</option>
                                {districtsData?.districts?.map((d: any) => (
                                    <option key={d.district_id} value={d.district_id}>
                                        {d.district_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Street / Details */}
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="address"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                العنوان التفصيلي
                            </label>
                            <textarea
                                id="address"
                                rows={3}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" required 
                                placeholder="اسم الشارع، علامة مميزة، الخ..."
                            />
                        </div>
                    </div>
                </div>

                    {/* Error message */}

                    {/* Submit */}
                    <button
                        type="submit"
                        className={`px-6 py-2 text-white bg-primary hover:bg-second rounded-md text-sm font-medium transition-all ${updating ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={updating}
                    >
                        {updating ? "جاري التحديث..." : "حفظ التعديلات"}
                    </button>
                </form>
            </div>

            {/* ---- Toast ---- */}
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
