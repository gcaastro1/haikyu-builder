"use client";

import { useEffect, useMemo, useState } from "react";

import { CharacterCard } from "./components/CharacterCard";
import type {
  Character,
  CharacterWithDetails,
  Position,
  School,
} from "../../data/characters";
import { supabase } from "./lib/supabaseClient";
import { TeamCourt } from "./components/TeamCourt";
import { PositionFilter } from "./components/PositionFilter";
import { Bench } from "./components/Bench";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { SectionHeader } from "./components/SectionHeader";
import { RotateCw, Trash2 } from "lucide-react";
import { NameSearchInput } from "./components/NameSearchInput";
import { SchoolFilter } from "./components/SchoolFilter";
import { Bond, CharacterBondLink } from "@/types";
import { getAllCharacterBondLinks, getBonds } from "./lib/actions";
import { ActiveBondsDisplay } from "./ActiveBondsDisplay";

export type TeamSlots = {
  pos5_ws: Character | null;
  pos6_mb: Character | null;
  pos1_op: Character | null;
  pos4_ws: Character | null;
  pos3_mb: Character | null;
  pos2_s: Character | null;
  libero: Character | null;
};
const initialTeamState: TeamSlots = {
  pos5_ws: null,
  pos6_mb: null,
  pos1_op: null,
  pos4_ws: null,
  pos3_mb: null,
  pos2_s: null,
  libero: null,
};
export type SlotKey = keyof TeamSlots;
type ActiveDragData = {
  character: Character;
  type: "list" | "court" | "bench";
  [key: string]: unknown;
};
type OverDragData = {
  type: "court" | "bench";
  acceptedPosition?: Position;
  [key: string]: unknown;
};

export default function Home() {
  const [team, setTeam] = useState<TeamSlots>(initialTeamState);
  const [bench, setBench] = useState<(Character | null)[]>(Array(6).fill(null));
  const [positionFilter, setPositionFilter] = useState<Position | "ALL">("ALL");
  const [activeDragItem, setActiveDragItem] =
    useState<CharacterWithDetails | null>(null);
  const [isPositionFree, setIsPositionFree] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState<School | "ALL">("ALL");
  const [nameSearch, setNameSearch] = useState<string>("");

  const [allCharactersData, setAllCharactersData] = useState<
    CharacterWithDetails[]
  >([]);
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [allBonds, setAllBonds] = useState<Bond[]>([]); // Todos os vínculos disponíveis (ID, Nome, Desc)
  const [characterBondLinks, setCharacterBondLinks] = useState<
    CharacterBondLink[]
  >([]);
  const [loadingBondsData, setLoadingBondsData] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingCharacters(true);
      setLoadingBondsData(true);
      try {
        const [charactersResult, bondsResult, linksResult] = await Promise.all([
          supabase
            .from("Characters")
            .select("*")
            .order("name", { ascending: true }),
          getBonds(),
          getAllCharacterBondLinks(),
        ]);

        if (charactersResult.error) throw charactersResult.error;
        if (charactersResult.data) {
          const formattedData = charactersResult.data.map((char) => ({
            ...char,
            styles: Array.isArray(char.styles) ? char.styles : [],
            skills: Array.isArray(char.skills) ? char.skills : [],
            attributes:
              typeof char.attributes === "object" ? char.attributes : {},
          })) as Character[];
          setAllCharactersData(formattedData);
        } else {
          setAllCharactersData([]);
        }

        if (bondsResult.error) throw new Error(bondsResult.error);
        if (bondsResult.bonds) {
          setAllBonds(bondsResult.bonds);
        } else {
          setAllBonds([]);
        }

        if (linksResult.error) throw new Error(linksResult.error);
        if (linksResult.links) {
          setCharacterBondLinks(linksResult.links);
        } else {
          setCharacterBondLinks([]);
        }
      } catch (error: any) {
        console.error("Erro ao buscar dados iniciais:", error);
        setFetchError(
          `Erro ao carregar dados: ${error.message || "Erro desconhecido"}`
        );

        setAllCharactersData([]);
        setAllBonds([]);
        setCharacterBondLinks([]);
      } finally {
        setLoadingCharacters(false);
        setLoadingBondsData(false);
      }
    };
    fetchInitialData();
  }, []);

  const activeBonds = useMemo(() => {
    const currentActiveBonds: Bond[] = [];

    const charactersOnCourt = Object.values(team).filter(
      Boolean
    ) as Character[];

    if (
      charactersOnCourt.length === 0 ||
      allBonds.length === 0 ||
      characterBondLinks.length === 0
    ) {
      return currentActiveBonds;
    }

    const schoolCounts: Record<string, number> = {};
    charactersOnCourt.forEach((char) => {
      if (char.school) {
        schoolCounts[char.school] = (schoolCounts[char.school] || 0) + 1;
      }
    });

    Object.entries(schoolCounts).forEach(([schoolName, count]) => {
      if (count >= 4) {
        const schoolBond = allBonds.find((bond) => bond.name === schoolName);
        if (schoolBond) {
          currentActiveBonds.push(schoolBond);
        }
      }
    });

    const characterNamesOnCourt = new Set(
      charactersOnCourt.map((char) => char.name)
    );

    const nonSchoolBonds = allBonds.filter(
      (bond) => !Object.keys(schoolCounts).includes(bond.name || "")
    );

    nonSchoolBonds.forEach((bond) => {
      if (!bond || !bond.id) return;

      const requiredCharacterLinks = characterBondLinks.filter(
        (link) => link.bond_id === bond.id
      );
      if (requiredCharacterLinks.length === 0) return;

      const requiredCharacterNames = new Set<string>();
      requiredCharacterLinks.forEach((link) => {
        const charData = allCharactersData.find(
          (c) => c.id === link.character_id
        );
        if (charData?.name) {
          requiredCharacterNames.add(charData.name);
        }
      });

      if (requiredCharacterNames.size === 0) return;

      let allRequiredPresent = true;
      for (const reqName of requiredCharacterNames) {
        if (!characterNamesOnCourt.has(reqName)) {
          allRequiredPresent = false;
          break;
        }
      }

      if (allRequiredPresent) {
        currentActiveBonds.push(bond);
      }
    });

    return currentActiveBonds;
  }, [team, allBonds, characterBondLinks, allCharactersData]);

  const handlePositionModeChange = () => {
    const newMode = !isPositionFree;
    if (isPositionFree === true && newMode === false) {
      setTeam(initialTeamState);
    }
    setIsPositionFree(newMode);
  };
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.character) {
      setActiveDragItem(active.data.current.character);
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeData = active.data.current as ActiveDragData;
    const overData = over.data.current as OverDragData;
    const draggedCharacter = activeData.character;
    if (!draggedCharacter) return;
    const newTeam = { ...team };
    const newBench = [...bench];
    const allCurrentNames = [
      ...Object.values(newTeam)
        .filter(Boolean)
        .map((c) => c!.name),
      ...newBench.filter(Boolean).map((c) => c!.name),
    ];
    let charFromTargetSlot: Character | null = null;
    if (overData?.type === "court") {
      charFromTargetSlot = newTeam[overData.slotKey as SlotKey];
    } else if (overData?.type === "bench") {
      charFromTargetSlot = newBench[overData.index as number];
    }
    const isSubstituting = charFromTargetSlot?.name === draggedCharacter.name;
    if (allCurrentNames.includes(draggedCharacter.name) && !isSubstituting) {
      alert(
        `'${draggedCharacter.name}' já está no seu time. Você só pode substituir, arrastando esta versão sobre a que já está em jogo.`
      );
      return;
    }
    const targetIsCourt = overData?.type === "court";
    if (targetIsCourt) {
      const targetPosition = overData.acceptedPosition as Position;
      const targetSlotKey = overData.slotKey as SlotKey;
      if (targetSlotKey === "libero") {
        if (draggedCharacter.position !== "L") {
          alert("Apenas Líberos (L) podem ir para o slot de Líbero!");
          return;
        }
      } else if (isPositionFree) {
        if (draggedCharacter.position === "L") {
          alert("Líberos só podem ir para o slot de Líbero!");
          return;
        }
      } else {
        if (draggedCharacter.position !== targetPosition) {
          alert(
            `Este personagem (${draggedCharacter.position}) não pode ir para um slot de ${targetPosition}! (Modo Global)`
          );
          return;
        }
      }
    }
    if (overData?.type === "court") {
      newTeam[overData.slotKey as SlotKey] = draggedCharacter;
    } else if (overData?.type === "bench") {
      newBench[overData.index as number] = draggedCharacter;
    }
    if (activeData?.type === "court") {
      newTeam[activeData.slotKey as SlotKey] = isSubstituting
        ? null
        : charFromTargetSlot;
    } else if (activeData?.type === "bench") {
      newBench[activeData.index as number] = isSubstituting
        ? null
        : charFromTargetSlot;
    }
    setTeam(newTeam);
    setBench(newBench);
  };
  const handleRemoveFromCourt = (slotKey: SlotKey) => {
    setTeam((prevTeam) => ({ ...prevTeam, [slotKey]: null }));
  };
  const handleRemoveFromBench = (index: number) => {
    const newBench = [...bench];
    newBench[index] = null;
    setBench(newBench);
  };
  const courtCharacterNames = Object.values(team)
    .filter(Boolean)
    .map((char) => char!.name);
  const benchCharacterNames = bench.filter(Boolean).map((char) => char!.name);
  const teamCharacterNames = [...courtCharacterNames, ...benchCharacterNames];

  const filteredCharacters = allCharactersData.filter((character) => {
    if (positionFilter !== "ALL" && character.position !== positionFilter) {
      return false;
    }

    if (schoolFilter !== "ALL" && character.school !== schoolFilter) {
      return false;
    }

    if (
      nameSearch &&
      !character.name.toLowerCase().includes(nameSearch.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const handleRotateTeam = () => {
    console.log("Botão Rotacionar Clicado!");

    setTeam((currentTeam) => {
      console.log("Time Atual (Antes de Rotacionar):", currentTeam);

      const rotatedTeam: TeamSlots = {
        pos3_mb: currentTeam.pos2_s,
        pos4_ws: currentTeam.pos3_mb,
        pos1_op: currentTeam.pos4_ws,
        pos6_mb: currentTeam.pos1_op,
        pos5_ws: currentTeam.pos6_mb,
        pos2_s: currentTeam.pos5_ws,
        libero: currentTeam.libero,
      };

      console.log("Time Rotacionado (Depois de Calcular):", rotatedTeam);
      return rotatedTeam;
    });
  };

  const handleClearTeam = () => {
    if (window.confirm("Tem certeza que deseja limpar o time e o banco?")) {
      setTeam(initialTeamState);
      setBench(Array(6).fill(null));
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <main className="max-w-full mx-auto p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          <section className="lg:w-3/5 flex flex-col">
            <div className="w-full max-w-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <SectionHeader titleBold="Seu" titleRegular="Time" />
              <label
                htmlFor="positionToggle"
                className="flex items-center cursor-pointer self-center sm:self-auto"
              >
                <span className="mr-3 text-sm font-medium text-gray-300">
                  Modo JP (Livre)
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    id="positionToggle"
                    className="sr-only"
                    checked={isPositionFree}
                    onChange={handlePositionModeChange}
                  />
                  <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                      isPositionFree ? "translate-x-6 bg-sky-400" : ""
                    }`}
                  ></div>
                </div>
              </label>
            </div>
            <TeamCourt
              team={team}
              onRemoveCharacter={handleRemoveFromCourt}
              onSlotClick={setPositionFilter}
              isPositionFree={isPositionFree}
            />
            <div className="flex items-center gap-4 my-4">
              <button
                onClick={handleRotateTeam}
                className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors w-fit"
                title="Rotacionar Time (Sentido Horário)"
              >
                <RotateCw size={18} />
              </button>

              <button
                onClick={handleClearTeam}
                className="p-2 bg-red-900 hover:bg-red-700 text-white rounded-full transition-colors w-fit"
                title="Limpar Time e Banco"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <ActiveBondsDisplay bonds={activeBonds} loading={loadingBondsData} />

            <Bench bench={bench} onRemoveFromBench={handleRemoveFromBench} />
          </section>

          <section
            className="mt-16 lg:mt-0 lg:w-2/5 lg:top-24 lg:self-start 
                              bg-zinc-950 p-4 rounded-lg shadow-inner border border-gray-700
                              flex flex-col h-[calc(100vh-6rem)]"
          >
            <SectionHeader titleBold="Personagens" titleRegular="Disponíveis" />

            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-1/2">
                  <NameSearchInput
                    value={nameSearch}
                    onChange={setNameSearch}
                  />
                </div>
                <div className="sm:w-1/2">
                  <SchoolFilter
                    activeFilter={schoolFilter}
                    onFilterChange={setSchoolFilter}
                  />
                </div>
              </div>

              <div>
                <PositionFilter
                  activeFilter={positionFilter}
                  onFilterChange={setPositionFilter}
                />
              </div>
            </div>

            <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(theme(width.28),1fr))] 
                                place-items-center p-2 
                                overflow-y-auto flex-grow 
                                custom-scrollbar">
                    
                {loadingCharacters && <p className="col-span-full text-center text-gray-400 w-full">Carregando...</p>} 
                {fetchError && <p className="col-span-full text-center text-red-500 w-full">{fetchError}</p>}
                {!loadingCharacters && !fetchError && filteredCharacters.length === 0 && (
                    <p className="col-span-full text-center text-gray-500 w-full">Nenhum personagem encontrado...</p>
                )}

                {!loadingCharacters && !fetchError && filteredCharacters.map((char) => {
                    const isDisabled = teamCharacterNames.includes(char.name);
                    const dragId = `list-${char.id}`;
                    return (
                        <CharacterCard 
                            key={dragId} 
                            dragId={dragId} 
                            character={char}
                            isDisabled={isDisabled} 
                            dragData={{ type: 'list', character: char }}
                            size="small"
                            originType="list"
                        />
                    );
                })}
            </div>
          </section>
        </div>
      </main>

      <DragOverlay>
        {activeDragItem ? (
          <CharacterCard
            character={activeDragItem}
            dragId="overlay-item"
            dragData={{ type: "overlay", character: activeDragItem }}
            size="small"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
