import { Layout, NavBar } from '../components/Layout';
import { TOTAL_WORLDS, getWorldName, LEVELS_PER_WORLD } from '../game/worlds';
import { getLevelProgress, worldStars } from '../store/progression';
import type { PlayerSave } from '../game/types';
import { useMemo, useState } from 'react';

interface Props {
  save: PlayerSave;
  onNavigate: (screen: string, world?: number) => void;
}

const PAGE_SIZE = 20;

export function WorldMapScreen({ save, onNavigate }: Props) {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(TOTAL_WORLDS / PAGE_SIZE);
  const worlds = useMemo(() => {
    const start = page * PAGE_SIZE;
    return Array.from({ length: Math.min(PAGE_SIZE, TOTAL_WORLDS - start) }, (_, i) => start + i);
  }, [page]);

  return (
    <Layout
      title="World Map"
      subtitle={`${TOTAL_WORLDS} worlds · 1000 levels`}
      onBack={() => onNavigate('home')}
      footer={<NavBar active="worldMap" onNavigate={onNavigate} />}
    >
      <div className="pager">
        <button type="button" className="icon-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          ‹
        </button>
        <span>Worlds {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, TOTAL_WORLDS)}</span>
        <button
          type="button"
          className="icon-btn"
          disabled={page >= pageCount - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          ›
        </button>
      </div>
      <div className="world-list">
        {worlds.map((index) => {
          const stars = worldStars(save, index);
          const firstLevel = index * LEVELS_PER_WORLD + 1;
          const unlocked = getLevelProgress(save, firstLevel).unlocked;
          return (
            <button
              key={index}
              type="button"
              className={`world-card theme-${index % 10}`}
              disabled={!unlocked}
              onClick={() => onNavigate('levelSelect', index)}
            >
              <span className="world-num">World {index + 1}</span>
              <span className="world-name">{getWorldName(index)}</span>
              <span className="world-stars">{stars > 0 ? `★ ${stars}/30` : '—'}</span>
            </button>
          );
        })}
      </div>
    </Layout>
  );
}
