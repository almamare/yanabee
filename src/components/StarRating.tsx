"use client";

import React, { useState } from "react"; // Import React and useState for managing state
import { Star } from "lucide-react"; // Or use any icon lib, or emoji ★

// Import the Star icon from lucide-react
interface StarRatingProps {
    rating: number;
    onRate?: (rating: number) => void;
    maxStars?: number;
    readOnly?: boolean;
}

/// StarRating component that allows users to rate something using stars
const StarRating: React.FC<StarRatingProps> = ({ rating, onRate, maxStars = 5, readOnly = false}) => {
    const [hovered, setHovered] = useState<number | null>(null); 

    return (
        <div className="flex space-x-1">
            {Array.from({ length: maxStars }, (_, index) => {
                const starIndex = index + 1;
                const isActive = hovered ? starIndex <= hovered : starIndex <= rating;

                return (
                    <button key={starIndex} type="button" className="text-2xl transition-colors" onMouseEnter={() => !readOnly && setHovered(starIndex)} onMouseLeave={() => !readOnly && setHovered(null)} onClick={() => !readOnly && onRate?.(starIndex)}>
                        <Star className={`w-6 h-6 ${isActive ? "text-yellow-400" : "text-gray-300" }`} fill={isActive ? "#facc15" : "none"} />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
