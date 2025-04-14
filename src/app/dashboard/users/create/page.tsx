"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import RoleSelector from "@/components/users/create/RoleSelector";
import { GET_LOCATIONS } from "@/graphql/queries/queries";
import { CREATE_USER_MUTATION } from "@/graphql/mutations/userMutation";
import { LocationData, LocationVariables } from "@/graphql/types/statesType";
import { CreateUserInput, CreateUserResponse } from "@/graphql/types/UsersTypes";
import Toast from "@/components/Toast";




export default function CreatePage() {  
    // ---- State to track which step we are on ----
    const [step, setStep] = useState(1);

    // ---- Codes for state, city, and district ----
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("");

    // ---- Display names (populated in useEffect) ----
    const [selectedStateName, setSelectedStateName] = useState("");
    const [selectedCityName, setSelectedCityName] = useState("");
    const [selectedDistrictName, setSelectedDistrictName] = useState("");

    //---- Branch name (populated in useEffect) ----
    const [selectedBranchName, setSelectedBranchName] = useState("");

    // ---- GraphQL mutation for creating a user ----
    const [createUser, { loading: mutationLoading, error: mutationError }] = useMutation<CreateUserResponse, CreateUserInput>(CREATE_USER_MUTATION);



    // ---- Toast notification ----
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "danger" | "warning" | "info";
    } | null>(null);

    // ---- Form data across all steps ----
    const [formData, setFormData] = useState({
        role: "",
        type: "",
        name: "",
        surname: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        address_name: "",
        address_phone: "",
        state: "",      // store the code in formData
        city: "",       // store the code in formData
        district: "",   // store the code in formData
        address: "",
        branch_id: "",
        client_type: "",
        balance: 0,
        currency: "IQD",
        acceptTerms: false,
    });

    // ---- GraphQL query for locations ----
    const { data, loading, error, refetch } = useQuery<LocationData, LocationVariables>(
        GET_LOCATIONS,
        {
            variables: {
                stateCode: null,
                cityCode: null,
                stateName: null,
            },
        }
    );

    // ---- (1) When selectedState changes, re-fetch cities, reset city & district ----
    useEffect(() => {
        if (selectedState) {
            refetch({
                stateCode: selectedState,
                cityCode: null,
                stateName: selectedStateName, // If your query actually needs the state name
            });
        }
        // Reset local city/district
        setSelectedCity("");
        setSelectedDistrict("");
        // Also reset them in formData
        setFormData((prev) => ({
            ...prev,
            city: "",
            district: "",
        }));
    }, [selectedState, selectedStateName, refetch]);

    // ---- (2) When selectedCity changes, re-fetch districts, reset district ----
    useEffect(() => {
        if (selectedCity) {
            refetch({
                stateCode: selectedState,
                cityCode: selectedCity,
            });
        }
        setSelectedDistrict("");
        setFormData((prev) => ({
            ...prev,
            district: "",
        }));
    }, [selectedCity, selectedState, refetch]);

    // ---- (3) Update selectedStateName whenever selectedState or data changes ----
    useEffect(() => {
        if (!selectedState || !data?.states) {
            setSelectedStateName("");
            return;
        }
        const foundState = data.states.find((s) => s.state_code === formData.state);
        setSelectedStateName(foundState?.state_name || "");
    }, [selectedState, data?.states]);

    // ---- (4) Update selectedCityName whenever selectedCity or data changes ----
    useEffect(() => {
        if (!selectedCity || !data?.cities) {
            setSelectedCityName("");
            return;
        }
        const selectedCode = parseInt(selectedCity); // تحويل إلى رقم صحيح
        const foundCity = data?.cities?.find((c) => parseInt(c.city_code) === selectedCode);
        setSelectedCityName(foundCity?.city_name || "");

    }, [selectedCity, data?.cities]);

    useEffect(() => {
        if (!selectedBranch || !data?.branches) {
            setSelectedBranchName("");
            return;
        }
        const foundBranch = data?.branches.find(
            (b) => b.user_id === selectedBranch
        );
        setSelectedBranchName(foundBranch?.name || "");
    }, [selectedBranch, data?.branches]);
    

    // ---- (5) Update selectedDistrictName whenever selectedDistrict or data changes ----
    useEffect(() => {
        if (!selectedDistrict || !data?.districts) {
            setSelectedDistrictName("");
            return;
        }
        const selectedCode = parseInt(selectedDistrict); // تحويل إلى رقم صحيح
        const foundDistrict = data.districts.find(
            (d) => parseInt(d.district_id) === selectedCode
        );
        setSelectedDistrictName(foundDistrict?.district_name || "");
    }, [selectedDistrict, data?.districts]);

    // ---- Example: handle role selection from <RoleSelector /> ----
    const handleRoleChange = (data: any) => {
        setFormData((prev) => ({
            ...prev,
            role: data.selectedRole,
            type: data.selectedRoleType,
        }));
    };


    // Go to the next step
    const goNext = () => {

        if (step === 1) {
            if (!formData.role || !formData.type) {
                setToast({ message: "يرجى اختيار نوع الحساب", type: "danger" });
                return;
            }
        }
        if (step === 2) {
            if (!formData.name || !formData.surname || !formData.phone || !formData.email) {
                setToast({ message: "يرجى ملء جميع الحقول المطلوبة", type: "danger" });
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setToast({ message: "كلمات المرور غير متطابقة", type: "danger" });
                return;
            }
        }
        if (step === 3) {
            if (!formData.address_name || !formData.address_phone || !formData.state || !formData.city || !formData.district || !formData.address) {
                setToast({ message: "يرجى ملء جميع الحقول المطلوبة", type: "danger" });
                return;
            }
            if (formData.role === "عميل" && !formData.branch_id) {
                setToast({ message: "يرجى اختيار الفرع", type: "danger" });
                return;
            }
        }

        if (step < 5) {
            setStep(step + 1);
        }
    };

    // Go back to the previous step
    const goPrev = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    // This function updates the formData state with new values
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        // Prevent default behavior of the event
        const { name, value, type } = e.target;

        // Handle checkbox for terms
        if (type === "checkbox") {
            setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };


    // Updated handleSubmit to call the mutation
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Double-check password match
        if (formData.password !== formData.confirmPassword) {
            setToast({ message: "كلمات المرور غير متطابقة", type: "danger" });
            return;
        }

        // Prepare submission data, excluding 'acceptTerms'
        const { acceptTerms, ...submitData } = formData;

        try {
            // Call the mutation to create a user
            const result = await createUser({
                variables: {
                    ...submitData,
                    userType: submitData.type, // Map 'type' to 'userType'
                }
            });

            if (result.data?.createUser) {
                setToast({ message: result.data.createUser.message, type: "success" });
                // Optionally reset form or navigate to another page
                setFormData({
                    role: "",
                    type: "",
                    name: "",
                    surname: "",
                    phone: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    address_name: "",
                    address_phone: "",
                    state: "",
                    city: "",
                    district: "",
                    address: "",
                    branch_id: "",
                    client_type: "",
                    balance: 0,
                    currency: "IQD",
                    acceptTerms: false,
                });
                setStep(1); // Reset to step 1
            }
        } catch (err) {
            if (err instanceof Error) {
                // Handle specific error messages based on your GraphQL server response
                setToast({ message: err.message, type: "danger" });
            } else {
                // Handle unknown errors
                setToast({ message: "An unknown error occurred", type: "danger" });
            }
        }
    };

    // ---- Render the step indicator with icons ----
    const renderStepIndicator = () => {
        return (
            <ol className="flex justify-between w-full mb-5 sm:mb-5">
                {/* STEP 1 indicator */}
                <li className={`flex w-full items-center ${step > 1 ? "text-primary after:content-[''] after:w-full after:h-1 after:border-b after:border-second after:border-4 after:inline-block"
                    : "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block"}`}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${step >= 1 ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                        {/* Icon for Step 1 */}
                        <i className="far fa-user-tag text-xl"></i>
                    </div>
                </li>

                {/* STEP 2 indicator */}
                <li className={`flex w-full items-center ${step > 2 ? "text-primary after:content-[''] after:w-full after:h-1 after:border-b after:border-second after:border-4 after:inline-block"
                    : "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block"}`}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${step >= 2 ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                        {/* Icon for Step 2 */}
                        <i className="far fa-user text-xl"></i>
                    </div>
                </li>

                {/* STEP 3 indicator */}
                <li className={`flex w-full items-center ${step > 3 ? "text-primary after:content-[''] after:w-full after:h-1 after:border-b after:border-second after:border-4 after:inline-block"
                    : "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block"}`}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${step >= 3 ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                        {/* Icon for Step 3 */}
                        <i className="far fa-address-card text-xl"></i>
                    </div>
                </li>

                {/* STEP 4 indicator */}
                <li className={`flex w-full items-center ${step > 4 ? "text-primary after:content-[''] after:w-full after:h-1 after:border-b after:border-second after:border-4 after:inline-block"
                    : "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block"}`}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${step >= 4 ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                        {/* Icon for Step 4 */}
                        <i className="far fa-wallet text-xl"></i>
                    </div>
                </li>

                {/* STEP 5 indicator */}
                <li className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${step === 5 ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                        {/* Icon for Step 5 (Terms) */}
                        <i className="far fa-check-circle text-xl"></i>
                    </div>
                </li>
            </ol>
        );
    };

    // ---- Render the form for each step ----
    const renderStepForm = () => {
        switch (step) {
            case 1:
                return (
                    // Role Selector component for Step 1
                    <RoleSelector onChange={handleRoleChange} initialRole={formData.role as any} initialRoleType={formData.type} />
                );
            case 2:
                return (
                    <>
                        {/* Display a warning message */}
                        <h3 className="text-2xl font-bold text-primary">بيانات المستخدم</h3>
                        <p className="text-xs text-gray-500 mb-2">الخطوة الثانية</p>

                        {/* Display a warning message */}
                        <div className="grid gap-4 mb-3">
                            <article className="p-4">
                                <h1 className="text-gray-800 text-lg font-bold mb-1">ملاحظة:</h1>
                                <p className="text-gray-600 text-md mb-1">
                                    عند إدخال بيانات المستخدم، يجب التأكد من صحة البيانات وتطابقها مع الوثائق الرسمية.
                                </p>
                                <p className="text-gray-600 text-md mb-1">
                                    كما يجب ملاحظة أنه لا يمكن استخدام رقم هاتف أو بريد إلكتروني مسجل مسبقًا في النظام.
                                </p>
                                <p className="text-gray-600 text-md mb-1">
                                    هذا الإجراء يساعد في الحفاظ على تميز كل حساب ومنع الازدواجية في التسجيل.
                                </p>
                            </article>
                        </div>

                        {/* Display the user info form */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                                        الأسم <span className="text-red-600">*</span>
                                    </label>
                                    <input type="text" name="name" id="name" placeholder="الاسم" value={formData.name} onChange={handleChange}
                                        className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1" />
                                </div>
                                <div>
                                    <label htmlFor="surname" className="block mb-2 text-sm font-medium text-gray-900">
                                        اللقب <span className="text-red-600">*</span>
                                    </label>
                                    <input type="text" name="surname" id="surname" placeholder="اللقب" value={formData.surname} onChange={handleChange}
                                        className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1" />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900">
                                        الهاتف <span className="text-red-600">*</span>
                                    </label>
                                    <input type="text" name="phone" id="phone" placeholder="الهاتف" value={formData.phone} onChange={handleChange}
                                        className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                                        البريد الالكتروني <span className="text-red-600">*</span>
                                    </label>
                                    <input type="email" name="email" id="email" placeholder="البريد الالكتروني" value={formData.email} onChange={handleChange}
                                        className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1" />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                                        كلمة المرور <span className="text-red-600">*</span>
                                    </label>
                                    <input type="password" name="password" id="password" placeholder="كلمة المرور" value={formData.password} onChange={handleChange}
                                        className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1" />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900">
                                        تأكيد كلمة المرور <span className="text-red-600">*</span>
                                    </label>
                                    <input type="password" name="confirmPassword" id="confirmPassword" placeholder="تأكيد كلمة المرور" value={formData.confirmPassword} onChange={handleChange}
                                        className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1" />
                                </div>
                            </div>
                        </div>
                    </>

                );
            case 3:
                return (
                    <>
                        {/* عنوان الصفحة */}
                        <h3 className="text-2xl font-bold text-primary">عنوان المستخدم</h3>
                        <p className="text-xs text-gray-500 mb-2">الخطوة الثالثة</p>

                        {/* ملاحظات هامة */}
                        <div className="grid gap-4 mb-3">
                            <article className="p-4">
                                <p className="text-gray-600 text-md mb-1">
                                    إذا كان المستخدم يمثل فرعًا لشركة أو مؤسسة، يجب ذكر اسم الفرع بوضوح مع تحديد موقعه الجغرافي، مثل: "فرع البصرة" أو "فرع بغداد". هذا يساعد على تحديد موقع الفروع بدقة وتسهيل التواصل مع العملاء.
                                </p>
                                <p className="text-gray-600 text-md mb-1">
                                    حالة المستخدم الذي يمثل عميلًا، يُنصح بكتابة الاسم الكامل للعمل أو الشركة مع توضيح طبيعة النشاط التجاري، مثل: "شركة النور للتكنولوجيا" أو "مكتب الإبداع للدعاية والإعلان". هذا يضمن تمييز الهوية التجارية
                                </p>
                                <p className="text-gray-600 text-md mb-1">
                                    بالنسبة لرقم الهاتف، يُفضل استخدام رقم هاتف رئيسي يكون مميزًا للتواصل. يجب التأكيد على أن رقم الهاتف لا يُسجل كعنوان آخر، مع إمكانية إضافة رقم بديل في حال كان مختلفًا عن الرقم الأساسي
                                </p>
                            </article>
                        </div>

                        {/* نموذج البيانات */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {/* الاسم */}
                                <div className="col-span-2">
                                    <label htmlFor="address_name" className="block mb-2 text-sm font-medium text-gray-900">
                                        اسم العنوان (العمل أو المتجر) <span className="text-red-600">*</span>
                                    </label>
                                    <input type="text" name="address_name" id="address_name" placeholder="مثال: متجر النور" value={formData.address_name} onChange={handleChange}
                                        className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1" />
                                </div>

                                {/* هاتف العنوان */}
                                <div>
                                    <label htmlFor="address_phone" className="block mb-2 text-sm font-medium text-gray-900">
                                        هاتف العنوان <span className="text-red-600">*</span>
                                    </label>
                                    <input type="text" name="address_phone" id="address_phone" placeholder="رقم الهاتف" value={formData.address_phone} onChange={handleChange}
                                        className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1" />
                                </div>

                                {/* المحافظة */}
                                <div>
                                    <label htmlFor="state" className="block mb-2 text-sm font-medium text-gray-900">
                                        المحافظة <span className="text-red-600">*</span>
                                    </label>
                                    <select id="state" name="state" value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(""); setSelectedDistrict(""); handleChange(e); }}
                                        className="w-full py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-3sm focus:ring-primary focus:border-primary text-right">
                                        <option value="">اختر المحافظة</option>
                                        {data?.states.map((state) => (
                                            <option key={state.state_code} value={state.state_code}>
                                                {state.state_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* المدينة */}
                                <div>
                                    <label htmlFor="city" className="block mb-2 text-sm font-medium text-gray-900">
                                        المدينة <span className="text-red-600">*</span>
                                    </label>
                                    <select id="city" name="city" value={selectedCity} onChange={
                                        (e) => { setSelectedCity(e.target.value); setSelectedDistrict(""); handleChange(e); 

                                        }
                                    } disabled={!selectedState}
                                        className="w-full py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary text-right">
                                        <option value="">اختر المدينة</option>
                                        {data?.cities?.map((city) => (
                                            <option key={city.city_code} value={city.city_code}>
                                                {city.city_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* الحي */}
                                <div>
                                    <label htmlFor="district" className="block mb-2 text-sm font-medium text-gray-900">
                                        الحي <span className="text-red-600">*</span>
                                    </label>
                                    <select id="district" name="district" value={selectedDistrict} onChange={(e) => { setSelectedDistrict(e.target.value); handleChange(e); }} disabled={!selectedCity}
                                        className="w-full py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary text-right">
                                        <option value="">اختر الحي</option>
                                        {data?.districts?.map((district) => (
                                            <option key={district.district_id} value={district.district_id} >
                                                {district.district_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* العنوان الكامل */}
                                <div className="col-span-2">
                                    <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900">
                                        العنوان الكامل <span className="text-red-600">*</span>
                                    </label>
                                    <input type="text" name="address" id="address" placeholder="مثال: شارع 60، قرب مسجد الحسين" value={formData.address} onChange={handleChange}
                                        className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1" />
                                </div>
                            </div>
                        </div>
                        {formData.role === "عميل" && (
                            <>
                                <div className="grid gap-4 mb-3">
                                    <article className="p-4">
                                        <p className="text-gray-600 text-md mb-1">
                                            اختيار الفرع الأقرب إلى العميل ضمن نطاق المحافظة التي يتواجد فيها، لضمان توفير الخدمة بشكل سريع وفعّال.
                                        </p>
                                        {formData.type === "عميل مستويات" && (
                                            <p className="text-gray-600 text-md mb-1">
                                                هذا الحساب يمثل المستوى الأول (قائد فرق) فئة A، ويمكن تغييره من إعدادات الحساب حسب الحاجة.
                                            </p>
                                        )}
                                    </article>
                                </div>
                                {/* نموذج البيانات */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                                        {/* اختيار الفرع */}
                                        <div>
                                            <label htmlFor="branch_id" className="block mb-2 text-sm font-medium text-gray-900">
                                                الفرع <span className="text-red-600">*</span>
                                            </label>
                                            <select id="branch_id" name="branch_id" value={selectedBranch} onChange={(e) => { setSelectedBranch(e.target.value); handleChange(e); }} disabled={!selectedState}
                                                className="w-full py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary text-right">
                                                <option value="">اختر الفرع</option>
                                                {data?.branches.map((branch) => (
                                                    <option key={branch.user_id} value={branch.user_id}>
                                                        {branch.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* المخازن */}
                                        <div>
                                            <label htmlFor="client_type" className="block mb-2 text-sm font-medium text-gray-900">
                                                المخزن <span className="text-red-600">*</span>
                                            </label>
                                            <select id="client_type" name="client_type" value={formData.client_type} onChange={handleChange}
                                                className="w-full py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary text-right">
                                                <option value="">اختر</option>
                                                <option value="مخزن">مع مخزن</option>
                                                <option value="عادي">بدون مخزن</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>

                );
            case 4:
                return (
                    <>
                        {/* عنوان الصفحة */}
                        <h3 className="text-2xl font-bold text-primary">محفظة المستخدم</h3>
                        <p className="text-xs text-gray-500 mb-2">الخطوة الرابعة</p>

                        {/* ملاحظات هامة */}
                        <div className="grid gap-4 mb-3">
                            <article className="p-4">
                                <p className="text-gray-600 text-md mb-1">
                                    يتم إنشاء محفظة تلقائية لكل مستخدم عند تسجيله في النظام، وذلك لإدارة أرصدته بكفاءة وسهولة، مع ضمان دقة العمليات المالية.
                                </p>
                                <p className="text-gray-600 text-md mb-1">
                                    تُنشأ المحفظة بعملة الدينار العراقي بشكل افتراضي، ولا يمكن تغيير العملة بعد الإنشاء، مما يعزز الاستقرار والثبات في الحسابات.
                                </p>
                                <p className="text-gray-600 text-md mb-1">
                                    <b>ملاحظة:</b> حسابات الزبائن لا تشمل المحافظ أو المعاملات المالية، حيث تُعالج هذه العمليات بشكل منفصل لضمان أمان البيانات.
                                </p>
                            </article>
                        </div>

                        {/* نموذج البيانات */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">


                                <div>
                                    <label htmlFor="balance" className="block mb-2 text-sm font-medium text-gray-900">
                                        الرصيد <span className="text-red-600">*</span>
                                    </label>
                                    <input type="text" name="balance" value={formData.balance} onChange={handleChange} placeholder="0.00" disabled
                                        className="bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary block px-2 py-1" />
                                </div>

                                <div>
                                    <label htmlFor="currency" className="block mb-2 text-sm font-medium text-gray-900">
                                        العملة <span className="text-red-600">*</span>
                                    </label>
                                    <select id="currency" name="currency" value={formData.currency} onChange={handleChange}
                                        className="w-full py-1 border border-gray-300 bg-gray-50 rounded-md focus:outline-none text-sm focus:ring-primary focus:border-primary text-right">
                                        <option value="IQD">الدينار العراقي</option>
                                    </select>
                                </div>

                            </div>
                        </div>

                    </>
                );
            case 5:
                return (
                    <>
                        {/* عنوان الصفحة */}
                        <h3 className="text-2xl font-bold text-primary">تأكيد الحساب</h3>
                        <p className="text-xs text-gray-500 mb-3">الخطوة الخامسة</p>

                        <h4 className="text-lg font-bold text-gray-700 mb-4">ملخص البيانات</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                            {/* العمود الأول */}
                            <div className="flow-root">
                                <ul role="list" className="divide-y divide-gray-200">
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                نوع الحساب
                                            </p>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                {formData.role}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                التصنيف
                                            </p>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                {formData.type}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                الاسم
                                            </p>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                {formData.name}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                اللقب
                                            </p>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                {formData.surname}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                الهاتف
                                            </p>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                {formData.phone}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                البريد الإلكتروني
                                            </p>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                {formData.email}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                اسم العنوان
                                            </p>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                {formData.address_name}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                هاتف العنوان
                                            </p>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                {formData.address_phone}
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* العمود الثاني */}
                            <div className="flow-root">
                                <ul role="list" className="divide-y divide-gray-200">
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                المحافظة
                                            </p>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                {selectedStateName}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                المدينة
                                            </p>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                {selectedCityName}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                الحي
                                            </p>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                {selectedDistrictName}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                العنوان الكامل
                                            </p>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                {formData.address}
                                            </div>
                                        </div>
                                    </li>
                                    {formData.role === "عميل" && (
                                        <>
                                            <li className="py-2">
                                                <div className="flex items-center">
                                                    <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                        الفرع
                                                    </p>
                                                    <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                        {selectedBranchName}
                                                    </div>
                                                </div>
                                            </li>
                                            <li className="py-2">
                                                <div className="flex items-center">
                                                    <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                        المخزن
                                                    </p>
                                                    <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                        {formData.client_type}
                                                    </div>
                                                </div>
                                            </li>
                                        </>
                                    )}
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                الرصيد
                                            </p>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                {formData.balance}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="py-2">
                                        <div className="flex items-center">
                                            <p className="flex-1 min-w-0 ml-4 text-xs font-medium text-gray-900 truncate">
                                                العملة
                                            </p>
                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                {formData.currency}
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* نموذج التأكيد */}
                        <div className="mb-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    name="acceptTerms"
                                    id="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 h-5 w-5 ml-2 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                    required
                                />
                                <span className="text-sm">
                                    أكد ان جميع البيانات المدخلة صحيحة ومطابقة للوثائق الرسمية
                                </span>
                            </label>
                        </div>
                    </>

                );
            default:
                return null;
        }
    };

    return (
        <>
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-700 mb-2">إظافة مستخدم</h3>
            </div>

            {/* Breadcrumb */}
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:text-second">
                            لوحة التحكم
                        </Link>
                    </li>
                    <li className="inline-flex items-center">
                        <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                        <Link href="/dashboard/users" className="inline-flex items-center text-sm font-medium text-primary hover:text-second">
                            المستخدمين
                        </Link>
                    </li>
                    <li aria-current="page">
                        <div className="flex items-center">
                            <span className="mx-1 text-xl font-bold text-gray-800">/</span>
                            <span className="text-sm font-medium text-gray-700">
                                إظافة مستخدم
                            </span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* Step Container */}
            <div className="p-6 bg-white shadow-sm rounded-lg mt-5">

                {/* Step Indicator */}
                {renderStepIndicator()}

                {/* The dynamic form for each step */}
                <form onSubmit={step === 5 ? handleSubmit : (e) => e.preventDefault()}>
                    {renderStepForm()}

                    {/* Navigation Buttons */}
                    <div className="flex flex-row mt-4 items-end space-x-4">
                        {/* Previous Button */}
                        {step > 1 && (
                            <button type="button" onClick={goPrev} className="px-2 py-2 mx-3 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md">
                                <i className="fas fa-chevron-right mx-1"></i>
                                الخطوة السابقة
                            </button>
                        )}

                        {/* Next Button */}
                        {step < 5 && (
                            <button type="button" onClick={goNext} className="px-2 py-2 mx-3 text-sm font-medium text-center text-white bg-primary hover:bg-gray-600 rounded-md">
                                الخطوة التالية
                                <i className="fas fa-chevron-left mx-1"></i>
                            </button>
                        )}

                        {/* Submit Button */}
                        {step === 5 && (
                            <button type="submit" className={`px-3 py-2 mx-3 text-sm font-medium text-center text-white hover:bg-gray-600 rounded-md ${mutationLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary'}`} disabled={mutationLoading}>
                                {mutationLoading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Toast notifications */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}


