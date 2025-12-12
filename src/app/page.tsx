"use client";
import { useHydrateStores } from "@/hooks/useHydrateStores";
import { useCharacterStore } from "@/stores/useCharacterStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { useUIStore } from "@/stores/useUIStore";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { ActiveBondsDisplay } from "./components/ActiveBondsDisplay";
import { CharacterList } from "./components/CharacterList";
import { DragDropProvider } from "./components/DragDropProvider";
import { TeamControls } from "./components/TeamControls";
import { TeamCourt } from "./components/TeamCourt";
const CharacterSelectionModal = dynamic(() =>
  import("./components/CharacterSelectionModal").then((m) => m.CharacterSelectionModal)
);
const FeedbackToast = dynamic(() =>
  import("./components/FeedbackToast").then((m) => m.FeedbackToast)
);

import "@/styles/pages/_home.scss";
import { TeamTypeDisplay } from "./components/TeamDisplay";
const SavedTeamsModal = dynamic(() =>
  import("./components/SavedTeamsModal").then((m) => m.SavedTeamsModal)
);

export default function Home() {
  // ✅ Hidratação dos stores apenas no cliente (evita erro de hidratação SSR)
  const _isHydrated = useHydrateStores();

  // === STORES - Otimizado: seletores combinados com useShallow para evitar loops infinitos ===
  const { team, isPositionFree, removeFromCourt } = useTeamStore(
    useShallow((s) => ({
      team: s.team,
      isPositionFree: s.isPositionFree,
      removeFromCourt: s.removeFromCourt,
    }))
  );

  const { 
    fetchInitialData, 
    calculateBondsForTeam, 
    allCharacters, 
    allBonds, 
    loadingBonds, 
    activeBonds: bonds 
  } = useCharacterStore(
    useShallow((s) => ({
      fetchInitialData: s.fetchInitialData,
      calculateBondsForTeam: s.calculateBondsForTeam,
      allCharacters: s.allCharacters,
      allBonds: s.allBonds,
      loadingBonds: s.loadingBonds,
      activeBonds: s.activeBonds,
    }))
  );

  const feedbackMessage = useUIStore((s) => s.feedbackMessage);
  const courtRef = useRef<HTMLDivElement | null>(null);
  const [bondsHeight, setBondsHeight] = useState<number | undefined>(undefined);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const el = courtRef.current;
    if (!el || !isDesktop) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = Math.round(entry.contentRect.height);
        if (h >= 240 && h <= 1400) {
          setBondsHeight(h);
        }
      }
    });
    ro.observe(el);
    const initialH = Math.round(el.getBoundingClientRect().height);
    if (initialH >= 240 && initialH <= 1400) setBondsHeight(initialH);
    return () => ro.disconnect();
  }, [isDesktop]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 992px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
    <DragDropProvider>
      <main className="home">
        <div className="home__layout">
          <section className="home__left">
            <div className="home__team-type">
              <TeamTypeDisplay />
            </div>
            
            <div className="home__court-section">
              <div className="home__court-wrapper" ref={courtRef}>
                <TeamCourt
                  team={team}
                  onRemoveCharacter={removeFromCourt}
                  isPositionFree={isPositionFree}
                />
              </div>

            {/* Banco de reservas removido desta tela */}
            </div>

            <div className="home__controls">
              <TeamControls />
            </div>

          </section>

          <section className="home__right">
            <div
              className="home__bonds"
              style={{ height: isDesktop && bondsHeight ? `${bondsHeight}px` : undefined }}
            >
              <ActiveBondsDisplay bonds={bonds} loading={loadingBonds} />
            </div>
          </section>
        </div>

        {/* Drawer fixo (desktop/mobile) */}
        <CharacterList />

        <CharacterSelectionModal />
        <SavedTeamsModal />

        {feedbackMessage && (
          <FeedbackToast
            message={feedbackMessage.text}
            type={feedbackMessage.type}
          />
        )}
      </main>
    </DragDropProvider>
  );
}
