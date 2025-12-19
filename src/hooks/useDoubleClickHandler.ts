import { useTeamStore } from "@/stores/useTeamStore";
import { useUIStore } from "@/stores/useUIStore";
import { Character, DoubleClickOrigin, SlotKey, TeamSlots } from "@/types";
import { useCallback } from "react";

export function useDoubleClickHandler(
  team: TeamSlots,
  teamCharacterNames: Set<string>
) {
  const { showFeedback } = useUIStore();
  const { setTeam, removeFromCourt } = useTeamStore();

  const findCourtSlotForDoubleClick = useCallback(
    (character: Character, currentTeam: TeamSlots): SlotKey | null => {
      const { position } = character;

      if (position === "L") return currentTeam.libero === null ? "libero" : null;

      const courtKeys: SlotKey[] = ["pos1_s", "pos2_mb", "pos3_ws", "pos5_mb", "pos6_ws", "pos4_op"];

      if (character.position !== "L") {
        for (const key of courtKeys) {
          if (currentTeam[key] === null) {
            return key;
          }
        }
      }
      
      return null;
    },
    []
  );

  const handleDoubleClickCharacter = useCallback(
    (character: Character, origin: DoubleClickOrigin, originKey?: SlotKey) => {
      if (origin === "list") {
        if (teamCharacterNames.has(character.name)) {
          showFeedback(`'${character.name}' já está no time.`, "error");
          return;
        }

        let added = false;
        const targetSlotKey = findCourtSlotForDoubleClick(character, team);

        if (targetSlotKey) {
          setTeam({ ...team, [targetSlotKey]: character });
          showFeedback(`${character.name} adicionado à quadra.`);
          added = true;
        }
        if (!added) showFeedback("Time está cheio!", "error");
      } else if (origin === "court" && typeof originKey === "string") {
        removeFromCourt(originKey as SlotKey);
        showFeedback(`${character.name} removido da quadra.`);
      }
    },
    [team, findCourtSlotForDoubleClick, showFeedback, teamCharacterNames, setTeam, removeFromCourt]
  );

  return { handleDoubleClickCharacter };
}
