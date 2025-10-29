export type Position = "OP" | "MB" | "WS" | "S" | "L";
export type Rarity = "SR" | "SSR" | "UR" | "SP";
export type School =
  | "Shiratorizawa"
  | "Nekoma"
  | "Fukurodani"
  | "Aoba Johsai"
  | "Inarizaki"
  | "Kamomedai"
  | "Karasuno"
  | "Date Tech"
  | "Itachiyama"
  | "Johzenji"
  | "Kitagawa Daichi";

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

export interface CalculatedBond {
  id: number;
  name: string | null;
  description: string | null;
  totalRequired: number;
  currentCount: number;
  isActive: boolean;
  hasAnyMemberOnCourt: boolean;
  isTeamBond?: boolean;
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
  rarity: Rarity | null;
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
  pos6_ws: Character | null;
  pos5_mb: Character | null;
  pos4_op: Character | null;
  pos3_ws: Character | null;
  pos2_mb: Character | null;
  pos1_s: Character | null;
  libero: Character | null;
};

export type SlotKey = keyof TeamSlots;

export interface SavedTeam {
  name: string;
  court: TeamSlots;
  bench: (Character | null)[];
  savedAt: string;
}

export interface ExportedTeam {
  c: { [key in SlotKey]?: number | null };
  b: (number | null)[];
}

export type DbStyle = "quick" | "power" | "receive" | "block" | string;
export type RelevantStyleDisplay =
  | "Ataque Rápido"
  | "Potente"
  | "Bloqueio"
  | "Recepção";
export type TeamType = RelevantStyleDisplay | "Nenhum";

export const dbStyleToTeamTypeMap: { [key in DbStyle]?: RelevantStyleDisplay } =
  {
    quick: "Ataque Rápido",
    power: "Potente",
    block: "Bloqueio",
    receive: "Recepção",
  };

export const teamTypeStyles: Record<
  TeamType,
  { className: string; icon?: string }
> = {
  "Ataque Rápido": { className: "style-quick" },
  Potente: { className: "style-power" },
  Bloqueio: { className: "style-block" },
  Recepção: { className: "style-receive" },
  Nenhum: { className: "style-none" },
};

export type StyleCounts = Record<RelevantStyleDisplay, number>;

export type DoubleClickOrigin = "list" | "court" | "bench";
