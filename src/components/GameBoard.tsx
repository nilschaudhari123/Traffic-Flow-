import type { BoardState, Vehicle } from '../game/types';

const VEHICLE_EMOJI: Record<string, string> = {
  car: '🚗',
  taxi: '🚕',
  bus: '🚌',
  ambulance: '🚑',
  police: '🚓',
  tow: '🛻',
  van: '🚐',
};

function tileClass(kind: string): string {
  return `tile tile-${kind}`;
}

function dirArrow(d: string): string {
  return { N: '↑', E: '→', S: '↓', W: '←' }[d] ?? '•';
}

interface Props {
  board: BoardState;
  trafficLights?: boolean;
  onVehicleTap: (id: number) => void;
}

export function GameBoard({ board, trafficLights, onVehicleTap }: Props) {
  const { width, height, tiles, vehicles } = board;

  const vehicleMap = new Map<string, Vehicle>();
  for (const v of vehicles) {
    if (!v.gone) vehicleMap.set(`${v.x},${v.y}`, v);
  }

  return (
    <div
      className="game-board"
      style={{
        gridTemplateColumns: `repeat(${width}, 1fr)`,
        gridTemplateRows: `repeat(${height}, 1fr)`,
      }}
    >
      {Array.from({ length: height }, (_, y) =>
        Array.from({ length: width }, (_, x) => {
          const tile = tiles[y * width + x];
          const vehicle = vehicleMap.get(`${x},${y}`);
          return (
            <button
              key={`${x}-${y}`}
              type="button"
              className={`${tileClass(tile.kind)}${vehicle?.selected ? ' selected-cell' : ''}`}
              onClick={() => vehicle && onVehicleTap(vehicle.id)}
              disabled={!vehicle}
            >
              {tile.kind === 'exit' && <span className="exit-mark">OUT</span>}
              {tile.kind === 'parking' && <span className="parking-mark">P</span>}
              {trafficLights && tile.kind === 'intersection' && (
                <span className="traffic-light">🚦</span>
              )}
              {vehicle && (
                <span className={`vehicle ${vehicle.selected ? 'vehicle-selected' : ''}`}>
                  <span className="vehicle-icon">{VEHICLE_EMOJI[vehicle.kind] ?? '🚗'}</span>
                  <span className="vehicle-dir">{dirArrow(vehicle.direction)}</span>
                </span>
              )}
            </button>
          );
        }),
      )}
    </div>
  );
}
