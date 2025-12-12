import { calculateActiveBonds } from "@/app/lib/calculateActiveBonds";
import {
    Bond,
    CalculatedBond,
    Character,
    CharacterBondLink,
    DbStyle,
    Memory,
    Position,
    Potential,
    RelevantStyleDisplay,
    SlotKey,
    TeamSlots,
    TeamType
} from "@/types";
import { create, StoreApi, UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
// Dados passam a ser carregados 100% dos JSON em /public/mock
import { Lang } from "./useI18nStore";

export type CharacterStoreState = {
  allCharacters: Character[];
  allBonds: Bond[];
  characterBondLinks: CharacterBondLink[];
  activeBonds: CalculatedBond[];
  allPotentials: Potential[];
  allMemories: Memory[];
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
  refreshBondsLanguage: (lang: Lang) => void;
};

export const useCharacterStore: UseBoundStore<StoreApi<CharacterStoreState>> =
  create<CharacterStoreState>()(
    persist(
      (set, get) => ({
        allCharacters: [],
        allBonds: [],
        characterBondLinks: [],
        activeBonds: [],
        allPotentials: [],
        allMemories: [],
        isLoading: false,
        loadingBonds: false,
        fetchError: null,
        hasLoadedData: false,

        fetchInitialData: async () => {
          const { isLoading, hasLoadedData } = get();
          if (isLoading || hasLoadedData) return;

          set({ isLoading: true, fetchError: null });

          try {
            const fetchJson = async (url: string) => {
              const res = await fetch(url);
              if (!res.ok) throw new Error(`Falha ao carregar ${url}: ${res.status}`);
              return res.json();
            };

            const [charactersJson, bondsJson, linksJson, potentialsJson, memoriesJson] = await Promise.all([
              fetchJson("/mock/characters.json"),
              fetchJson("/mock/bonds.json"),
              fetchJson("/mock/character_bonds.json"),
              fetchJson("/mock/potentials.json"),
              fetchJson("/mock/memories.json"),
            ]);

            const formattedCharacters: Character[] = (charactersJson as any[]).map((c: any) => {
              const supabaseUrl: string | null = c.image_url ?? null;
              const fileName = typeof supabaseUrl === "string" ? supabaseUrl.split("/").pop() ?? null : null;
              const localImageUrl = fileName ? `/images/characters/${fileName}` : null;

              return {
                id: c.id,
                name: c.name,
                position: c.position,
                rarity: c.rarity,
                school: c.school,
                image_url: localImageUrl,
                styles: c.styles ?? null,
                serve: c.serve ?? null,
                attack: c.attack ?? null,
                set: c.set ?? null,
                receive: c.receive ?? null,
                block: c.block ?? null,
                defense: c.defense ?? null,
                potential: c.potential ?? null,
              };
            });

            const bonds: Bond[] = (bondsJson as any[]).map((b: any) => ({
              id: b.id,
              name: b.name ?? null,
              description: b.description ?? null,
            }));

            const links: CharacterBondLink[] = (linksJson as any[]).map((l: any) => ({
              character_id: l.character_id,
              bond_id: l.bond_id,
            }));

            const potentials: Potential[] = (potentialsJson as any[]).map((p: any) => ({
              id: p.id,
              name: p.name,
              image_url: p.image_url,
              catalog_id: p.catalog_id,
              twoPiece: p.twoPiece ?? {},
              fourPiece: p.fourPiece ?? {},
              desc2: p.desc2 ?? "",
              desc4: p.desc4 ?? "",
            }));

            const memories: Memory[] = (memoriesJson as any[]).map((m: any) => ({
              id: m.id,
              name: m.name,
              positions: Array.isArray(m.positions) ? m.positions : [],
              bonus: m.bonus ?? {},
              desc: m.desc ?? "",
              image_url: m.image_url ?? m.img ?? "",
            }));

            set({
              allCharacters: formattedCharacters,
              allBonds: bonds,
              characterBondLinks: links,
              allPotentials: potentials,
              allMemories: memories,
              isLoading: false,
              hasLoadedData: true,
              fetchError: null,
            });
          } catch (error: unknown) {
            console.error("Erro ao carregar dados mock:", error);
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

        refreshBondsLanguage: async (_lang) => {
          try {
            const res = await fetch("/mock/bonds.json");
            if (res.ok) {
              const bondsJson = await res.json();
              const bonds: Bond[] = (bondsJson as any[]).map((b: any) => ({
                id: b.id,
                name: b.name ?? null,
                description: b.description ?? null,
              }));
              set({ allBonds: bonds });
            }
          } catch {}
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

          // ✅ Otimização: Cria Maps uma vez para lookup O(1) ao invés de includes() O(n)
          const teamIdsSet = new Set(
            Object.values(currentTeam)
              .filter(Boolean)
              .map((m) => m!.id)
          );

          // Cria um Map de character_id -> bond_ids para lookup rápido
          const characterBondMap = new Map<number, Set<number>>();
          characterBondLinks.forEach((link) => {
            if (!characterBondMap.has(link.character_id)) {
              characterBondMap.set(link.character_id, new Set());
            }
            characterBondMap.get(link.character_id)!.add(link.bond_id);
          });

          // Otimização adicional: cria map bond_id -> set de character_ids
          // Isso permite calcular sinergia rapidamente sem iterar toda a lista de links
          const bondToCharacters = new Map<number, Set<number>>();
          characterBondLinks.forEach((link) => {
            if (!bondToCharacters.has(link.bond_id)) {
              bondToCharacters.set(link.bond_id, new Set());
            }
            bondToCharacters.get(link.bond_id)!.add(link.character_id);
          });

          const calcSynergyScore = (char: Character): number => {
            const charBondIds = characterBondMap.get(char.id) || new Set();
            if (charBondIds.size === 0) return 0;

            // Para cada bond do personagem, conta quantos membros do time
            // também possuem esse bond. Usamos `bondToCharacters` para lookup O(1)
            // e iteramos sobre `teamIdsSet` (tipicamente pequeno).
            let synergyScore = 0;
            for (const bondId of charBondIds) {
              const members = bondToCharacters.get(bondId);
              if (!members) continue;
              for (const memberId of teamIdsSet) {
                if (members.has(memberId)) synergyScore++;
              }
            }

            return synergyScore;
          };

          const getCharacterScore = (
            char: Character,
            _team: TeamSlots
          ): number => {
            const rarityScore =
              rarityWeights[char.rarity as keyof typeof rarityWeights] || 0;
            const synergyScore = calcSynergyScore(char);
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

          // ✅ Otimização: Cria Set de IDs já no time para lookup O(1)
          const teamIdsInNewTeam = new Set(
            Object.values(newTeam)
              .filter(Boolean)
              .map((c) => c!.id)
          );

          // ✅ Otimização: Cria Map reverso de slot -> positions válidas
          const slotToPositionsMap = new Map<SlotKey, Set<Position>>();
          Object.entries(positionSlots).forEach(([pos, slots]) => {
            slots.forEach((slot) => {
              if (!slotToPositionsMap.has(slot)) {
                slotToPositionsMap.set(slot, new Set());
              }
              slotToPositionsMap.get(slot)!.add(pos as Position);
            });
          });

          for (const slotKey of Object.keys(newTeam) as SlotKey[]) {
            if (newTeam[slotKey]) continue;
            if (addedOfType >= requiredOfType) break;

            const isLiberoSlot = slotKey === "libero";
            const candidate = sortedPreferred.find((c) => {
              if (teamIdsInNewTeam.has(c.id)) return false;
              if (isLiberoSlot) return c.position === "L";

              if (!isJPMode) {
                const validPositions = slotToPositionsMap.get(slotKey);
                return validPositions?.has(c.position as Position) ?? false;
              } else if (c.position === "L") return false;

              return true;
            });

            if (candidate) {
              newTeam[slotKey] = candidate;
              teamIdsInNewTeam.add(candidate.id);
              addedOfType++;
            }
          }

          for (const slotKey of Object.keys(newTeam) as SlotKey[]) {
            if (newTeam[slotKey]) continue;

            const isLiberoSlot = slotKey === "libero";
            const availableCandidates = [...sortedOthers].filter((c) => {
              if (teamIdsInNewTeam.has(c.id)) return false;
              if (isLiberoSlot) return c.position === "L";

              if (!isJPMode) {
                const validPositions = slotToPositionsMap.get(slotKey);
                return validPositions?.has(c.position as Position) ?? false;
              } else if (c.position === "L") return false;

              return true;
            });

            if (availableCandidates.length > 0) {
              // ✅ Otimização: Encontra o melhor candidato sem ordenar toda a lista
              const bestCandidate = availableCandidates.reduce((best, current) => {
                const currentScore = getCharacterScore(current, newTeam);
                const bestScore = getCharacterScore(best, newTeam);
                return currentScore > bestScore ? current : best;
              });
              newTeam[slotKey] = bestCandidate;
              teamIdsInNewTeam.add(bestCandidate.id);
            }
          }

          const finalCounts = { quick: 0, power: 0, block: 0, receive: 0 };
          Object.values(newTeam).forEach((char) => {
            if (!char || !char.styles) return;

            const expectedDbKey =
              teamTypeToDbKey[targetType as RelevantStyleDisplay];
            if (char.styles.includes(expectedDbKey)) {
              finalCounts[expectedDbKey as keyof typeof finalCounts]++;
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
        skipHydration: true, // ✅ Evita hidratação automática que causa mismatch SSR/CSR
        partialize: (state) => ({
          allCharacters: state.allCharacters,
          allBonds: state.allBonds,
          characterBondLinks: state.characterBondLinks,
          allPotentials: state.allPotentials,
          allMemories: state.allMemories,
        }),
        // Normaliza imagens antigas armazenadas em localStorage (ex: "/imagens/..." -> "/images/...")
        onRehydrateStorage: () => (persistedState) => {
          if (!persistedState || !persistedState.allCharacters) return;
          try {
            persistedState.allCharacters = persistedState.allCharacters.map((c: any) => {
              if (c && typeof c.image_url === "string" && c.image_url.startsWith("/imagens/")) {
                return { ...c, image_url: c.image_url.replace("/imagens/", "/images/") };
              }
              return c;
            });
          } catch {}
        },
      }
    )
  );
