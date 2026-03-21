import { create } from "zustand";
import { LootSystem } from "../LootSystem";
import type { LootItem } from "../gameTypes";

// ─── REWARD TIERS ────────────────────────────────────────────────────────────

export interface DailyReward {
  day: number;
  gold: number;
  essence: number;
  crystals: number;
  itemRarity: LootItem['rarity'] | null;
  description: string;
  icon: string;
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, gold: 200,   essence: 0,    crystals: 0,   itemRarity: null,        description: '200 Gold',                                         icon: '💰' },
  { day: 2, gold: 500,   essence: 0,    crystals: 0,   itemRarity: 'common',    description: '500 Gold + Common Item',                            icon: '🎁' },
  { day: 3, gold: 1000,  essence: 10,   crystals: 0,   itemRarity: 'uncommon',  description: '1,000 Gold + 10 Essence + Uncommon Item',           icon: '✨' },
  { day: 4, gold: 2000,  essence: 25,   crystals: 0,   itemRarity: 'rare',      description: '2,000 Gold + 25 Essence + Rare Item',               icon: '💎' },
  { day: 5, gold: 3000,  essence: 50,   crystals: 5,   itemRarity: 'epic',      description: '3,000 Gold + 50 Essence + 5 Crystals + Epic Item',  icon: '🔮' },
  { day: 6, gold: 5000,  essence: 100,  crystals: 10,  itemRarity: 'epic',      description: '5,000 Gold + 100 Essence + 10 Crystals + Epic Item', icon: '⚡' },
  { day: 7, gold: 10000, essence: 250,  crystals: 25,  itemRarity: 'legendary', description: '10,000 Gold + 250 Essence + 25 Crystals + Legendary Item', icon: '🌟' },
];

// ─── STATE TYPES ─────────────────────────────────────────────────────────────

interface DailyLoginState {
  lastLoginDate: string | null;  // ISO date string (YYYY-MM-DD)
  currentStreak: number;
  longestStreak: number;
  showLoginModal: boolean;
  pendingReward: DailyReward | null;
  pendingItem: LootItem | null;
  totalDaysLoggedIn: number;

  // Actions
  checkDailyLogin: () => void;
  claimReward: () => {
    gold: number;
    essence: number;
    crystals: number;
    item: LootItem | null;
  };
  dismissModal: () => void;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function isConsecutiveDay(lastDate: string): boolean {
  const last = new Date(lastDate);
  const today = new Date(todayString());
  const diffMs = today.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

function isAlreadyLoggedToday(lastDate: string | null): boolean {
  if (!lastDate) return false;
  return lastDate === todayString();
}

function getRewardForStreak(streak: number): DailyReward {
  // Day 1-7, then loops back with streak bonuses tracked separately
  const dayIndex = ((streak - 1) % 7);
  return DAILY_REWARDS[dayIndex];
}

// ─── STORE ───────────────────────────────────────────────────────────────────

export const useDailyLogin = create<DailyLoginState>((set, get) => ({
  lastLoginDate: null,
  currentStreak: 0,
  longestStreak: 0,
  showLoginModal: false,
  pendingReward: null,
  pendingItem: null,
  totalDaysLoggedIn: 0,

  checkDailyLogin: () => {
    const state = get();

    if (isAlreadyLoggedToday(state.lastLoginDate)) {
      // Already claimed today — no modal
      return;
    }

    // Calculate new streak
    let newStreak: number;
    if (state.lastLoginDate === null) {
      newStreak = 1;
    } else if (isConsecutiveDay(state.lastLoginDate)) {
      newStreak = state.currentStreak + 1;
    } else {
      // Streak broken
      newStreak = 1;
    }

    const reward = getRewardForStreak(newStreak);

    // Generate item reward if applicable
    let pendingItem: LootItem | null = null;
    if (reward.itemRarity) {
      pendingItem = LootSystem.generateItem(
        { x: 0, y: 0, z: 0 },
        reward.itemRarity,
        undefined,
        Math.max(1, newStreak * 3)  // Higher streak = higher level item
      );
    }

    set({
      currentStreak: newStreak,
      longestStreak: Math.max(state.longestStreak, newStreak),
      showLoginModal: true,
      pendingReward: reward,
      pendingItem,
      totalDaysLoggedIn: state.totalDaysLoggedIn + 1,
    });
  },

  claimReward: () => {
    const { pendingReward, pendingItem } = get();
    if (!pendingReward) {
      return { gold: 0, essence: 0, crystals: 0, item: null };
    }

    const result = {
      gold: pendingReward.gold,
      essence: pendingReward.essence,
      crystals: pendingReward.crystals,
      item: pendingItem,
    };

    set({
      lastLoginDate: todayString(),
      showLoginModal: false,
      pendingReward: null,
      pendingItem: null,
    });

    return result;
  },

  dismissModal: () => {
    set({
      lastLoginDate: todayString(),
      showLoginModal: false,
      pendingReward: null,
      pendingItem: null,
    });
  },
}));
