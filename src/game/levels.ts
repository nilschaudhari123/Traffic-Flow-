import type { LevelConfig } from './types';
import {
  getWorldTheme,
  TOTAL_LEVELS,
  worldForLevel,
  worldLevelNumber,
} from './worlds';

export { TOTAL_LEVELS };

export function buildLevelConfig(levelId: number): LevelConfig {
  const id = Math.max(1, Math.min(TOTAL_LEVELS, levelId));
  const world = worldForLevel(id);
  const wl = worldLevelNumber(id);

  return {
    levelId: id,
    worldIndex: world,
    worldLevel: wl,
    theme: getWorldTheme(world),
    vehicleCount: clamp(6 + world * 2 + wl, 7, 36),
    moveLimit: clamp(18 + world * 3 + wl * 2, 20, 90),
    parkingSlots: clamp(2 + Math.floor(world / 2), 2, 8),
    seed: 7919 + id * 104729,
    dynamicRoads: world >= 1 && wl >= 4,
    trafficLights: world >= 1 && wl >= 7,
    bridges: world >= 3,
    tunnels: world >= 3,
    mysteryVehicles: world >= 2 && wl >= 5,
    baseScore: 1000 + world * 300 + wl * 75,
    perfectFlowBonus: 500 + world * 100,
  };
}

export function buildDailyConfig(): LevelConfig {
  const today = new Date().toISOString().slice(0, 10);
  let seed = 0;
  for (let i = 0; i < today.length; i++) seed = (seed * 31 + today.charCodeAt(i)) >>> 0;
  const levelId = (seed % TOTAL_LEVELS) + 1;
  const base = buildLevelConfig(levelId);
  return { ...base, levelId: -1, seed: hashDaily(seed), moveLimit: base.moveLimit + 5 };
}

export function buildEndlessConfig(wave: number): LevelConfig {
  const levelId = ((wave - 1) % TOTAL_LEVELS) + 1;
  const base = buildLevelConfig(levelId);
  return {
    ...base,
    levelId: -wave,
    vehicleCount: clamp(base.vehicleCount + Math.floor(wave / 3), 7, 40),
    moveLimit: clamp(base.moveLimit + Math.floor(wave / 2), 20, 100),
    seed: base.seed + wave * 9973,
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function hashDaily(v: number): number {
  let x = v >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  return x >>> 0;
}
