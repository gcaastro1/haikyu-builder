import { useSavedTeamsStore } from "@/stores/useSavedTeamsStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { useUIStore } from "@/stores/useUIStore";
import { Character, ExportedTeam, SavedTeam, TeamSlots } from "@/types";

export function useTeamManager() {
  const { setTeam, clearTeam } = useTeamStore();
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
      if (!json?.c) throw new Error("Chave inválida.");

      const newTeam: TeamSlots = { ...useTeamStore.getState().team };

      const characterMap = new Map<number, Character>(
        allCharacters.map((c) => [c.id, c])
      );

      for (const [key, id] of Object.entries(json.c)) {
        if (id == null) {
          newTeam[key as keyof TeamSlots] = null;
          continue;
        }
        const found = characterMap.get(Number(id));
        newTeam[key as keyof TeamSlots] = found || null;
      }

      setTeam(newTeam);
      showFeedback("Time importado com sucesso.");
    } catch {
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
