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