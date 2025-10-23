"use client";

import { Search } from 'lucide-react'; 

type NameSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function NameSearchInput({ value, onChange }: NameSearchInputProps) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Pesquisar por nome..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
      />
      <Search
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
        size={18}
      />
    </div>
  );
}