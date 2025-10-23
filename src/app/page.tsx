"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { shallow } from 'zustand/shallow';

import { CharacterCard } from "./components/CharacterCard";
import { TeamCourt } from "./components/TeamCourt";
import { Bench } from "./components/Bench";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { SectionHeader } from "./components/SectionHeader";
import { Save, Trash2, List, RotateCw } from "lucide-react";
import {
  Character,
  Position,
  ExportedTeam,
  SavedTeam,
  dbStyleToTeamTypeMap,
  DbStyle,
  TeamType,
  StyleCounts,
  DoubleClickOrigin,
  TeamSlots, 
  SlotKey,   
} from "@/types";
import { ActiveBondsDisplay } from "./components/ActiveBondsDisplay";
import { SavedTeamsModal } from "./components/SavedTeamsModal";
import { CharacterSelectionModal } from "./components/CharacterSelectorModal";
import { TeamTypeDisplay } from "./components/TeamDisplay";

import { useCharacterStore } from "@/stores/useCharacterStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { useSavedTeamsStore } from "@/stores/useSavedTeamsStore";
import { useUIStore } from "@/stores/useUIStore";


const initialTeamState: TeamSlots = {
  pos5_ws: null,
  pos6_mb: null,
  pos1_op: null,
  pos4_ws: null,
  pos3_mb: null,
  pos2_s: null,
  libero: null,
};

const acceptedPosition: Record<Exclude<SlotKey, "libero">, Position> = {
  pos2_s: "S",
  pos3_mb: "MB",
  pos4_ws: "WS",
  pos1_op: "OP",
  pos6_mb: "MB",
  pos5_ws: "WS",
};

type ActiveDragData = {
  character: Character;
  type: "list" | "court" | "bench";
  [key: string]: any;
};

type OverDragData = {
  type: "court" | "bench" | "list";
  acceptedPosition?: Position;
  [key: string]: any;
};

export default function Home() {

  const allCharacters = useCharacterStore((s) => s.allCharacters);
  const allBonds = useCharacterStore((s) => s.allBonds);
  const characterBondLinks = useCharacterStore((s) => s.characterBondLinks);
  const isLoading = useCharacterStore((s) => s.isLoading);

  const team = useTeamStore((s) => s.team);
  const bench = useTeamStore((s) => s.bench);
  const isPositionFree = useTeamStore((s) => s.isPositionFree);

  const isTeamsModalOpen = useUIStore((s) => s.isTeamsModalOpen);
  const isSelectionModalOpen = useUIStore((s) => s.isSelectionModalOpen); 
  const targetSlotIdentifier = useUIStore((s) => s.targetSlotIdentifier);
  const feedbackMessage = useUIStore((s) => s.feedbackMessage);

  const savedTeamsList = useSavedTeamsStore((s) => s.savedTeamsList);

  const fetchInitialData = useCharacterStore((s) => s.fetchInitialData);
  const {
    togglePositionMode,
    rotateTeam,
    clearTeam,
    setTeam,
    setBench,
    removeFromCourt,
    removeFromBench,
    setCharacterInSlot,
  } = useTeamStore();
  const { showFeedback, openTeamsModal, openSelectionModal, closeModals } =
    useUIStore();
  const { loadFromStorage, saveCurrentTeam, loadTeam, deleteTeam } =
    useSavedTeamsStore();


  const [activeDragItem, setActiveDragItem] = useState<Character | null>(null);
  const [importKey, setImportKey] = useState("");


  useEffect(() => {
    fetchInitialData();
    loadFromStorage();
  }, [fetchInitialData, loadFromStorage]);

  // --- 5. LÓGICA DERIVADA (useMemo) ---

  const { calculatedTeamType, styleCounts } = useMemo(() => {
    // ... (Lógica de cálculo idêntica à original, sem alterações) ...
    const charactersOnCourtIncludingLibero = Object.values(team).filter(
      Boolean
    ) as Character[];
    let finalTeamType: TeamType = "Nenhum";
    const currentStyleCounts: StyleCounts = {
      "Ataque Rápido": 0, Potente: 0, Bloqueio: 0, Recepção: 0,
    };
    if (!isPositionFree) {
      const setter = team.pos2_s;
      if (setter?.styles) {
        for (const style of setter.styles as DbStyle[]) {
          const mappedType = dbStyleToTeamTypeMap[style];
          if (mappedType) {
            finalTeamType = mappedType;
            break;
          }
        }
      }
      charactersOnCourtIncludingLibero.forEach((char) => {
        if (char.styles) {
          (char.styles as DbStyle[]).forEach((style) => {
            const mappedType = dbStyleToTeamTypeMap[style];
            if (mappedType) currentStyleCounts[mappedType]++;
          });
        }
      });
    } else {
      if (charactersOnCourtIncludingLibero.length > 0) {
        charactersOnCourtIncludingLibero.forEach((char) => {
          if (char.styles) {
            (char.styles as DbStyle[]).forEach((style) => {
              const mappedType = dbStyleToTeamTypeMap[style];
              if (mappedType) currentStyleCounts[mappedType]++;
            });
          }
        });

        if (currentStyleCounts["Recepção"] >= 5) finalTeamType = "Recepção";
        else if (currentStyleCounts["Bloqueio"] >= 4)
          finalTeamType = "Bloqueio";
        else if (currentStyleCounts["Potente"] >= 4) finalTeamType = "Potente";
        else if (currentStyleCounts["Ataque Rápido"] >= 4)
          finalTeamType = "Ataque Rápido";
      }
    }
    return {
      calculatedTeamType: finalTeamType,
      styleCounts: currentStyleCounts,
    };
  }, [team, isPositionFree]);

  const activeBonds = useMemo(() => {
    // ... (Lógica de cálculo idêntica à original, sem alterações) ...
    const currentActiveBonds: Bond[] = [];
    const charactersOnCourt = Object.values(team).filter(
      Boolean
    ) as Character[];
    if (
      charactersOnCourt.length === 0 ||
      allBonds.length === 0 ||
      characterBondLinks.length === 0
    )
      return currentActiveBonds;
    const schoolCounts: Record<string, number> = {};
    charactersOnCourt.forEach((char) => {
      if (char.school)
        schoolCounts[char.school] = (schoolCounts[char.school] || 0) + 1;
    });
    Object.entries(schoolCounts).forEach(([schoolName, count]) => {
      if (count >= 4) {
        const schoolBond = allBonds.find((bond) => bond.name === schoolName);
        if (schoolBond) currentActiveBonds.push(schoolBond);
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
        const charData = allCharacters.find(
          (c) => c.id === link.character_id
        );
        if (charData?.name) requiredCharacterNames.add(charData.name);
      });
      if (requiredCharacterNames.size === 0) return;
      let allRequiredPresent = true;
      for (const reqName of requiredCharacterNames) {
        if (!characterNamesOnCourt.has(reqName)) {
          allRequiredPresent = false;
          break;
        }
      }
      if (allRequiredPresent) currentActiveBonds.push(bond);
    });
    return currentActiveBonds;
  }, [team, allBonds, characterBondLinks, allCharacters]);

  const teamCharacterNames = useMemo(() => {
    const courtNames = Object.values(team)
      .filter(Boolean)
      .map((char) => char!.name);
    const benchNames = bench.filter(Boolean).map((char) => char!.name);
    return new Set([...courtNames, ...benchNames]);
  }, [team, bench]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.character) {
      setActiveDragItem(active.data.current.character as Character);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragItem(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeData = active.data.current as ActiveDragData;
      const overData = over.data.current as OverDragData;
      const draggedCharacter = activeData.character;
      if (!draggedCharacter) return;

      const newTeam = { ...team };
      const newBench = [...bench];

      let charFromTargetSlot: Character | null = null;
      if (overData?.type === "court")
        charFromTargetSlot = team[overData.slotKey as SlotKey];
      else if (overData?.type === "bench")
        charFromTargetSlot = bench[overData.index as number];
      const isSubstituting = charFromTargetSlot?.name === draggedCharacter.name;

      if (teamCharacterNames.has(draggedCharacter.name) && !isSubstituting) {
        showFeedback(
          `'${draggedCharacter.name}' já está no time. Só pode substituir.`,
          "error"
        );
        return;
      }
      
      const targetIsCourt = overData?.type === "court";
      if (targetIsCourt) {
        const targetPosition = overData.acceptedPosition as Position;
        const targetSlotKey = overData.slotKey as SlotKey;
        if (targetSlotKey === "libero" && draggedCharacter.position !== "L") {
          showFeedback(
            "Apenas Líberos (L) podem ir para o slot de Líbero!",
            "error"
          );
          return;
        }
        if (
          isPositionFree &&
          targetSlotKey !== "libero" &&
          draggedCharacter.position === "L"
        ) {
          showFeedback("Líberos só podem ir para o slot de Líbero!", "error");
          return;
        }
        if (
          !isPositionFree &&
          targetSlotKey !== "libero" &&
          draggedCharacter.position !== targetPosition
        ) {
          showFeedback(
            `Personagem (${draggedCharacter.position}) não pode ir para slot ${targetPosition}! (Modo Global)`,
            "error"
          );
          return;
        }
      }

      if (overData?.type === "court")
        newTeam[overData.slotKey as SlotKey] = draggedCharacter;
      else if (overData?.type === "bench")
        newBench[overData.index as number] = draggedCharacter;

      if (activeData?.type === "court")
        newTeam[activeData.slotKey as SlotKey] = isSubstituting
          ? null
          : charFromTargetSlot;
      else if (activeData?.type === "bench")
        newBench[activeData.index as number] = isSubstituting
          ? null
          : charFromTargetSlot;

      setTeam(newTeam);
      setBench(newBench);
    },
    [team, bench, isPositionFree, showFeedback, teamCharacterNames, setTeam, setBench]
  );

  const handleRotate = useCallback(() => {
    rotateTeam();
    showFeedback("Time rotacionado!");
  }, [rotateTeam, showFeedback]);

  const handleClear = useCallback(() => {
    if (window.confirm("Limpar a quadra e o banco?")) {
      clearTeam();
      showFeedback("Time limpo.");
    }
  }, [clearTeam, showFeedback]);

  const handleSave = useCallback(() => {
    const teamName = prompt("Digite um nome para este time:");
    if (!teamName || teamName.trim() === "") {
      showFeedback("Nome inválido ou cancelado.", "error");
      return;
    }
    saveCurrentTeam(teamName);
    showFeedback(`Time "${teamName}" salvo!`);
  }, [saveCurrentTeam, showFeedback]);

  const handleLoadTeam = useCallback(
    (teamToLoad: SavedTeam) => {
      if (
        window.confirm(
          `Carregar o time "${teamToLoad.name}"? As alterações atuais serão perdidas.`
        )
      ) {
        const success = loadTeam(teamToLoad);
        if (success) {
          closeModals();
          showFeedback(`Time "${teamToLoad.name}" carregado.`);
        } else {
          showFeedback("Dados corrompidos.", "error");
        }
      }
    },
    [loadTeam, closeModals, showFeedback]
  );

  const handleDeleteTeam = useCallback(
    (indexToDelete: number) => {
      const teamToDelete = savedTeamsList[indexToDelete];
      if (window.confirm(`Excluir o time "${teamToDelete.name}"?`)) {
        deleteTeam(indexToDelete);
        showFeedback(`Time "${teamToDelete.name}" excluído.`);
      }
    },
    [savedTeamsList, deleteTeam, showFeedback]
  );

  const handleExportTeam = useCallback(
    (teamToExport: SavedTeam): string | null => {
      try {
        const exportedData: ExportedTeam = { c: {}, b: [] };
        for (const key in teamToExport.court) {
          const typedKey = key as SlotKey;
          exportedData.c[typedKey] = teamToExport.court[typedKey]?.id ?? null;
        }
        exportedData.b = teamToExport.bench.map((char) => char?.id ?? null);
        const jsonString = JSON.stringify(exportedData);
        return btoa(jsonString);
      } catch (error) {
        showFeedback("Erro ao gerar chave.", "error");
        return null;
      }
    },
    [showFeedback]
  );

  const handleImportTeam = useCallback(async () => {
    if (!importKey || importKey.trim() === "") {
      showFeedback("Cole a chave.", "error");
      return;
    }
    try {
      const jsonString = atob(importKey.trim());
      const importedData = JSON.parse(jsonString) as ExportedTeam;
      if (
        !importedData ||
        typeof importedData.c !== "object" ||
        !Array.isArray(importedData.b)
      ) {
        throw new Error("Formato inválido.");
      }

      const newTeam: TeamSlots = { ...initialTeamState };
      const newBench: (Character | null)[] = Array(6).fill(null);
      let foundAll = true;
      const missingChars: string[] = [];

      for (const key in importedData.c) {
        const typedKey = key as SlotKey;
        const charId = importedData.c[typedKey];
        if (charId != null) {
          const foundChar = allCharacters.find((c) => c.id === charId);
          if (foundChar) {
            newTeam[typedKey] = foundChar;
          } else {
            foundAll = false;
            newTeam[typedKey] = null;
            missingChars.push(`ID ${charId} (slot ${typedKey})`);
          }
        } else {
          newTeam[typedKey] = null;
        }
      }

      importedData.b.forEach((charId, index) => {
        if (charId != null && index < 6) {
          const foundChar = allCharacters.find((c) => c.id === charId);
          if (foundChar) {
            newBench[index] = foundChar;
          } else {
            foundAll = false;
            newBench[index] = null;
            missingChars.push(`ID ${charId} (banco ${index})`);
          }
        } else if (index < 6) {
          newBench[index] = null;
        }
      });

      setTeam(newTeam);
      setBench(newBench);
      setImportKey("");

      const teamName = prompt(
        `Time importado ${
          foundAll ? "" : "(com ressalvas)"
        }! Digite um nome para salvá-lo (ou cancele):`
      );
      if (teamName && teamName.trim() !== "") {
        saveCurrentTeam(teamName);
        showFeedback(`Time "${teamName}" importado e salvo!`);
        if (!foundAll)
          console.warn(
            "Personagens não encontrados durante importação:",
            missingChars
          );
      } else {
        showFeedback(
          foundAll
            ? "Time importado!"
            : "Time importado (alguns personagens não encontrados). Não foi salvo.",
          foundAll ? "success" : "error"
        );
        if (!foundAll)
          console.warn("Personagens não encontrados:", missingChars);
      }
      closeModals();
    } catch (error: any) {
      showFeedback(
        `Erro ao importar: ${error.message || "Chave inválida."}`,
        "error"
      );
    }
  }, [
    importKey,
    allCharacters,
    showFeedback,
    setTeam,
    setBench,
    saveCurrentTeam,
    closeModals,
  ]);

  const handleSelectCharacterFromModal = useCallback(
    (selectedCharacter: Character) => {
      if (!targetSlotIdentifier) return;

      const [origin, keyOrIndex] = targetSlotIdentifier.split("-");

      if (origin === "court") {
        const slotKey = keyOrIndex as SlotKey;

        const slotAcceptedPosition =
          slotKey === "libero"
            ? "L"
            : acceptedPosition[slotKey as Exclude<SlotKey, "libero">];
        
        if (
          !isPositionFree &&
          selectedCharacter.position !== slotAcceptedPosition
        ) {
          showFeedback(
            `Seleção inválida: ${selectedCharacter.position} não pode ir para ${slotAcceptedPosition}.`,
            "error"
          );
          return;
        }
        if (slotKey !== "libero" && selectedCharacter.position === "L") {
          showFeedback("Líbero só pode ir para o slot de Líbero.", "error");
          return;
        }
        if (slotKey === "libero" && selectedCharacter.position !== "L") {
          showFeedback(
            "Apenas Líberos podem ir para o slot de Líbero.",
            "error"
          );
          return;
        }
      }
      
      setCharacterInSlot(targetSlotIdentifier, selectedCharacter);
      
      showFeedback(
        `${selectedCharacter.name} selecionado para ${targetSlotIdentifier}.`
      );
      closeModals();
    },
    [targetSlotIdentifier, isPositionFree, showFeedback, setCharacterInSlot, closeModals]
  );

  const findCourtSlotForDoubleClick = useCallback(
    (
      character: Character,
      currentTeam: TeamSlots,
      isFreeMode: boolean
    ): SlotKey | null => {
      const { position } = character;

      if (position === "L") {
        return currentTeam.libero === null ? "libero" : null;
      }

      if (isFreeMode) {
        const courtKeys: SlotKey[] = [
          "pos2_s", "pos3_mb", "pos4_ws", "pos5_ws", "pos6_mb", "pos1_op",
        ];
        for (const key of courtKeys) {
          if (currentTeam[key] === null) {
            if (character.position !== "L") {
              return key;
            } else {
              return null;
            }
          }
        }
        return null;
      } else {
        if (character.position === "L") return null;

        switch (position) {
          case "WS":
            if (currentTeam.pos4_ws === null) return "pos4_ws";
            if (currentTeam.pos5_ws === null) return "pos5_ws";
            return null;
          case "MB":
            if (currentTeam.pos3_mb === null) return "pos3_mb";
            if (currentTeam.pos6_mb === null) return "pos6_mb";
            return null;
          case "S":
            return currentTeam.pos2_s === null ? "pos2_s" : null;
          case "OP":
            return currentTeam.pos1_op === null ? "pos1_op" : null;
          default:
            return null;
        }
      }
    },
    []
  );

  const handleDoubleClickCharacter = useCallback(
    (
      character: Character,
      origin: DoubleClickOrigin,
      originKey?: SlotKey | number
    ) => {
      if (origin === "list") {
        if (teamCharacterNames.has(character.name)) {
          showFeedback(
            `'${character.name}' já está no time ou banco.`,
            "error"
          );
          return;
        }

        let added = false;
        const targetSlotKey = findCourtSlotForDoubleClick(
          character,
          team,
          isPositionFree
        );
        
        if (targetSlotKey) {
          setTeam({ ...team, [targetSlotKey]: character }); 
          showFeedback(`${character.name} adicionado à quadra.`);
          added = true;
        }

        if (!added) {
          const firstEmptyBenchSlot = bench.findIndex((slot) => slot === null);
          if (firstEmptyBenchSlot !== -1) {
            const newB = [...bench];
            newB[firstEmptyBenchSlot] = character;
            setBench(newB); 
            showFeedback(`${character.name} adicionado ao banco.`);
            added = true;
          }
        }

        if (!added) {
          showFeedback("Time e banco estão cheios!", "error");
        }
      } else if (origin === "court" && typeof originKey === "string") {
        removeFromCourt(originKey as SlotKey); 
        showFeedback(`${character.name} removido da quadra.`);
      } else if (origin === "bench" && typeof originKey === "number") {
        const targetSlotKey = findCourtSlotForDoubleClick(
          character,
          team,
          isPositionFree
        );
        if (targetSlotKey) {
          setTeam({ ...team, [targetSlotKey]: character }); 
          removeFromBench(originKey); 
          showFeedback(`${character.name} movido do banco para a quadra.`);
        } else {
          removeFromBench(originKey); 
          showFeedback(
            `${character.name} removido do banco (sem espaço na quadra).`
          );
        }
      }
    },
    [team, bench, isPositionFree, findCourtSlotForDoubleClick, showFeedback, teamCharacterNames, setTeam, setBench, removeFromCourt]
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 text-white">
        Carregando dados...
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          <section className="lg:w-3/5 flex flex-col items-center">
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
                    onChange={togglePositionMode}
                  />
                  <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                      isPositionFree ? "translate-x-6 bg-orange-500" : ""
                    }`}
                  ></div>
                </div>
              </label>
            </div>

            <div className="w-full max-w-xl mx-auto">
              <TeamTypeDisplay
                teamType={calculatedTeamType}
                styleCounts={styleCounts}
              />
            </div>

            <TeamCourt
              team={team}
              onRemoveCharacter={removeFromCourt}
              onSlotClick={() => {}} // Esta prop não é mais necessária
              isPositionFree={isPositionFree}
              onOpenSelector={openSelectionModal}
            />

            <div className="flex items-center justify-center flex-wrap gap-3 my-4 w-full max-w-xl">
              <button
                onClick={handleRotate}
                className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors w-fit"
                title="Rotacionar Time"
              >
                <RotateCw size={18} />
              </button>
              <button
                onClick={handleClear}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors w-fit"
                title="Limpar Time e Banco"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm"
              >
                <Save size={16} /> Salvar
              </button>
              <button
                onClick={openTeamsModal}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm"
                title="Gerenciar Times Salvos"
              >
                <List size={16} /> Gerenciar
              </button>
            </div>

            <ActiveBondsDisplay
              bonds={activeBonds}
              loading={isLoading}
            />

            <Bench
              bench={bench}
              onRemoveFromBench={removeFromBench}
              onOpenSelector={openSelectionModal} // Passando a prop para o Bench
            />
          </section>
        </div>
      </main>

      {/* --- MODAIS --- */}

      <SavedTeamsModal
        isOpen={isTeamsModalOpen}
        onClose={closeModals}
        savedTeams={savedTeamsList}
        onLoadTeam={handleLoadTeam}
        onDeleteTeam={handleDeleteTeam}
        onExportTeam={handleExportTeam}
        importKey={importKey}
        setImportKey={setImportKey}
        onImportTeam={handleImportTeam}
        feedbackMessage={feedbackMessage}
      />

      <CharacterSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={closeModals}
        onSelectCharacter={handleSelectCharacterFromModal}
        currentTeamNames={teamCharacterNames}
      />

      <DragOverlay>
        {activeDragItem ? (
          <CharacterCard
            character={activeDragItem}
            dragId="overlay-item"
            dragData={{}}
            originType="list"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}