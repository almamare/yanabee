"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";

// Types for location data from server
import { LocationData, LocationVariables } from "@/graphql/types/statesType";
import { GET_LOCATIONS } from "@/graphql/queries/queries";

/**
 * AddressUpdate interface must match what we expect to edit in the modal.
 * If needed, you can import the same interface from `UserDetailsPage.tsx`,
 * or define a shared interface in a separate file.
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

interface UpdateAddressModalProps {
    isOpen: boolean;  // Controls whether the modal is open or not
    onClose: () => void;  // Function to close the modal
    address: AddressUpdate;  // Current address object we want to edit
    onUpdate: (updatedAddress: AddressUpdate) => void; // Callback to pass updated address back
}

export default function UpdateAddressModal({
    isOpen,
    onClose,
    address,
    onUpdate,
}: UpdateAddressModalProps) {
    // Local state for form data
    const [formData, setFormData] = useState<AddressUpdate>(address);

    // If the address prop changes (e.g., user opens the modal for a different address),
    // we update the local state accordingly
    useEffect(() => {
        setFormData(address);
    }, [address]);

    // If you are using codes for states, cities, and districts, track them
    const [selectedState, setSelectedState] = useState<string>("");
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");

    // Query to get states, cities, and districts
    const { data, loading, error, refetch } = useQuery<LocationData, LocationVariables>(
        GET_LOCATIONS,
        {
            variables: {
                stateCode: null,
                cityCode: null,
                stateName: null,
            },
            fetchPolicy: "network-only",
        }
    );

    // When selectedState changes, refetch cities and reset city/district
    useEffect(() => {
        if (selectedState) {
            refetch({
                stateCode: selectedState,
                cityCode: null,
                stateName: null,
            });
        }
        setSelectedCity("");
        setSelectedDistrict("");
        setFormData((prev) => ({ ...prev, city: "", district: "" }));
    }, [selectedState, refetch]);

    // When selectedCity changes, refetch districts and reset district
    useEffect(() => {
        if (selectedCity) {
            refetch({
                stateCode: selectedState,
                cityCode: selectedCity,
                stateName: null,
            });
        }
        setSelectedDistrict("");
        setFormData((prev) => ({ ...prev, district: "" }));
    }, [selectedCity, selectedState, refetch]);

    // Handle text/select input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle state selection
    const handleSelectState = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedState(value);
        // Also update form data to store the state code (or name, based on your needs)
        setFormData((prev) => ({ ...prev, state: value }));
    };

    // Handle city selection
    const handleSelectCity = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedCity(value);
        setFormData((prev) => ({ ...prev, city: value }));
    };

    // Handle district selection
    const handleSelectDistrict = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedDistrict(value);
        setFormData((prev) => ({ ...prev, district: value }));
    };

    // On form submit, call the onUpdate prop
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onUpdate(formData);
    };

    // If modal is not open, render nothing
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay to close the modal when clicked outside */}
            <div
                className="fixed inset-0 bg-gray-800 bg-opacity-50 z-40"
                onClick={onClose}
            ></div>

            {/* Modal content */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between mb-4 border-b pb-4">
                        <h2 className="text-xl font-bold mb-1 text-primary">
                            Update Address
                        </h2>
                        <button
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                            onClick={onClose}
                        >
                            <i className="far fa-times"></i>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Address name */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">
                                Address Name <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter address name"
                                required
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md w-full 
                  focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">
                                Phone <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter address phone"
                                required
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md w-full 
                  focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                            />
                        </div>

                        {/* State */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">
                                State <span className="text-red-600">*</span>
                            </label>
                            {loading && !data?.states && (
                                <p className="text-sm text-gray-500">Loading states...</p>
                            )}
                            <select
                                name="state"
                                value={formData.state}
                                onChange={handleSelectState}
                                required
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md w-full 
                  focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                            >
                                <option value="">Select state</option>
                                {data?.states?.map((st) => (
                                    <option key={st.state_code} value={st.state_code}>
                                        {st.state_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* City */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">
                                City <span className="text-red-600">*</span>
                            </label>
                            {loading && formData.state && !data?.cities && (
                                <p className="text-sm text-gray-500">Loading cities...</p>
                            )}
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleSelectCity}
                                required
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md w-full 
                  focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                            >
                                <option value="">Select city</option>
                                {data?.cities?.map((ct) => (
                                    <option key={ct.city_code} value={ct.city_code}>
                                        {ct.city_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* District */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">
                                District <span className="text-red-600">*</span>
                            </label>
                            {loading && formData.city && !data?.districts && (
                                <p className="text-sm text-gray-500">Loading districts...</p>
                            )}
                            <select
                                name="district"
                                value={formData.district}
                                onChange={handleSelectDistrict}
                                required
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md w-full 
                  focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                            >
                                <option value="">Select district</option>
                                {data?.districts?.map((dist) => (
                                    <option key={dist.district_id} value={dist.district_id}>
                                        {dist.district_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Full address */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">
                                Full Address <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter the full address"
                                required
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md w-full 
                  focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none block px-2 py-1"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="px-4 py-1.5 bg-red-600 text-white rounded-md mx-2"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-1.5 bg-primary text-white rounded-md"
                            >
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}



