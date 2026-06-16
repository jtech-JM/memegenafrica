import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "amber" | "green" | "red" | "blue" | "gray";
  className?: string;
}

const variantMap = {
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  red:   "bg-red-500/15 text-red-400 border-red-500/30",
  blue:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  gray:  "bg-slate-800 text-gray-400 border-slate-700",
};

export default function Badge({ children, variant = "gray", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${variantMap[variant]} ${className}`}>
      {children}
    </span>
  );
}
