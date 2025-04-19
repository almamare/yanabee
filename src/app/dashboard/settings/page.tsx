"use client";

import React, { useState, useEffect } from "react"; // Import React and useState for state management
import Link from "next/link"; // Import Link for navigation
import { useQuery, useLazyQuery, useMutation } from "@apollo/client"; // Import Apollo Client hooks for GraphQL queries
import { PAYMENT_SETTINGS_STATES_QUERY, GET_CITIES_BY_STATE, GET_DISTRICTS_BY_CITY } from "@/graphql/queries/settings"; // Import the query for payment settings and states
import { DELETE_PAYMENT_METHOD, DELETE_ORDER_TYPE, DELETE_CITY, DELETE_DISTRICT } from "@/graphql/mutations/settings"; // Import the mutation for deleting payment methods
import { PaymentMethodsQueryResponse, Setting } from "@/graphql/types/settings"; // Import the type for the query response
import Toast from "@/components/Toast"; // Import Toast component for notifications
import ConfirmDialog from "@/components/ConfirmDialog"; // Import ConfirmDialog component for confirmation dialogs


// Function to truncate text to a specified maximum length
function truncateText(text: string, maxLength = 50) {
    if (!text) return "";
    return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
}

/// Define the main tabs for the management page
const mainTabs = [
    { id: "paymentMethods", label: "طرق الدفع" }, // Payment Methods
    { id: "orderTypes", label: "أنواع الطلبات" }, // Order Types
    { id: "settings", label: "الإعدادات" }, // Settings
    { id: "states", label: "المحافظات" }, // States
    { id: "cities", label: "المدن" }, // Cities
    { id: "districts", label: "الأحياء" }, // Districts
];

// Define the main tabs for the management page
export default function ManagementPage() {

    // State to manage the active tab
    const [activeMainTab, setActiveMainTab] = useState<string>("paymentMethods");
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]); // State to manage payment methods
    const [orderTypes, setOrderTypes] = useState<any[]>([]); // State to manage order types
    const [settings, setSettings] = useState<any[]>([]); // State to manage settings
    const [states, setStates] = useState<any[]>([]); // State to manage states
    const [cities, setCities] = useState<any[]>([]); // State to manage cities
    const [districts, setDistricts] = useState<any[]>([]); // State to manage districts
    const [showConfirm, setShowConfirm] = useState(false); // State to manage confirmation dialog visibility
    const [selectId, setSelectId] = useState<any | null>(null); // State to manage selected ID for deletion
    const [deleteType, setDeleteType] = useState<"paymentMethod" | "orderType" | "cities" | "districts" | null>(null); // State to manage deletion type

    // Function to render the cell content based on the column ID
    const columns = [
        { id: "role", name: "الدور" },
        { id: "title", name: "العنوان" },
        { id: "support_phone", name: "هاتف الدعم" },
        { id: "support_email", name: "بريد الدعم" },
        { id: "description", name: "الوصف (جزء منه)" },
        { id: "privacy_policy", name: "سياسة الخصوصية (جزء)" },
        { id: "terms_of_use", name: "شروط الاستخدام (جزء)" },
        { id: "content", name: "المحتوى (جزء)" },
        { id: "about", name: "حول (جزء)" },
        { id: "actions", name: "الإجراءات" },
    ];

    // Function to render the cell content based on the column ID
    const renderCell = (setting: Setting, columnId: string) => {
        switch (columnId) {
            case "description":
            case "privacy_policy":
            case "terms_of_use":
            case "content":
            case "about":
                return truncateText((setting as any)[columnId]);

            default:
                return (setting as any)[columnId];
        }
    };

    // State to manage toast notifications
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "warning" | "info" } | null>(null);

    // Mutation to delete a payment method
    const [deletePaymentMethod] = useMutation(DELETE_PAYMENT_METHOD);
    // Mutation to delete an order type
    const [deleteOrderType] = useMutation(DELETE_ORDER_TYPE);
    // Mutation to delete a city
    const [deleteCity] = useMutation(DELETE_CITY);
    // Mutation to delete a district
    const [deleteDistrict] = useMutation(DELETE_DISTRICT);

    // Fetch payment methods, order types, settings, and states using Apollo Client
    const { data: generalData, loading: generalLoading, error: generalError, } = useQuery<PaymentMethodsQueryResponse>(PAYMENT_SETTINGS_STATES_QUERY, {
        fetchPolicy: "network-only",
    });

    // Lazy queries to fetch cities and districts based on selected state and city
    const [loadCities, { data: citiesData, loading: citiesLoading }] = useLazyQuery(GET_CITIES_BY_STATE);
    // Lazy query to fetch districts based on selected city
    const [loadDistricts, { data: districtsData, loading: districtsLoading }] = useLazyQuery(GET_DISTRICTS_BY_CITY);

    // State to manage selected state and city
    const [selectedState, setSelectedState] = useState<string>("");
    // State to manage selected city
    const [selectedCity, setSelectedCity] = useState<string>("");

    // Effect to reset selected city when state changes
    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedState(val);
        setSelectedCity("");
        if (val) { loadCities({ variables: { state_code: val } }); }
    };

    // Effect to handle deletion of payment method
    const handleDelete = async (id: any) => {

        if (deleteType === "paymentMethod") {
            try {
                const { data } = await deletePaymentMethod({ variables: { id } });
                if (data?.deletePaymentMethod) {
                    setToast({ message: data.deletePaymentMethod.message, type: "success" });
                    // Remove the deleted payment method from the state
                    setPaymentMethods((prev) => prev.filter((method) => method.id !== id));
                    setSelectId(null); // Reset selected ID
                    setShowConfirm(false);
                }
            } catch (err: any) {
                const validTypes: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info"];
                const toastType = validTypes.includes(err.extensions?.code as any) ? (err.extensions?.code as "success" | "danger" | "warning" | "info") : "danger";
                setToast({ message: err.message, type: toastType });
            }
        } else if (deleteType === "orderType") {
            try {
                const { data } = await deleteOrderType({ variables: { id } });
                if (data?.deleteOrderType) {
                    setToast({ message: data.deleteOrderType.message, type: "success" });
                    // Remove the deleted order type from the state
                    setOrderTypes((prev) => prev.filter((type) => type.id !== id));
                    setSelectId(null); // Reset selected ID
                    setShowConfirm(false);
                }
            } catch (err: any) {
                const validTypes: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info"];
                const toastType = validTypes.includes(err.extensions?.code as any) ? (err.extensions?.code as "success" | "danger" | "warning" | "info") : "danger";
                setToast({ message: err.message, type: toastType });
            }
        } else if (deleteType === "cities") {
            try {
                const { data } = await deleteCity({ variables: { city_code: id } });
                if (data?.deleteCity) {
                    setToast({ message: data.deleteCity.message, type: "success" });
                    // Remove the deleted city from the state
                    setCities((prev) => prev.filter((city) => city.city_code !== id));
                    setSelectId(null); // Reset selected ID
                    setShowConfirm(false);
                }
            } catch (err: any) {
                const validTypes: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info"];
                const toastType = validTypes.includes(err.extensions?.code as any) ? (err.extensions?.code as "success" | "danger" | "warning" | "info") : "danger";
                setToast({ message: err.message, type: toastType });
            }
        } else if (deleteType === "districts") {
            try {
                const { data } = await deleteDistrict({ variables: { district_id: id } });
                if (data?.deleteDistrict) {
                    setToast({ message: data.deleteDistrict.message, type: "success" });
                    // Remove the deleted district from the state
                    setDistricts((prev) => prev.filter((district) => district.district_id !== id));
                    setSelectId(null); // Reset selected ID
                    setShowConfirm(false);
                }
            } catch (err: any) {
                const validTypes: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info"];
                const toastType = validTypes.includes(err.extensions?.code as any) ? (err.extensions?.code as "success" | "danger" | "warning" | "info") : "danger";
                setToast({ message: err.message, type: toastType });
            }
        }
    };

    // Effect to reset selected city when state changes
    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedCity(val);
        if (val) { loadDistricts({ variables: { city_code: val } }); }
    };

    // Effect to set the fetched data into state variables
    useEffect(() => {
        setPaymentMethods(generalData?.paymentMethods || []); // Payment Methods
        setOrderTypes(generalData?.orderTypes || []); // Order Types
        setSettings(generalData?.settings || []); // Settings
        setStates(generalData?.states || []); // States

        if (generalError) {
            generalError.graphQLErrors.forEach((err) => {
                const validTypes: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info"];
                const toastType = validTypes.includes(err.extensions?.code as any) ? (err.extensions?.code as "success" | "danger" | "warning" | "info") : "danger";
                setToast({ message: err.message, type: toastType });
            });
        }
    }, [generalData, generalLoading, generalError]);

    // Effect to set the fetched cities and districts into state variables
    useEffect(() => {
        if (citiesData) {
            setCities(citiesData?.cities); // Cities
        }
        if (districtsData) {
            setDistricts(districtsData?.districts); // Districts
        }
    }, [citiesData, citiesLoading, districtsData, districtsLoading]);

    function handleMainTabChange(tabId: string) {
        // Set the active main tab based on the clicked tab
        setActiveMainTab(tabId);
    }

    return (
        <>
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-700 mb-2">الاعدادات</h3>
            </div>

            {/* Breadcrumb Navigation */}
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:text-second">
                            لوحة التحكم
                        </Link>
                    </li>
                    <li aria-current="page">
                        <div className="flex items-center">
                            <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                            <span className="text-sm font-medium text-gray-700">
                                الاعدادات
                            </span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* Main Tabs Navigation */}
            <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-300 mb-4">
                <ul className="flex flex-wrap -mb-px">
                    {mainTabs.map((tab) => (
                        <li key={tab.id} className="me-2">
                            <button onClick={() => handleMainTabChange(tab.id)} className={`inline-block px-4 py-2 border-b-2 rounded-t-lg font-bold transition-colors duration-300 ${activeMainTab === tab.id ? "bg-primary border-primary text-white" : "border-transparent hover:text-primary hover:border-gray-300"}`}>
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>


            {/* Main Content Area */}
            {activeMainTab === "paymentMethods" && (
                <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="text-xl font-bold text-gray-700">طرق الدفع</h5>
                        <Link href="/dashboard/settings/create/payment-methods" className="px-3 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md">
                            <i className="fas fa-plus"></i> إضافة طريقة دفع
                        </Link>
                    </div>
                    <div className="relative overflow-x-auto rounded-lg">
                        {generalLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                                <div className="loader"></div>
                            </div>
                        )}
                        <table className="min-w-full whitespace-nowrap border-collapse border border-slate-100 rounded-md text-right text-sm text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-second">
                                <tr>
                                    <th className="py-2 px-3 border border-slate-200">الاسم</th>
                                    <th className="py-2 px-3 border border-slate-200">الوصف</th>
                                    <th className="py-2 px-3 border border-slate-200">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-medium">
                                {paymentMethods.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-2 text-gray-500">
                                            لا توجد طرق دفع
                                        </td>
                                    </tr>
                                ) : (
                                    paymentMethods.map((method: any) => (
                                        <tr key={method.id} className="border-b odd:bg-white even:bg-gray-50">
                                            <td className="py-2 px-2 border border-slate-200">
                                                {method.method_name}
                                            </td>
                                            <td className="py-2 px-2 border border-slate-200">
                                                {method.description}
                                            </td>
                                            <td className="py-2 px-2 border border-slate-200">
                                                <button className="px-3 py-1 text-xs font-medium text-center text-white bg-red-600 hover:bg-red-700 rounded-md" onClick={() => { setSelectId(method.id); setDeleteType("paymentMethod"); setShowConfirm(true); }}>
                                                    حذف
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeMainTab === "orderTypes" && (
                <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="text-xl font-bold text-gray-700">أنواع الطلبات</h5>
                        <Link href="/dashboard/settings/create/order-types" className="px-3 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md" >
                            <i className="fas fa-plus"></i> إضافة نوع طلب
                        </Link>
                    </div>
                    <div className="relative overflow-x-auto rounded-lg">
                        {generalLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                                <div className="loader"></div>
                            </div>
                        )}
                        <table className="min-w-full whitespace-nowrap border-collapse border border-slate-100 rounded-md text-right text-sm text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-second">
                                <tr>
                                    <th className="py-2 px-3 border border-slate-200">الاسم</th>
                                    <th className="py-2 px-3 border border-slate-200">الوصف</th>
                                    <th className="py-2 px-3 border border-slate-200">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-medium">
                                {orderTypes.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-2 text-gray-500">
                                            لا توجد أنواع طلبات
                                        </td>
                                    </tr>
                                ) : (
                                    orderTypes.map((type: any) => (
                                        <tr key={type.id} className="border-b odd:bg-white even:bg-gray-50">
                                            <td className="py-2 px-2 border border-slate-200">
                                                {type.type_name}
                                            </td>
                                            <td className="py-2 px-2 border border-slate-200">
                                                {type.description}
                                            </td>
                                            <td className="py-2 px-2 border border-slate-200">
                                                <button className="px-3 py-1 text-xs font-medium text-center text-white bg-red-600 hover:bg-red-700 rounded-md" onClick={() => { setSelectId(type.id); setDeleteType("orderType"); setShowConfirm(true); }}>
                                                    حذف
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeMainTab === "settings" && (
                <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="text-xl font-bold text-gray-700">
                            جدول الإعدادات
                        </h5>
                        {settings && (<span className="text-md text-gray-700"> المجموع ({settings.length}) </span>)}
                    </div>

                    <div className="relative overflow-x-auto rounded-lg">
                        {generalLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                                <div className="loader"></div>
                            </div>
                        )}
                        <table className="min-w-full whitespace-nowrap border-collapse border border-slate-100 rounded-md text-right text-sm text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-second">
                                <tr>
                                    {columns.map((col) => (
                                        <th key={col.id} scope="col" className="py-2 px-3 border border-slate-200" >
                                            {col.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-medium">
                                {(!settings || settings.length === 0) ? (
                                    <tr>
                                        <td colSpan={columns.length} className="text-center py-2 text-gray-500">
                                            لا توجد بيانات
                                        </td>
                                    </tr>
                                ) : (
                                    settings.map((setting) => (
                                        <tr key={setting.id} className="border-b odd:bg-white even:bg-gray-50" >
                                            {columns.map((col) => {
                                                if (col.id === "actions") {
                                                    return (
                                                        <td key={`${setting.id}-${col.id}`} className="py-2 px-2 border border-slate-200" >
                                                            <Link href={`/dashboard/settings/update/${setting.id}`}
                                                                className="px-2 py-1 text-xs font-medium text-center text-white bg-blue-500 hover:bg-blue-700 rounded-md" >
                                                                تعديل
                                                            </Link>
                                                        </td>
                                                    );
                                                }
                                                return (
                                                    <td key={`${setting.id}-${col.id}`} className="py-2 px-2 border border-slate-200" >
                                                        {renderCell(setting, col.id)}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeMainTab === "states" && (
                <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="text-xl font-bold text-gray-700">المحافظات</h5>
                        {states && (<span className="text-md text-gray-700"> المجموع ({states.length}) </span>)}
                    </div>
                    <div className="relative overflow-x-auto rounded-lg">
                        {generalLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                                <div className="loader"></div>
                            </div>
                        )}
                        <table className="min-w-full whitespace-nowrap border-collapse border border-slate-100 rounded-md text-right text-sm text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-second">
                                <tr>
                                    <th className="py-2 px-3 border border-slate-200">الكود</th>
                                    <th className="py-2 px-3 border border-slate-200">الاسم</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-medium">
                                {states.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="text-center py-2 text-gray-500">
                                            لا توجد محافظات
                                        </td>
                                    </tr>
                                ) : (
                                    states.map((st: any) => (
                                        <tr key={st.state_code} className="border-b odd:bg-white even:bg-gray-50" >
                                            <td className="py-2 px-2 border border-slate-200">
                                                {st.state_code}
                                            </td>
                                            <td className="py-2 px-2 border border-slate-200">
                                                {st.state_name}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeMainTab === "cities" && (
                <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
                    <div className="flex items-center justify-between mb-3">
                        <h5 className="text-xl font-bold text-gray-700">المدن</h5>
                        <Link href="/dashboard/settings/create/cities" className="px-3 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md">
                            <i className="fas fa-plus"></i> إضافة مدينة
                        </Link>
                    </div>
                    <div className="mb-3 flex items-center space-x-2 rtl:space-x-reverse">
                        <label htmlFor="stateSelect" className="text-gray-700 font-medium">
                            المحافظة:
                        </label>
                        <select id="stateSelect" className="py-1 border border-gray-300 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-right mx-2" value={selectedState} onChange={handleStateChange} >
                            <option value="">اختر المحافظة</option>
                            {states.map((st: any) => (
                                <option key={st.state_code} value={st.state_code}>
                                    {st.state_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="relative overflow-x-auto rounded-lg">
                        {citiesLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                                <div className="loader"></div>
                            </div>
                        )}
                        <table className="min-w-full whitespace-nowrap border-collapse border border-slate-100 rounded-md text-right text-sm text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-second">
                                <tr>
                                    <th className="py-2 px-3 border border-slate-200">الكود</th>
                                    <th className="py-2 px-3 border border-slate-200">الاسم</th>
                                    <th className="py-2 px-3 border border-slate-200">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-medium">
                                {cities && cities.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-2 text-gray-500">
                                            لا توجد مدن
                                        </td>
                                    </tr>
                                ) : (
                                    (cities).map((ct: any) => (
                                        <tr key={ct.city_code} className="border-b odd:bg-white even:bg-gray-50" >
                                            <td className="py-2 px-2 border border-slate-200">
                                                {ct.city_code}
                                            </td>
                                            <td className="py-2 px-2 border border-slate-200">
                                                {ct.city_name}
                                            </td>
                                            <td className="py-2 px-2 border border-slate-200">
                                                <button className="px-3 py-1 text-xs font-medium text-center text-white bg-red-600 hover:bg-red-700 rounded-md" onClick={() => { setSelectId(ct.city_code); setDeleteType("cities"); setShowConfirm(true); }}>
                                                    حذف
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeMainTab === "districts" && (
                <div className="p-4 bg-white shadow-sm rounded-lg mt-5">

                    <div className="flex items-center justify-between mb-3">
                        <h5 className="text-xl font-bold text-gray-700">الأحياء</h5>
                        <Link href="/dashboard/settings/create/districts" className="px-3 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md">
                            <i className="fas fa-plus"></i> إضافة حي
                        </Link>
                    </div>

                    <div className="flex flex-nowrap space-x-2 rtl:space-x-reverse">
                        <div className="mb-3 flex items-center space-x-2 rtl:space-x-reverse">
                            <label htmlFor="stateSelect" className="text-gray-700 font-medium text-sm">
                                المحافظة
                            </label>
                            <select id="stateSelect" className="py-1 border border-gray-300 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-right mx-2" value={selectedState} onChange={handleStateChange} >
                                <option value="">اختر المحافظة</option>
                                {states.map((st: any) => (
                                    <option key={st.state_code} value={st.state_code}>
                                        {st.state_name}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div className="mb-3 flex items-center space-x-2 rtl:space-x-reverse">
                            <label htmlFor="citySelect" className="text-gray-700 font-medium text-sm">
                                المدينة
                            </label>
                            <select id="citySelect" className="py-1 border border-gray-300 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-right mx-2" value={selectedCity} onChange={handleCityChange} disabled={!selectedState}>
                                <option value="">اختر المدينة</option>
                                {cities.map((ct: any) => (
                                    <option key={ct.city_code} value={ct.city_code}>
                                        {ct.city_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="relative overflow-x-auto rounded-lg">
                        {districtsLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                                <div className="loader"></div>
                            </div>
                        )}
                        <table className="min-w-full whitespace-nowrap border-collapse border border-slate-100 rounded-md text-right text-sm text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-second">
                                <tr>
                                    <th className="py-2 px-3 border border-slate-200">المعرف</th>
                                    <th className="py-2 px-3 border border-slate-200">الاسم</th>
                                    <th className="py-2 px-3 border border-slate-200">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-medium">
                                {districts.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-2 text-gray-500">
                                            لا توجد أحياء
                                        </td>
                                    </tr>
                                ) : (
                                    districts.map((dist: any) => (
                                        <tr key={dist.district_id} className="border-b odd:bg-white even:bg-gray-50">
                                            <td className="py-2 px-2 border border-slate-200">
                                                {dist.district_id}
                                            </td>
                                            <td className="py-2 px-2 border border-slate-200">
                                                {dist.district_name}
                                            </td>
                                            <td className="py-2 px-2 border border-slate-200">
                                                <button className="px-3 py-1 text-xs font-medium text-center text-white bg-red-600 hover:bg-red-700 rounded-md" onClick={() => { setSelectId(dist.district_id); setDeleteType("districts"); setShowConfirm(true); }}>
                                                    حذف
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Confirmation dialog for delete action */}
            {showConfirm && (<ConfirmDialog message="هل تريد حذف هذا العنصر؟ اضغط على موافق للتأكيد." onConfirm={() => { if (selectId) { handleDelete(selectId) } }} onCancel={() => setShowConfirm(false)} />)}


            {/* Toast notification for errors or success messages */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
}
