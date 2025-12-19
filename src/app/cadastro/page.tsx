"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useCharacterStore } from "@/stores/useCharacterStore";
import { Bond, Character, StatsBondType } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { saveCharacterToJson } from "../actions/saveCharacter";
import { BondCreationModal } from "../components/BondCreationModal";
import { ImageSelector } from "../components/ImageSelector";
import { SectionHeader } from "../components/SectionHeader";
import { StatsBondCreationModal } from "../components/StatsBondCreationModal";
import { StyleSelector } from "../components/StyleSelector";
import { getCharacterStatBonds, getStatsBondTypes } from "../lib/actions";

const positions = ["OP", "MB", "WS", "S", "L"];
const rarities = ["SR", "SSR", "UR", "SP"];
const schools = [
  "Shiratorizawa",
  "Nekoma",
  "Fukurōdani",
  "Aoba Johsai",
  "Inarizaki",
  "Kamomedai",
  "Karasuno",
  "Date Tech",
  "Itachiyama",
  "Johzenji",
  "Kitagawa Daichi",
];

function CadastroForm() {
  const { allPotentials, allCharacters, allBonds, characterBondLinks, characterStatsBondLinks, fetchInitialData } = useCharacterStore();
  const { isAdmin } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");

  const [message, setMessage] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [selectedBonds, setSelectedBonds] = useState<number[]>([]);
  const [isBondModalOpen, setIsBondModalOpen] = useState(false);

  const [allStatsBonds, setAllStatsBonds] = useState<StatsBondType[]>([]);
  const [selectedStatsBonds, setSelectedStatsBonds] = useState<number[]>([]);
  const [isStatsBondModalOpen, setIsStatsBondModalOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
    getStatsBondTypes().then(({ types }) => {
      if (types) setAllStatsBonds(types);
    });
  }, [fetchInitialData]);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/database");
    }
  }, [isAdmin, router]);

  useEffect(() => {
    if (editId && allCharacters.length > 0) {
      const char = allCharacters.find((c) => c.id === Number(editId));
      if (char) {
        setEditingCharacter(char);
        setImageUrl(char.image_url || "");
        
        if (characterBondLinks.length > 0) {
            const charBonds = characterBondLinks
                .filter(link => link.character_id === char.id)
                .map(link => link.bond_id);
            setSelectedBonds(charBonds);
        }

        getCharacterStatBonds(char.id).then(({ statsBonds }) => {
            if (statsBonds) {
                setSelectedStatsBonds(statsBonds.map(sb => sb.stats_bond_id));
            }
        });
      }
    }
    if (!editId || (editId && allCharacters.length > 0)) {
        setIsLoaded(true);
    }
  }, [editId, allCharacters, characterBondLinks]);

  const handleBondChange = (bondId: number) => {
    setSelectedBonds(prev => 
      prev.includes(bondId) 
        ? prev.filter(id => id !== bondId)
        : [...prev, bondId]
    );
  };

  const handleBondCreated = (newBond: Bond) => {
    setSelectedBonds(prev => [...prev, newBond.id]);
  };

  const handleStatsBondChange = (statsBondId: number) => {
    setSelectedStatsBonds(prev => 
      prev.includes(statsBondId) 
        ? prev.filter(id => id !== statsBondId)
        : [...prev, statsBondId]
    );
  };

  const handleStatsBondCreated = (newStatsBond: StatsBondType) => {
    setAllStatsBonds(prev => [...prev, newStatsBond]);
    setSelectedStatsBonds(prev => [...prev, newStatsBond.id]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus("saving");
    setMessage("");
    const fd = new FormData(event.currentTarget);
    const name = (fd.get("name") as string) || "";
    const position = (fd.get("position") as string) || "";
    const rarity = (fd.get("rarity") as string) || "";
    const school = (fd.get("school") as string) || "";
    const styles = ((fd.get("styles") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    const serve = Number(fd.get("serve") || 0);
    const attack = Number(fd.get("attack") || 0);
    const setVal = Number(fd.get("set") || 0);
    const receive = Number(fd.get("receive") || 0);
    const block = Number(fd.get("block") || 0);
    const defense = Number(fd.get("defense") || 0);

    const potential4 = Number(fd.get("potential4")) || null;
    const potential2 = Number(fd.get("potential2")) || null;

    const slot1 = (fd.get("slot1") as string) || "";
    const slot2 = (fd.get("slot2") as string) || "";
    const slot3 = (fd.get("slot3") as string) || "";
    const slot4 = (fd.get("slot4") as string) || "";
    const slot5 = (fd.get("slot5") as string) || "";
    const slot6 = (fd.get("slot6") as string) || "";

    const potential = (potential4 || potential2) ? {
        "4slots": potential4,
        "2slots": potential2
    } : null;

    const recommended_stats = (slot1 || slot2 || slot3 || slot4 || slot5 || slot6) ? {
        slot1, slot2, slot3, slot4, slot5, slot6
    } : null;

    const img = imageUrl || "/images/placeholder.png";

    if (!name || !position || !rarity || !school) {
      setSubmitStatus("error");
      setMessage("Erro: Campos obrigatórios (Nome, Posição, Raridade, Escola) estão faltando.");
      return;
    }

    const charData = {
      id: editingCharacter?.id,
      name,
      position,
      rarity,
      school,
      image_url: img,
      styles,
      serve,
      attack,
      set: setVal,
      receive,
      block,
      defense,
      potential,
      recommended_stats,
    };

    const result = await saveCharacterToJson(charData as any, selectedBonds, selectedStatsBonds);
    
    if (result.success) {
        await fetchInitialData(true); 
        setSubmitStatus("success");
        setMessage(result.message);

        setTimeout(() => {
            router.push("/database");
        }, 1500);

        if (!editingCharacter) {
            event.currentTarget.reset();
            setImageUrl("");
            setSelectedBonds([]);
            setSelectedStatsBonds([]);
        }
    } else {
        setSubmitStatus("error");
        setMessage(result.message);
    }
  };

  if (!isLoaded) return <div className="cadastro-page"><p>Carregando...</p></div>;
  if (editId && !editingCharacter && isLoaded) return <div className="cadastro-page"><p>Personagem não encontrado.</p></div>;

  const sortedBonds = [...allBonds].sort((a, b) => {
    const aSelected = selectedBonds.includes(a.id);
    const bSelected = selectedBonds.includes(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return (a.name || "").localeCompare(b.name || "");
  });

  const sortedStatsBonds = [...allStatsBonds].sort((a, b) => {
    const aSelected = selectedStatsBonds.includes(a.id);
    const bSelected = selectedStatsBonds.includes(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return (a.name || "").localeCompare(b.name || "");
  });

  return (
    <main className="cadastro-page">
      <SectionHeader title={editingCharacter ? "Editar Personagem" : "Cadastro de Personagem"} />

      {message && (
        <p
          className={`cadastro-page__message ${
            message.startsWith("Erro") || message.startsWith("Falha")
              ? "error"
              : "success"
          }`}
        >
          {message}
        </p>
      )}

      <form key={editingCharacter ? editingCharacter.id : 'new'} onSubmit={handleSubmit} className="cadastro-page__form">
        <div className="cadastro-page__field cadastro-page__field--wide">
          <label>Nome</label>
          <input type="text" name="name" required defaultValue={editingCharacter?.name || ""} />
        </div>

        <div className="cadastro-page__field cadastro-page__field--wide">
          <ImageSelector name="image_url" initialValue={imageUrl} onChange={setImageUrl} />
        </div>

        <div className="cadastro-page__field">
          <label>Posição</label>
          <select name="position" required defaultValue={editingCharacter?.position || ""}>
            <option value="">Selecione a Posição</option>
            {positions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="cadastro-page__field">
          <label>Raridade</label>
          <select name="rarity" required defaultValue={editingCharacter?.rarity || ""}>
            <option value="">Selecione a Raridade</option>
            {rarities.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="cadastro-page__field">
          <label>Escola</label>
          <select name="school" required defaultValue={editingCharacter?.school || ""}>
            <option value="">Selecione a Escola</option>
            {schools.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="cadastro-page__field cadastro-page__field--wide">
          <StyleSelector name="styles" initialStyles={editingCharacter?.styles || []} />
        </div>

        <div className="cadastro-page__section">
          <SectionHeader title="Vínculos (Bonds)" />
          <button 
            type="button" 
            className="cadastro-page__add-bond-btn"
            onClick={() => setIsBondModalOpen(true)}
          >
            + Criar Novo Vínculo
          </button>
        </div>

        <div className="cadastro-page__field cadastro-page__field--wide">
            <div className="bond-selector" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {sortedBonds.map(bond => {
                    const participants = characterBondLinks
                        .filter(link => link.bond_id === bond.id)
                        .map(link => allCharacters.find(c => c.id === link.character_id))
                        .filter(Boolean);

                    return (
                        <label key={bond.id} className={selectedBonds.includes(bond.id) ? "selected" : ""}>
                            <div className="bond-selector__header">
                                <input 
                                    type="checkbox" 
                                    checked={selectedBonds.includes(bond.id)}
                                    onChange={() => handleBondChange(bond.id)}
                                />
                                <span title={bond.description || undefined}>{bond.name}</span>
                            </div>
                            
                            {participants.length > 0 && (
                                <div className="bond-selector__participants">
                                    {participants.map(char => (
                                        <div key={char!.id} className="bond-selector__avatar" title={char!.name}>
                                            <img 
                                                src={char!.image_url || "/images/placeholder.png"} 
                                                alt={char!.name}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </label>
                    );
                })}
            </div>
        </div>

        {isBondModalOpen && (
            <BondCreationModal 
                isOpen={isBondModalOpen}
                onClose={() => setIsBondModalOpen(false)} 
                onSuccess={handleBondCreated} 
            />
        )}

        <div className="cadastro-page__section">
          <SectionHeader title="Vínculos de Status (Stats Bonds)" />
          <button 
            type="button" 
            className="cadastro-page__add-bond-btn"
            onClick={() => setIsStatsBondModalOpen(true)}
          >
            + Criar Novo Vínculo de Status
          </button>
        </div>

        <div className="cadastro-page__field cadastro-page__field--wide">
            <div className="bond-selector" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {sortedStatsBonds.map(statsBond => {
                    const participants = characterStatsBondLinks
                        .filter(link => link.stats_bond_id === statsBond.id)
                        .map(link => allCharacters.find(c => c.id === link.character_id))
                        .filter(Boolean);

                    return (
                        <label key={statsBond.id} className={selectedStatsBonds.includes(statsBond.id) ? "selected" : ""}>
                            <div className="bond-selector__header">
                                <input 
                                    type="checkbox" 
                                    checked={selectedStatsBonds.includes(statsBond.id)}
                                    onChange={() => handleStatsBondChange(statsBond.id)}
                                />
                                <span>{statsBond.name}</span>
                            </div>
                            
                            {participants.length > 0 && (
                                <div className="bond-selector__participants">
                                    {participants.map(char => (
                                        <div key={char!.id} className="bond-selector__avatar" title={char!.name}>
                                            <img 
                                                src={char!.image_url || "/images/placeholder.png"} 
                                                alt={char!.name}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </label>
                    );
                })}
                {sortedStatsBonds.length === 0 && (
                    <p className="text-zinc-500 text-sm p-2">Nenhum vínculo de status cadastrado.</p>
                )}
            </div>
        </div>

        {isStatsBondModalOpen && (
            <StatsBondCreationModal 
                isOpen={isStatsBondModalOpen}
                onClose={() => setIsStatsBondModalOpen(false)} 
                onSuccess={handleStatsBondCreated} 
            />
        )}

        <div className="cadastro-page__section">
          <SectionHeader title="Potenciais" />
        </div>
        <div className="cadastro-page__field">
             <label>Potencial (4 slots)</label>
             <select name="potential4" defaultValue={editingCharacter?.potential?.["4slots"] || ""}>
                 <option value="">Selecione...</option>
                 {allPotentials.map(p => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                 ))}
             </select>
        </div>
        <div className="cadastro-page__field">
             <label>Potencial (2 slots)</label>
             <select name="potential2" defaultValue={editingCharacter?.potential?.["2slots"] || ""}>
                 <option value="">Selecione...</option>
                 {allPotentials.map(p => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                 ))}
             </select>
        </div>

        <div className="cadastro-page__section">
            <SectionHeader title="Status Recomendados (Slots)" />
        </div>
        <div className="cadastro-page__attributes">
             {[1, 2, 3, 4, 5, 6].map(i => (
                 <div key={i} className="cadastro-page__attr">
                     <label>Slot {i}</label>
                     <input 
                        type="text" 
                        name={`slot${i}`} 
                        placeholder={`Status principal`} 
                        defaultValue={editingCharacter?.recommended_stats?.[`slot${i}` as keyof NonNullable<Character['recommended_stats']>] || ""}
                    />
                 </div>
             ))}
        </div>

        <div className="cadastro-page__section">
          <SectionHeader title="Atributos (0–9999)" />
        </div>

        <div className="cadastro-page__attributes">
          {[
            { label: "Saque (Serve)", name: "serve", val: editingCharacter?.serve },
            { label: "Ataque (Attack)", name: "attack", val: editingCharacter?.attack },
            { label: "Passe (Set)", name: "set", val: editingCharacter?.set },
            { label: "Recepção (Receive)", name: "receive", val: editingCharacter?.receive },
            { label: "Bloqueio (Block)", name: "block", val: editingCharacter?.block },
            { label: "Defesa (Defense)", name: "defense", val: editingCharacter?.defense },
          ].map((attr) => (
            <div key={attr.name} className="cadastro-page__attr">
              <label>{attr.label}</label>
              <input
                type="number"
                name={attr.name}
                min="0"
                max="9999"
                defaultValue={attr.val || 0}
                required
              />
            </div>
          ))}
        </div>

        <div className="cadastro-page__submit">
          <button type="submit" disabled={submitStatus === "saving"}>
            {submitStatus === "saving" ? "Salvando..." : (editingCharacter ? "Salvar Alterações" : "Cadastrar Personagem")}
          </button>
        </div>
      </form>
    </main>
  );
}

export default function CadastroPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <CadastroForm />
        </Suspense>
    );
}