import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useTelemetry } from "./useTelemetry";

export type GamePhase = "ready" | "playing" | "ended";
export type RunStage = "selection" | "combat" | "boss" | "extraction" | "build";

interface GameState {
  phase: GamePhase;
  runStage: RunStage;
  worldTier: number;
  challengeModifiers: string[];
  
  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
  setWorldTier: (tier: number) => void;
  setChallengeModifiers: (modifiers: string[]) => void;
  advanceRunStage: () => void;
}

const RUN_SEQUENCE: RunStage[] = ["selection", "combat", "boss", "extraction", "build"];

export const useGame = create<GameState>()(
  subscribeWithSelector((set) => ({
    phase: "ready",
    runStage: "selection",
    worldTier: 1,
    challengeModifiers: [],
    
    start: () => {
      set((state) => {
        // Only transition from ready to playing
        if (state.phase === "ready") {
          useTelemetry.getState().recordRunSnapshot({
            timestamp: Date.now(),
            phase: "playing",
            worldTier: state.worldTier,
            challengeModifierCount: state.challengeModifiers.length,
          });
          return { phase: "playing", runStage: "combat" };
        }
        return {};
      });
    },
    
    restart: () => {
      set(() => ({ phase: "ready", runStage: "selection" }));
    },
    
    end: () => {
      set((state) => {
        // Only transition from playing to ended
        if (state.phase === "playing") {
          useTelemetry.getState().recordRunSnapshot({
            timestamp: Date.now(),
            phase: "ended",
            worldTier: state.worldTier,
            challengeModifierCount: state.challengeModifiers.length,
          });
          return { phase: "ended", runStage: "build" };
        }
        return {};
      });
    },

    setWorldTier: (tier) => {
      set({ worldTier: Math.max(1, Math.min(10, tier)) });
    },

    setChallengeModifiers: (modifiers) => {
      set({ challengeModifiers: modifiers });
    },

    advanceRunStage: () => {
      set((state) => {
        const idx = RUN_SEQUENCE.indexOf(state.runStage);
        const next = RUN_SEQUENCE[(idx + 1) % RUN_SEQUENCE.length];
        useTelemetry.getState().recordRunSnapshot({
          timestamp: Date.now(),
          phase: `stage:${next}`,
          worldTier: state.worldTier,
          challengeModifierCount: state.challengeModifiers.length,
        });
        return { runStage: next };
      });
    },
  }))
);
