import {
    Bond,
    CalculatedBond,
    Character,
    CharacterBondLink,
    CharacterStatsBond,
    DbStyle,
    Memory,
    Potential,
    RelevantStyleDisplay,
    SlotKey,
    TeamSlots,
    TeamType
} from "@/types";
import { create, StoreApi, UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
// Dados passam a ser carregados 100% dos JSON em /public/mock
import { fetchAndValidate } from "@/app/lib/api";
import { BondSchema, CharacterBondLinkSchema, CharacterSchema, CharacterStatsBondSchema, MemorySchema, PotentialSchema } from "@/app/lib/schemas";
import z from "zod";
import { Lang } from "./useI18nStore";

export type CharacterStoreState = {
  allCharacters: Character[];
  allBonds: Bond[];
  characterBondLinks: CharacterBondLink[];
  characterStatsBondLinks: CharacterStatsBond[];
  activeBonds: CalculatedBond[];
  allPotentials: Potential[];
  allMemories: Memory[];
  isLoading: boolean;
  loadingBonds: boolean;
  fetchError: string | null;
  hasLoadedData: boolean;

  fetchInitialData: (force?: boolean) => Promise<void>;
  calculateBondsForTeam: (team: TeamSlots) => void;

  suggestTeam: (
    targetType: TeamType,
    currentTeam: TeamSlots
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
        characterStatsBondLinks: [],
        activeBonds: [],
        allPotentials: [],
        allMemories: [],
        isLoading: false,
        loadingBonds: false,
        fetchError: null,
        hasLoadedData: false,

        fetchInitialData: async (force = false) => {
          const { isLoading, hasLoadedData } = get();
          if (isLoading || (hasLoadedData && !force)) return;

          set({ isLoading: true, fetchError: null });

          try {
            const [
              charactersJson,
              bondsJson,
              linksJson,
              statsBondLinksJson,
              potentialsJson,
              memoriesJson,
            ] = await Promise.all([
              fetchAndValidate("/mock/characters.json", z.array(CharacterSchema)),
              fetchAndValidate("/mock/bonds.json", z.array(BondSchema)),
              fetchAndValidate("/mock/character_bonds.json", z.array(CharacterBondLinkSchema)),
              fetchAndValidate("/mock/character_stats_bonds.json", z.array(CharacterStatsBondSchema)),
              fetchAndValidate("/mock/potentials.json", z.array(PotentialSchema)),
              fetchAndValidate("/mock/memories.json", z.array(MemorySchema)),
            ]);

            const formattedCharacters: Character[] = charactersJson.map((c) => {
              // Se já tiver caminho completo local, usa ele. Se não, tenta construir.
              // Isso permite que o characters.json tenha "/images/characters_lg/..." ou "/images/characters/..."
              let localImageUrl = c.image_url;
              
              if (!localImageUrl || (!localImageUrl.startsWith("/images/") && !localImageUrl.startsWith("http"))) {
                  // Fallback para comportamento antigo se não tiver path
                const supabaseUrl: string | null = c.image_url ?? null;
                const fileName = typeof supabaseUrl === "string" ? supabaseUrl.split("/").pop() ?? null : null;
                localImageUrl = fileName ? `/images/characters_lg/${fileName}` : null;
            }

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
                recommended_stats: c.recommended_stats ?? null,
              };
            });

            const bonds: Bond[] = bondsJson.map((b) => ({
              id: b.id,
              name: b.name ?? null,
              description: b.description ?? null,
              is_team_bond: b.is_team_bond,
              participants: b.participants,
            }));

            const links: CharacterBondLink[] = linksJson.map((l) => ({
              character_id: l.character_id,
              bond_id: l.bond_id,
            }));

            const statsBondLinks: CharacterStatsBond[] = statsBondLinksJson.map((l) => ({
              id: l.id,
              stats_bond_id: l.stats_bond_id,
              character_id: l.character_id,
              buff_description: l.buff_description,
              created_at: l.created_at,
              stats_bond_name: l.stats_bond_name
            }));

            const potentials: Potential[] = potentialsJson.map((p) => ({
              id: p.id,
              name: p.name,
              image_url: p.image_url,
              catalog_id: p.catalog_id,
              twoPiece: p.twoPiece ?? {},
              fourPiece: p.fourPiece ?? {},
              desc2: p.desc2 ?? "",
              desc4: p.desc4 ?? "",
            }));

            const memories: Memory[] = memoriesJson.map((m) => ({
              id: m.id,
              name: m.name,
              positions: Array.isArray(m.positions) ? m.positions : [],
              bonus: m.bonus ?? {},
              desc: m.desc ?? "",
              image_url: m.image_url ?? (m as any).img ?? "",
            }));

            set({
              allCharacters: formattedCharacters,
              allBonds: bonds,
              characterBondLinks: links,
              characterStatsBondLinks: statsBondLinks,
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
            const bondsJson = await fetchAndValidate("/mock/bonds.json", z.array(BondSchema));
            const bonds: Bond[] = bondsJson.map((b) => ({
              id: b.id,
              name: b.name ?? null,
              description: b.description ?? null,
              is_team_bond: b.is_team_bond,
              participants: b.participants,
            }));
            set({ allBonds: bonds });
          } catch {}
        },

        calculateBondsForTeam: (team: TeamSlots) => {
          const { allBonds, characterBondLinks } = get();
          const teamIds = new Set(
            Object.values(team)
              .filter((c): c is Character => c !== null)
              .map((c) => c.id)
          );

          // Build a map of bond_id -> Set<character_id> from characterBondLinks
          const bondParticipantsMap = new Map<number, Set<number>>();
          characterBondLinks.forEach((link) => {
            if (!bondParticipantsMap.has(link.bond_id)) {
              bondParticipantsMap.set(link.bond_id, new Set());
            }
            bondParticipantsMap.get(link.bond_id)!.add(link.character_id);
          });

          const calculatedBonds: CalculatedBond[] = allBonds.map((bond) => {
             const participantsSet = bondParticipantsMap.get(bond.id) || new Set(bond.participants || []);
             const participants = Array.from(participantsSet);

             const totalRequired = participants.length;
             let currentCount = 0;
             participants.forEach(pid => {
                 if (teamIds.has(pid)) {
                     currentCount++;
                 }
             });

             const isActive = totalRequired > 0 && currentCount === totalRequired;
             const hasAnyMemberOnCourt = currentCount > 0;

             return {
                 id: bond.id,
                 name: bond.name,
                 description: bond.description,
                 totalRequired,
                 currentCount,
                 isActive,
                 hasAnyMemberOnCourt,
                 isTeamBond: bond.is_team_bond
             };
          });

          const relevantBonds = calculatedBonds.filter(b => b.hasAnyMemberOnCourt);
          
          relevantBonds.sort((a, b) => {
              if (a.isActive && !b.isActive) return -1;
              if (!a.isActive && b.isActive) return 1;
              const ratioA = a.totalRequired > 0 ? a.currentCount / a.totalRequired : 0;
              const ratioB = b.totalRequired > 0 ? b.currentCount / b.totalRequired : 0;
              return ratioB - ratioA;
          });

          set({ activeBonds: relevantBonds });
        },

        suggestTeam: (targetType, currentTeam) => {
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

          const newTeam = { ...currentTeam };
          const requiredOfType = requiredCounts[targetType];
          let addedOfType = 0;

          // ✅ Otimização: Cria Set de NOMES já no time para evitar duplicatas do mesmo personagem
          const teamNamesInNewTeam = new Set(
            Object.values(newTeam)
              .filter(Boolean)
              .map((c) => c!.name)
          );

          for (const slotKey of Object.keys(newTeam) as SlotKey[]) {
            if (newTeam[slotKey]) continue;
            if (addedOfType >= requiredOfType) break;

            const isLiberoSlot = slotKey === "libero";
            const candidate = sortedPreferred.find((c) => {
              if (teamNamesInNewTeam.has(c.name)) return false;
              if (isLiberoSlot) return c.position === "L";
              if (c.position === "L") return false;

              return true;
            });

            if (candidate) {
              newTeam[slotKey] = candidate;
              teamNamesInNewTeam.add(candidate.name);
              addedOfType++;
            }
          }

          for (const slotKey of Object.keys(newTeam) as SlotKey[]) {
            if (newTeam[slotKey]) continue;

            const isLiberoSlot = slotKey === "libero";
            const availableCandidates = [...sortedOthers].filter((c) => {
              if (teamNamesInNewTeam.has(c.name)) return false;
              if (isLiberoSlot) return c.position === "L";
              if (c.position === "L") return false;

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
              teamNamesInNewTeam.add(bestCandidate.name);
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
        version: 1, // Bump version to force re-fetch with new validation
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
