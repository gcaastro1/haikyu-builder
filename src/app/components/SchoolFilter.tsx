"use client";

import { School } from "@/types";

const availableSchools: School[] = [
    "Aoba Johsai", 
    "Date Tech", 
    "Fukurodani", 
    "Inarizaki", 
    "Itachiyama", 
    "Johzenji", 
    "Kamomedai", 
    "Karasuno", 
    "Kitagawa Daichi",
    "Nekoma", 
    "Shiratorizawa" 
].sort() as School[];

const schools: (School | "ALL")[] = ["ALL", ...availableSchools];

type SchoolFilterProps = {
  activeFilter: School | "ALL";
  onFilterChange: (school: School | "ALL") => void;
};

export function SchoolFilter({ activeFilter, onFilterChange }: SchoolFilterProps) {
  return (
    <div className="relative w-full"> 
      <select
        value={activeFilter}
        onChange={(e) => onFilterChange(e.target.value as School | "ALL")} 
        className="w-full appearance-none bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
        aria-label="Filtrar por escola"
      >
        <option value="ALL">Todas as Escolas</option>
        
        {availableSchools.map((school) => (
          <option key={school} value={school}>
            {school}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
}