"use client";

import { getRarityBackground } from "@/app/lib/rarityBackgrounds";
import { useCharacterStore } from "@/stores/useCharacterStore";
import { Bond, Character, CharacterStatsBond, Skill } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import {
    getBonds,
    getCharacterBonds,
    getCharacterSkills,
    getCharacterStatBonds,
} from "../lib/actions";

type CharacterModalProps = {
  character: Character;
  onClose: () => void;
};

type TabKey =
  | "Summary"
  | "Skills"
  | "Bonds"
  | "Resonances"
  | "Memory"
  | "Teams";

export function CharacterModal({ character, onClose }: CharacterModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("Summary");
  const [characterBondIds, setCharacterBondIds] = useState<number[]>([]);
  const [allAvailableBonds, setAllAvailableBonds] = useState<Bond[]>([]);
  const [characterSkills, setCharacterSkills] = useState<Skill[]>([]);
  const [characterStatBonds, setCharacterStatBonds] = useState<
    CharacterStatsBond[]
  >([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(true);

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
        if (charBondsResult.bondIds) setCharacterBondIds(charBondsResult.bondIds);
        if (allBondsResult.bonds) setAllAvailableBonds(allBondsResult.bonds);
        if (skillsResult.skills) setCharacterSkills(skillsResult.skills);
        if (statBondsResult.statsBonds)
          setCharacterStatBonds(statBondsResult.statsBonds);
      } catch {
      } finally {
        setLoadingRelatedData(false);
      }
    };
    loadRelatedData();
  }, [character.id]);

  const bondMap = useMemo(
    () => new Map(allAvailableBonds.map((b) => [b.id, b])),
    [allAvailableBonds]
  );

  const rarityBg = useMemo(() => getRarityBackground(character.rarity!), [character.rarity]);

  const allMemories = useCharacterStore((s) => s.allMemories);
  const allCharacters = useCharacterStore((s) => s.allCharacters);
  const characterBondLinks = useCharacterStore((s) => s.characterBondLinks);
  const memoryForCharacter = useMemo(() => {
    const pos = (character.position || "").toString();
    return (
      allMemories.find((m) =>
        (m.positions || []).some((p) => p.toString() === pos)
      ) || null
    );
  }, [allMemories, character.position]);

  const bondParticipants = useMemo(() => {
    const map = new Map<number, { id: number; name: string; image_url: string | null }[]>();
    characterBondLinks.forEach((link) => {
      const ch = allCharacters.find((c) => c.id === link.character_id);
      if (!ch) return;
      if (!map.has(link.bond_id)) map.set(link.bond_id, []);
      map.get(link.bond_id)!.push({ id: ch.id, name: ch.name, image_url: ch.image_url });
    });
    return map;
  }, [characterBondLinks, allCharacters]);

  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="database-character-modal" onClick={onClose}>
      <motion.div
        className="database-character-modal__content"
        onClick={handleModalContentClick}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        layout
      >
        <div className="database-character-modal__header">
          <h2 className="database-character-modal__title">{character.name}</h2>
          <button onClick={onClose} aria-label="Fechar modal">
            <X size={24} />
          </button>
        </div>

        <div className="database-character-modal__body">
          <div className="modal-content">
            <motion.nav className="tabs" layout>
              {(
                ["Summary", "Skills", "Bonds", "Resonances", "Memory", "Teams"] as TabKey[]
              ).map((tab) => (
                <button
                  key={tab}
                  className={`tabs__item ${activeTab === tab ? "tabs__item--active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {activeTab === tab && (
                    <motion.div
                      className="tabs__underline"
                      layoutId="tabs-underline"
                      transition={{ type: "spring", stiffness: 500, damping: 28 }}
                    />
                  )}
                  {tab}
                </button>
              ))}
            </motion.nav>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className="tab-panel"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ type: "spring", stiffness: 340, damping: 26 }}
                layout
              >
                {activeTab === "Summary" && (
                  <div className="summary-grid">
                    <div className="summary-info">
                      <div className="meta">
                        <span
                          className={`badge badge--rarity badge--rarity-${(
                            character.rarity || ""
                          )
                            .toString()
                            .toLowerCase()}`}
                        >
                          {character.rarity || ""}
                        </span>
                        <span className="badge badge--position">
                          {character.position || ""}
                        </span>
                        {(() => {
                          const s = (character.school || "")
                            .toString()
                            .toLowerCase()
                            .replace(/\s+/g, "-");
                          return (
                            <span className={`badge badge--school badge--school-${s}`}>
                              {character.school || ""}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="database-character-modal__section">
                        <h3>Atributos</h3>
                        {["serve", "attack", "set", "receive", "block", "defense"].map(
                          (attr) => (
                            <div key={attr} className="attribute">
                              <strong>{attr}:</strong>
                              <span>{Number((character as any)[attr] ?? 0)}</span>
                            </div>
                          )
                        )}
                      </div>
                      <div className="database-character-modal__section">
                        <h3>Estilos</h3>
                        {character.styles?.length ? (
                          <div className="summary-styles">
                            {character.styles.map((styleKey) => (
                              <Image
                                key={styleKey}
                                src={`/images/styles/${styleKey}.png`}
                                alt={String(styleKey)}
                                width={24}
                                height={24}
                                className="summary-style-icon"
                                unoptimized
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="empty">Nenhum estilo definido.</p>
                        )}
                      </div>
                    </div>
                    <div className="summary-visual">
                      <div className="summary-card">
                        <motion.img
                          src={rarityBg}
                          alt=""
                          className="summary-card__background"
                          initial={{ scale: 1.06, y: -10 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 260, damping: 24 }}
                        />
                        <img
                          src={character.image_url || "/images/placeholder.png"}
                          alt={character.name}
                          className="summary-card__image"
                        />
                        <div className="summary-card__overlay" />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "Skills" && (
                  <>
                    {loadingRelatedData ? (
                      <p className="loading">Carregando...</p>
                    ) : (
                      <div className="skills-grid">
                        {characterSkills.length ? (
                          characterSkills.map((skill) => {
                            const variant = (skill.type || "Normal").toString().toLowerCase();
                            const label = (skill.type || "Normal").toString();
                            const badgeClass =
                              variant === "special"
                                ? "skill-badge skill-badge--special"
                                : "skill-badge skill-badge--normal";
                            const cardClass =
                              variant === "special"
                                ? "skill-card skill-card--special"
                                : "skill-card";
                            return (
                              <div key={skill.id} className={cardClass}>
                                <div className="skill-card__header">
                                  <strong>{skill.name}</strong>
                                  <span className={badgeClass}>{label}</span>
                                </div>
                                <p className="skill-card__desc">{skill.description}</p>
                              </div>
                            );
                          })
                        ) : (
                          <p className="empty">Nenhuma habilidade definida.</p>
                        )}
                      </div>
                    )}
                  </>
                )}
                {activeTab === "Bonds" && (
                  <>
                    {loadingRelatedData ? (
                      <p className="loading">Carregando...</p>
                    ) : characterBondIds.length ? (
                      <ul className="list">
                        {characterBondIds.map((id) => {
                          const b = bondMap.get(id);
                          const participants = bondParticipants.get(id) || [];
                          return (
                            <li key={id} className="list-item">
                              <div className="bond-item__header">
                                <strong>{b?.name || `ID ${id}`}</strong>
                                <span className="bond-participants__count">{participants.length}</span>
                              </div>
                              <p>{b?.description || ""}</p>
                              {participants.length > 0 && (
                                <div className="bond-participants">
                                  {participants.map((p) => (
                                    <div key={p.id} className="bond-participant">
                                      {p.image_url ? (
                                        <Image
                                          src={p.image_url}
                                          alt={p.name}
                                          width={24}
                                          height={24}
                                          className="bond-participant__image"
                                          unoptimized
                                        />
                                      ) : (
                                        <span className="bond-participant__placeholder" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="empty">Nenhum vínculo definido.</p>
                    )}
                  </>
                )}
                {activeTab === "Resonances" && (
                  <>
                    {character.resonance ? (
                      <div className="resonance-timeline">
                        {(["re1", "re2", "re3", "re4", "re5"] as const).map((key, idx) => {
                          const text = character.resonance?.[key] || "";
                          return (
                            <div key={key} className="resonance-item">
                              <div className="resonance-item__dot">{["I","II","III","IV","V"][idx]}</div>
                              <div className="resonance-item__content">
                                <strong>Ressonância {idx + 1}</strong>
                                <p>{text || "Em breve."}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <>
                        {loadingRelatedData ? (
                          <p className="loading">Carregando...</p>
                        ) : (
                          <ul className="list">
                            {characterStatBonds.length ? (
                              characterStatBonds.map((sb) => (
                                <li key={sb.id} className="list-item">
                                  <strong>{sb.stats_bond_name}</strong>
                                  <p>{sb.buff_description}</p>
                                </li>
                              ))
                            ) : (
                              <li className="empty">Nenhuma ressonância definida.</li>
                            )}
                          </ul>
                        )}
                      </>
                    )}
                  </>
                )}
                {activeTab === "Memory" && (
                  <>
                    {memoryForCharacter ? (
                      <div className="memory-card">
                        <div className="memory-hero">
                          <img
                            src={memoryForCharacter.image_url}
                            alt={memoryForCharacter.name}
                            className="memory-hero__image"
                          />
                          <div className="memory-hero__overlay" />
                        </div>
                        <h3 className="memory-title">
                          {memoryForCharacter.name}
                        </h3>
                        <div className="memory-panel">
                          <p className="memory-desc">{memoryForCharacter.desc}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="empty">Nenhuma memória correspondente.</p>
                    )}
                  </>
                )}
                {activeTab === "Teams" && <p className="empty">Em breve.</p>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
