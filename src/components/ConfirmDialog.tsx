"use client";

import React from "react";

/// ConfirmDialog component props
interface ConfirmDialogProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

/// ConfirmDialog component
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    message,
    onConfirm,
    onCancel,
}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
                <h2 className="text-md font-medium mb-4">{message}</h2>
                <div className="flex justify-center gap-5 mt-6">
                    <button onClick={onCancel} className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition">
                        إلغاء
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition">
                        موافق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
