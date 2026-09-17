import { anyMovable, canDispatch, dispatchVehicle, generateBoard } from './generator';
import type { GameplayState, LevelConfig } from './types';

export function startGame(config: LevelConfig): GameplayState {
  const board = generateBoard(config);
  const remaining = board.vehicles.filter((v) => !v.gone).length;
  return {
    config,
    board,
    moves: 0,
    score: 0,
    combo: 0,
    remaining,
    status: 'playing',
    message: 'Tap a vehicle to build the flow.',
  };
}

export function selectVehicle(state: GameplayState, vehicleId: number): GameplayState {
  if (state.status !== 'playing') return state;
  const board = {
    ...state.board,
    vehicles: state.board.vehicles.map((v) => ({
      ...v,
      selected: v.id === vehicleId && !v.gone,
    })),
  };
  return { ...state, board };
}

export function tapVehicle(state: GameplayState, vehicleId: number): GameplayState {
  if (state.status !== 'playing') return state;
  const vehicle = state.board.vehicles.find((v) => v.id === vehicleId);
  if (!vehicle || vehicle.gone) return state;

  if (!canDispatch(state.board, vehicle)) {
    return {
      ...state,
      combo: 0,
      message: 'Route blocked — clear the lane first.',
      board: {
        ...state.board,
        vehicles: state.board.vehicles.map((v) => ({ ...v, selected: v.id === vehicleId })),
      },
    };
  }

  const { board, steps } = dispatchVehicle(state.board, vehicle);
  const moved = board.vehicles.find((v) => v.id === vehicleId);
  const cleared = moved?.gone ?? false;
  const moves = state.moves + 1;
  let combo = cleared ? state.combo + 1 : 0;
  let score = state.score + 25 * steps + (cleared ? 50 + combo * 15 : 0);
  const remaining = board.vehicles.filter((v) => !v.gone).length;

  let status: GameplayState['status'] = state.status;
  let message = cleared ? 'Flow released!' : 'Vehicle advanced.';

  if (moves > state.config.moveLimit) {
    status = 'lost';
    message = 'Move limit reached.';
  } else if (remaining === 0) {
    status = 'won';
    score += state.config.baseScore;
    if (combo >= 3) score += state.config.perfectFlowBonus;
    message = 'Flow complete!';
  } else if (!anyMovable(board)) {
    status = 'deadlock';
    message = 'Gridlock! No valid moves remain.';
  }

  return {
    ...state,
    board,
    moves,
    score,
    combo,
    remaining,
    status,
    message,
  };
}

export function useTowPowerUp(state: GameplayState): GameplayState {
  if (state.status !== 'playing' && state.status !== 'deadlock') return state;
  const target = state.board.vehicles.find((v) => !v.gone);
  if (!target) return state;

  const board = {
    ...state.board,
    vehicles: state.board.vehicles.map((v) =>
      v.id === target.id ? { ...v, gone: true, selected: false } : v,
    ),
  };
  const remaining = board.vehicles.filter((v) => !v.gone).length;
  let status: GameplayState['status'] = state.status === 'deadlock' ? 'playing' : state.status;
  let message = 'Tow truck cleared a vehicle.';
  let score = state.score + 40;

  if (remaining === 0) {
    status = 'won';
    score += state.config.baseScore;
    message = 'Flow complete!';
  } else if (status === 'playing' && !anyMovable(board)) {
    status = 'deadlock';
    message = 'Still gridlocked.';
  }

  return { ...state, board, remaining, status, message, score, combo: 0 };
}

export function starsForResult(state: GameplayState): number {
  if (state.status !== 'won') return 0;
  const ratio = state.moves / state.config.moveLimit;
  if (ratio <= 0.55) return 3;
  if (ratio <= 0.8) return 2;
  return 1;
}
