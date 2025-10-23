"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CharacterCard } from "./components/CharacterCard";
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
import { Save, Trash2, List, RotateCw } from "lucide-react";
import { NameSearchInput } from "./components/NameSearchInput";
import { SchoolFilter } from "./components/SchoolFilter";

import {
  Character,
  Position,
  School,
  Bond,
  CharacterBondLink,
  ExportedTeam,
  SavedTeam,
  dbStyleToTeamTypeMap,
  DbStyle,
  TeamType,
  StyleCounts,
  DoubleClickOrigin,
} from "@/types";
import { getAllCharacterBondLinks, getBonds } from "./lib/actions";
import { ActiveBondsDisplay } from "./components/ActiveBondsDisplay";
import { SavedTeamsModal } from "./components/SavedTeamsModal";
import { TeamTypeDisplay } from "./components/TeamDisplay";

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
  [key: string]: any;
};

type OverDragData = {
  type: "court" | "bench" | "list";
  acceptedPosition?: Position;
  [key: string]: any;
};

const LOCAL_STORAGE_KEY = "haikyuBuilderSavedTeams";

export default function Home() {
  const [team, setTeam] = useState<TeamSlots>(initialTeamState);
  const [bench, setBench] = useState<(Character | null)[]>(Array(6).fill(null));
  const [allCharactersData, setAllCharactersData] = useState<Character[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [positionFilter, setPositionFilter] = useState<Position | "ALL">("ALL");
  const [schoolFilter, setSchoolFilter] = useState<School | "ALL">("ALL");
  const [nameSearch, setNameSearch] = useState<string>("");
  const [activeDragItem, setActiveDragItem] = useState<Character | null>(null);
  const [isPositionFree, setIsPositionFree] = useState(false);
  const [allBonds, setAllBonds] = useState<Bond[]>([]);
  const [characterBondLinks, setCharacterBondLinks] = useState<
    CharacterBondLink[]
  >([]);
  const [loadingBondsData, setLoadingBondsData] = useState(true);
  const [savedTeamsList, setSavedTeamsList] = useState<SavedTeam[]>([]);
  const [importKey, setImportKey] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);

  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [targetSlotIdentifier, setTargetSlotIdentifier] = useState<
    string | null
  >(null);

  const showFeedback = useCallback(
    (text: string, type: "success" | "error" = "success") => {
      setFeedbackMessage({ type, text });
      const timer = setTimeout(() => setFeedbackMessage(null), 3000);
      return () => clearTimeout(timer);
    },
    []
  );

  useEffect(() => {
    try {
      const storedTeams = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTeams) {
        setSavedTeamsList(JSON.parse(storedTeams));
      }
    } catch (error) {
      console.error("Erro ao carregar times salvos:", error);
      setSavedTeamsList([]);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingCharacters(true);
      setLoadingBondsData(true);
      setFetchError(null);
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
          const formattedData = charactersResult.data.map((char: any) => ({
            ...char,
            styles: Array.isArray(char.styles)
              ? char.styles
              : typeof char.styles === "string"
              ? JSON.parse(char.styles)
              : [],
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

  const handleOpenSelectionModal = useCallback((slotIdentifier: string) => {
    console.log("Abrindo modal para slot:", slotIdentifier); // Debug
    setTargetSlotIdentifier(slotIdentifier);
    setIsSelectionModalOpen(true);
  }, []);

  const handleCloseSelectionModal = useCallback(() => {
    setIsSelectionModalOpen(false);
    setTargetSlotIdentifier(null);
  }, []);

  const handleSelectCharacterFromModal = useCallback(
    (selectedCharacter: Character) => {
      if (!targetSlotIdentifier) return; // Segurança

      console.log(
        "Personagem selecionado:",
        selectedCharacter.name,
        "para slot:",
        targetSlotIdentifier
      ); // Debug

      const [origin, keyOrIndex] = targetSlotIdentifier.split("-"); // Ex: ['court', 'pos2_s'] ou ['bench', '0']

      if (origin === "court") {
        const slotKey = keyOrIndex as SlotKey;
        const acceptedPosition =
          slotKey === "libero"
            ? "L"
            : acceptedPosition[slotKey as Exclude<SlotKey, "libero">];
        if (
          !isPositionFree &&
          selectedCharacter.position !== acceptedPosition
        ) {
          showFeedback(
            `Seleção inválida: ${selectedCharacter.position} não pode ir para ${acceptedPosition}.`,
            "error"
          );
          return; // Impede a seleção
        }
        // Validação de Líbero (em qualquer modo)
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
        setTeam((prev) => ({ ...prev, [slotKey]: selectedCharacter }));
      } else if (origin === "bench") {
        const index = parseInt(keyOrIndex, 10);
        if (!isNaN(index) && index >= 0 && index < 6) {
          setBench((prev) => {
            const newB = [...prev];
            newB[index] = selectedCharacter;
            return newB;
          });
        }
      }
      showFeedback(
        `${selectedCharacter.name} selecionado para ${targetSlotIdentifier}.`
      );
    },
    [targetSlotIdentifier, isPositionFree, showFeedback]
  );

  const { calculatedTeamType, styleCounts } = useMemo(() => {
    const charactersOnCourtIncludingLibero = Object.values(team).filter(
      Boolean
    ) as Character[];

    let finalTeamType: TeamType = "Nenhum";
    const currentStyleCounts: StyleCounts = {
      "Ataque Rápido": 0,
      Potente: 0,
      Bloqueio: 0,
      Recepção: 0,
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

  const handlePositionModeChange = useCallback(() => {
    const newMode = !isPositionFree;
    if (isPositionFree === true && newMode === false) {
      setTeam(initialTeamState);
    }
    setIsPositionFree(newMode);
  }, [isPositionFree]);

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

      const allCurrentNames = [
        ...Object.values(team)
          .filter(Boolean)
          .map((c) => c!.name),
        ...bench.filter(Boolean).map((c) => c!.name),
      ];
      let charFromTargetSlot: Character | null = null;
      if (overData?.type === "court")
        charFromTargetSlot = team[overData.slotKey as SlotKey];
      else if (overData?.type === "bench")
        charFromTargetSlot = bench[overData.index as number];
      const isSubstituting = charFromTargetSlot?.name === draggedCharacter.name;

      if (allCurrentNames.includes(draggedCharacter.name) && !isSubstituting) {
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
    [team, bench, isPositionFree, showFeedback]
  );

  const handleRemoveFromCourt = useCallback((slotKey: SlotKey) => {
    setTeam((prevTeam) => ({ ...prevTeam, [slotKey]: null }));
  }, []);

  const handleRemoveFromBench = useCallback((index: number) => {
    setBench((prevBench) => {
      const newBench = [...prevBench];
      newBench[index] = null;
      return newBench;
    });
  }, []);

  const handleRotateTeam = useCallback(() => {
    setTeam((currentTeam) => {
      const rotatedTeam: TeamSlots = {
        pos3_mb: currentTeam.pos2_s,
        pos4_ws: currentTeam.pos3_mb,
        pos1_op: currentTeam.pos4_ws,
        pos6_mb: currentTeam.pos1_op,
        pos5_ws: currentTeam.pos6_mb,
        pos2_s: currentTeam.pos5_ws,
        libero: currentTeam.libero,
      };
      return rotatedTeam;
    });
    showFeedback("Time rotacionado!");
  }, [showFeedback]);

  const handleClearTeam = useCallback(() => {
    if (window.confirm("Limpar a quadra e o banco?")) {
      setTeam(initialTeamState);
      setBench(Array(6).fill(null));
      showFeedback("Time limpo.");
    }
  }, [showFeedback]);

  const handleSaveTeam = useCallback(() => {
    const teamName = prompt("Digite um nome para este time:");
    if (!teamName || teamName.trim() === "") {
      showFeedback("Nome inválido ou cancelado.", "error");
      return;
    }
    const newSavedTeam: SavedTeam = {
      name: teamName.trim(),
      court: { ...team },
      bench: [...bench],
      savedAt: new Date().toISOString(),
    };
    try {
      const updatedList = [...savedTeamsList, newSavedTeam];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      setSavedTeamsList(updatedList);
      showFeedback(`Time "${teamName}" salvo!`);
    } catch (error) {
      showFeedback("Erro ao salvar no LocalStorage.", "error");
    }
  }, [team, bench, savedTeamsList, showFeedback]);

  const handleLoadTeam = useCallback(
    (teamToLoad: SavedTeam) => {
      if (
        window.confirm(
          `Carregar o time "${teamToLoad.name}"? As alterações atuais serão perdidas.`
        )
      ) {
        if (!teamToLoad.court || !teamToLoad.bench) {
          showFeedback("Dados corrompidos.", "error");
          return;
        }
        setTeam(teamToLoad.court);
        setBench(teamToLoad.bench);
        setIsTeamsModalOpen(false);
        showFeedback(`Time "${teamToLoad.name}" carregado.`);
      }
    },
    [showFeedback]
  );

  const handleDeleteTeam = useCallback(
    (indexToDelete: number) => {
      const teamToDelete = savedTeamsList[indexToDelete];
      if (window.confirm(`Excluir o time "${teamToDelete.name}"?`)) {
        try {
          const updatedList = savedTeamsList.filter(
            (_, index) => index !== indexToDelete
          );
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
          setSavedTeamsList(updatedList);
          showFeedback(`Time "${teamToDelete.name}" excluído.`);
        } catch (error) {
          showFeedback("Erro ao excluir.", "error");
        }
      }
    },
    [savedTeamsList, showFeedback]
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
          const foundChar = allCharactersData.find((c) => c.id === charId);
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
          const foundChar = allCharactersData.find((c) => c.id === charId);
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
        const newSavedTeam: SavedTeam = {
          name: teamName.trim(),
          court: newTeam,
          bench: newBench,
          savedAt: new Date().toISOString(),
        };
        try {
          const updatedList = [...savedTeamsList, newSavedTeam];
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
          setSavedTeamsList(updatedList);
          showFeedback(`Time "${teamName}" importado e salvo!`);
          if (!foundAll)
            console.warn(
              "Personagens não encontrados durante importação:",
              missingChars
            );
        } catch (saveError) {
          showFeedback("Time importado, mas erro ao salvar.", "error");
        }
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
      setIsTeamsModalOpen(false);
    } catch (error: any) {
      showFeedback(
        `Erro ao importar: ${error.message || "Chave inválida."}`,
        "error"
      );
    }
  }, [importKey, allCharactersData, savedTeamsList, showFeedback]);

  const activeBonds = useMemo(() => {
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
        const charData = allCharactersData.find(
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
  }, [team, allBonds, characterBondLinks, allCharactersData]);

  const filteredCharacters = useMemo(
    () =>
      allCharactersData.filter((character) => {
        if (positionFilter !== "ALL" && character.position !== positionFilter)
          return false;
        if (schoolFilter !== "ALL" && character.school !== schoolFilter)
          return false;
        if (
          nameSearch &&
          !character.name.toLowerCase().includes(nameSearch.toLowerCase())
        )
          return false;
        return true;
      }),
    [allCharactersData, positionFilter, schoolFilter, nameSearch]
  );

  const teamCharacterNames = useMemo(() => {
    const courtNames = Object.values(team)
      .filter(Boolean)
      .map((char) => char!.name);
    const benchNames = bench.filter(Boolean).map((char) => char!.name);
    return [...courtNames, ...benchNames];
  }, [team, bench]);

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
          "pos2_s",
          "pos3_mb",
          "pos4_ws",
          "pos5_ws",
          "pos6_mb",
          "pos1_op",
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
      console.log(
        `Double Clicked: ${character.name} from ${origin} (Key: ${originKey})`
      );

      const courtCharacterNames = Object.values(team)
        .filter(Boolean)
        .map((char) => char!.name);
      const benchCharacterNames = bench
        .filter(Boolean)
        .map((char) => char!.name);

      if (origin === "list") {
        if (
          [...courtCharacterNames, ...benchCharacterNames].includes(
            character.name
          )
        ) {
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
          setTeam((prev) => ({ ...prev, [targetSlotKey]: character }));
          showFeedback(`${character.name} adicionado à quadra.`);
          added = true;
        }

        if (!added) {
          const firstEmptyBenchSlot = bench.findIndex((slot) => slot === null);
          if (firstEmptyBenchSlot !== -1) {
            setBench((prev) => {
              const newB = [...prev];
              newB[firstEmptyBenchSlot] = character;
              return newB;
            });
            showFeedback(`${character.name} adicionado ao banco.`);
            added = true;
          }
        }

        if (!added) {
          showFeedback("Time e banco estão cheios!", "error");
        }
      } else if (origin === "court" && typeof originKey === "string") {
        setTeam((prev) => ({ ...prev, [originKey]: null }));
        showFeedback(`${character.name} removido da quadra.`);
      } else if (origin === "bench" && typeof originKey === "number") {
        const targetSlotKey = findCourtSlotForDoubleClick(
          character,
          team,
          isPositionFree
        );
        if (targetSlotKey) {
          setTeam((prev) => ({ ...prev, [targetSlotKey]: character }));
          setBench((prev) => {
            const newB = [...prev];
            newB[originKey] = null;
            return newB;
          });
          showFeedback(`${character.name} movido do banco para a quadra.`);
        } else {
          setBench((prev) => {
            const newB = [...prev];
            newB[originKey] = null;
            return newB;
          });
          showFeedback(
            `${character.name} removido do banco (sem espaço na quadra).`
          );
        }
      }
    },
    [team, bench, isPositionFree, findCourtSlotForDoubleClick, showFeedback]
  );

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <main className="max-w-full mx-auto p-4 sm:p-8">
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
                    onChange={handlePositionModeChange}
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
              onRemoveCharacter={handleRemoveFromCourt}
              onSlotClick={setPositionFilter}
              isPositionFree={isPositionFree}
              onOpenSelector={handleOpenSelectionModal}
            />

            <div className="flex items-center justify-center flex-wrap gap-3 my-4 w-full max-w-xl">
              <button
                onClick={handleRotateTeam}
                className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors w-fit"
                title="Rotacionar Time"
              >
                <RotateCw size={18} />
              </button>
              <button
                onClick={handleClearTeam}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors w-fit"
                title="Limpar Time e Banco"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={handleSaveTeam}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm"
              >
                {" "}
                <Save size={16} /> Salvar{" "}
              </button>
              <button
                onClick={() => setIsTeamsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm"
                title="Gerenciar Times Salvos"
              >
                {" "}
                <List size={16} /> Gerenciar{" "}
              </button>
            </div>

            <ActiveBondsDisplay
              bonds={activeBonds}
              loading={loadingBondsData}
            />

            <Bench bench={bench} onRemoveFromBench={handleRemoveFromBench} />
          </section>
        </div>
      </main>

      {isTeamsModalOpen && (
        <SavedTeamsModal
          isOpen={isTeamsModalOpen}
          onClose={() => setIsTeamsModalOpen(false)}
          savedTeams={savedTeamsList}
          onLoadTeam={handleLoadTeam}
          onDeleteTeam={handleDeleteTeam}
          onExportTeam={handleExportTeam}
          importKey={importKey}
          setImportKey={setImportKey}
          onImportTeam={handleImportTeam}
          feedbackMessage={feedbackMessage}
        />
      )}

      <DragOverlay>
        {activeDragItem ? (
          <CharacterCard
            character={activeDragItem}
            dragId="overlay-item"
            dragData={{}}
            originType="list"
            onDoubleClickCharacter={handleDoubleClickCharacter}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
