import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <span
      className={`inline-block border-2 border-amber-500 border-t-transparent rounded-full animate-spin ${sizeMap[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
