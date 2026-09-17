import { Layout, NavBar } from '../components/Layout';
import { WORLD_NAMES } from '../game/worlds';
import { worldStars } from '../store/progression';
import type { PlayerSave } from '../game/types';

interface Props {
  save: PlayerSave;
  onNavigate: (screen: string, world?: number) => void;
}

export function WorldMapScreen({ save, onNavigate }: Props) {
  return (
    <Layout
      title="World Map"
      subtitle="10 worlds · 100 levels"
      onBack={() => onNavigate('home')}
      footer={<NavBar active="worldMap" onNavigate={onNavigate} />}
    >
      <div className="world-list">
        {WORLD_NAMES.map((name, index) => {
          const stars = worldStars(save, index);
          const unlocked = save.levels[index * 10 + 1]?.unlocked ?? index === 0;
          return (
            <button
              key={name}
              type="button"
              className={`world-card theme-${index}`}
              disabled={!unlocked}
              onClick={() => onNavigate('levelSelect', index)}
            >
              <span className="world-num">World {index + 1}</span>
              <span className="world-name">{name}</span>
              <span className="world-stars">{'★'.repeat(Math.min(30, stars)) || '—'}</span>
            </button>
          );
        })}
      </div>
    </Layout>
  );
}
