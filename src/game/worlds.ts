export const LEVELS_PER_WORLD = 10;
export const TOTAL_WORLDS = 100;
export const TOTAL_LEVELS = TOTAL_WORLDS * LEVELS_PER_WORLD;

const BASE_WORLD_NAMES = [
  'Sunny Suburb',
  'Downtown',
  'Neon City',
  'Mountain Highway',
  'Airport',
  'Harbor',
  'Desert Highway',
  'Snow City',
  'Cyber City',
  'Mega Gridlock',
];

export const WORLD_THEMES = [
  'suburb',
  'downtown',
  'neon',
  'mountain',
  'airport',
  'harbor',
  'desert',
  'snow',
  'cyber',
  'mega',
];

/** @deprecated use getWorldName */
export const WORLD_NAMES = BASE_WORLD_NAMES;

export function getWorldName(worldIndex: number): string {
  if (worldIndex >= 0 && worldIndex < BASE_WORLD_NAMES.length) {
    return BASE_WORLD_NAMES[worldIndex];
  }
  return `Grid Sector ${worldIndex + 1}`;
}

export function getWorldTheme(worldIndex: number): string {
  return WORLD_THEMES[((worldIndex % WORLD_THEMES.length) + WORLD_THEMES.length) % WORLD_THEMES.length];
}

export function worldForLevel(levelId: number): number {
  return Math.floor((levelId - 1) / LEVELS_PER_WORLD);
}

export function worldLevelNumber(levelId: number): number {
  return ((levelId - 1) % LEVELS_PER_WORLD) + 1;
}
