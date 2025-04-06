import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastProps = {
    message: string;
    type?: "success" | "danger" | "warning" | "info";
    duration?: number; // in milliseconds
    onClose: () => void;
};

const iconMap = {
    success: <CheckCircle className="text-green-600" size={20} />,
    danger: <XCircle className="text-red-600" size={20} />,
    warning: <AlertCircle className="text-yellow-600" size={20} />,
    info: <Info className="text-blue-600" size={20} />,
};

const bgMap = {
    success: "bg-green-100 border-green-500 text-green-700",
    danger: "bg-red-100 border-red-500 text-red-700",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
    info: "bg-blue-100 border-blue-500 text-blue-700",
};

const Toast: React.FC<ToastProps> = ({ message, type = "info", duration = 3000, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Delay for animation
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!visible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-5 left-5 flex items-center gap-3 p-4 border-l-4 z-50 rounded-lg shadow-md ${bgMap[type]}`}
        >
            {iconMap[type]}
            <span>{message}</span>
            <button onClick={() => setVisible(false)} className="text-gray-700 hover:text-gray-900">
                ✕
            </button>
        </motion.div>
    );
};

export default Toast;
