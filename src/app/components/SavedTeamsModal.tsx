"use client";

import React, { useState, useCallback } from "react";
import type {
  SavedTeam,
  ExportedTeam,
  SlotKey,
  TeamSlots,
  Character,
} from "@/types";
import { Upload, Trash2, X, Copy } from "lucide-react";

import { useUIStore } from "@/stores/useUIStore";
import { useSavedTeamsStore } from "@/stores/useSavedTeamsStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { useCharacterStore } from "@/stores/useCharacterStore";

const initialTeamState: TeamSlots = {
  pos5_ws: null,
  pos6_mb: null,
  pos1_op: null,
  pos4_ws: null,
  pos3_mb: null,
  pos2_s: null,
  libero: null,
};

export function SavedTeamsModal() {

  const [importKey, setImportKey] = useState("");


  const isOpen = useUIStore((state) => state.isTeamsModalOpen);
  const onClose = useUIStore((state) => state.closeModals);
  const showFeedback = useUIStore((state) => state.showFeedback);
  const feedbackMessage = useUIStore((state) => state.feedbackMessage);

  const savedTeamsList = useSavedTeamsStore((state) => state.savedTeamsList);
  const storeLoadTeam = useSavedTeamsStore((state) => state.loadTeam); 
  const storeDeleteTeam = useSavedTeamsStore((state) => state.deleteTeam);
  const storeSaveCurrentTeam = useSavedTeamsStore((state) => state.saveCurrentTeam);

  const setTeam = useTeamStore((state) => state.setTeam);
  const setBench = useTeamStore((state) => state.setBench);

  const allCharacters = useCharacterStore((state) => state.allCharacters);

  const handleLoadTeam = useCallback(
    (teamToLoad: SavedTeam) => {
      if (window.confirm(`Carregar o time "${teamToLoad.name}"?`)) {
        const success = storeLoadTeam(teamToLoad);
        if (success) {
          onClose();
          showFeedback(`Time "${teamToLoad.name}" carregado.`);
        } else {
          showFeedback("Dados corrompidos.", "error");
        }
      }
    },
    [storeLoadTeam, onClose, showFeedback]
  );

  const handleDeleteTeam = useCallback(
    (index: number) => {
      const teamToDelete = savedTeamsList[index];
      if (window.confirm(`Excluir o time "${teamToDelete.name}"?`)) {
        storeDeleteTeam(index);
        showFeedback(`Time "${teamToDelete.name}" excluído.`);
      }
    },
    [savedTeamsList, storeDeleteTeam, showFeedback]
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

  const handleCopyToClipboard = useCallback(
    async (key: string) => {
      try {
        await navigator.clipboard.writeText(key);
        showFeedback("Chave copiada para a área de transferência!");
      } catch (err) {
        console.error("Falha ao copiar:", err);
        showFeedback("Erro ao copiar a chave.", "error");
      }
    },
    [showFeedback]
  );

  const exportAndCopy = useCallback(
    (team: SavedTeam) => {
      const key = handleExportTeam(team);
      if (key) {
        handleCopyToClipboard(key);
      }
    },
    [handleExportTeam, handleCopyToClipboard]
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
        storeSaveCurrentTeam(teamName);
        showFeedback(`Time "${teamName}" importado e salvo!`);
      } else {
        showFeedback(
          foundAll
            ? "Time importado!"
            : "Time importado (alguns personagens não encontrados). Não foi salvo.",
          foundAll ? "success" : "error"
        );
      }
      onClose();
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
    storeSaveCurrentTeam,
    onClose,
  ]);

  if (!isOpen) return null;

  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] border border-zinc-700 flex flex-col overflow-hidden"
        onClick={handleModalContentClick}
      >
        <div className="flex-shrink-0 p-4 border-b border-zinc-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white font-bricolage">
            Gerenciar Times Salvos
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
          {feedbackMessage && (
            <p
              className={`p-2 rounded text-white text-sm text-center ${
                feedbackMessage.type === "error"
                  ? "bg-red-700/80"
                  : "bg-green-700/80"
              }`}
            >
              {feedbackMessage.text}
            </p>
          )}

          <div className="mb-6">
            <h4 className="text-md font-semibold text-zinc-300 mb-2">
              Times Salvos:
            </h4>
            {savedTeamsList.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">
                Nenhum time salvo ainda.
              </p>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2 border border-zinc-700 rounded-md p-2 bg-zinc-800/50">
                {savedTeamsList.map((savedTeam, index) => (
                  <li
                    key={index}
                    className="flex flex-col sm:flex-row justify-between items-center bg-zinc-700/50 p-2 rounded gap-2"
                  >
                    <div className="flex-grow">
                      <span className="font-semibold text-white">
                        {savedTeam.name}
                      </span>
                      <span className="text-xs text-zinc-400 ml-2">
                        {" "}
                        (Salvo em:{" "}
                        {new Date(savedTeam.savedAt).toLocaleDateString()})
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleLoadTeam(savedTeam)}
                        title="Carregar"
                        className="p-1.5 bg-sky-600 hover:bg-sky-700 rounded text-white"
                      >
                        <Upload size={16} />
                      </button>
                      <button
                        onClick={() => exportAndCopy(savedTeam)}
                        title="Copiar Chave de Exportação"
                        className="p-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-white"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(index)}
                        title="Excluir"
                        className="p-1.5 bg-red-600 hover:bg-red-700 rounded text-white"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="text-md font-semibold text-zinc-300 mb-2">
              Importar Time por Chave:
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={importKey}
                onChange={(e) => setImportKey(e.target.value)}
                placeholder="Cole a chave aqui..."
                className="flex-grow bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                onClick={handleImportTeam}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-1 px-3 text-sm rounded transition-colors"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
