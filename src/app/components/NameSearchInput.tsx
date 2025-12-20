"use client";

import { Search } from "lucide-react";
import React from "react";

type NameSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

export function NameSearchInput({
  value,
  onChange,
  className = "",
  placeholder = "Pesquisar por nome...",
}: NameSearchInputProps) {
  return (
    <div className={`input-wrapper ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-input"
      />
      <Search className="input-icon" size={18} />
    </div>
  );
}
