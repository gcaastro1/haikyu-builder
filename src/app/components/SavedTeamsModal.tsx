"use client";

import { useCharacterStore } from "@/stores/useCharacterStore";
import { useSavedTeamsStore } from "@/stores/useSavedTeamsStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { useUIStore } from "@/stores/useUIStore";
import type { ExportedTeam, SavedTeam, SlotKey, TeamSlots } from "@/types";
import { Copy, Trash2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";

const initialTeamState: TeamSlots = {
  pos5_mb: null,
  pos6_ws: null,
  pos4_op: null,
  pos3_ws: null,
  pos2_mb: null,
  pos1_s: null,
  libero: null,
};


export function SavedTeamsModal() {
  const [importKey, setImportKey] = useState("");

  const isOpen = useUIStore((s) => s.isTeamsModalOpen);
  const onClose = useUIStore((s) => s.closeModals);
  const showFeedback = useUIStore((s) => s.showFeedback);
  const feedbackMessage = useUIStore((s) => s.feedbackMessage);

  const savedTeamsList = useSavedTeamsStore((s) => s.savedTeamsList);
  const storeLoadTeam = useSavedTeamsStore((s) => s.loadTeam);
  const storeDeleteTeam = useSavedTeamsStore((s) => s.deleteTeam);
  const storeSaveCurrentTeam = useSavedTeamsStore((s) => s.saveCurrentTeam);

  const setTeam = useTeamStore((s) => s.setTeam);
  const allCharacters = useCharacterStore((s) => s.allCharacters);

  const handleLoadTeam = useCallback(
    (team: SavedTeam) => {
      if (window.confirm(`Carregar o time "${team.name}"?`)) {
        const success = storeLoadTeam(team);
        if (success) {
          onClose();
          showFeedback(`Time "${team.name}" carregado!`);
        } else showFeedback("Erro ao carregar time.", "error");
      }
    },
    [storeLoadTeam, onClose, showFeedback]
  );

  const handleDeleteTeam = useCallback(
    (index: number) => {
      const team = savedTeamsList[index];
      if (window.confirm(`Excluir o time "${team.name}"?`)) {
        storeDeleteTeam(index);
        showFeedback(`Time "${team.name}" excluído.`);
      }
    },
    [savedTeamsList, storeDeleteTeam, showFeedback]
  );

  const handleExportTeam = useCallback(
    (team: SavedTeam): string | null => {
      try {
        const exported: ExportedTeam = { c: {} };
        for (const key in team.court) {
          const typed = key as SlotKey;
          exported.c[typed] = team.court[typed]?.id ?? null;
        }
        return btoa(JSON.stringify(exported));
      } catch {
        showFeedback("Erro ao gerar chave.", "error");
        return null;
      }
    },
    [showFeedback]
  );

  const handleCopyKey = useCallback(
    async (key: string) => {
      try {
        await navigator.clipboard.writeText(key);
        showFeedback("Chave copiada para a área de transferência!");
      } catch {
        showFeedback("Erro ao copiar chave.", "error");
      }
    },
    [showFeedback]
  );

  const handleExportAndCopy = useCallback(
    (team: SavedTeam) => {
      const key = handleExportTeam(team);
      if (key) handleCopyKey(key);
    },
    [handleExportTeam, handleCopyKey]
  );

  const handleImport = useCallback(async () => {
    if (!importKey.trim()) {
      showFeedback("Cole uma chave válida.", "error");
      return;
    }

    try {
      const data = JSON.parse(atob(importKey.trim())) as ExportedTeam;
      if (!data?.c) throw new Error("Formato inválido.");

      const newTeam: TeamSlots = { ...initialTeamState };
      let foundAll = true;
      const missing: string[] = [];

      // Otimização: Map para lookup O(1) de characters por ID
      const characterMap = new Map(allCharacters.map((c) => [c.id, c]));

      for (const key in data.c) {
        const typed = key as SlotKey;
        const charId = data.c[typed];
        const found = characterMap.get(Number(charId)) ?? null;
        newTeam[typed] = found;
        if (!found && charId) {
          missing.push(`${charId}`);
          foundAll = false;
        }
      }

      setTeam(newTeam);
      setImportKey("");

      const name = prompt(
        `Time importado${foundAll ? "" : " (com falhas)"}! Digite um nome para salvá-lo:`
      );
      if (name && name.trim() !== "") {
        storeSaveCurrentTeam(name);
        showFeedback(`Time "${name}" importado e salvo!`);
      } else {
        showFeedback(
          foundAll ? "Time importado com sucesso!" : "Time importado com falhas.",
          foundAll ? "success" : "error"
        );
      }

      onClose();
    } catch (err: any) {
      showFeedback(`Erro ao importar: ${err.message}`, "error");
    }
  }, [importKey, allCharacters, setTeam, storeSaveCurrentTeam, showFeedback, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h3>Gerenciar Times Salvos</h3>
          <button onClick={onClose} aria-label="Fechar">
            <X size={22} />
          </button>
        </header>

        <div className="modal__content">
          {feedbackMessage && (
            <div
              className={`modal__feedback ${feedbackMessage.type === "error" ? "error" : "success"}`}
            >
              {feedbackMessage.text}
            </div>
          )}

          <section className="modal__section">
            <h4>Times Salvos</h4>
            {savedTeamsList.length === 0 ? (
              <p className="modal__empty">Nenhum time salvo.</p>
            ) : (
              <ul className="modal__team-list">
                {savedTeamsList.map((team, i) => (
                  <li key={i} className="modal__team">
                    <div className="modal__team-info">
                      <strong>{team.name}</strong>
                      <span>
                        ({new Date(team.savedAt).toLocaleDateString("pt-BR")})
                      </span>
                    </div>
                    <div className="modal__team-actions">
                      <button
                        title="Carregar"
                        className="btn-icon blue"
                        onClick={() => handleLoadTeam(team)}
                      >
                        <Upload size={16} />
                      </button>
                      <button
                        title="Copiar chave"
                        className="btn-icon yellow"
                        onClick={() => handleExportAndCopy(team)}
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        title="Excluir"
                        className="btn-icon red"
                        onClick={() => handleDeleteTeam(i)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="modal__section">
            <h4>Importar Time por Chave</h4>
            <div className="modal__import">
              <input
                type="text"
                placeholder="Cole a chave aqui..."
                value={importKey}
                onChange={(e) => setImportKey(e.target.value)}
              />
              <button onClick={handleImport}>Importar</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
