import { CalculatedBond } from "@/types";
import React, { useState } from "react";

type ActiveBondsDisplayProps = {
  bonds: CalculatedBond[];
  loading: boolean;
};

export function ActiveBondsDisplay({ bonds, loading }: ActiveBondsDisplayProps) {
  const [activeTab, setActiveTab] = useState<"ativos" | "pendentes">("ativos");

  if (loading) {
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

      <div className="bonds-container">
        {displayedBonds.length > 0 ? (
          displayedBonds.map((bond) => (
            <div
              key={bond.id}
              className={`bond-card ${bond.isActive ? "active" : "pending"}`}
            >
              <div className="bond-header">
                <span className="bond-name">{bond.name}</span>
                <span className="bond-progress">
                  {bond.currentCount}/{bond.totalRequired}
                </span>
              </div>
              <div className="bond-progress-bar">
                <div
                  className="bond-progress-fill"
                  style={{
                    width: `${Math.min(
                      (bond.currentCount / bond.totalRequired) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="bond-description">
                {bond.description || "Sem descrição."}
              </p>
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
