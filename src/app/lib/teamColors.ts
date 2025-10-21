import { School } from "../../../data/characters"; 

const schoolColorMap: Record<School, string> = {
  "Karasuno": "border-orange-500",
  "Nekoma": "border-red-600",
  "Aoba Johsai": "border-teal-400",
  "Date Tech": "border-teal-700",     
  "Fukurōdani": "border-gray-300",      
  "Shiratorizawa": "border-purple-600",
  "Inarizaki": "border-zinc-900",       
  "Kamomedai": "border-gray-200",     
  "Itachiyama": "border-green-600",    
};

export const getTeamBorderColor = (school: School): string => {
  return schoolColorMap[school] || "border-gray-500"; 
};