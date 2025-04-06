import React, { useState, useEffect } from 'react';

// RoleKeys is a union type that represents the possible roles in the system.
type RoleKeys = "" | "عميل" | "فرع" | "مندوب" | "مدير" | "زبون";

interface RoleSelectorProps {
    onChange: (value: { selectedRole: RoleKeys; selectedRoleType: string }) => void;
    initialRole?: RoleKeys;
    initialRoleType?: string;
}

// RoleSelector is a component that allows the user to select a role and a role type.
const RoleSelector = ({ onChange, initialRole = "", initialRoleType = "" }: RoleSelectorProps) => {
    const [selectedRole, setSelectedRole] = useState<RoleKeys | "">(initialRole);
    const [selectedRoleType, setSelectedRoleType] = useState(initialRoleType);

    // Define the possible role types for each role.
    const roleTypes: Record<RoleKeys, string[]> = {
        "عميل": ["عميل مستويات", "عميل عادي"],
        "فرع": ["فرع رئيسي", "فرع عادي"],
        "مندوب": ["مندوب تسليم", "مندوب نقل"],
        "مدير": ["مشرف قسم", "مدير عام"],
        "زبون": ["زبون عادي"],
        '': []
    };

    // When the selected role or role type changes, call the onChange callback.
    useEffect(() => {
        if (selectedRole && selectedRoleType) {
            onChange({ selectedRole, selectedRoleType });
        }
    }, [selectedRole, selectedRoleType]);

    // Handle the role change event. This function is called when the user selects a role.
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const role = e.target.value as RoleKeys | "";
        setSelectedRole(role);
        setSelectedRoleType(""); // Reset the role type when the role changes.
      }

    // Handle the role type change event. This function is called when the user selects a role type.
    const handleRoleTypeChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setSelectedRoleType(e.target.value);
    };

    return (
        <div>
            {/* Display a title for the role selector */}
            <h3 className="text-2xl font-bold text-primary">اختيار نوع المستخدم</h3>
            <p className="text-xs text-gray-500 mb-2">الخطوة الاولى</p>


            {/* Display a warning message */}
            <div className="grid gap-4 mb-3">
                <article className="p-4">
                    <h1 className="text-red-600 text-xl font-bold mb-2">تنبيه هام!</h1>
                    <p className="text-gray-600 text-md mb-2">
                        عند اختيارك نوع المستخدم، فإن هذا الاختيار يُعد نهائيًا ولا يمكن تغييره فيما بعد.
                        يجب عليك اختيار الفئة التي تتناسب مع المستخدم
                    </p>
                    <p className="text-gray-600 text-md mb-1">
                        <strong>ملاحظة:</strong> لا يمكن تحويل العميل إلى فرع، ولا يمكن تحويل الفرع إلى مندوب، وذلك حفاظًا على تنظيم البيانات وسلامة النظام.
                    </p>
                    <p className="text-gray-600 text-md mb-1">
                        يرجى التأكد من صحة جميع البيانات قبل المتابعة إلى الخطوة التالية. حيث أن أي خطأ في المعلومات قد يؤدي إلى رفض التسجيل
                    </p>
                </article>
            </div>

            {/* Display the role selector */}
            <div className="flex flex-row mb-6 items-end space-x-4">
                <div className="mb-4 mx-4">
                    <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900">
                        اختيار دور الحساب <span className="text-red-600">*</span>
                    </label>
                    <select id="role" value={selectedRole} onChange={handleRoleChange}
                        className="px-6 py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary text-right"
                        required>
                        <option value="">أختار</option>
                        <option value="عميل">عميل</option>
                        <option value="فرع">فرع</option>
                        <option value="مندوب">مندوب</option>
                        <option value="مدير">مدير</option>
                        <option value="زبون">زبون</option>
                    </select>
                </div>

                {/* Display the role type selector */}
                {selectedRole && roleTypes[selectedRole] && (
                    <div className="mb-4">
                        <label htmlFor="roleType" className="block mb-2 text-sm font-medium text-gray-900">
                            اختيار نوع الدور <span className="text-red-600">*</span>
                        </label>
                        <select id="roleType" value={selectedRoleType} onChange={handleRoleTypeChange}
                            className="px-6 py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary text-right"
                            required>
                            <option value="">أختار</option>
                            {roleTypes[selectedRole].map((type, index) => (
                                <option key={index} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleSelector;
