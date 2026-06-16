import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
}

export default function Input({ label, hint, icon, error, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 font-mono">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`w-full bg-slate-950/70 border ${error ? "border-red-500/60" : "border-slate-800"} focus:border-amber-400 text-xs text-white ${icon ? "pl-10" : "pl-3"} pr-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-all font-sans placeholder-gray-600 ${className}`}
        />
      </div>
      {hint && !error && <p className="text-[9.5px] text-gray-500">{hint}</p>}
      {error && <p className="text-[9.5px] text-red-400">{error}</p>}
    </div>
  );
}
