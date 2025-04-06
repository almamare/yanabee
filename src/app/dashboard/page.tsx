'use client';

export default function DashboardPage() {


    // Dashboard content
    return (

            <div style={{ padding: '2rem' }}>
                <h1>Welcome to your Dashboard</h1>
                {/* Add your dashboard content here */}
                <p>This is where your dashboard content will go.</p>
            </div>

    );
}


// import { GET_MANAGER_QUERY } from '@/graphql/queries/queries';
// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useQuery } from '@apollo/client';

// // تعريف واجهة البيانات المستلمة من الاستعلام
// interface ManagerData {
//     manager: {
//         manager_id: number;
//         manager_no: string;
//         name: string;
//         surname: string;
//         email: string;
//         phone: string;
//         role: string;
//         status: string;
//         created_at: string;
//         updated_at: string;
//     };
// }

// interface ManagerDataVars {
//     id: number;
// }

// export default function DashboardPage() {
//     const router = useRouter();
//     const [token, setToken] = useState<string | null>(null);
//     const [sidebarOpen, setSidebarOpen] = useState(false); // حالة التحكم في ظهور القائمة الجانبية

//     const { loading, error, data } = useQuery<ManagerData, ManagerDataVars>(GET_MANAGER_QUERY, {
//         variables: { id: 1 },
//     });

//     if (loading) return <p className="text-center mt-10">جارٍ التحميل...</p>;
//     if (error) {
//         console.error('خطأ في تحميل بيانات المدير:', error);
//         return <p className="text-center mt-10 text-red-500">خطأ في تحميل بيانات المدير: {error.message}</p>;
//     }

//     if (!data || !data.manager) return <p className="text-center mt-10">لا توجد بيانات مدير متاحة</p>;

//     return (
//         <div>
//             trytryrty

//         </div>
//     );
// }

