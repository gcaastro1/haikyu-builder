import React from 'react';

type SectionHeaderProps = {
  titleBold: string;
  titleRegular: string;
};

export function SectionHeader({ titleBold, titleRegular }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
      
      <h2 className="text-2xl font-bricolage text-white uppercase">
        <span className="font-bold">{titleBold}</span>
        <span className="font-normal opacity-80 ml-1">{titleRegular}</span>
      </h2>
    </div>
  );
}