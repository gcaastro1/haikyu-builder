export type Position = "OP" | "MB" | "WS" | "S" | "L";
export type Rarity = "SR" | "SSR" | "UR" | "SP";
export type School = "Shiratorizawa" | "Nekoma" | "Fukurodani" | "Aoba Johsai" | "Inarizaki" | "Kamomedai" | "Karasuno" | "Date Tech" | "Itachiyama" | "Johzenji" | "Kitagawa Daichi";

export interface Skill {
  id: number;
  name: string | null;
  description: string | null;
  character_id: number; 
  created_at?: string;
}

export interface Bond {
  id: number;
  name: string | null;
  description: string | null;
  created_at?: string;
}

export interface CharacterBondLink {
    character_id: number;
    bond_id: number;
}

export interface StatsBondType {
    id: number;
    name: string | null;
    created_at?: string;
}

export interface CharacterStatsBond {
    id: number;
    stats_bond_id: number;
    character_id: number;
    buff_description: string | null;
    created_at?: string;
    stats_bond_name?: string; 
}


export interface Character {
  id: number; // 
  name: string;
  position: Position | string | null; 
  rarity: Rarity | string | null;
  school: School | string | null;
  image_url: string | null;
  styles: string[] | null;
  serve: number | null;
  attack: number | null;
  set: number | null;
  receive: number | null;
  block: number | null;
  defense: number | null;
  created_at?: string;

  skills?: Skill[]; 
  bondIds?: number[];
  bonds?: Bond[]; 
  statsBonds?: CharacterStatsBond[]; 
}

export type TeamSlots = {
  pos5_ws: Character | null;
  pos6_mb: Character | null;
  pos1_op: Character | null;
  pos4_ws: Character | null;
  pos3_mb: Character | null;
  pos2_s: Character | null;
  libero: Character | null;
};

export type SlotKey = keyof TeamSlots;
