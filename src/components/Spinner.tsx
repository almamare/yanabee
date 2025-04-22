"use client";

import React from "react";
import clsx from "clsx";

interface SpinnerProps {
  /** Diameter presets */
  size?: "sm" | "md" | "lg";
  /** Color presets that match your Tailwind config */
  color?: "primary" | "white" | "gray";
  /** Extra classes */
  className?: string;
}

const SIZE_MAP: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "w-4 h-4 border-2",  // 16 px
  md: "w-8 h-8 border-4",  // 32 px (default)
  lg: "w-12 h-12 border-4", // 48 px
};

const COLOR_MAP: Record<NonNullable<SpinnerProps["color"]>, string> = {
  primary: "border-primary border-t-transparent",
  white: "border-white border-t-transparent",
  gray: "border-gray-300 border-t-transparent",
};

/**
 * Tailwind‑only spinner.
 *
 * ```tsx
 * <Spinner />                 // medium primary spinner
 * <Spinner size="sm" />       // small
 * <Spinner color="white" />  // on dark background
 * ```
 */
export default function Spinner({
  size = "md",
  color = "primary",
  className = "",
}: SpinnerProps) {
  return (
    <div role="status" className="inline-flex items-center justify-center">
      <span
        className={clsx(
          "animate-spin rounded-full",
          SIZE_MAP[size],
          COLOR_MAP[color],
          "border-solid",
          className
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
