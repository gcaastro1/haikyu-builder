// src/app/database/CharacterModal.tsx
"use client";

import React, { useState, useEffect } from "react";

import {
  getCharacterBonds,
  updateCharacterBonds,
  getBonds,
  getCharacterSkills,
  getCharacterStatBonds,
  updateCharacter,
} from "../lib/actions";
import { X, Edit, Save, RotateCw } from "lucide-react";
import {
  Bond,
  Character,
  CharacterStatsBond,
  Position,
  Rarity,
  School,
  Skill,
} from "@/types";
import { CharacterCard } from "./CharacterCard";
import { ImageSelector } from "./ImageSelector";
import { BondSelector } from "./BondSelector";

// Define options here or import them
const positions: Position[] = ["OP", "MB", "WS", "S", "L"];
const rarities: Rarity[] = ["SR", "SSR", "UR", "SP"];
const schools: School[] = [
  "Aoba Johsai",
  "Date Tech",
  "Fukurodani",
  "Inarizaki",
  "Itachiyama",
  "Johzenji",
  "Kamomedai",
  "Karasuno",
  "Kitagawa Daichi",
  "Nekoma",
  "Shiratorizawa",
];

type CharacterModalProps = {
  character: Character;
  onClose: () => void;
};

export function CharacterModal({ character, onClose }: CharacterModalProps) {
  // --- States ---
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Character>>({});
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(
    character.image_url
  );
  const [editedStylesString, setEditedStylesString] = useState(
    character.styles?.join(", ") || ""
  );
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [characterBondIds, setCharacterBondIds] = useState<number[]>([]);
  const [editedBondIds, setEditedBondIds] = useState<number[]>([]);
  const [allAvailableBonds, setAllAvailableBonds] = useState<Bond[]>([]);
  const [characterSkills, setCharacterSkills] = useState<Skill[]>([]);
  const [characterStatBonds, setCharacterStatBonds] = useState<
    CharacterStatsBond[]
  >([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(true);

  // --- Fetch Related Data ---
  useEffect(() => {
    const loadRelatedData = async () => {
      setLoadingRelatedData(true);
      try {
        const [charBondsResult, allBondsResult, skillsResult, statBondsResult] =
          await Promise.all([
            getCharacterBonds(character.id),
            getBonds(),
            getCharacterSkills(character.id),
            getCharacterStatBonds(character.id),
          ]);

        if (charBondsResult.bondIds) {
          setCharacterBondIds(charBondsResult.bondIds);
          setEditedBondIds(charBondsResult.bondIds);
        }
        if (allBondsResult.bonds) {
          setAllAvailableBonds(allBondsResult.bonds);
        }
        if (skillsResult.skills) {
          setCharacterSkills(skillsResult.skills);
        }
        if (statBondsResult.statsBonds) {
          setCharacterStatBonds(statBondsResult.statsBonds);
        }
      } catch (error) {
        console.error("Erro ao carregar dados relacionados:", error);
        setSaveMessage("Erro ao carregar detalhes.");
        setSaveStatus("error");
      } finally {
        setLoadingRelatedData(false);
      }
    };
    loadRelatedData();
  }, [character.id]);

  const handleSave = async () => {
    setSaveStatus("saving");
    setSaveMessage("");
    let overallSuccess = true;
    let finalMessage = "";

    const finalData: Partial<Character> & { id: number } = {
      id: character.id,
      name: editedData.name ?? character.name,
      position: (editedData.position ?? character.position) as Position,
      rarity: (editedData.rarity ?? character.rarity) as Rarity,
      school: (editedData.school ?? character.school) as School,
      serve: editedData.serve ?? character.serve,
      attack: editedData.attack ?? character.attack,
      set: editedData.set ?? character.set,
      receive: editedData.receive ?? character.receive,
      block: editedData.block ?? character.block,
      defense: editedData.defense ?? character.defense,
      styles: editedStylesString
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      image_url: editedImageUrl,
    };

    const updateResult = await updateCharacter(finalData);

    if (!updateResult.success) {
      overallSuccess = false;
      finalMessage = updateResult.message;
    } else {
      finalMessage = updateResult.message;
      const bondsResult = await updateCharacterBonds(
        character.id,
        editedBondIds
      );
      if (!bondsResult.success) {
        overallSuccess = false;
        finalMessage += ` | ${bondsResult.message}`;
      } else {
        setCharacterBondIds(editedBondIds);
      }
      // TODO: Add logic to update Skills and StatBonds if they become editable
    }

    setSaveStatus(overallSuccess ? "success" : "error");
    setSaveMessage(finalMessage);
    if (overallSuccess) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedData({});
    setEditedImageUrl(character.image_url);
    setEditedStylesString(character.styles?.join(", ") || "");
    setEditedBondIds(characterBondIds);
    setIsEditing(false);
    setSaveStatus("idle");
    setSaveMessage("");
  };

  // --- Helper Functions ---
  const getValue = (key: keyof Character) => {
    const editedValue = (editedData as any)[key];
    const originalValue = (character as any)[key];
    return editedValue ?? originalValue ?? "";
  };
  const getNumberValue = (key: keyof Character) => {
    const editedValue = (editedData as any)[key];
    const originalValue = (character as any)[key];
    const value = editedValue ?? originalValue ?? 0;
    return Number(value);
  };
  const getBondNameById = (id: number): string => {
    const bond = allAvailableBonds.find((b) => b.id === id);
    return bond ? bond.name || `ID ${id}` : `ID ${id}`;
  };
  const currentImageUrl = isEditing ? editedImageUrl : character.image_url;
  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] border border-zinc-700 flex flex-col overflow-hidden"
        onClick={handleModalContentClick}
      >
        <div className="flex-shrink-0 p-4 border-b border-zinc-700 flex justify-end items-center">
          <button
            onClick={isEditing ? handleCancel : onClose}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label={isEditing ? "Cancelar Edição" : "Fechar modal"}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="w-full md:w-1/3 lg:w-[200px] flex-shrink-0 md:sticky md:top-6 self-start mx-auto md:mx-0">
              <CharacterCard
                character={
                  {
                    ...character,
                    ...editedData,
                    image_url: currentImageUrl,
                  } as Character
                }
                size="normal"
                dragId={`modal-${character.id}`}
                dragData={{}}
                originType="list"
              />
            </div>

            <div className="flex-grow flex flex-col text-zinc-300 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={getValue("name")}
                  onChange={handleInputChange}
                  className="text-2xl font-bold font-bricolage bg-zinc-800 border border-zinc-700 p-1 rounded mb-2 text-white w-full"
                />
              ) : (
                <h2 className="text-2xl font-bold font-bricolage text-white mb-2">
                  {getValue("name")}
                </h2>
              )}

              <div className="flex flex-wrap gap-2 items-center mb-4 text-sm">
                {isEditing ? (
                  <>
                    <select
                      name="rarity"
                      value={getValue("rarity")}
                      onChange={handleInputChange}
                      className="bg-zinc-700 px-2 py-1 rounded text-xs text-white cursor-pointer"
                    >
                      {" "}
                      {rarities.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}{" "}
                    </select>
                    <select
                      name="position"
                      value={getValue("position")}
                      onChange={handleInputChange}
                      className="bg-zinc-700 px-2 py-1 rounded text-xs text-white cursor-pointer"
                    >
                      {" "}
                      {positions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}{" "}
                    </select>
                    <select
                      name="school"
                      value={getValue("school")}
                      onChange={handleInputChange}
                      className="bg-zinc-700 px-2 py-1 rounded text-xs text-white cursor-pointer w-full sm:w-auto"
                    >
                      {" "}
                      {schools.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}{" "}
                    </select>
                  </>
                ) : (
                  <>
                    <span className="bg-zinc-700 px-2 py-0.5 rounded text-xs">
                      {getValue("rarity")}
                    </span>
                    <span className="bg-zinc-700 px-2 py-0.5 rounded text-xs">
                      {getValue("position")}
                    </span>
                    <span className="bg-zinc-700 px-2 py-0.5 rounded text-xs">
                      {getValue("school")}
                    </span>
                  </>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2 border-b border-zinc-700 pb-1">
                  Atributos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                  {[
                    "serve",
                    "attack",
                    "set",
                    "receive",
                    "block",
                    "defense",
                  ].map((attrKey) => (
                    <div key={attrKey} className="flex items-center gap-2">
                      <strong className="text-zinc-100 w-20 capitalize flex-shrink-0">
                        {attrKey}:
                      </strong>
                      {isEditing ? (
                        <input
                          type="number"
                          name={attrKey}
                          value={getNumberValue(attrKey as keyof Character)}
                          onChange={handleInputChange}
                          min="0"
                          className="bg-zinc-800 border border-zinc-700 p-1 rounded text-white w-20"
                        />
                      ) : (
                        <span>
                          {getNumberValue(attrKey as keyof Character)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2 border-b border-zinc-700 pb-1">
                  Estilos
                </h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedStylesString}
                    onChange={(e) => setEditedStylesString(e.target.value)}
                    placeholder="Estilos separados por vírgula"
                    className="w-full bg-zinc-800 border border-zinc-700 p-2 rounded text-xs text-white"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {character.styles && character.styles.length > 0 ? (
                      character.styles.map((style) => (
                        <span
                          key={style}
                          className="bg-zinc-700 text-xs px-2 py-0.5 rounded"
                        >
                          {style}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-500">
                        Nenhum estilo definido.
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2 border-b border-zinc-700 pb-1">
                  Imagem
                </h3>
                {isEditing ? (
                  <ImageSelector
                    name="image_url_selector_only"
                    initialValue={editedImageUrl}
                    onChange={setEditedImageUrl}
                  />
                ) : (
                  <p className="text-sm text-zinc-500 italic">
                    {character.image_url
                      ? "Imagem exibida no card."
                      : "Nenhuma imagem definida."}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2 border-b border-zinc-700 pb-1">
                  Vínculos
                </h3>
                {isEditing ? (
                  loadingRelatedData ? (
                    <p className="text-sm text-zinc-400">Carregando...</p>
                  ) : (
                    <BondSelector
                      initialSelectedIds={editedBondIds}
                      onChange={setEditedBondIds}
                    />
                  )
                ) : loadingRelatedData ? (
                  <p className="text-sm text-zinc-400">Carregando...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {characterBondIds.length > 0 ? (
                      characterBondIds.map((id) => (
                        <span
                          key={id}
                          className="bg-zinc-700 text-xs px-2 py-0.5 rounded"
                        >
                          {getBondNameById(id)}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-500">
                        Nenhum vínculo definido.
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2 border-b border-zinc-700 pb-1">
                  Habilidades
                </h3>
                {loadingRelatedData ? (
                  <p className="text-sm text-zinc-400">Carregando...</p>
                ) : isEditing ? (
                  <div>
                    <p className="text-sm text-zinc-500 italic">
                      (Edição não implementada)
                    </p>
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-sm space-y-2">
                    {characterSkills.length > 0 ? (
                      characterSkills.map((skill) => (
                        <li key={skill.id}>
                          <strong className="text-zinc-100">
                            {skill.name || "Sem nome"}
                          </strong>
                          <p className="text-xs text-zinc-400 ml-4">
                            {skill.description || "Sem descrição."}
                          </p>
                        </li>
                      ))
                    ) : (
                      <li className="text-zinc-500">
                        Nenhuma habilidade definida.
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2 border-b border-zinc-700 pb-1">
                  Bônus de Vínculo (Stats)
                </h3>
                {loadingRelatedData ? (
                  <p className="text-sm text-zinc-400">Carregando...</p>
                ) : isEditing ? (
                  <div>
                    <p className="text-sm text-zinc-500 italic">
                      (Edição não implementada)
                    </p>
                  </div>
                ) : (
                  <ul className="list-disc list-inside text-sm space-y-2">
                    {characterStatBonds.length > 0 ? (
                      characterStatBonds.map((sb) => (
                        <li key={sb.id}>
                          <strong className="text-zinc-100">
                            {sb.stats_bond_name || "Sem nome"}
                          </strong>
                          <p className="text-xs text-zinc-400 ml-4">
                            {sb.buff_description || "Sem descrição."}
                          </p>
                        </li>
                      ))
                    ) : (
                      <li className="text-zinc-500">Nenhum bônus definido.</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 p-4 border-t border-zinc-700 flex justify-between items-center">
          <div className="flex-grow mr-4">
            {saveStatus !== "idle" && saveStatus !== "saving" && (
              <p
                className={`p-2 text-center text-sm rounded ${
                  saveStatus === "success"
                    ? "bg-green-700/50 text-green-300"
                    : "bg-red-700/50 text-red-300"
                }`}
              >
                {saveMessage}
              </p>
            )}
          </div>

          <div className="flex gap-3 flex-shrink-0">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="bg-zinc-600 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === "saving"}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveStatus === "saving" ? (
                    <RotateCw size={16} className="animate-spin mr-1" />
                  ) : (
                    <Save size={16} className="mr-1" />
                  )}
                  Salvar
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
              >
                <Edit size={16} />
                Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
