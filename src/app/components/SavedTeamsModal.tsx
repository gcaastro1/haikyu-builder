"use client";

import { useTranslation } from "@/hooks/useTranslation";
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
  const t = useTranslation();

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
      if (window.confirm(`${t.saved_teams.confirm_load} "${team.name}"?`)) {
        const success = storeLoadTeam(team);
        if (success) {
          onClose();
          showFeedback(`${t.common.team || "Team"} "${team.name}" ${t.saved_teams.load_success}`);
        } else showFeedback(t.saved_teams.load_error, "error");
      }
    },
    [storeLoadTeam, onClose, showFeedback, t]
  );

  const handleDeleteTeam = useCallback(
    (index: number) => {
      const team = savedTeamsList[index];
      if (window.confirm(`${t.saved_teams.confirm_delete} "${team.name}"?`)) {
        storeDeleteTeam(index);
        showFeedback(`${t.common.team || "Team"} "${team.name}" ${t.saved_teams.delete_success}`);
      }
    },
    [savedTeamsList, storeDeleteTeam, showFeedback, t]
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
        showFeedback(t.saved_teams.key_error, "error");
        return null;
      }
    },
    [showFeedback, t]
  );

  const handleCopyKey = useCallback(
    async (key: string) => {
      try {
        await navigator.clipboard.writeText(key);
        showFeedback(t.saved_teams.copy_success);
      } catch {
        showFeedback(t.saved_teams.copy_error, "error");
      }
    },
    [showFeedback, t]
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
      showFeedback(t.saved_teams.invalid_key, "error");
      return;
    }

    try {
      const data = JSON.parse(atob(importKey.trim())) as ExportedTeam;
      if (!data?.c) throw new Error(t.saved_teams.invalid_format);

      const newTeam: TeamSlots = { ...initialTeamState };
      let foundAll = true;
      const missing: string[] = [];

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
        foundAll ? t.saved_teams.import_prompt : t.saved_teams.import_prompt_failures
      );
      if (name && name.trim() !== "") {
        storeSaveCurrentTeam(name);
        showFeedback(`${t.common.team || "Team"} "${name}" ${t.saved_teams.import_success}`);
      } else {
        showFeedback(
          foundAll ? t.saved_teams.import_success_simple : t.saved_teams.import_failures_simple,
          foundAll ? "success" : "error"
        );
      }

      onClose();
    } catch (err: any) {
      showFeedback(`${t.saved_teams.import_error} ${err.message}`, "error");
    }
  }, [importKey, allCharacters, setTeam, storeSaveCurrentTeam, showFeedback, onClose, t]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h3>{t.saved_teams.title}</h3>
          <button onClick={onClose} aria-label={t.common.close}>
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
            <h4>{t.saved_teams.saved_teams}</h4>
            {savedTeamsList.length === 0 ? (
              <p className="modal__empty">{t.saved_teams.no_saved_teams}</p>
            ) : (
              <ul className="modal__team-list">
                {savedTeamsList.map((team, i) => (
                  <li key={i} className="modal__team">
                    <div className="modal__team-info">
                      <strong>{team.name}</strong>
                      <span>
                        ({new Date(team.savedAt).toLocaleDateString()})
                      </span>
                    </div>
                    <div className="modal__team-actions">
                      <button
                        title={t.common.load}
                        className="btn-icon blue"
                        onClick={() => handleLoadTeam(team)}
                      >
                        <Upload size={16} />
                      </button>
                      <button
                        title={t.common.copy_key}
                        className="btn-icon yellow"
                        onClick={() => handleExportAndCopy(team)}
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        title={t.common.delete}
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
            <h4>{t.saved_teams.import_title}</h4>
            <div className="modal__import">
              <input
                type="text"
                placeholder={t.saved_teams.import_placeholder}
                value={importKey}
                onChange={(e) => setImportKey(e.target.value)}
              />
              <button onClick={handleImport}>{t.saved_teams.import_btn}</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
