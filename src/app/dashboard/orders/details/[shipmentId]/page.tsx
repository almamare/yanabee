'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useEffect, useState, ChangeEvent } from 'react';
import Image from 'next/image';

import {
    Shipment,
    Customer,
    OrderItem,
    Invoice,
    Tracking,
    Address,
    ShipmentResponse,
} from '@/graphql/types/shipmentTypes';

// استيراد الاستعلام الخاص بالشحنة
import { SHIPMENT_QUERY } from '@/graphql/queries/queries';

// خريطة أيقونات التتبع بناءً على حالة التتبع
const trackingStatusMap: Record<string, string> = {
    'فرع المرسل': '01',
    'في النقل': '02',
    'فرع التسليم': '03',
    'مع المندوب': '04',
    'تم التسليم': '05',
    'تم الاعادة': '06',
};

// دوال مساعدة لاسترجاع تنسيقات الألوان بناءً على الحالة
function getOrderStatusClasses(status?: string) {
    switch (status) {
        case 'قيد الانتظار':
            return 'bg-yellow-50 text-yellow-600';
        case 'مؤكد':
            return 'bg-green-50 text-green-600';
        case 'غير مؤكد':
            return 'bg-red-50 text-red-600';
        case 'تم التنفيذ':
            return 'bg-teal-50 text-teal-600';
        case 'قيد التوصيل':
            return 'bg-blue-50 text-blue-600';
        case 'مرتجعة':
        case 'قيد الارجاع':
            return 'bg-orange-50 text-orange-600';
        case 'مكتملة':
        case 'مستلم جزئيا':
            return 'bg-green-50 text-green-600';
        case 'ملغاة':
            return 'bg-red-50 text-red-600';
        default:
            return 'bg-gray-50 text-gray-600';
    }
}

// بطاقة عرض العنوان
function AddressCard({ title, address }: { title: string; address: Address }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-primary">{title}</h4>
                {/* زر تعديل العنوان (يمكن ربطه بفتح مودال أو نموذج مصغر للتعديل) */}
                <button
                    onClick={() => alert(`تعديل العنوان: ${title}`)}
                    className="text-sm text-blue-600 hover:underline"
                >
                    تعديل العنوان
                </button>
            </div>
            <ul role="list" className="divide-y divide-gray-200 bg-gray-50 rounded-md">
                <li className="py-2 px-3">
                    <div className="flex items-center">
                        <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                            الاسم
                        </p>
                        <div className="inline-flex items-center text-base font-semibold text-gray-900">
                            {address?.name || 'لا يوجد'}
                        </div>
                    </div>
                </li>
                <li className="py-2 px-3">
                    <div className="flex items-center">
                        <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                            الهاتف
                        </p>
                        <div className="inline-flex items-center text-base font-semibold text-gray-900">
                            {address?.phone || 'لا يوجد'}
                        </div>
                    </div>
                </li>
                <li className="py-2 px-3">
                    <div className="flex items-center">
                        <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                            المحافظة
                        </p>
                        <div className="inline-flex items-center text-base font-semibold text-gray-900">
                            {address?.state || 'لا يوجد'}
                        </div>
                    </div>
                </li>
                <li className="py-2 px-3">
                    <div className="flex items-center">
                        <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                            المدينة
                        </p>
                        <div className="inline-flex items-center text-base font-semibold text-gray-900">
                            {address?.city || 'لا يوجد'}
                        </div>
                    </div>
                </li>
                <li className="py-2 px-3">
                    <div className="flex items-center">
                        <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                            المنطقة
                        </p>
                        <div className="inline-flex items-center text-base font-semibold text-gray-900">
                            {address?.district || 'لا يوجد'}
                        </div>
                    </div>
                </li>
                <li className="py-2 px-3">
                    <div className="flex items-center">
                        <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                            العنوان
                        </p>
                        <div className="inline-flex items-center text-base font-semibold text-gray-900">
                            {address?.address || 'لا يوجد'}
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    );
}

export default function ShipmentDetailsPage() {
    const { shipmentId } = useParams();

    // حالات للبيانات القادمة من السيرفر
    const [shipment, setShipment] = useState<Shipment | null>(null);
    const [customers, setCustomers] = useState<Customer | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [invoices, setInvoices] = useState<Invoice | null>(null);
    const [tracking, setTracking] = useState<Tracking[]>([]);

    // حالتان للتحكم في رفع الملفات
    const [labelFile, setLabelFile] = useState<File | null>(null);
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

    // تنفيذ الاستعلام GraphQL
    const { data, loading, error } = useQuery<{ shipment: ShipmentResponse }>(
        SHIPMENT_QUERY,
        {
            variables: { shipment_id: shipmentId },
            fetchPolicy: 'network-only',
        }
    );

    // عند وصول البيانات
    useEffect(() => {
        if (data?.shipment?.order) {
            const orderData = data.shipment.order;
            setShipment(orderData.shipment || null);
            setCustomers(orderData.customers || null);
            setItems(orderData.items || []);
            setInvoices(orderData.invoices || null);
            setTracking(orderData.tracking || []);
        }
    }, [data]);

    // -------------------- Dummy Functions للأزرار الجديدة --------------------
    const handleEditShipment = () => {
        alert('تعديل الشحنة (يمكن فتح مودال أو صفحة تعديل خاصة)');
    };

    const handleChangeStatus = () => {
        alert('تغيير حالة الشحنة (يمكن فتح مودال اختيار الحالة الجديدة)');
    };

    // -------------------- واجهة التحميل (Skeleton) --------------------
    if (loading) {
        return (
            <div className="container mx-auto px-4 my-6 animate-pulse">
                {/* مثال على الـ Skeleton */}
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="flex space-x-2 rtl:space-x-reverse mb-6">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-white rounded-lg shadow-sm space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    </div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm mt-6">
                    <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/5"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------- حالة الخطأ --------------------
    if (error) {
        return (
            <div className="container mx-auto px-4 my-6">
                <p className="text-red-600 font-semibold">حدث خطأ: {error.message}</p>
            </div>
        );
    }

    // -------------------- في حال عدم وجود بيانات --------------------
    if (!shipment) {
        return (
            <div className="container mx-auto px-4 my-6">
                <p className="text-gray-600">لا توجد بيانات للشحنة المطلوبة</p>
            </div>
        );
    }

    // -------------------- عرض بيانات الشحنة --------------------
    const statusClasses = getOrderStatusClasses(shipment.status);
    const publicTracking = tracking.filter((track) => track.tracking_type === 'عام');
    const privateTracking = tracking.filter((track) => track.tracking_type === 'خاص');

    return (
        <div className="mx-auto px-4 my-4">
            {/* -------------------- عنوان الصفحة والأزرار الجديدة -------------------- */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-700">
                    تفاصيل الطلب
                </h3>
            </div>

            {/* -------------------- Breadcrumb -------------------- */}
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:text-second" >
                            لوحة التحكم
                        </Link>
                    </li>
                    <svg className="rtl:rotate-180 w-3 h-3 text-gray-700 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                    </svg>
                    <li>
                        <Link href="/dashboard/orders" className="inline-flex items-center text-sm font-medium text-primary hover:text-second">
                            الطلبات
                        </Link>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <svg className="rtl:rotate-180 w-3 h-3 text-gray-700 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                            </svg>
                            <span className="text-sm font-medium text-gray-700">
                                تفاصيل الطلب
                            </span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* -------------------- محتوى الصفحة الرئيسي -------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* القسم الأيسر (معلومات الشحنة، الفروع، العملاء، المنتجات) */}
                <div className="lg:col-span-3 space-y-4">
                    {/* بطاقة معلومات الشحنة + معلومات الفاتورة */}
                    <div className="p-4 bg-white shadow-sm rounded-lg">
                        <h4 className="text-xl font-bold text-primary mb-4">معلومات الشحنة</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                            <div className="flow-root">
                                <ul role="list" className="divide-y divide-gray-200">
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                الحالة
                                            </p>
                                            <div className={`inline-flex items-center text-base font-semibold rounded-md px-2 ${statusClasses}`}>
                                                {shipment?.status}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                رقم الطلب
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {shipment?.order_no}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                رقم التتبع
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {shipment?.tracking_no}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                أنشئ بواسطة
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {shipment?.created_by}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                نوع الشحن
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {shipment?.shipment_type}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                نوع الطلب
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {shipment?.order_type}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                المبلغ المستحق
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-primary">
                                                {shipment?.amount}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                تاريخ الإنشاء
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {shipment?.created_at}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                تاريخ التحديث
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {shipment?.updated_at}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                تاريخ التسليم
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {shipment?.delivered_date}
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="flow-root">
                                <ul role="list" className="divide-y divide-gray-200">
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                رقم الفاتورة
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {invoices?.invoice_no}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                طريقة الدفع
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {invoices?.payment_method}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                العملة
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {invoices?.currency}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                المبلغ
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-primary">
                                                {invoices?.amount}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                سعر الشحن
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-primary">
                                                {invoices?.shipping_price}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                الإجمالي
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-primary">
                                                {invoices?.total}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                حالة الفاتورة
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {invoices?.status}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                مُستلم بواسطة
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {invoices?.received_by}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                تاريخ الإنشاء
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {invoices?.created_at}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-sm font-medium text-gray-900 truncate">
                                                تاريخ التحديث
                                            </p>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                                {invoices?.updated_at}
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white shadow-sm rounded-lg">
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {/* زر تعديل الشحنة */}
                            <button onClick={handleEditShipment} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
                                تعديل الشحنة
                            </button>
                            {/* زر تغيير الحالة */}
                            <button onClick={handleChangeStatus} className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm">
                                تغيير الحالة
                            </button>
                        </div>
                    </div>



                    {/* بطاقة عناوين الفروع (المرسل والمستلم) */}
                    <div className="p-4 bg-white shadow-sm rounded-lg">
                        <div className="md:flex md:space-x-8 rtl:space-x-reverse">
                            <div className="md:flex-1">
                                <AddressCard title="فرع المرسل" address={shipment.branches.sender} />
                            </div>
                            <div className="md:flex-1">
                                <AddressCard
                                    title="فرع المستلم"
                                    address={shipment.branches.received}
                                />
                            </div>
                        </div>
                    </div>

                    {/* بطاقة عناوين العملاء (المرسل والمستلم) */}
                    {customers && (
                        <div className="p-4 bg-white shadow-sm rounded-lg">
                            <div className="md:flex md:space-x-8 rtl:space-x-reverse">
                                <div className="md:flex-1">
                                    <AddressCard title="مرسل الطلب" address={customers.sender} />
                                </div>
                                <div className="md:flex-1">
                                    <AddressCard title="مستلم الطلب" address={customers.received} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* المنتجات (إن وجدت) */}
                    {items.length > 0 && (
                        <div className="p-4 bg-white shadow-sm rounded-lg">
                            <h4 className="text-xl font-bold text-primary mb-4">المنتجات</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-700">
                                    <thead className="text-xs uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-2">
                                                #
                                            </th>
                                            <th scope="col" className="px-4 py-2">
                                                الاسم
                                            </th>
                                            <th scope="col" className="px-4 py-2">
                                                السعر
                                            </th>
                                            <th scope="col" className="px-4 py-2">
                                                الكمية
                                            </th>
                                            <th scope="col" className="px-4 py-2">
                                                المجموع
                                            </th>
                                            <th scope="col" className="px-4 py-2">
                                                الحالة
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="border-b last:border-b-0 hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-2">{index + 1}</td>
                                                <td className="px-4 py-2">{item.name}</td>
                                                <td className="px-4 py-2 text-primary font-semibold">
                                                    {item.price}
                                                </td>
                                                <td className="px-4 py-2">{item.quantity}</td>
                                                <td className="px-4 py-2 text-primary font-semibold">
                                                    {item.amount}
                                                </td>
                                                <td className="px-4 py-2">{item.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* القسم الأيمن (تتبع الشحنة) */}
                <div className="p-4 md:p-6 bg-white shadow-sm rounded-lg mt-4 lg:mt-0">
                    <div className="flex items-center justify-between mb-5">
                        <h4 className="text-lg font-bold leading-none text-primary">تتبع الطلب الأساسي</h4>
                    </div>
                    {publicTracking.length === 0 ? (
                        <p className="text-md text-center text-gray-600">لا يوجد بيانات تتبع</p>
                    ) : (
                        <ol className="relative border-s border-gray-300 ms-4 md:ms-8">
                            {publicTracking.map((track) => {
                                const statusIcon = trackingStatusMap[track.status] ?? '01';
                                return (
                                    <li className="mb-8 ms-8" key={track.id}>
                                        <span className="absolute flex items-center justify-center w-10 h-10 bg-primary rounded-full -start-5 ring-2 ring-white">
                                            <Image
                                                src={`https://cdn.yanabie.com/assets/images/tracking/${statusIcon}.svg`}
                                                alt={`Tracking status: ${track.status}`}
                                                width={20}
                                                height={20}
                                            />
                                        </span>
                                        <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 pt-1">
                                            {track.status}
                                            <span className="bg-light text-second text-sm font-medium me-2 px-2 py-0.5 rounded-md ms-3">
                                                {track.updated_at}
                                            </span>
                                        </h3>
                                        <p className="block text-sm font-normal leading-none text-gray-400">
                                            {track.location} - {track.tracking} - {track.updated_by}
                                        </p>
                                        {track.note && (
                                            <p className="mb-4 text-base font-normal text-gray-500">
                                                {track.note}
                                            </p>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                    <div className="flex items-center justify-between mb-5">
                        <h4 className="text-lg font-bold leading-none text-primary">تتبع الطلب المخصص</h4>
                    </div>
                    {privateTracking.length === 0 ? (
                        <p className="text-md text-center text-gray-600">لا يوجد بيانات تتبع</p>
                    ) : (
                        <ol className="relative border-s border-gray-300 ms-4 md:ms-8">
                            {privateTracking.map((track, index) => {
                                return (
                                    <li className="mb-8 ms-8" key={track.id}>
                                        <span className="absolute flex items-center justify-center w-10 h-10 bg-primary rounded-full -start-5 ring-2 ring-white text-white text-lg font-semibold">
                                            {index + 1}
                                        </span>
                                        <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 pt-1">
                                            {track.status}
                                            <span className="bg-light text-second text-sm font-medium me-2 px-2 py-0.5 rounded-md ms-3">
                                                {track.updated_at}
                                            </span>
                                        </h3>
                                        <p className="block text-sm font-normal leading-none text-gray-400">
                                            {track.location} - <span className="bg-blue-100 text-blue-800 px-2 rounded-md">{track.tracking}</span> - {track.updated_by}
                                        </p>
                                        {track.note && (
                                            <p className="mb-4 text-base font-normal text-gray-500">
                                                {track.note}
                                            </p>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </div>
            </div>
        </div>
    );
}
