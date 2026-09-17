import { Layout, NavBar } from '../components/Layout';
import { buildDailyConfig } from '../game/levels';
import { achievementLabel } from '../store/progression';
import type { PlayerSave } from '../game/types';

export function DailyScreen({
  save,
  onBack,
  onPlay,
  onNavigate,
}: {
  save: PlayerSave;
  onBack: () => void;
  onPlay: () => void;
  onNavigate: (s: string) => void;
}) {
  const cfg = buildDailyConfig();
  const today = new Date().toISOString().slice(0, 10);
  const done = save.daily.date === today && save.daily.completed;
  return (
    <Layout title="Daily Challenge" subtitle="UTC deterministic seed" onBack={onBack}>
      <div className="info-card">
        <p>Today&apos;s puzzle uses seed {cfg.seed}.</p>
        <p>Move limit: {cfg.moveLimit}</p>
        <p>Best today: {save.daily.date === today ? save.daily.bestScore : 0}</p>
        {done && <p className="badge">Completed today ✓</p>}
      </div>
      <button type="button" className="primary-btn" onClick={onPlay}>
        Start Daily
      </button>
      <NavBar active="home" onNavigate={onNavigate} />
    </Layout>
  );
}

export function EndlessScreen({
  save,
  onBack,
  onPlay,
}: {
  save: PlayerSave;
  onBack: () => void;
  onPlay: (wave: number) => void;
}) {
  const wave = Math.floor(save.endlessBest / 500) + 1;
  return (
    <Layout title="Endless Gridlock" subtitle="Continuous puzzles" onBack={onBack}>
      <div className="info-card">
        <p>Best score: {save.endlessBest}</p>
        <p>Next wave: {wave}</p>
      </div>
      <button type="button" className="primary-btn" onClick={() => onPlay(wave)}>
        Start Run
      </button>
    </Layout>
  );
}

export function AchievementsScreen({
  save,
  onBack,
  onNavigate,
}: {
  save: PlayerSave;
  onBack: () => void;
  onNavigate: (s: string) => void;
}) {
  return (
    <Layout title="Achievements" subtitle="Earn gem rewards" onBack={onBack}>
      <ul className="achievement-list">
        {Object.entries(save.achievements).map(([id, unlocked]) => (
          <li key={id} className={unlocked ? 'unlocked' : ''}>
            <span>{achievementLabel(id)}</span>
            <span>{unlocked ? '✓ +5💎' : 'Locked'}</span>
          </li>
        ))}
      </ul>
      <NavBar active="achievements" onNavigate={onNavigate} />
    </Layout>
  );
}

export function LeaderboardScreen({
  save,
  onBack,
  onNavigate,
}: {
  save: PlayerSave;
  onBack: () => void;
  onNavigate: (s: string) => void;
}) {
  const entries = Object.entries(save.levels)
    .filter(([, p]) => p.completed)
    .map(([id, p]) => ({ id: Number(id), score: p.bestScore }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <Layout title="Leaderboard" subtitle="Local rankings" onBack={onBack}>
      <p className="hint">Platform leaderboards connect in production builds.</p>
      <ol className="leaderboard">
        {entries.length === 0 && <li>No scores yet — complete a level!</li>}
        {entries.map((e, i) => (
          <li key={e.id}>
            <span>#{i + 1}</span> Level {e.id} — {e.score} pts
          </li>
        ))}
      </ol>
      <p>Endless best: {save.endlessBest}</p>
      <NavBar active="leaderboard" onNavigate={onNavigate} />
    </Layout>
  );
}

export function ShopScreen({
  save,
  onBack,
  onNavigate,
  onPurchase,
}: {
  save: PlayerSave;
  onBack: () => void;
  onNavigate: (s: string) => void;
  onPurchase: (cost: number, reward: string) => void;
}) {
  const offers = [
    { id: 'coins', label: '500 Coins', cost: 5, currency: 'gems' },
    { id: 'tow', label: 'Tow x3', cost: 120, currency: 'coins' },
    { id: 'ads', label: 'Remove Ads (demo)', cost: 0, currency: 'info' },
  ];
  return (
    <Layout title="Gridlock Shop" subtitle="Power-ups & currency" onBack={onBack}>
      <div className="currency-row">
        <span>🪙 {save.coins}</span>
        <span>💎 {save.gems}</span>
      </div>
      <ul className="shop-list">
        {offers.map((o) => (
          <li key={o.id}>
            <span>{o.label}</span>
            <button
              type="button"
              className="secondary-btn small"
              onClick={() => onPurchase(o.cost, o.id)}
            >
              {o.currency === 'info' ? 'Configure IAP' : `Buy (${o.cost} ${o.currency})`}
            </button>
          </li>
        ))}
      </ul>
      <NavBar active="shop" onNavigate={onNavigate} />
    </Layout>
  );
}

export function SettingsScreen({
  save,
  onBack,
  onChange,
}: {
  save: PlayerSave;
  onBack: () => void;
  onChange: (settings: PlayerSave['settings']) => void;
}) {
  const s = save.settings;
  return (
    <Layout title="Settings" subtitle="Accessibility & audio" onBack={onBack}>
      <label className="setting-row">
        Music volume
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={s.music}
          onChange={(e) => onChange({ ...s, music: Number(e.target.value) })}
        />
      </label>
      <label className="setting-row">
        SFX volume
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={s.sfx}
          onChange={(e) => onChange({ ...s, sfx: Number(e.target.value) })}
        />
      </label>
      <label className="setting-row">
        <input
          type="checkbox"
          checked={s.haptics}
          onChange={(e) => onChange({ ...s, haptics: e.target.checked })}
        />
        Haptic feedback
      </label>
      <label className="setting-row">
        <input
          type="checkbox"
          checked={s.reducedMotion}
          onChange={(e) => onChange({ ...s, reducedMotion: e.target.checked })}
        />
        Reduced motion
      </label>
      <label className="setting-row">
        <input
          type="checkbox"
          checked={s.highContrast}
          onChange={(e) => onChange({ ...s, highContrast: e.target.checked })}
        />
        High contrast
      </label>
    </Layout>
  );
}
