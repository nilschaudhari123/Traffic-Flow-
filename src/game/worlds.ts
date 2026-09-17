export const LEVELS_PER_WORLD = 10;

export const WORLD_NAMES = [
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

export function worldForLevel(levelId: number): number {
  return Math.floor((levelId - 1) / LEVELS_PER_WORLD);
}

export function worldLevelNumber(levelId: number): number {
  return ((levelId - 1) % LEVELS_PER_WORLD) + 1;
}
