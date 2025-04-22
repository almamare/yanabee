"use client";

import React, { useState, useCallback, useEffect } from "react"; // Import React and necessary hooks
import { CATEGORIES_QUERY } from "@/graphql/queries/categories"; // Import the GraphQL query for categories
import Link from "next/link"; // Import Link component for navigation
import { useQuery, useMutation } from "@apollo/client"; // Import Apollo Client hooks for GraphQL queries and mutations
import { debounce } from "lodash"; // Import debounce function from lodash for debouncing input
import Toast from "@/components/Toast"; // Import Toast component for displaying notifications
import { CategoriesResponse, Category } from "@/graphql/types/categories"; // Import TypeScript types for categories response
import ConfirmDialog from "@/components/ConfirmDialog"; // Import ConfirmDialog component for confirmation dialogs
import { DELETE_CATEGORY } from "@/graphql/mutations/categories"; // Import the GraphQL mutation for deleting a category
 

// Define a mapping for the category types to their labels in Arabic
const tabMap: Record<string, string> = { main: "رئيسي", sub: "فرعي" };
// Define the tabs for the UI
const tabs = [{ id: "main", label: "رئيسي" }, { id: "sub", label: "فرعي" }];

export default function CategoriesPage() {
    // State variables for managing the active tab, search term, pagination, and categories data
    const [activeTab, setActiveTab] = useState<keyof typeof tabMap>("main");

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);

    const [categories, setCategories] = useState<Category[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);

    // Define the state variable for the confirmation dialog
    const [showConfirm, setShowConfirm] = useState(false);

    // Define the state variable for the selected tutorial ID
    const [selectId, setSelectId] = useState<string | null>(null);

    // State variable for managing toast notifications
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "warning" | "info"; } | null>(null);

    // Mutation for deleting a category
    const [deleteCategory] = useMutation(DELETE_CATEGORY)

    const columns = [
        { id: "name", name: "الاسم" },
        { id: "description", name: "الوصف" },
        { id: "category_type", name: "نوع الفئة" },
        { id: "img", name: "الصورة" },
        { id: "created_at", name: "تاريخ الإنشاء" },
        { id: "updated_at", name: "تاريخ التعديل" },
        { id: "actions", name: "الإجراءات" },
    ];

    // Apollo Client query to fetch categories data based on the active tab, search term, and pagination
    const { data, loading: queryLoading, error } = useQuery<CategoriesResponse>(CATEGORIES_QUERY,
        {
            variables: {
                category_type: tabMap[activeTab],
                search: searchTerm || null,
                page,
                limit: itemsPerPage,
            },
            fetchPolicy: "network-only",
        }
    );

    // Handle the delete category mutation
    const handleDeleteCategory = async (id: string) => {
        try {
            const { data } = await deleteCategory({
                variables: { id },
            });
            if (data.deleteCategory) {
                setToast({ message: data.deleteCategory.message , type: "success" });
                setShowConfirm(false);
                setCategories((prev) => prev.filter((category) => category.id !== id));
            }
        } catch (err: any) {
            if (err?.graphQLErrors && Array.isArray(err.graphQLErrors)) {
                err.graphQLErrors.forEach((graphqlError: any) => {
                    const validTypes: Array<"success" | "danger" | "warning" | "info"> = ["success", "danger", "warning", "info"];
                    const toastType = validTypes.includes(graphqlError.extensions?.code)
                        ? (graphqlError.extensions.code as "success" | "danger" | "warning" | "info")
                        : "danger";
                    setToast({ message: graphqlError.message, type: toastType });
                });
            } else if (err instanceof Error) {
                setToast({ message: err.message, type: "danger" });
            } else {
                setToast({ message: "An unknown error occurred", type: "danger" });
            }
        }
    }

    // Apollo Client mutation to delete a category (not used in this snippet)
    const debouncedSearch = useCallback(
        debounce((val: string) => {
            setSearchTerm(val);
            setPage(1);
        }, 400),
        []
    );

    useEffect(() => {
        if (data?.categories) {
            setCategories(data.categories.items);
            setTotalPages(data.categories.pages);
            setTotalItems(data.categories.total);
        }

        if (error) {
            error.graphQLErrors.forEach((err) => {
                setToast({ message: err.message, type: "warning" });
            });
        }
    }, [data, error]);

    // Handle tab change and reset pagination
    function handleTabChange(tabId: keyof typeof tabMap) {
        setActiveTab(tabId);
        setPage(1);
    }

    // Handle page change for pagination
    const nextPage = () => {
        if (page < totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    // Handle previous page change for pagination
    const prevPage = () => {
        if (page > 1) {
            setPage((prev) => prev - 1);
        }
    };

    return (
        <>

            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-700 mb-2">الفئات</h3>
                <Link href="/dashboard/categories/create" className="px-3 py-2 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md">
                    <i className="fas fa-plus"></i> إضافة فئة
                </Link>
            </div>

            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:text-second" >
                            لوحة التحكم
                        </Link>
                    </li>
                    <li aria-current="page">
                        <div className="flex items-center">
                            <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                            <span className="text-sm font-medium text-gray-700">الفئات</span>
                        </div>
                    </li>
                </ol>
            </nav>

            <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-300">
                <ul className="flex flex-wrap -mb-px">
                    {tabs.map((tab) => (
                        <li key={tab.id} className="me-2">
                            <button onClick={() => handleTabChange(tab.id as keyof typeof tabMap)}
                                className={`inline-block px-4 py-2 border-b-2 rounded-t-lg font-bold transition-colors duration-300 ${activeTab === tab.id ? "bg-primary border-primary text-white" : "border-transparent hover:text-primary hover:border-gray-300"}`} aria-current={activeTab === tab.id ? "page" : undefined} >
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="p-4 bg-white shadow-sm rounded-lg mt-5">
                <div className="flex items-center justify-between">
                    <h5 className="text-xl font-bold text-gray-700 mb-5">
                        نوع الفئة: {tabMap[activeTab]}
                    </h5>
                    <h5 className="text-xl font-bold text-gray-700 mb-5">
                        جدول الفئات
                    </h5>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <select id="entries" className="px-3 py-1 border border-gray-300 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-right mx-2"
                            value={itemsPerPage} onChange={(e) => { setPage(1); setItemsPerPage(Number(e.target.value)); }} >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                        <label htmlFor="entries" className="text-sm font-medium text-gray-700" >
                            العرض
                        </label>
                    </div>

                    <div className="flex items-center space-x-3">
                        <label htmlFor="search" className="text-sm font-medium text-gray-700 mx-2" >
                            البحث
                        </label>
                        <input id="search" type="text" placeholder="ابحث عن فئة..." onChange={(e) => debouncedSearch(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1" />
                    </div>
                </div>

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
                                    <th key={column.id} scope="col" className="py-2 px-3 border border-slate-200" >
                                        {column.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-medium">
                            {error || categories.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-2 text-gray-500" >
                                        لا توجد بيانات
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.id} className="border-b odd:bg-white even:bg-gray-50" >
                                        <td className="py-2 px-2 border border-slate-200">
                                            {category.name}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {category.description}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {category.category_type}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {category.img ? (
                                                <img src={category.img} alt={`صورة ${category.name}`} className="w-8 h-8 object-cover rounded-md" />
                                            ) : (
                                                "لا توجد صورة"
                                            )}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(category.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            {new Date(category.updated_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-2 border border-slate-200">
                                            <Link href={`/dashboard/categories/update/${category.id}`} className="px-2 py-1 text-xs ml-2 font-medium text-center text-white bg-blue-600 hover:bg-blue-700 rounded-md" >
                                                تعديل
                                            </Link>
                                            <button className="px-3 py-1 text-xs font-medium text-center text-white bg-red-600 hover:bg-red-700 rounded-md" onClick={() => { setSelectId(category.id); setShowConfirm(true); }}>
                                                حذف
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="py-3 flex items-center justify-between">
                    <span>
                        <button onClick={prevPage} disabled={page <= 1} className="text-white bg-primary hover:bg-primary disabled:bg-gray-400 px-4 py-1 rounded-md" >
                            <i className="fas fa-angle-right"></i> السابق
                        </button>
                        <span className="mx-3">
                            {page} / {totalPages}
                        </span>
                        <button onClick={nextPage} disabled={page >= totalPages} className="text-white bg-primary hover:bg-primary disabled:bg-gray-400 px-4 py-1 rounded-md" >
                            التالي <i className="fas fa-angle-left"></i>
                        </button>
                    </span>
                    <span>المجموع ( {totalItems} )</span>
                </div>
            </div>


            {/* Confirmation dialog for delete action */}
            {showConfirm && (<ConfirmDialog message="هل تريد حذف هذا العنصر؟ اضغط على موافق للتأكيد." onConfirm={() => { if (selectId) { handleDeleteCategory(selectId) } }} onCancel={() => setShowConfirm(false)} />)}

            {/* Toast notification for success or error messages */}
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </>
    );
}
