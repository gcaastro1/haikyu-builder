'use server';

import { Bond, Character, CharacterBondLink, CharacterStatsBond, Skill } from '@/types';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL ou SERVICE_ROLE_KEY não estão configuradas corretamente no ambiente do servidor.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false }
});


export async function createCharacter(prevState: { message: string }, formData: FormData) {
    
    const imageUrl = formData.get('image_url') as string;
    const characterName = formData.get('name') as string;

    if (!imageUrl) {
        return { message: "Erro: A imagem do personagem deve ser selecionada." };
    }
    
    const data = {
        name: characterName,
        position: formData.get('position') as string,
        rarity: formData.get('rarity') as string,
        school: formData.get('school') as string,
        image_url: imageUrl, 
        
        styles: (formData.get('styles') as string || '')
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0),
        serve: Number(formData.get('serve')),
        attack: Number(formData.get('attack')),
        set: Number(formData.get('set')),
        receive: Number(formData.get('receive')),
        block: Number(formData.get('block')),
        defense: Number(formData.get('defense')),
    };

    if (!data.name || !data.position || !data.rarity || !data.school) {
        return { message: "Erro: Campos obrigatórios (Nome, Posição, Raridade, Escola) estão faltando." };
    }
    
    const { error } = await supabase
        .from('characters')
        .insert([data]);

    if (error) {
        console.error("Erro no Supabase:", error);
        return { message: `Falha ao cadastrar: ${error.message}` };
    }
    
    return { message: `Personagem ${data.name} cadastrado com sucesso!` };
}

interface StorageFile {
    name: string;
    publicUrl: string;
}

const BUCKET_NAME = 'character-images'; 
const STORAGE_FOLDER = 'characters'; 


export async function getStorageImages(): Promise<{ images: StorageFile[] | null; error: string | null }> {
    const { data: listData, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(STORAGE_FOLDER, { 
            limit: 100,
            sortBy: { column: 'name', order: 'asc' },
        });

    if (listError) {
        console.error("Erro ao listar Storage:", listError);
        return { images: null, error: `Falha ao listar imagens: ${listError.message}` };
    }

    if (!listData || listData.length === 0) {
        return { images: [], error: null };
    }

    const imagesWithUrl: StorageFile[] = listData
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => {
            
            const fullFilePath = `${STORAGE_FOLDER}/${file.name}`;

            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(fullFilePath); 
                
            return {
                name: file.name,
                publicUrl: publicUrlData?.publicUrl || ''
            };
        });

    return { images: imagesWithUrl.filter(img => img.publicUrl), error: null };
}

export async function updateCharacter(
    characterData: Partial<Character> & { id: number } 
): Promise<{ success: boolean; message: string }> {

    const { id, ...updateData } = characterData;

    if (!id) {
        return { success: false, message: "Erro: ID do personagem não fornecido para atualização." };
    }

    if (!updateData.name || !updateData.position || !updateData.rarity || !updateData.school) {
         return { success: false, message: "Erro: Campos obrigatórios (Nome, Posição, Raridade, Escola) estão faltando." };
    }

    if (updateData.image_url === undefined) {
    }

    const numericFields: string[] = ['serve', 'attack', 'set', 'receive', 'block', 'defense'];
    
    numericFields.forEach(field => {
        const value = (updateData as any)[field]; 
        
        if (value !== undefined && value !== null && value !== '') {
            (updateData as any)[field] = Number(value); 
        } else {
             (updateData as any)[field] = 0;
        }
    });

    const { error } = await supabase
        .from('Characters') 
        .update(updateData) 
        .eq('id', id); 

    if (error) {
        console.error("Erro no Supabase ao atualizar:", error);
        return { success: false, message: `Falha ao atualizar: ${error.message}` };
    }

    revalidatePath('/database'); 
    revalidatePath('/'); 
    
    return { success: true, message: `Personagem ${updateData.name} atualizado com sucesso!` };
}

export async function getBonds(): Promise<{ bonds: Bond[] | null; error: string | null }> {
    const { data, error } = await supabase
        .from('Bonds')
        .select('id, name, description') 
        .order('name', { ascending: true });

    if (error) {
        console.error("Erro ao buscar Vínculos:", error);
        return { bonds: null, error: `Falha ao buscar vínculos: ${error.message}` };
    }
    return { bonds: data as Bond[], error: null };
}

export async function getAllCharacterBondLinks(): Promise<{ links: CharacterBondLink[] | null; error: string | null }> {
    const { data, error } = await supabase
        .from('Character_Bonds') 
        .select('character_id, bond_id'); 

    if (error) {
        console.error("Erro ao buscar ligações Character_Bonds:", error);
        return { links: null, error: `Falha ao buscar ligações: ${error.message}` };
    }
    return { links: data as CharacterBondLink[], error: null };
}

export async function getCharacterBonds(characterId: number): Promise<{ bondIds: number[] | null; error: string | null }> {
    if (!characterId) return { bondIds: [], error: null };

    const { data, error } = await supabase
        .from('Character_Bonds') 
        .select('bond_id')
        .eq('character_id', characterId);

    if (error) {
        console.error(`Erro ao buscar vínculos do personagem ${characterId}:`, error);
        return { bondIds: null, error: `Falha ao buscar vínculos do personagem: ${error.message}` };
    }
    const ids = data ? data.map(item => item.bond_id) : [];
    return { bondIds: ids, error: null };
}

export async function updateCharacterBonds(
    characterId: number,
    newBondIds: number[]
): Promise<{ success: boolean; message: string }> {

    if (!characterId) {
        return { success: false, message: "Erro: ID do personagem não fornecido." };
    }

    const { error: deleteError } = await supabase
        .from('Character_Bonds')
        .delete()
        .eq('character_id', characterId);

    if (deleteError) {
        console.error(`Erro ao deletar vínculos antigos para ${characterId}:`, deleteError);
        return { success: false, message: `Falha ao limpar vínculos antigos: ${deleteError.message}` };
    }

    if (newBondIds && newBondIds.length > 0) {
        const rowsToInsert = newBondIds.map(bondId => ({
            character_id: characterId,
            bond_id: bondId,
        }));

        const { error: insertError } = await supabase
            .from('Character_Bonds')
            .insert(rowsToInsert);

        if (insertError) {
            console.error(`Erro ao inserir novos vínculos para ${characterId}:`, insertError);
            return { success: false, message: `Falha ao salvar novos vínculos: ${insertError.message}` };
        }
    }

    revalidatePath('/database'); 
    revalidatePath(`/database/${characterId}`); 
    revalidatePath('/'); 

    return { success: true, message: "Vínculos atualizados com sucesso!" };
}

export async function getCharacterSkills(characterId: number): Promise<{ skills: Skill[] | null; error: string | null }> {
    if (!characterId) return { skills: [], error: null };

    const { data, error } = await supabase
        .from('Skills') 
        .select('*')
        .eq('character_id', characterId)
        .order('id', { ascending: true }); 

    if (error) {
        console.error(`Erro ao buscar skills do personagem ${characterId}:`, error);
        return { skills: null, error: `Falha ao buscar skills: ${error.message}` };
    }
    return { skills: data as Skill[], error: null };
}

export async function getCharacterStatBonds(characterId: number): Promise<{ statsBonds: CharacterStatsBond[] | null; error: string | null }> {
    if (!characterId) return { statsBonds: [], error: null };

    const { data, error } = await supabase
        .from('Character_StatsBonds') 
        .select(`
            *,
            StatsBonds ( name ) 
        `) 
        .eq('character_id', characterId);

    if (error) {
        console.error(`Erro ao buscar stat bonds do personagem ${characterId}:`, error);
        return { statsBonds: null, error: `Falha ao buscar stat bonds: ${error.message}` };
    }
    
    const formattedData = data?.map(item => ({
        ...item,
        stats_bond_name: (item.StatsBonds as any)?.name || 'Nome Desconhecido' 
    })) || [];

    return { statsBonds: formattedData as CharacterStatsBond[], error: null };
}