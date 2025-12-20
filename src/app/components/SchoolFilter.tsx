"use client";

import { useTranslation } from "@/hooks/useTranslation";
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
  "Shiratorizawa",
].sort() as School[];

type SchoolFilterProps = {
  activeFilter: School | "ALL";
  onFilterChange: (school: School | "ALL") => void;
  className?: string;
};

export function SchoolFilter({
  activeFilter,
  onFilterChange,
  className = "",
}: SchoolFilterProps) {
  const t = useTranslation();

  return (
    <div className={`select-wrapper ${className}`}>
      <select
        value={activeFilter}
        onChange={(e) => onFilterChange(e.target.value as School | "ALL")}
        className="select-input"
        aria-label="Filtrar por escola"
      >
        <option value="ALL">{t.filters.all_schools}</option>
        {availableSchools.map((school) => (
          <option key={school} value={school}>
            {school}
          </option>
        ))}
      </select>

      <svg
        className="select-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
      </svg>
    </div>
  );
}
