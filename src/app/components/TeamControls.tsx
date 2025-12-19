"use client";

import { useTeamManager } from "@/hooks/useTeamManager";
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

  const [shake, setShake] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TeamType | null>(null);

  const handleSaveClick = () => {
    const name = prompt("Digite o nome do time:");
    if (!name) return;
    handleSave(name);
  };

  const handleClearClick = () => {
    const confirmClear = confirm("Deseja realmente limpar o time atual?");
    if (confirmClear) {
      clearTeam();
      showFeedback("Time limpo com sucesso.");
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleRotateClick = () => {
    rotateTeam();
    showFeedback("Time rotacionado!");
  };

  const handleSuggestClick = () => {
    setIsModalOpen(true);
  };

  const handleGenerateTeam = () => {
    if (!selectedType) return;
    const suggestion = suggestTeam(selectedType, team);
    setTeam(suggestion);
    setIsModalOpen(false);
    showFeedback(`Time sugerido para o tipo "${selectedType}"!`);
  };

  return (
    <div className="team-controls">
      {/* === Botões principais === */}
      <button className="btn btn--save" onClick={handleSaveClick}>
        <Save size={16} />
        <span>Salvar</span>
      </button>

      <button className="btn btn--manage" onClick={openTeamsModal}>
        <List size={16} />
        <span>Gerenciar</span>
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
        <span>Sugerir</span>
      </button>

      {/* === Modal de Sugestão === */}
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
              <h3>Selecione o tipo de time</h3>

              <div className="suggest-type-grid">
                {["Ataque Rápido", "Potente", "Bloqueio", "Recepção"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type as TeamType)}
                    className={`suggest-type-btn ${
                      selectedType === type ? "selected" : ""
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="suggest-modal__actions">
                <button
                  className="btn btn--confirm"
                  disabled={!selectedType}
                  onClick={handleGenerateTeam}
                >
                  Gerar
                </button>
                <button
                  className="btn btn--cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
