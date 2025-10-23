import { create } from 'zustand';
import { Character, Bond, CharacterBondLink } from '@/types';
import { getAllCharacterBondLinks, getBonds } from '@/app/lib/actions';
import { supabase } from '@/app/lib/supabaseClient';


type CharacterStoreState = {
  allCharacters: Character[];
  allBonds: Bond[];
  characterBondLinks: CharacterBondLink[];
  isLoading: boolean;
  fetchError: string | null;

  fetchInitialData: () => Promise<void>;
};


export const useCharacterStore = create<CharacterStoreState>((set, get) => ({

  allCharacters: [],
  allBonds: [],
  characterBondLinks: [],
  isLoading: false,
  fetchError: null,

  fetchInitialData: async () => {
    const { isLoading, allCharacters } = get();

    if (isLoading || allCharacters.length > 0) {
      return;
    }

    set({ isLoading: true, fetchError: null });

    try {
      const [charactersResult, bondsResult, linksResult] = await Promise.all([
        supabase
          .from("Characters")
          .select("*")
          .order("name", { ascending: true }),
        getBonds(),
        getAllCharacterBondLinks(),
      ]);

      let formattedCharacters: Character[] = [];
      if (charactersResult.error) throw charactersResult.error;
      if (charactersResult.data) {
        formattedCharacters = charactersResult.data.map((char: any) => ({
          ...char,
          styles: Array.isArray(char.styles)
            ? char.styles
            : typeof char.styles === "string"
            ? JSON.parse(char.styles)
            : [],
        })) as Character[];
      }

      if (bondsResult.error) throw new Error(bondsResult.error);
      const bonds = bondsResult.bonds || [];

      if (linksResult.error) throw new Error(linksResult.error);
      const links = linksResult.links || [];

      set({
        allCharacters: formattedCharacters,
        allBonds: bonds,
        characterBondLinks: links,
        isLoading: false,
      });

    } catch (error: any) {
      console.error("Erro ao buscar dados iniciais na store:", error);
      set({
        fetchError: `Erro ao carregar dados: ${error.message || "Erro desconhecido"}`,
        isLoading: false,
        allCharacters: [],
        allBonds: [],
        characterBondLinks: [],
      });
    }
  },
}));