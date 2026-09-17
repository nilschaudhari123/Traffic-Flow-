import { Layout } from '../components/Layout';
import { buildLevelConfig, TOTAL_LEVELS } from '../game/levels';
import { LEVELS_PER_WORLD, WORLD_NAMES } from '../game/worlds';
import type { PlayerSave } from '../game/types';

interface Props {
  save: PlayerSave;
  worldFilter?: number;
  onBack: () => void;
  onPlay: (levelId: number) => void;
}

export function LevelSelectScreen({ save, worldFilter, onBack, onPlay }: Props) {
  const start = worldFilter !== undefined ? worldFilter * LEVELS_PER_WORLD + 1 : 1;
  const end = worldFilter !== undefined ? start + LEVELS_PER_WORLD - 1 : TOTAL_LEVELS;
  const title = worldFilter !== undefined ? WORLD_NAMES[worldFilter] : 'All Levels';

  return (
    <Layout title="Level Select" subtitle={title} onBack={onBack}>
      <div className="level-grid">
        {Array.from({ length: end - start + 1 }, (_, i) => {
          const levelId = start + i;
          const progress = save.levels[levelId];
          const cfg = buildLevelConfig(levelId);
          return (
            <button
              key={levelId}
              type="button"
              className={`level-btn${progress?.unlocked ? '' : ' locked'}`}
              disabled={!progress?.unlocked}
              onClick={() => onPlay(levelId)}
            >
              <span>{levelId}</span>
              <small>{'★'.repeat(progress?.stars ?? 0) || '·'}</small>
              <small className="level-meta">{cfg.moveLimit} moves</small>
            </button>
          );
        })}
      </div>
    </Layout>
  );
}
