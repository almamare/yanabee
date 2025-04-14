"use client";

import React from "react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative inline-block group">
      <div>{children}</div>
      <div
        className="
          absolute
          z-50
          hidden
          group-hover:block
          px-3
          py-2
          text-[10px] sm:text-xs
          text-white
          bg-gray-800
          rounded-md
          border border-gray-600
          bottom-full
          left-1/2
          transform
          -translate-x-1/2
          -translate-y-2
          mb-2
          max-w-[90vw]
          w-max
          whitespace-normal
          break-words
          shadow-lg
          transition-opacity
          duration-200
          pointer-events-none
        "
        style={{
          minWidth: "60px",
          maxWidth: "320px",
        }}
      >
        {text}
        {/* مؤشر مثلث احترافي */}
        <div
          className="
            absolute
            top-full
            left-1/2
            -translate-x-1/2
            w-3
            h-3
            bg-gray-800
            border-b border-r border-gray-600
            transform
            rotate-45
            origin-center
          "
        />
      </div>
    </div>
  );
};

export default Tooltip;
