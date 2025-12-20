"use client";

import { useTeamManager } from "@/hooks/useTeamManager";
import { useTranslation } from "@/hooks/useTranslation";
import { useCharacterStore } from "@/stores/useCharacterStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { useUIStore } from "@/stores/useUIStore";
import type { TeamType } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, List, RotateCw, Save, Trash2 } from "lucide-react";
import { useState } from "react";

export function TeamControls() {
  const { openTeamsModal, showFeedback } = useUIStore();
  const { team, setTeam, rotateTeam, clearTeam } = useTeamStore();
  const { handleSave } = useTeamManager();
  const { suggestTeam } = useCharacterStore();
  const t = useTranslation();

  const [shake, setShake] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TeamType | null>(null);

  const handleSaveClick = () => {
    const name = prompt(t.home.team_name_prompt);
    if (!name) return;
    handleSave(name);
  };

  const handleClearClick = () => {
    const confirmClear = confirm(t.home.clear_confirm);
    if (confirmClear) {
      clearTeam();
      showFeedback(t.home.clear_success);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleRotateClick = () => {
    rotateTeam();
    showFeedback(t.home.rotate_success);
  };

  const handleSuggestClick = () => {
    setIsModalOpen(true);
  };

  const handleGenerateTeam = () => {
    if (!selectedType) return;
    const suggestion = suggestTeam(selectedType, team);
    setTeam(suggestion);
    setIsModalOpen(false);
    showFeedback(`${t.home.suggest_success} "${selectedType}"!`);
  };

  return (
    <div className="team-controls">
      <button className="btn btn--save" onClick={handleSaveClick}>
        <Save size={16} />
        <span>{t.common.save}</span>
      </button>

      <button className="btn btn--manage" onClick={openTeamsModal}>
        <List size={16} />
        <span>{t.common.manage}</span>
      </button>

      <motion.button
        onClick={handleClearClick}
        animate={shake ? { x: [-6, 6, -6, 6, 0] } : {}}
        transition={{ duration: 0.3 }}
        className="btn-circle btn--delete"
      >
        <Trash2 size={18} />
      </motion.button>

      <button className="btn-circle btn--rotate" onClick={handleRotateClick}>
        <RotateCw size={18} />
      </button>

      <button className="btn btn--suggest" onClick={handleSuggestClick}>
        <Lightbulb size={16} />
        <span>{t.common.suggest}</span>
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="suggest-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="suggest-modal__content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3>{t.home.suggest_modal_title}</h3>

              <div className="suggest-type-grid">
                {["Ataque Rápido", "Potente", "Bloqueio", "Recepção"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type as TeamType)}
                    className={`suggest-type-btn ${
                      selectedType === type ? "selected" : ""
                    }`}
                  >
                    {t.home.team_types[type as keyof typeof t.home.team_types] || type}
                  </button>
                ))}
              </div>

              <div className="suggest-modal__actions">
                <button
                  className="btn btn--confirm"
                  disabled={!selectedType}
                  onClick={handleGenerateTeam}
                >
                  {t.common.generate}
                </button>
                <button
                  className="btn btn--cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t.common.cancel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
