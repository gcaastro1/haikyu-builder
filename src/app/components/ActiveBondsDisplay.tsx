import { useActiveBonds } from "@/hooks/useActiveBonds";
import { useCharacterStore } from "@/stores/useCharacterStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { Character, CharacterBondLink } from "@/types";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

export function ActiveBondsDisplay() {
  const [activeTab, setActiveTab] = useState<"ativos" | "pendentes">("ativos");
  const { allCharacters, characterBondLinks, loadingBonds } = useCharacterStore();
  const { team } = useTeamStore();
  const bonds = useActiveBonds();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredBondId, setHoveredBondId] = useState<number | null>(null);
  const [hoverPlacement, setHoverPlacement] = useState<"top" | "bottom">("bottom");
  const [openBondId, setOpenBondId] = useState<number | null>(null);

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      const containerEl = containerRef.current;
      if (!containerEl || !target) return;
      if (!containerEl.contains(target)) {
        setOpenBondId(null);
        return;
      }
      const closestCard = (target as HTMLElement).closest(".bond-card");
      if (!closestCard) setOpenBondId(null);
    };
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  const teamMembers = useMemo(() => Object.values(team).filter(Boolean) as Character[], [team]);
  const norm = (s: string) => s.toLowerCase().trim();
  const normalizeName = (name: string) =>
    name
      .toLowerCase()
      .replace(/\(.*?\)/g, "")
      .replace(/-sp| ur| sr| ssr| sp/gi, "")
      .trim();

  const linksByBond = useMemo(() => {
    const m = new Map<number, CharacterBondLink[]>();
    characterBondLinks.forEach((l) => {
      const arr = m.get(l.bond_id);
      if (arr) arr.push(l);
      else m.set(l.bond_id, [l]);
    });
    return m;
  }, [characterBondLinks]);

  const characterById = useMemo(() => {
    const m = new Map<number, Character>();
    allCharacters.forEach((ch) => m.set(ch.id, ch));
    return m;
  }, [allCharacters]);

  const uniqueByName = (arr: Character[]) => {
    const seen = new Set<string>();
    const out: Character[] = [];
    for (const c of arr) {
      const nm = normalizeName(c.name);
      if (seen.has(nm)) continue;
      seen.add(nm);
      out.push(c);
    }
    return out;
  };

  if (loadingBonds) {
    return (
      <div className="active-bonds-display">
        <p className="loading-text">Carregando vínculos...</p>
      </div>
    );
  }

  const activeBonds = bonds.filter((b) => b.isActive);
  const pendingBonds = bonds.filter(
    (b) => !b.isActive && b.hasAnyMemberOnCourt && !b.isTeamBond
  );

  const displayedBonds = activeTab === "ativos" ? activeBonds : pendingBonds;

  return (
    <div className="active-bonds-display">
      <div className="header">
        <h3>VÍNCULOS</h3>
        <div className="tabs">
          <button
            className={activeTab === "ativos" ? "tab active" : "tab"}
            onClick={() => setActiveTab("ativos")}
          >
            Ativos ({activeBonds.length})
          </button>
          <button
            className={activeTab === "pendentes" ? "tab active" : "tab"}
            onClick={() => setActiveTab("pendentes")}
          >
            Pendentes ({pendingBonds.length})
          </button>
        </div>
      </div>

      <div className="bonds-container" ref={containerRef}>
        {displayedBonds.length > 0 ? (
          displayedBonds.map((bond) => (
            <div
              key={bond.id}
              className={`bond-card ${bond.isActive ? "active" : "pending"} ${
                openBondId === bond.id ? "is-open" : ""
              }`}
              onMouseEnter={(e) => {
                setHoveredBondId(bond.id);
                const cardEl = e.currentTarget as HTMLElement;
                const tipEl = cardEl.querySelector<HTMLElement>(".bond-tooltip");
                const containerEl = containerRef.current;
                if (!tipEl || !containerEl) return;
                const tipH = tipEl.offsetHeight || 140;
                const contRect = containerEl.getBoundingClientRect();
                const cardRect = cardEl.getBoundingClientRect();
                const _spaceAbove = cardRect.top - contRect.top;
                const spaceBelow = contRect.bottom - cardRect.bottom;
                if (_spaceAbove < 48) {
                  setHoverPlacement("bottom");
                } else if (spaceBelow >= tipH + 12) {
                  setHoverPlacement("bottom");
                } else {
                  setHoverPlacement("top");
                }
              }}
              onMouseLeave={() => setHoveredBondId(null)}
              onClick={(e) => {
                const cardEl = e.currentTarget as HTMLElement;
                const tipEl = cardEl.querySelector<HTMLElement>(".bond-tooltip");
                const containerEl = containerRef.current;
                if (tipEl && containerEl) {
                  const tipH = tipEl.offsetHeight || 140;
                  const contRect = containerEl.getBoundingClientRect();
                  const cardRect = cardEl.getBoundingClientRect();
                  const _spaceAbove = cardRect.top - contRect.top;
                  const spaceBelow = contRect.bottom - cardRect.bottom;
                  if (_spaceAbove < 48) {
                    setHoverPlacement("bottom");
                  } else if (spaceBelow >= tipH + 12) {
                    setHoverPlacement("bottom");
                  } else {
                    setHoverPlacement("top");
                  }
                }
                setOpenBondId((prev) => (prev === bond.id ? null : bond.id));
              }}
            >
              <div className="bond-header">
                <span className="bond-name">{bond.name}</span>
                <span className="bond-progress">
                  {bond.currentCount}/{bond.totalRequired}
                </span>
              </div>
              <div className="bond-progress-bar">
                <div
                  className={`bond-progress-fill w-p${Math.min(
                    Math.round((bond.currentCount / bond.totalRequired) * 100),
                    100
                  )}`}
                ></div>
              </div>
              <p className="bond-description">{bond.description || "Sem descrição."}</p>
              {(() => {
                const membersOnCourt: Character[] = [];
                const membersOffCourt: Character[] = [];
                if (bond.isTeamBond && bond.name) {
                  const schoolNorm = norm(bond.name);
                  teamMembers.forEach((c) => {
                    const sc = c.school ? norm(String(c.school)) : "";
                    if (sc && sc === schoolNorm) membersOnCourt.push(c);
                  });
                  const allSchoolChars = allCharacters.filter((c) => {
                    const sc = c.school ? norm(String(c.school)) : "";
                    return sc && sc === schoolNorm;
                  });
                  const onIds = new Set(membersOnCourt.map((c) => c.id));
                  allSchoolChars.forEach((c) => {
                    if (!onIds.has(c.id)) membersOffCourt.push(c);
                  });
                } else {
                  const links = linksByBond.get(bond.id) || [];
                  const requiredIds = Array.from(new Set(links.map((lnk) => lnk.character_id)));
                  const requiredChars = requiredIds
                    .map((id) => characterById.get(id))
                    .filter((c): c is Character => !!c);
                  const teamIdsSet = new Set(teamMembers.map((c) => c.id));
                  requiredChars.forEach((c) => {
                    if (teamIdsSet.has(c.id)) membersOnCourt.push(c);
                    else membersOffCourt.push(c);
                  });
                }
                const allParticipants = uniqueByName([...membersOnCourt, ...membersOffCourt]);
                const onIdsSet = new Set(membersOnCourt.map((c) => c.id));
                return (
                  <>
                    {bond.isActive ? (
                      uniqueByName(membersOnCourt).length ? (
                        <div className="bond-members">
                          {uniqueByName(membersOnCourt).map((member) => (
                            <div key={member.id} className="bond-member-avatar" title={member.name}>
                              <Image
                                src={member.image_url || "/images/placeholder.png"}
                                alt={member.name}
                                width={24}
                                height={24}
                                unoptimized
                              />
                            </div>
                          ))}
                        </div>
                      ) : null
                    ) : (
                      allParticipants.length ? (
                        <div className="bond-members bond-members--nowrap">
                          {allParticipants.map((member) => (
                            <div
                              key={member.id}
                              className={`bond-member-avatar ${onIdsSet.has(member.id) ? "" : "off"}`}
                              title={member.name}
                            >
                              <Image
                                src={member.image_url || "/images/placeholder.png"}
                                alt={member.name}
                                width={24}
                                height={24}
                                unoptimized
                              />
                            </div>
                          ))}
                        </div>
                      ) : null
                    )}
                    <div
                      className={`bond-tooltip ${
                        ((hoveredBondId === bond.id || openBondId === bond.id) &&
                          hoverPlacement === "bottom")
                          ? "bond-tooltip--bottom"
                          : ""
                      }`}
                    >
                      <p className="bond-tooltip__desc">{bond.description || "Sem descrição."}</p>
                      <div className="bond-tooltip__participants">
                        {allParticipants.map((member) => (
                          <div
                            key={`tip-${member.id}`}
                            className={`bond-tooltip__avatar ${onIdsSet.has(member.id) ? "on" : "off"}`}
                            title={member.name}
                          >
                            <Image
                              src={member.image_url || "/images/placeholder.png"}
                              alt={member.name}
                              width={24}
                              height={24}
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ))
        ) : (
          <p className="empty-text">
            {activeTab === "ativos"
              ? "Nenhum vínculo ativo."
              : "Nenhum vínculo pendente."}
          </p>
        )}
      </div>
    </div>
  );
}
