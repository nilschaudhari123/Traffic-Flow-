import { GameBoard } from '../components/GameBoard';
import { Layout } from '../components/Layout';
import { tapVehicle, useTowPowerUp } from '../game/engine';
import type { GameplayState } from '../game/types';

interface Props {
  state: GameplayState;
  onUpdate: (state: GameplayState) => void;
  onExit: () => void;
  towAvailable: boolean;
  onUseTow: () => void;
}

export function GameplayScreen({ state, onUpdate, onExit, towAvailable, onUseTow }: Props) {
  const handleTap = (id: number) => {
    onUpdate(tapVehicle(state, id));
  };

  const handleTow = () => {
    if (!towAvailable) return;
    onUpdate(useTowPowerUp(state));
    onUseTow();
  };

  const levelLabel =
    state.config.levelId > 0
      ? `Level ${state.config.levelId}`
      : state.config.levelId === -1
        ? 'Daily Challenge'
        : `Endless ${Math.abs(state.config.levelId)}`;

  return (
    <Layout title={levelLabel} subtitle={state.config.theme} onBack={onExit}>
      <div className="hud">
        <div>
          <span className="hud-label">Score</span>
          <strong>{state.score}</strong>
        </div>
        <div>
          <span className="hud-label">Moves</span>
          <strong>
            {state.moves}/{state.config.moveLimit}
          </strong>
        </div>
        <div>
          <span className="hud-label">Combo</span>
          <strong>x{state.combo}</strong>
        </div>
        <div>
          <span className="hud-label">Left</span>
          <strong>{state.remaining}</strong>
        </div>
      </div>
      <p className={`status-line${state.status === 'deadlock' ? ' deadlock' : ''}`}>
        {state.message}
      </p>
      <GameBoard
        board={state.board}
        trafficLights={state.config.trafficLights}
        onVehicleTap={handleTap}
      />
      <div className="game-actions">
        <button type="button" className="secondary-btn" onClick={handleTow} disabled={!towAvailable}>
          🛻 Tow Power-up
        </button>
      </div>
    </Layout>
  );
}
