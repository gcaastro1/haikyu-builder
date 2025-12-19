import { Rarity } from "@/types";


const rarityBackgroundMap: Record<Rarity, string> = {
  "SR": "/images/backgrounds/BackgroundSR.png",     
  "SSR": "/images/backgrounds/BackgroundSSR.png",    
  "UR": "/images/backgrounds/BackgroundUR.png",      
  "SP": "/images/backgrounds/BackgroundSP.png",     
};

export const getRarityBackground = (rarity: Rarity | string | null | undefined): string => {
  if (!rarity) return "/images/backgrounds/BackgroundSR.png";
  return rarityBackgroundMap[rarity as Rarity] || "/images/backgrounds/BackgroundSR.png"; 
};

const rarityColorMap: Record<Rarity, string> = {
    "SR": "text-zinc-400",
    "SSR": "text-[#EBAC43]", 
    "UR": "text-[#E04444]",
    "SP": "text-[#C6E3FF]",
}
export const getRarityColor = (rarity: Rarity): string => {
    return rarityColorMap[rarity] || "text-gray-300";
}

const rarityBorderColorMap: Record<Rarity, string> = {
    "SR": "border-zinc-400",    
    "SSR": "border-[#EBAC43]", 
    "UR": "border-[#E04444]",  
    "SP": "border-[#C6E3FF]", 
};

export const getRarityBorderColor = (rarity: Rarity): string => {
    return rarityBorderColorMap[rarity] || "border-gray-700";
};