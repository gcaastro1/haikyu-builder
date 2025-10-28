"use client";

import { Search } from "lucide-react";
import React from "react";

type NameSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function NameSearchInput({
  value,
  onChange,
  className = "",
}: NameSearchInputProps) {
  return (
    <div className={`input-wrapper ${className}`}>
      <input
        type="text"
        placeholder="Pesquisar por nome..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-input"
      />
      <Search className="input-icon" size={18} />
    </div>
  );
}
