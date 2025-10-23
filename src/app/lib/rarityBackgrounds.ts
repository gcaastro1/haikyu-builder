import { Rarity } from "../../../data/characters"; 

const rarityBackgroundMap: Record<Rarity, string> = {
  "SR": "/images/backgrounds/BackgroundSR.png",     
  "SSR": "/images/backgrounds/BackgroundSSR.png",    
  "UR": "/images/backgrounds/BackgroundUR.png",      
  "SP": "/images/backgrounds/BackgroundSP.png",     
};

export const getRarityBackground = (rarity: Rarity): string => {
  return rarityBackgroundMap[rarity] || "/images/backgroundsBackgroundSR.webp"; 
};

const rarityColorMap: Record<Rarity, string> = {
    "SR": "text-blue-300",
    "SSR": "text-yellow-400", 
    "UR": "text-orange-400",
    "SP": "text-purple-400",
}
export const getRarityColor = (rarity: Rarity): string => {
    return rarityColorMap[rarity] || "text-gray-300";
}

const rarityBorderColorMap: Record<Rarity, string> = {
    "SR": "border-purple-500",    
    "SSR": "border-yellow-500", 
    "UR": "border-red-500",  
    "SP": "border-blue-300", 
};

export const getRarityBorderColor = (rarity: Rarity): string => {
    return rarityBorderColorMap[rarity] || "border-gray-700";
};