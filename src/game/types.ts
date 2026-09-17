export type Direction = 'N' | 'E' | 'S' | 'W';

export type VehicleKind =
  | 'car'
  | 'taxi'
  | 'bus'
  | 'ambulance'
  | 'police'
  | 'tow'
  | 'van';

export type TileKind = 'grass' | 'road' | 'exit' | 'parking' | 'intersection';

export interface Tile {
  kind: TileKind;
  /** Allowed travel directions through this tile */
  links: Direction[];
}

export interface Vehicle {
  id: number;
  kind: VehicleKind;
  x: number;
  y: number;
  direction: Direction;
  length: number;
  route: { x: number; y: number }[];
  target: 'exit' | 'parking';
  gone: boolean;
  selected: boolean;
}

export interface LevelConfig {
  levelId: number;
  worldIndex: number;
  worldLevel: number;
  theme: string;
  vehicleCount: number;
  moveLimit: number;
  parkingSlots: number;
  seed: number;
  dynamicRoads: boolean;
  trafficLights: boolean;
  bridges: boolean;
  tunnels: boolean;
  mysteryVehicles: boolean;
  baseScore: number;
  perfectFlowBonus: number;
}

export interface BoardState {
  width: number;
  height: number;
  tiles: Tile[];
  vehicles: Vehicle[];
  parkingUsed: number;
  exits: { x: number; y: number }[];
}

export interface GameplayState {
  config: LevelConfig;
  board: BoardState;
  moves: number;
  score: number;
  combo: number;
  remaining: number;
  status: 'playing' | 'won' | 'lost' | 'deadlock';
  message: string;
}

export interface LevelProgress {
  unlocked: boolean;
  stars: number;
  bestScore: number;
  bestMoves: number;
  completed: boolean;
}

export interface PlayerSave {
  coins: number;
  gems: number;
  levels: Record<number, LevelProgress>;
  achievements: Record<string, boolean>;
  daily: { date: string; bestScore: number; completed: boolean };
  endlessBest: number;
  settings: {
    music: number;
    sfx: number;
    haptics: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  };
}

export type ScreenId =
  | 'home'
  | 'worldMap'
  | 'levelSelect'
  | 'gameplay'
  | 'complete'
  | 'failed'
  | 'daily'
  | 'endless'
  | 'achievements'
  | 'leaderboard'
  | 'shop'
  | 'settings';
