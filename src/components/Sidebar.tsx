'use client';

import Link from 'next/link';

// ------------------------------------
// 1. Define types for a sidebar item
// ------------------------------------
interface SidebarItem {
  label: string;
  link: string;
  icon: string;
  badge?: number;
}

// 2. Define types for a section
interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

// 3. Define the Sidebar component props
interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {

    const auth = JSON.parse(sessionStorage.getItem('auth') || '{}');
    const admin = auth.admin;

  // ------------------------------------
  // 4. Create an array of sections
  // ------------------------------------
  const sections: SidebarSection[] = [
    {
      title: 'الرئيسية',
      items: [
        { label: 'لوحة التحكم', link: '/dashboard', icon: 'far fa-tachometer-alt-fast' },
        { label: 'الطلبات', link: '/dashboard/orders', icon: 'far fa-box-alt', badge: 5 },
        { label: 'التقارير', link: '', icon: 'far fa-chart-bar' },
        { label: 'الاستعلام', link: '#', icon: 'far fa-search' },
        { label: 'التنبيهات', link: '#', icon: 'far fa-bell' },
      ],
    },
    {
      title: 'المتابعة',
      items: [
        { label: 'تتبع الطلب', link: '#', icon: 'far fa-route' },
        { label: 'المحادثات', link: '#', icon: 'far fa-comment-alt', badge: 5 },
      ],
    },
    {
      title: 'الحسابات',
      items: [
        { label: 'المعاملات', link: '/dashboard/transactions', icon: 'far fa-exchange-alt', badge: 5 },
        { label: 'السندات', link: '#', icon: 'far fa-file-alt' },
        { label: 'الفواتير', link: '#', icon: 'far fa-file-invoice' },
        { label: 'الأيصالات', link: '#', icon: 'far fa-receipt' },
        { label: 'التسعيرات', link: '#', icon: 'far fa-money-check-edit-alt' },
        { label: 'الصناديق', link: '#', icon: 'far fa-usd-square' },
      ],
    },
    {
      title: 'الملفات التعريفية',
      items: [
        { label: 'المستخدمين', link: '/dashboard/users', icon: 'far fa-users' },
        { label: 'المنتجات', link: '/dashboard/products', icon: 'far fa-tags' },
        { label: 'الفئات', link: '/dashboard/categories', icon: 'far fa-th-large'},
      ],
    },
    {
      title: 'الأعدادات',
      items: [
        { label: 'التقييمات', link: '/dashboard/ratings', icon: 'far fa-star'},
        { label: 'العلانات', link: '/dashboard/advertisements', icon: 'far fa-ad' },
        { label: 'الاعدادات', link: '#', icon: 'far fa-cog' },
        { label: 'التعليمات', link: '#', icon: 'far fa-question-square' },
      ],
    },
  ];

  // ------------------------------------
  // 5. Render
  // ------------------------------------
  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full pt-[60px] w-64 bg-gray-800 shadow-md z-50 transform 
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
        transition-transform duration-300 ease-in-out 
        lg:translate-x-0 lg:shadow-none`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 overflow-auto flex-1">
            {/* Render each section */}
            {sections.map((section) => (
              <div key={section.title} className="mb-4">
                <h3 className="text-md text-second mb-2"><i className="fas fa-circle text-xs"></i> {section.title}</h3>
                <ul className="space-y-1">
                  {section.items.map(({ label, link, icon, badge }) => (
                    <li key={label}>
                      <Link href={link}>
                        <div className="flex items-center justify-between p-1.5 text-gray-50 rounded-lg hover:bg-gray-700">
                          <span>
                            <i className={icon}></i>
                            <span className="mx-3">{label}</span>
                          </span>
                          {badge && badge > 0 && (
                            <span className="bg-primary text-light text-sm font-bold px-2 py-0.5 rounded-full">
                              {badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer user section */}
          <div className="p-3 border-t border-gray-700">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-white">مرحباً، {admin.name} {admin.surname}</p>
                <p className="text-xs text-gray-300">{admin.code}{admin.number} - {admin.type}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
