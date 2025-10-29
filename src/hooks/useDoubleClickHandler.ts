import { useCallback } from "react";
import { Character, DoubleClickOrigin, SlotKey, TeamSlots } from "@/types";
import { useUIStore } from "@/stores/useUIStore";
import { useTeamStore } from "@/stores/useTeamStore";

export function useDoubleClickHandler(
  team: TeamSlots,
  bench: (Character | null)[],
  isPositionFree: boolean,
  teamCharacterNames: Set<string>
) {
  const { showFeedback } = useUIStore();
  const { setTeam, setBench, removeFromCourt, removeFromBench } =
    useTeamStore();

  const findCourtSlotForDoubleClick = useCallback(
    (character: Character, currentTeam: TeamSlots, isFreeMode: boolean): SlotKey | null => {
      const { position } = character;

      if (position === "L") return currentTeam.libero === null ? "libero" : null;

      const courtKeys: SlotKey[] = ["pos1_s", "pos2_mb", "pos3_ws", "pos5_mb", "pos6_ws", "pos4_op"];

      if (isFreeMode) {
        for (const key of courtKeys) {
          if (currentTeam[key] === null && character.position !== "L") {
            return key;
          }
        }
        return null;
      }

      switch (position) {
        case "WS": return currentTeam.pos3_ws === null ? "pos3_ws" : currentTeam.pos6_ws === null ? "pos6_ws" : null;
        case "MB": return currentTeam.pos2_mb === null ? "pos2_mb" : currentTeam.pos5_mb === null ? "pos5_mb" : null;
        case "S": return currentTeam.pos1_s === null ? "pos1_s" : null;
        case "OP": return currentTeam.pos4_op === null ? "pos4_op" : null;
        default: return null;
      }
    },
    []
  );

  const handleDoubleClickCharacter = useCallback(
    (character: Character, origin: DoubleClickOrigin, originKey?: SlotKey | number) => {
      if (origin === "list") {
        if (teamCharacterNames.has(character.name)) {
          showFeedback(`'${character.name}' já está no time ou banco.`, "error");
          return;
        }

        let added = false;
        const targetSlotKey = findCourtSlotForDoubleClick(character, team, isPositionFree);

        if (targetSlotKey) {
          setTeam({ ...team, [targetSlotKey]: character });
          showFeedback(`${character.name} adicionado à quadra.`);
          added = true;
        }

        if (!added) {
          const firstEmptyBenchSlot = bench.findIndex((slot) => slot === null);
          if (firstEmptyBenchSlot !== -1) {
            const newBench = [...bench];
            newBench[firstEmptyBenchSlot] = character;
            setBench(newBench);
            showFeedback(`${character.name} adicionado ao banco.`);
            added = true;
          }
        }

        if (!added) showFeedback("Time e banco estão cheios!", "error");
      } else if (origin === "court" && typeof originKey === "string") {
        removeFromCourt(originKey as SlotKey);
        showFeedback(`${character.name} removido da quadra.`);
      } else if (origin === "bench" && typeof originKey === "number") {
        const targetSlotKey = findCourtSlotForDoubleClick(character, team, isPositionFree);
        if (targetSlotKey) {
          setTeam({ ...team, [targetSlotKey]: character });
          removeFromBench(originKey);
          showFeedback(`${character.name} movido do banco para a quadra.`);
        } else {
          removeFromBench(originKey);
          showFeedback(`${character.name} removido do banco (sem espaço na quadra).`);
        }
      }
    },
    [team, bench, isPositionFree, findCourtSlotForDoubleClick, showFeedback, teamCharacterNames, setTeam, setBench, removeFromCourt, removeFromBench]
  );

  return { handleDoubleClickCharacter };
}
