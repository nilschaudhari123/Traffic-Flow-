import { Layout } from '../components/Layout';
import { TOTAL_LEVELS } from '../game/levels';
import { LEVELS_PER_WORLD, TOTAL_WORLDS, getWorldName } from '../game/worlds';
import { getLevelProgress } from '../store/progression';
import type { PlayerSave } from '../game/types';
import { useState } from 'react';

interface Props {
  save: PlayerSave;
  worldFilter?: number;
  onBack: () => void;
  onPlay: (levelId: number) => void;
}

const PAGE_SIZE = 50;

export function LevelSelectScreen({ save, worldFilter, onBack, onPlay }: Props) {
  const [page, setPage] = useState(0);

  const isWorld = worldFilter !== undefined;
  const start = isWorld ? worldFilter * LEVELS_PER_WORLD + 1 : page * PAGE_SIZE + 1;
  const end = isWorld
    ? start + LEVELS_PER_WORLD - 1
    : Math.min(start + PAGE_SIZE - 1, TOTAL_LEVELS);
  const title = isWorld ? getWorldName(worldFilter) : 'All Levels';
  const pageCount = Math.ceil(TOTAL_LEVELS / PAGE_SIZE);

  return (
    <Layout title="Level Select" subtitle={title} onBack={onBack}>
      {!isWorld && (
        <div className="pager">
          <button type="button" className="icon-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            ‹
          </button>
          <span>Levels {start}–{end}</span>
          <button
            type="button"
            className="icon-btn"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </button>
        </div>
      )}
      <div className="level-grid">
        {Array.from({ length: end - start + 1 }, (_, i) => {
          const levelId = start + i;
          const progress = getLevelProgress(save, levelId);
          return (
            <button
              key={levelId}
              type="button"
              className={`level-btn${progress.unlocked ? '' : ' locked'}`}
              disabled={!progress.unlocked}
              onClick={() => onPlay(levelId)}
            >
              <span>{levelId}</span>
              <small>{'★'.repeat(progress.stars) || '·'}</small>
              <small className="level-meta">W{Math.floor((levelId - 1) / LEVELS_PER_WORLD) + 1}</small>
            </button>
          );
        })}
      </div>
      {!isWorld && (
        <p className="hint">Tip: open a world from the map to jump to its 10 levels ({TOTAL_WORLDS} worlds).</p>
      )}
    </Layout>
  );
}
