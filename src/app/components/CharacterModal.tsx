"use client";

import { getRarityBackground } from "@/app/lib/rarityBackgrounds";
import { DEFAULT_RARITY_COLOR, RARITY_COLORS } from "@/constants/theme";
import { useCharacterStore } from "@/stores/useCharacterStore";
import { Bond, CharacterStatsBond, Potential, Skill } from "@/types";
import { CharacterModalProps, CharacterModalTabKey } from "@/types/components";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import {
    getBonds,
    getCharacterBonds,
    getCharacterSkills,
    getCharacterStatBonds,
    getPotentials
} from "../lib/actions";
import styles from "./CharacterModal.module.scss";
import { HexagonStatChart } from "./HexagonStatChart";

export function CharacterModal({ character, onClose }: CharacterModalProps) {
  const [activeTab, setActiveTab] = useState<CharacterModalTabKey>("Resumo");
  const [characterBondIds, setCharacterBondIds] = useState<number[]>([]);
  const [allAvailableBonds, setAllAvailableBonds] = useState<Bond[]>([]);
  const [characterSkills, setCharacterSkills] = useState<Skill[]>([]);
  const [characterStatBonds, setCharacterStatBonds] = useState<
    CharacterStatsBond[]
  >([]);
  const [allPotentials, setAllPotentials] = useState<Potential[]>([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const loadRelatedData = async () => {
      setLoadingRelatedData(true);
      try {
        const [
          charBondsResult,
          allBondsResult,
          skillsResult,
          statBondsResult,
          potentialsResult,
        ] = await Promise.all([
          getCharacterBonds(character.id),
          getBonds(),
          getCharacterSkills(character.id),
          getCharacterStatBonds(character.id),
          getPotentials(),
        ]);
        if (charBondsResult.bondIds) setCharacterBondIds(charBondsResult.bondIds);
        if (allBondsResult.bonds) setAllAvailableBonds(allBondsResult.bonds);
        if (skillsResult.skills) setCharacterSkills(skillsResult.skills);
        if (statBondsResult.statsBonds)
          setCharacterStatBonds(statBondsResult.statsBonds);
        if (potentialsResult.potentials) setAllPotentials(potentialsResult.potentials);
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

  const rarityBg = useMemo(() => getRarityBackground(character.rarity), [character.rarity]);

  const rarityColor = RARITY_COLORS[(character.rarity || "SR") as keyof typeof RARITY_COLORS] || DEFAULT_RARITY_COLOR;

  const styleKeys: string[] = useMemo(() => {
    const keys = Array.isArray(character.styles) ? character.styles : [];
    const addSetter = character.position === "S" && !keys.includes("setter");
    return addSetter ? [...keys, "setter"] : keys;
  }, [character.styles, character.position]);

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
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.container}>
        <motion.div
          className={styles.content}
          onClick={handleModalContentClick}
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 14 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          layout
          tabIndex={-1}
        >
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.headerTop}>
              <h2 className={styles.title}>{character.name}</h2>
              <div className={styles.headerBadges}>
                <span
                  className={`${styles.badge} ${
                    (character.rarity || "").toString().toLowerCase() === "ur"
                      ? styles.badgeRarityUr
                      : (character.rarity || "").toString().toLowerCase() === "ssr"
                      ? styles.badgeRaritySsr
                      : (character.rarity || "").toString().toLowerCase() === "sp"
                      ? styles.badgeRaritySp
                      : styles.badgeRaritySr
                  }`}
                >
                  {character.rarity || ""}
                </span>
                <span className={`${styles.badge} ${styles.badgePosition}`}>
                  {character.position || ""}
                </span>
              </div>
            </div>
            <div className={styles.headerSchool}>
              {character.school || ""}
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar modal" className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.mainContent}>
            <motion.nav className={styles.tabs} layout>
              {(
                [
                  "Resumo",
                  "Habilidades",
                  "Vínculos",
                  "Ressonâncias",
                  "Memória",
                  "Potenciais",
                ] as CharacterModalTabKey[]
              ).map((tab) => (
                <button
                  key={tab}
                  className={`${styles.tabItem} ${activeTab === tab ? styles.tabItemActive : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {activeTab === tab && (
                    <motion.div
                      className={styles.underline}
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={styles.tabPanel}
              >
                {activeTab === "Resumo" && (
                  <div className={styles.summary}>
                    <div className={styles.summaryVisual}>
                      <div
                        className={styles.imageFrame}
                        style={{ borderColor: rarityColor }}
                      >
                        <div className={styles.imageBgWrapper}>
                          <Image
                            src={rarityBg}
                            alt=""
                            fill
                            className={styles.imageBg}
                            unoptimized
                          />
                        </div>
                        {character.image_url && (
                          <div className={styles.imageClipper}>
                            <Image
                              src={character.image_url}
                              alt={character.name}
                              fill
                              className={styles.characterImage}
                              unoptimized
                              priority
                            />
                          </div>
                        )}
                        <div className={styles.visualFooter}>
                          {styleKeys.length > 0 && (
                            <div className={styles.styles}>
                              {styleKeys.map((styleKey) => (
                                <Image
                                  key={styleKey}
                                  src={`/images/styles/${styleKey}.png`}
                                  alt={String(styleKey)}
                                  width={36}
                                  height={36}
                                  className={styles.styleIcon}
                                  unoptimized
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={styles.summaryInfo}>
                      <div className={styles.section}>
                        <HexagonStatChart
                          stats={{
                            serve: Number(character.serve ?? 0),
                            attack: Number(character.attack ?? 0),
                            set: Number(character.set ?? 0),
                            receive: Number(character.receive ?? 0),
                            block: Number(character.block ?? 0),
                            defense: Number(character.defense ?? 0),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "Habilidades" && (
                  <>
                    {loadingRelatedData ? (
                      <p className={styles.loading}>Carregando...</p>
                    ) : (
                      <div className={styles.skills}>
                         {characterSkills.length > 0 ? (
                            <div className={styles.skillsGrid}>
                              {characterSkills.map((skill, index) => {
                                const variant = (skill.type || "Normal").toString().toLowerCase();
                                const label = (skill.type || "Normal").toString();
                                const isSpecial = variant === "special";
                                
                                return (
                                  <div
                                    key={skill.id ?? index}
                                    className={`${styles.skillCard} ${isSpecial ? styles.skillCardSpecial : ""}`}
                                  >
                                    <div className={styles.skillCardHeader}>
                                      <strong>{skill.name}</strong>
                                      <span className={`${styles.skillBadge} ${isSpecial ? styles.skillBadgeSpecial : ""}`}>
                                        {label}
                                      </span>
                                    </div>
                                    <p className={styles.skillCardDesc}>
                                      {skill.description}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                        ) : (
                          <p className={styles.empty}>Nenhuma habilidade definida.</p>
                        )}
                      </div>
                    )}
                  </>
                )}
                {activeTab === "Vínculos" && (
                  <>
                    {loadingRelatedData ? (
                      <p className={styles.loading}>Carregando...</p>
                    ) : characterBondIds.length ? (
                      <ul className={styles.list}>
                        {characterBondIds.map((id) => {
                          const b = bondMap.get(id);
                          const participants = bondParticipants.get(id) || [];
                          return (
                            <li key={id} className={styles.listItem}>
                              <div className={styles.bondHeader}>
                                <strong>{b?.name || `ID ${id}`}</strong>
                                <span className={styles.bondCount}>{participants.length}</span>
                              </div>
                              <p>{b?.description || ""}</p>
                              {participants.length > 0 && (
                                <div className={styles.bondParticipants}>
                                  {participants.map((p) => (
                                    <div key={p.id} className={styles.bondParticipant}>
                                      {p.image_url ? (
                                        <Image
                                          src={p.image_url}
                                          alt={p.name}
                                          width={24}
                                          height={24}
                                          unoptimized
                                        />
                                      ) : (
                                        <span className={styles.bondParticipantPlaceholder} />
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
                      <p className={styles.empty}>Nenhum vínculo definido.</p>
                    )}
                  </>
                )}
                {activeTab === "Ressonâncias" && (
                  <>
                    {character.resonance ? (
                      <div className={styles.resonanceTimeline}>
                        {(["re1", "re2", "re3", "re4", "re5"] as const).map((key, idx) => {
                          const text = character.resonance?.[key] || "";
                          return (
                            <div key={key} className={styles.resonanceItem}>
                              <div className={styles.resonanceDot}>{["I","II","III","IV","V"][idx]}</div>
                              <div className={styles.resonanceContent}>
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
                          <p className={styles.loading}>Carregando...</p>
                        ) : (
                          <ul className={styles.list}>
                            {characterStatBonds.length ? (
                              characterStatBonds.map((sb) => (
                                <li key={sb.id} className={styles.listItem}>
                                  <strong>{sb.stats_bond_name}</strong>
                                  <p>{sb.buff_description}</p>
                                </li>
                              ))
                            ) : (
                              <li className={styles.empty}>Nenhuma ressonância definida.</li>
                            )}
                          </ul>
                        )}
                      </>
                    )}
                  </>
                )}
                {activeTab === "Memória" && (
                  <>
                    {memoryForCharacter ? (
                      <div className={styles.memoryCard}>
                        <div className={styles.memoryHero}>
                          <img
                            src={memoryForCharacter.image_url}
                            alt={memoryForCharacter.name}
                            className={styles.memoryHeroImage}
                          />
                          <div className={styles.memoryOverlay} />
                        </div>
                        <h3 className={styles.memoryTitle}>
                          {memoryForCharacter.name}
                        </h3>
                        <div className={styles.memoryPanel}>
                          <p className={styles.memoryDesc}>{memoryForCharacter.desc}</p>
                        </div>
                      </div>
                    ) : (
                      <p className={styles.empty}>Nenhuma memória correspondente.</p>
                    )}
                  </>
                )}
                {activeTab === "Potenciais" && (
                  <div className={styles.potentials}>
                    <div className={styles.potentialsGrid}>
                      {([1, 2, 3, 4, 5, 6] as const).map((num) => {
                        const slotKey = `slot${num}` as keyof typeof character.recommended_stats;
                        const value = character.recommended_stats?.[slotKey];
                        return (
                          <div key={num} className={styles.potentialSlot}>
                            <span className={styles.potentialLabel}>
                              {["I", "II", "III", "IV", "V", "VI"][num - 1]}
                            </span>
                            <span className={styles.potentialValue}>
                              {value || "-"}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className={styles.potentialsSets}>
                      <div className={styles.potentialSet}>
                        <h4>Set 2</h4>
                        {(() => {
                          const potId = character.potential?.["2slots"];
                          const pot = allPotentials.find((p) => p.id === potId);
                          return pot ? (
                            <div className={styles.potentialCard}>
                              <Image
                                src={pot.image_url}
                                alt={pot.name}
                                width={48}
                                height={48}
                                className={styles.potentialIcon}
                                unoptimized
                              />
                              <span>{pot.name}</span>
                            </div>
                          ) : (
                            <p className={styles.empty}>-</p>
                          );
                        })()}
                      </div>
                      <div className={styles.potentialSet}>
                        <h4>Set 4</h4>
                        {(() => {
                          const potId = character.potential?.["4slots"];
                          const pot = allPotentials.find((p) => p.id === potId);
                          return pot ? (
                            <div className={styles.potentialCard}>
                              <Image
                                src={pot.image_url}
                                alt={pot.name}
                                width={48}
                                height={48}
                                className={styles.potentialIcon}
                                unoptimized
                              />
                              <span>{pot.name}</span>
                            </div>
                          ) : (
                            <p className={styles.empty}>-</p>
                          );
                        })()}
                      </div>
                    </div>

                    <div className={styles.potentialsSubstats}>
                      <h3>Atributos Recomendados</h3>
                      <p>
                        {character.substats ||
                          "Nenhuma recomendação disponível."}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
