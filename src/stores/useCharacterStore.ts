import { create, StoreApi, UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
import {
  Character,
  Bond,
  CharacterBondLink,
  TeamSlots,
  CalculatedBond,
  TeamType,
  dbStyleToTeamTypeMap,
  Position,
  SlotKey,
  RelevantStyleDisplay,
  DbStyle,
} from "@/types";
import { getAllCharacterBondLinks, getBonds } from "@/app/lib/actions";
import { supabase } from "@/app/lib/supabaseClient";
import { calculateActiveBonds } from "@/app/lib/calculateActiveBonds";

export type CharacterStoreState = {
  allCharacters: Character[];
  allBonds: Bond[];
  characterBondLinks: CharacterBondLink[];
  activeBonds: CalculatedBond[];
  isLoading: boolean;
  loadingBonds: boolean;
  fetchError: string | null;
  hasLoadedData: boolean;

  fetchInitialData: () => Promise<void>;
  calculateBondsForTeam: (team: TeamSlots) => void;

  suggestTeam: (
    targetType: TeamType,
    currentTeam: TeamSlots,
    isJPMode: boolean
  ) => TeamSlots;
};

export const useCharacterStore: UseBoundStore<StoreApi<CharacterStoreState>> =
  create<CharacterStoreState>()(
    persist(
      (set, get) => ({
        allCharacters: [],
        allBonds: [],
        characterBondLinks: [],
        activeBonds: [],
        isLoading: false,
        loadingBonds: false,
        fetchError: null,
        hasLoadedData: false,

        fetchInitialData: async () => {
          const { isLoading, hasLoadedData } = get();
          if (isLoading || hasLoadedData) return;

          set({ isLoading: true, fetchError: null });

          try {
            const [charactersResult, bondsResult, linksResult] =
              await Promise.all([
                supabase
                  .from("Characters")
                  .select("*")
                  .order("name", { ascending: true }),
                getBonds(),
                getAllCharacterBondLinks(),
              ]);

            if (charactersResult.error) throw charactersResult.error;

            const formattedCharacters = (charactersResult.data || []).map(
              (char) => {
                let stylesArray: string[] = [];
                try {
                  if (Array.isArray(char.styles)) stylesArray = char.styles;
                  else if (typeof char.styles === "string")
                    stylesArray = JSON.parse(char.styles);
                } catch {
                  console.warn(`Falha ao parsear estilos de ${char.name}`);
                }
                return { ...char, styles: stylesArray ?? [] };
              }
            ) as Character[];

            if (bondsResult.error) throw new Error(bondsResult.error);
            if (linksResult.error) throw new Error(linksResult.error);

            set({
              allCharacters: formattedCharacters,
              allBonds: bondsResult.bonds || [],
              characterBondLinks: linksResult.links || [],
              isLoading: false,
              hasLoadedData: true,
              fetchError: null,
            });
          } catch (error: unknown) {
            console.error("Erro ao buscar dados iniciais:", error);
            set(() => ({
              fetchError:
                error instanceof Error
                  ? `Erro ao carregar dados: ${error.message}`
                  : "Erro desconhecido ao carregar dados.",
              isLoading: false,
              hasLoadedData: false,
            }));
          }
        },

        calculateBondsForTeam: (team) => {
          const { allCharacters, allBonds, characterBondLinks } = get();
          if (!allCharacters.length || !allBonds.length) return;

          set({ loadingBonds: true });
          const active = calculateActiveBonds(
            team,
            allCharacters,
            allBonds,
            characterBondLinks
          );
          set({ activeBonds: active, loadingBonds: false });
        },

        suggestTeam: (targetType, currentTeam, isJPMode) => {
          const { allCharacters, characterBondLinks } = get();
          if (!allCharacters.length) return { ...currentTeam };

          const rarityWeights = {
            SP: 5,
            UR: 4,
            SSR: 3,
            SR: 2,
            R: 1,
          } as const;

          const requiredCounts: Record<TeamType, number> = {
            "Ataque Rápido": 4,
            Potente: 4,
            Bloqueio: 4,
            Recepção: 5,
            Nenhum: 0,
          };

          const teamTypeToDbKey: Record<RelevantStyleDisplay, DbStyle> = {
            "Ataque Rápido": "quick",
            Potente: "power",
            Bloqueio: "block",
            Recepção: "receive",
          };

          const hasType = (char: Character): boolean => {
            if (!char.styles) return false;
            const expectedDbKey =
              teamTypeToDbKey[targetType as RelevantStyleDisplay];
            return (char.styles ?? []).includes(expectedDbKey);
          };

          const calcSynergyScore = (
            char: Character,
            team: TeamSlots
          ): number => {
            const teamIds = Object.values(team)
              .filter(Boolean)
              .map((m) => m!.id);

            const charBondIds = characterBondLinks
              .filter((link) => link.character_id === char.id)
              .map((link) => link.bond_id);

            const synergyScore = characterBondLinks.filter(
              (link) =>
                teamIds.includes(link.character_id) &&
                charBondIds.includes(link.bond_id)
            ).length;

            return synergyScore;
          };

          const getCharacterScore = (
            char: Character,
            team: TeamSlots
          ): number => {
            const rarityScore =
              rarityWeights[char.rarity as keyof typeof rarityWeights] || 0;
            const synergyScore = calcSynergyScore(char, team);
            const styleBonus = hasType(char) ? 3 : 0;
            return rarityScore * 2 + synergyScore * 4 + styleBonus;
          };

          const preferred = allCharacters.filter(hasType);
          const others = allCharacters.filter((c) => !hasType(c));

          const sortedPreferred = [...preferred].sort(
            (a, b) =>
              getCharacterScore(b, currentTeam) -
              getCharacterScore(a, currentTeam)
          );
          const sortedOthers = [...others].sort(
            (a, b) =>
              getCharacterScore(b, currentTeam) -
              getCharacterScore(a, currentTeam)
          );

          const positionSlots: Record<Position, SlotKey[]> = {
            S: ["pos1_s"],
            MB: ["pos2_mb", "pos5_mb"],
            WS: ["pos3_ws", "pos6_ws"],
            OP: ["pos4_op"],
            L: ["libero"],
          };

          const newTeam = { ...currentTeam };
          const requiredOfType = requiredCounts[targetType];
          let addedOfType = 0;

          for (const slotKey of Object.keys(newTeam) as SlotKey[]) {
            if (newTeam[slotKey]) continue;
            if (addedOfType >= requiredOfType) break;

            const isLiberoSlot = slotKey === "libero";
            const candidate = sortedPreferred.find((c) => {
              if (Object.values(newTeam).some((p) => p?.id === c.id))
                return false;
              if (isLiberoSlot) return c.position === "L";

              if (!isJPMode) {
                const validPositions = Object.entries(positionSlots)
                  .filter(([_, slots]) => slots.includes(slotKey))
                  .map(([pos]) => pos);
                return validPositions.includes(c.position as Position);
              } else if (c.position === "L") return false;

              return true;
            });

            if (candidate) {
              newTeam[slotKey] = candidate;
              addedOfType++;
            }
          }

          for (const slotKey of Object.keys(newTeam) as SlotKey[]) {
            if (newTeam[slotKey]) continue;

            const isLiberoSlot = slotKey === "libero";
            const availableCandidates = [...sortedOthers].filter((c) => {
              if (Object.values(newTeam).some((p) => p?.id === c.id))
                return false;
              if (isLiberoSlot) return c.position === "L";

              if (!isJPMode) {
                const validPositions = Object.entries(positionSlots)
                  .filter(([_, slots]) => slots.includes(slotKey))
                  .map(([pos]) => pos);
                return validPositions.includes(c.position as Position);
              } else if (c.position === "L") return false;

              return true;
            });

            if (availableCandidates.length > 0) {
              const bestCandidate = availableCandidates.sort(
                (a, b) =>
                  getCharacterScore(b, newTeam) - getCharacterScore(a, newTeam)
              )[0];
              newTeam[slotKey] = bestCandidate;
            }
          }

          const finalCounts = { quick: 0, power: 0, block: 0, receive: 0 };
          Object.values(newTeam).forEach((char) => {
            if (!char || !char.styles) return;

            const expectedDbKey =
              teamTypeToDbKey[targetType as RelevantStyleDisplay];
            if (char.styles.includes(expectedDbKey)) {
              finalCounts[expectedDbKey]++;
            } else {
              const firstStyle = char.styles[0] as keyof typeof finalCounts;
              if (firstStyle && finalCounts[firstStyle] !== undefined)
                finalCounts[firstStyle]++;
            }
          });

          console.log("==> Time sugerido:", targetType, finalCounts);

          return newTeam;
        },
      }),

      {
        name: "haikyu-character-cache",
        partialize: (state) => ({
          allCharacters: state.allCharacters,
          allBonds: state.allBonds,
          characterBondLinks: state.characterBondLinks,
        }),
      }
    )
  );
