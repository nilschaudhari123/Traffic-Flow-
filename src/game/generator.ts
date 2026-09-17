import { SeededRng } from './rng';
import type {
  BoardState,
  Direction,
  LevelConfig,
  Tile,
  TileKind,
  Vehicle,
  VehicleKind,
} from './types';

const OPP: Record<Direction, Direction> = {
  N: 'S',
  S: 'N',
  E: 'W',
  W: 'E',
};

const DELTA: Record<Direction, { x: number; y: number }> = {
  N: { x: 0, y: -1 },
  E: { x: 1, y: 0 },
  S: { x: 0, y: 1 },
  W: { x: -1, y: 0 },
};

export function generateBoard(config: LevelConfig): BoardState {
  const width = 9;
  const height = 11;
  const rng = new SeededRng(config.seed);
  const tiles: Tile[] = Array.from({ length: width * height }, () => ({
    kind: 'grass',
    links: [],
  }));

  const markRoad = (x: number, y: number, links: Direction[], kind: TileKind = 'road') => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    const existing = tiles[idx];
    const merged = new Set([...existing.links, ...links]);
    tiles[idx] = {
      kind: existing.kind === 'grass' ? kind : existing.kind === 'exit' ? 'exit' : kind,
      links: [...merged],
    };
  };

  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);

  for (let x = 1; x < width - 1; x++) {
    markRoad(x, midY, ['E', 'W'], 'road');
  }
  for (let y = 1; y < height - 1; y++) {
    markRoad(midX, y, ['N', 'S'], 'road');
  }

  if (config.dynamicRoads) {
    const ringY = midY + (rng.int(0, 1) ? 2 : -2);
    if (ringY > 1 && ringY < height - 2) {
      for (let x = 2; x < width - 2; x++) markRoad(x, ringY, ['E', 'W'], 'road');
      markRoad(2, ringY, ['N', 'S'], 'intersection');
      markRoad(width - 3, ringY, ['N', 'S'], 'intersection');
      markRoad(midX, ringY, ['N', 'S', 'E', 'W'], 'intersection');
    }
  }

  const exits: { x: number; y: number }[] = [
    { x: width - 1, y: midY },
    { x: 0, y: midY },
  ];
  if (config.bridges) exits.push({ x: midX, y: 0 });
  if (config.tunnels) exits.push({ x: midX, y: height - 1 });

  for (const ex of exits) {
    const dir = ex.x === 0 ? 'W' : ex.x === width - 1 ? 'E' : ex.y === 0 ? 'N' : 'S';
    markRoad(ex.x, ex.y, [OPP[dir]], 'exit');
  }

  const parkingCells: { x: number; y: number }[] = [];
  const parkingCandidates = [
    { x: midX - 2, y: midY - 2 },
    { x: midX + 2, y: midY - 2 },
    { x: midX - 2, y: midY + 2 },
    { x: midX + 2, y: midY + 2 },
    { x: midX - 1, y: midY + 3 },
    { x: midX + 1, y: midY - 3 },
  ];
  for (const p of rng.shuffle(parkingCandidates)) {
    if (parkingCells.length >= config.parkingSlots) break;
    if (p.x > 0 && p.y > 0 && p.x < width - 1 && p.y < height - 1) {
      markRoad(p.x, p.y, ['N', 'S', 'E', 'W'], 'parking');
      parkingCells.push(p);
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const t = tiles[y * width + x];
      if (t.kind === 'road' && t.links.length > 2) tiles[y * width + x] = { ...t, kind: 'intersection' };
    }
  }

  const roadCells: { x: number; y: number }[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const kind = tiles[y * width + x].kind;
      if (kind === 'road' || kind === 'intersection') roadCells.push({ x, y });
    }
  }

  const vehicleKinds: VehicleKind[] = ['car', 'taxi', 'van', 'bus', 'ambulance', 'police'];
  if (config.mysteryVehicles) vehicleKinds.push('tow');

  const spawns = rng.shuffle(roadCells).slice(0, config.vehicleCount);
  const vehicles: Vehicle[] = [];

  for (let i = 0; i < spawns.length; i++) {
    const cell = spawns[i];
    const tile = tiles[cell.y * width + cell.x];
    const fallbackDirs: Direction[] = ['N', 'E', 'S', 'W'];
    const direction = rng.pick(tile.links.length ? tile.links : fallbackDirs);
    const useParking = i % 3 === 0 && parkingCells.length > 0;
    const target = useParking ? 'parking' : 'exit';
    const route = buildRoute(tiles, width, height, cell, direction, target, parkingCells, exits);
    if (route.length < 2) continue;

    const kind =
      i === spawns.length - 1 && config.mysteryVehicles
        ? 'tow'
        : rng.pick(vehicleKinds);
    vehicles.push({
      id: i + 1,
      kind,
      x: cell.x,
      y: cell.y,
      direction,
      length: kind === 'bus' ? 2 : 1,
      route,
      target,
      gone: false,
      selected: false,
    });
  }

  return {
    width,
    height,
    tiles,
    vehicles,
    parkingUsed: 0,
    exits,
  };
}

function buildRoute(
  tiles: Tile[],
  width: number,
  height: number,
  start: { x: number; y: number },
  startDir: Direction,
  target: 'exit' | 'parking',
  parking: { x: number; y: number }[],
  exits: { x: number; y: number }[],
): { x: number; y: number }[] {
  const goals =
    target === 'parking'
      ? parking
      : exits;
  if (!goals.length) return [start];

  const queue: { x: number; y: number; dir: Direction; path: { x: number; y: number }[] }[] = [
    { ...start, dir: startDir, path: [start] },
  ];
  const seen = new Set<string>();

  while (queue.length) {
    const cur = queue.shift()!;
    const key = `${cur.x},${cur.y},${cur.dir},${cur.path.length}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (
      goals.some((g) => g.x === cur.x && g.y === cur.y) &&
      cur.path.length > 1
    ) {
      return cur.path;
    }

    if (cur.path.length > 24) continue;

    const tile = tiles[cur.y * width + cur.x];
    if (!tile.links.length) continue;

    const nextDirs = tile.links.filter((d) => canEnter(tile, cur.dir, d));
    for (const nd of nextDirs) {
      const delta = DELTA[nd];
      const nx = cur.x + delta.x;
      const ny = cur.y + delta.y;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nextTile = tiles[ny * width + nx];
      if (nextTile.kind === 'grass') continue;
      queue.push({
        x: nx,
        y: ny,
        dir: nd,
        path: [...cur.path, { x: nx, y: ny }],
      });
    }
  }

  return [start];
}

function canEnter(tile: Tile, from: Direction, to: Direction): boolean {
  if (!tile.links.includes(to)) return false;
  if (tile.kind === 'intersection' || tile.kind === 'parking') return true;
  return from === OPP[to] || tile.links.length <= 2;
}

export function vehicleAt(board: BoardState, x: number, y: number): Vehicle | undefined {
  return board.vehicles.find((v) => !v.gone && v.x === x && v.y === y);
}

export function canDispatch(board: BoardState, vehicle: Vehicle): boolean {
  if (vehicle.gone) return false;
  const route = vehicle.route;
  const posOnRoute = route.findIndex((c) => c.x === vehicle.x && c.y === vehicle.y);
  if (posOnRoute < 0) return false;

  for (let i = posOnRoute + 1; i < route.length; i++) {
    const cell = route[i];
    const blocker = board.vehicles.find(
      (v) => !v.gone && v.id !== vehicle.id && v.x === cell.x && v.y === cell.y,
    );
    if (blocker) return false;
  }
  return true;
}

export function dispatchVehicle(board: BoardState, vehicle: Vehicle): { board: BoardState; steps: number } {
  const route = vehicle.route;
  const posOnRoute = route.findIndex((c) => c.x === vehicle.x && c.y === vehicle.y);
  let steps = 0;
  let x = vehicle.x;
  let y = vehicle.y;
  let gone = false;

  for (let i = posOnRoute + 1; i < route.length; i++) {
    const cell = route[i];
    if (vehicleAt(board, cell.x, cell.y)) break;
    x = cell.x;
    y = cell.y;
    steps++;
    const tile = board.tiles[y * board.width + x];
    if (tile.kind === 'exit' || tile.kind === 'parking') {
      gone = true;
      break;
    }
  }

  const vehicles = board.vehicles.map((v) =>
    v.id === vehicle.id ? { ...v, x, y, gone, selected: false } : { ...v, selected: false },
  );

  let parkingUsed = board.parkingUsed;
  if (gone && vehicle.target === 'parking') parkingUsed += 1;

  return {
    board: { ...board, vehicles, parkingUsed },
    steps,
  };
}

export function anyMovable(board: BoardState): boolean {
  return board.vehicles.some((v) => !v.gone && canDispatch(board, v));
}
