import { create } from "zustand";
import { STORY_ZONES, StoryZone, StoryMission, StorySystem } from "../StorySystem";

interface StoryState {
  zones: StoryZone[];
  currentZoneId: string;
  activeMissionId: string | null;

  // Derived helpers
  currentZone: () => StoryZone;
  getZone: (id: string) => StoryZone | undefined;

  // Actions
  advanceToZone: (zoneId: string) => void;
  unlockZonesForLevel: (playerLevel: number) => void;
  completeMission: (missionId: string) => void;
  setActiveMission: (missionId: string | null) => void;
  completeCurrentZone: () => void;
}

export const useStory = create<StoryState>((set, get) => ({
  zones: STORY_ZONES.map(z => ({ ...z, missions: z.missions.map(m => ({ ...m })) })),
  currentZoneId: 'zone_crypt',
  activeMissionId: null,

  currentZone: () => {
    const { zones, currentZoneId } = get();
    return zones.find(z => z.id === currentZoneId) ?? zones[0];
  },

  getZone: (id) => get().zones.find(z => z.id === id),

  advanceToZone: (zoneId) => {
    set({ currentZoneId: zoneId, activeMissionId: null });
  },

  unlockZonesForLevel: (playerLevel) => {
    const unlockedIds = StorySystem.computeUnlockedZones(playerLevel);
    set((state) => ({
      zones: state.zones.map(z =>
        unlockedIds.includes(z.id) ? { ...z, unlocked: true } : z
      ),
    }));
    // Auto-advance current zone if it was locked
    const current = get().currentZone();
    if (!current.unlocked) {
      const nextUnlocked = get().zones.find(z => z.unlocked && !z.completed);
      if (nextUnlocked) set({ currentZoneId: nextUnlocked.id });
    }
  },

  completeMission: (missionId) => {
    set((state) => ({
      zones: state.zones.map(z => ({
        ...z,
        missions: z.missions.map(m =>
          m.id === missionId ? { ...m, completed: true } : m
        ),
      })),
      activeMissionId: null,
    }));
  },

  setActiveMission: (missionId) => {
    set({ activeMissionId: missionId });
  },

  completeCurrentZone: () => {
    const { currentZoneId } = get();
    set((state) => {
      const updatedZones = state.zones.map(z =>
        z.id === currentZoneId ? { ...z, completed: true } : z
      );
      // Find next zone and unlock it
      const currentIndex = updatedZones.findIndex(z => z.id === currentZoneId);
      const nextZone = updatedZones[currentIndex + 1];
      if (nextZone) {
        updatedZones[currentIndex + 1] = { ...nextZone, unlocked: true };
      }
      return { zones: updatedZones };
    });
    // Move to next zone
    const { zones, currentZoneId: cid } = get();
    const currentIndex = zones.findIndex(z => z.id === cid);
    const next = zones[currentIndex + 1];
    if (next) set({ currentZoneId: next.id, activeMissionId: null });
  },
}));
