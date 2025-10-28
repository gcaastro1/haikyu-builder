import React from "react";

interface SectionHeaderProps {
  title: string;
  count?: number;
}

export function SectionHeader({ title, count }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <h2 className="section-header__title">{title}</h2>
      {count !== undefined && (
        <span className="section-header__count">({count})</span>
      )}
    </div>
  );
}