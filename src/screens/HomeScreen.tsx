import { Layout, NavBar } from '../components/Layout';
import type { PlayerSave } from '../game/types';

interface Props {
  save: PlayerSave;
  onNavigate: (screen: string) => void;
}

export function HomeScreen({ save, onNavigate }: Props) {
  return (
    <Layout
      title="TRAFFIC FLOW"
      subtitle="1000 levels · GRIDLOCK"
      footer={<NavBar active="home" onNavigate={onNavigate} />}
    >
      <div className="hero-card">
        <p className="tagline">Design the flow. Clear the gridlock.</p>
        <div className="currency-row">
          <span>🪙 {save.coins}</span>
          <span>💎 {save.gems}</span>
        </div>
      </div>
      <div className="menu-grid">
        <button type="button" className="primary-btn" onClick={() => onNavigate('worldMap')}>
          Play — World Map
        </button>
        <button type="button" className="secondary-btn" onClick={() => onNavigate('levelSelect')}>
          Level Select
        </button>
        <button type="button" className="secondary-btn" onClick={() => onNavigate('daily')}>
          Daily Challenge
        </button>
        <button type="button" className="secondary-btn" onClick={() => onNavigate('endless')}>
          Endless Gridlock
        </button>
        <button type="button" className="ghost-btn" onClick={() => onNavigate('settings')}>
          Settings
        </button>
      </div>
    </Layout>
  );
}
