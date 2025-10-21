// /app/components/SectionHeader.tsx
import React from 'react';

type SectionHeaderProps = {
  children: React.ReactNode;
};

export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="fancy-title">
        {children}
      </h2>
    </div>
  );
}