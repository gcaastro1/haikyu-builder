import { Character, DoubleClickOrigin, SlotKey } from "./index";

export type CharacterCardProps = {
  character: Character;
  onRemoveCharacter?: () => void;
  onClick?: (slotIdentifier: string) => void;
  isDisabled?: boolean;
  dragId?: string;
  dragData?: Record<string, unknown>;
  dropData?: Record<string, unknown>;
  originType: DoubleClickOrigin;
  originKey?: SlotKey;
  onAddToTeam?: (character: Character) => void;
  className?: string;
  variant?: "default" | "popout";
};

export type CharacterModalProps = {
  character: Character;
  onClose: () => void;
};

export type CharacterModalTabKey =
  | "Resumo"
  | "Habilidades"
  | "Vínculos"
  | "Ressonâncias"
  | "Memória"
  | "Potenciais";
