"use client";
import React, { useEffect } from "react";
import { useTeamStore } from "@/stores/useTeamStore";
import { useCharacterStore } from "@/stores/useCharacterStore";
import { useUIStore } from "@/stores/useUIStore";

import { TeamCourt } from "./components/TeamCourt";
import { Bench } from "./components/Bench";
import { CharacterSelectionModal } from "./components/CharacterSelectionModal";
import { FeedbackToast } from "./components/FeedbackToast";
import { TeamControls } from "./components/TeamControls";
import { ActiveBondsDisplay } from "./components/ActiveBondsDisplay";

import "@/styles/pages/_home.scss";
import { TeamTypeDisplay } from "./components/TeamDisplay";
import { SavedTeamsModal } from "./components/SavedTeamsModal";

export default function Home() {
  // === STORES ===
  const team = useTeamStore((s) => s.team);
  const bench = useTeamStore((s) => s.bench);
  const isPositionFree = useTeamStore((s) => s.isPositionFree);
  const removeFromCourt = useTeamStore((s) => s.removeFromCourt);
  const removeFromBench = useTeamStore((s) => s.removeFromBench);

  const fetchInitialData = useCharacterStore((s) => s.fetchInitialData);
  const calculateBondsForTeam = useCharacterStore(
    (s) => s.calculateBondsForTeam
  );
  const allCharacters = useCharacterStore((s) => s.allCharacters);
  const allBonds = useCharacterStore((s) => s.allBonds);
  const loadingBonds = useCharacterStore((s) => s.loadingBonds);
  const bonds = useCharacterStore((s) => s.activeBonds);

  const feedbackMessage = useUIStore((s) => s.feedbackMessage);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    const hasTeamMembers = Object.values(team).some(
      (member) => member !== null
    );
    const dataLoaded = allCharacters.length > 0 && allBonds.length > 0;

    if (hasTeamMembers && dataLoaded) {
      calculateBondsForTeam(team);
    }
  }, [team, allCharacters, allBonds, calculateBondsForTeam]);

  return (
    <main className="home">
      <div className="home__layout">
        <section className="home__left">
          <div className="home__team-type">
            <TeamTypeDisplay />
          </div>
          <div className="home__court-wrapper">
            <TeamCourt
              team={team}
              onRemoveCharacter={removeFromCourt}
              isPositionFree={isPositionFree}
            />
          </div>

          <div className="home__controls">
            <TeamControls />
          </div>

          <div className="home__bonds">
            <ActiveBondsDisplay bonds={bonds} loading={loadingBonds} />
          </div>
        </section>

        <aside className="home__right">
          <Bench bench={bench} onRemoveFromBench={removeFromBench} />
        </aside>
      </div>

      <CharacterSelectionModal />
      < SavedTeamsModal />

      {feedbackMessage && (
        <FeedbackToast
          message={feedbackMessage.text}
          type={feedbackMessage.type}
        />
      )}
    </main>
  );
}
