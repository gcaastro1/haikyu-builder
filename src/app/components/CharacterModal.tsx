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
        if (allBondsResult.bonds) setAllAvailableBonds(allBondsResult.bonds);
        if (skillsResult.skills) setCharacterSkills(skillsResult.skills);
        if (statBondsResult.statsBonds)
          setCharacterStatBonds(statBondsResult.statsBonds);
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
    }

    setSaveStatus(overallSuccess ? "success" : "error");
    setSaveMessage(finalMessage);
    if (overallSuccess) setIsEditing(false);
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

  // --- Helpers ---
  const getValue = (key: keyof Character) =>
    (editedData as any)[key] ?? (character as any)[key] ?? "";
  const getNumberValue = (key: keyof Character) =>
    Number((editedData as any)[key] ?? (character as any)[key] ?? 0);

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
    <div className="database-character-modal" onClick={onClose}>
      <div
        className="database-character-modal__content"
        onClick={handleModalContentClick}
      >
        <div className="database-character-modal__header">
          <button
            onClick={isEditing ? handleCancel : onClose}
            aria-label={isEditing ? "Cancelar Edição" : "Fechar modal"}
          >
            <X size={24} />
          </button>
        </div>

        <div className="database-character-modal__body">
          <div className="modal-grid">
            <div className="modal-sidebar">
              <CharacterCard
                character={
                  {
                    ...character,
                    ...editedData,
                    image_url: currentImageUrl,
                  } as Character
                }
                dragId={`modal-${character.id}`}
                dragData={{}}
                originType="list"
              />
            </div>

            <div className="modal-content">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={getValue("name")}
                  onChange={handleInputChange}
                  className="database-character-modal__input"
                />
              ) : (
                <h2 className="database-character-modal__title">
                  {getValue("name")}
                </h2>
              )}

              <div className="meta">
                {isEditing ? (
                  <>
                    <select
                      name="rarity"
                      value={getValue("rarity")}
                      onChange={handleInputChange}
                      className="database-character-modal__select"
                    >
                      {rarities.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>

                    <select
                      name="position"
                      value={getValue("position")}
                      onChange={handleInputChange}
                      className="database-character-modal__select"
                    >
                      {positions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>

                    <select
                      name="school"
                      value={getValue("school")}
                      onChange={handleInputChange}
                      className="database-character-modal__select"
                    >
                      {schools.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <span>{getValue("rarity")}</span>
                    <span>{getValue("position")}</span>
                    <span>{getValue("school")}</span>
                  </>
                )}
              </div>

              <div className="database-character-modal__section">
                <h3>Atributos</h3>
                {["serve", "attack", "set", "receive", "block", "defense"].map(
                  (attr) => (
                    <div key={attr} className="attribute">
                      <strong>{attr}:</strong>
                      {isEditing ? (
                        <input
                          type="number"
                          name={attr}
                          value={getNumberValue(attr as keyof Character)}
                          onChange={handleInputChange}
                          className="database-character-modal__input"
                        />
                      ) : (
                        <span>{getNumberValue(attr as keyof Character)}</span>
                      )}
                    </div>
                  )
                )}
              </div>

              <div className="database-character-modal__section">
                <h3>Estilos</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedStylesString}
                    onChange={(e) => setEditedStylesString(e.target.value)}
                    placeholder="Estilos separados por vírgula"
                    className="database-character-modal__input"
                  />
                ) : character.styles?.length ? (
                  <div className="tags">
                    {character.styles.map((style) => (
                      <span key={style} className="tag">
                        {style}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="empty">Nenhum estilo definido.</p>
                )}
              </div>

              <div className="database-character-modal__section">
                <h3>Imagem</h3>
                {isEditing ? (
                  <ImageSelector
                    name="image_url_selector_only"
                    initialValue={editedImageUrl}
                    onChange={setEditedImageUrl}
                  />
                ) : (
                  <p className="empty">
                    {character.image_url
                      ? "Imagem exibida no card."
                      : "Nenhuma imagem definida."}
                  </p>
                )}
              </div>

              <div className="database-character-modal__section">
                <h3>Vínculos</h3>
                {isEditing ? (
                  loadingRelatedData ? (
                    <p className="loading">Carregando...</p>
                  ) : (
                    <BondSelector
                      initialSelectedIds={editedBondIds}
                      onChange={setEditedBondIds}
                    />
                  )
                ) : loadingRelatedData ? (
                  <p className="loading">Carregando...</p>
                ) : characterBondIds.length ? (
                  <div className="tags">
                    {characterBondIds.map((id) => (
                      <span key={id} className="tag">
                        {getBondNameById(id)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="empty">Nenhum vínculo definido.</p>
                )}
              </div>

              <div className="database-character-modal__section">
                <h3>Habilidades</h3>
                {loadingRelatedData ? (
                  <p className="loading">Carregando...</p>
                ) : (
                  <ul className="skills">
                    {characterSkills.length ? (
                      characterSkills.map((skill) => (
                        <li key={skill.id}>
                          <strong>{skill.name}</strong>
                          <p>{skill.description}</p>
                        </li>
                      ))
                    ) : (
                      <li className="empty">Nenhuma habilidade definida.</li>
                    )}
                  </ul>
                )}
              </div>

              <div className="database-character-modal__section">
                <h3>Bônus de Vínculo (Stats)</h3>
                {loadingRelatedData ? (
                  <p className="loading">Carregando...</p>
                ) : (
                  <ul className="skills">
                    {characterStatBonds.length ? (
                      characterStatBonds.map((sb) => (
                        <li key={sb.id}>
                          <strong>{sb.stats_bond_name}</strong>
                          <p>{sb.buff_description}</p>
                        </li>
                      ))
                    ) : (
                      <li className="empty">Nenhum bônus definido.</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="database-character-modal__footer">
          <div className="message-area">
            {saveStatus !== "idle" && saveStatus !== "saving" && (
              <p
                className={`database-character-modal__message ${
                  saveStatus === "success"
                    ? "database-character-modal__message--success"
                    : "database-character-modal__message--error"
                }`}
              >
                {saveMessage}
              </p>
            )}
          </div>

          <div className="actions">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="database-character-modal__button database-character-modal__button--cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === "saving"}
                  className={`database-character-modal__button database-character-modal__button--save ${
                    saveStatus === "saving" ? "disabled" : ""
                  }`}
                >
                  {saveStatus === "saving" ? (
                    <RotateCw size={16} className="spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Salvar
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="database-character-modal__button database-character-modal__button--edit"
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
