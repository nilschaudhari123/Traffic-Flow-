import { TOTAL_LEVELS } from '../game/levels';
import type { LevelProgress, PlayerSave } from '../game/types';

const STORAGE_KEY = 'traffic-flow-gridlock-save-v2';

const ACHIEVEMENTS = [
  'first_flow',
  'traffic_rookie',
  'perfect_driver',
  'flow_master',
  'daily_driver',
  'endless_runner',
] as const;

function defaultLevel(id: number): LevelProgress {
  return {
    unlocked: id === 1,
    stars: 0,
    bestScore: 0,
    bestMoves: 0,
    completed: false,
  };
}

function ensureLevel(save: PlayerSave, id: number): LevelProgress {
  return save.levels[id] ?? defaultLevel(id);
}

function defaultSave(): PlayerSave {
  return {
    coins: 250,
    gems: 15,
    levels: { 1: defaultLevel(1) },
    achievements: Object.fromEntries(ACHIEVEMENTS.map((a) => [a, false])),
    daily: { date: '', bestScore: 0, completed: false },
    endlessBest: 0,
    settings: {
      music: 0.7,
      sfx: 0.85,
      haptics: true,
      reducedMotion: false,
      highContrast: false,
    },
  };
}

export function loadSave(): PlayerSave {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('traffic-flow-gridlock-save-v1');
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as PlayerSave;
    const base = defaultSave();
    return {
      ...base,
      ...parsed,
      levels: { ...base.levels, ...parsed.levels },
      achievements: { ...base.achievements, ...parsed.achievements },
      settings: { ...base.settings, ...parsed.settings },
    };
  } catch {
    return defaultSave();
  }
}

export function writeSave(save: PlayerSave): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

export function isLevelUnlocked(save: PlayerSave, levelId: number): boolean {
  if (levelId <= 1) return true;
  const prev = ensureLevel(save, levelId - 1);
  return prev.completed || ensureLevel(save, levelId).unlocked;
}

export function getLevelProgress(save: PlayerSave, levelId: number): LevelProgress {
  const stored = ensureLevel(save, levelId);
  return { ...stored, unlocked: isLevelUnlocked(save, levelId) };
}

export function recordLevelResult(
  save: PlayerSave,
  levelId: number,
  stars: number,
  score: number,
  moves: number,
): PlayerSave {
  if (levelId < 1) return save;
  const prev = getLevelProgress(save, levelId);
  const next: LevelProgress = {
    unlocked: true,
    completed: true,
    stars: Math.max(prev.stars, stars),
    bestScore: Math.max(prev.bestScore, score),
    bestMoves: prev.bestMoves === 0 ? moves : Math.min(prev.bestMoves, moves),
  };
  const levels = { ...save.levels, [levelId]: next };
  if (levelId < TOTAL_LEVELS) {
    const unlock = getLevelProgress({ ...save, levels }, levelId + 1);
    levels[levelId + 1] = { ...unlock, unlocked: true };
  }
  let coins = save.coins + stars * 25 + 10;
  let gems = save.gems + (stars === 3 ? 1 : 0);
  const achievements = { ...save.achievements };
  if (!achievements.first_flow) achievements.first_flow = true;
  if (levelId >= 100 && !achievements.traffic_rookie) achievements.traffic_rookie = true;
  if (stars === 3 && !achievements.perfect_driver) achievements.perfect_driver = true;
  if (levelId >= 500 && !achievements.flow_master) achievements.flow_master = true;
  return { ...save, levels, coins, gems, achievements };
}

export function recordDaily(save: PlayerSave, score: number): PlayerSave {
  const date = new Date().toISOString().slice(0, 10);
  const daily = save.daily.date === date
    ? {
        date,
        bestScore: Math.max(save.daily.bestScore, score),
        completed: true,
      }
    : { date, bestScore: score, completed: true };
  const achievements = { ...save.achievements };
  if (!achievements.daily_driver) achievements.daily_driver = true;
  return { ...save, daily, achievements, coins: save.coins + 30 };
}

export function recordEndless(save: PlayerSave, score: number): PlayerSave {
  const endlessBest = Math.max(save.endlessBest, score);
  const achievements = { ...save.achievements };
  if (endlessBest >= 2000 && !achievements.endless_runner) achievements.endless_runner = true;
  return { ...save, endlessBest, achievements, coins: save.coins + 20 };
}

export function worldStars(save: PlayerSave, worldIndex: number): number {
  let total = 0;
  const start = worldIndex * 10 + 1;
  for (let i = start; i < start + 10; i++) total += save.levels[i]?.stars ?? 0;
  return total;
}

export function achievementLabel(id: string): string {
  const map: Record<string, string> = {
    first_flow: 'First Flow',
    traffic_rookie: 'Traffic Rookie (100+)',
    perfect_driver: 'Perfect Driver',
    flow_master: 'Flow Master (500+)',
    daily_driver: 'Daily Driver',
    endless_runner: 'Endless Runner',
  };
  return map[id] ?? id;
}
