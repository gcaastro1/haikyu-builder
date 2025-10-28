import { useTeamStore } from "@/stores/useTeamStore";
import { useSavedTeamsStore } from "@/stores/useSavedTeamsStore";
import { useUIStore } from "@/stores/useUIStore";
import { TeamSlots, SavedTeam, ExportedTeam, Character } from "@/types";

export function useTeamManager() {
  const { setTeam, setBench, clearTeam } = useTeamStore();
  const { saveCurrentTeam, loadTeam, deleteTeam } = useSavedTeamsStore();
  const { showFeedback, closeModals } = useUIStore();

  const handleSave = (teamName: string) => {
    if (!teamName.trim()) {
      showFeedback("Nome inválido ou vazio.", "error");
      return;
    }
    saveCurrentTeam(teamName);
    showFeedback(`Time "${teamName}" salvo com sucesso.`);
  };

  const handleLoad = (team: SavedTeam) => {
    const success = loadTeam(team);
    if (success) {
      closeModals();
      showFeedback(`Time "${team.name}" carregado.`);
    } else {
      showFeedback("Erro ao carregar time.", "error");
    }
  };

  const handleDelete = (index: number, teamName: string) => {
    deleteTeam(index);
    showFeedback(`Time "${teamName}" removido.`);
  };

  const handleClear = () => {
    clearTeam();
    showFeedback("Time limpo com sucesso.");
  };

  const handleImport = (importKey: string, allCharacters: Character[]) => {
    try {
      const json = JSON.parse(atob(importKey.trim())) as ExportedTeam;
      if (!json?.c || !Array.isArray(json.b)) throw new Error("Chave inválida.");

      const newTeam: TeamSlots = { ...useTeamStore.getState().team };
      const newBench = Array(6).fill(null) as (Character | null)[];

      for (const [key, id] of Object.entries(json.c)) {
        const found = allCharacters.find((c) => c.id === id);
        newTeam[key as keyof TeamSlots] = found || null;
      }

      json.b.forEach((id, idx) => {
        const found = allCharacters.find((c) => c.id === id);
        if (found) newBench[idx] = found;
      });

      setTeam(newTeam);
      setBench(newBench);
      showFeedback("Time importado com sucesso.");
    } catch (err) {
      showFeedback("Erro ao importar time.", "error");
    }
  };

  return {
    handleSave,
    handleLoad,
    handleDelete,
    handleClear,
    handleImport,
  };
}
