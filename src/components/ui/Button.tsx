import React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "xs" | "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:   "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold shadow-md hover:shadow-amber-500/20",
  secondary: "bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-gray-300 hover:text-white",
  danger:    "bg-red-500/10 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300",
  ghost:     "text-gray-400 hover:text-white hover:bg-slate-900/40",
};

const sizeClasses: Record<Size, string> = {
  xs: "px-2.5 py-1.5 text-[10px]",
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-xs",
};

export default function Button({
  variant = "secondary",
  size = "sm",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: React.PropsWithChildren<ButtonProps>) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold transition-all duration-150 cursor-pointer select-none uppercase tracking-wider focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="h-3.5 w-3.5 shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
