import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { starsForResult, startGame } from './game/engine';
import {
  buildDailyConfig,
  buildEndlessConfig,
  buildLevelConfig,
  TOTAL_LEVELS,
} from './game/levels';
import type { GameplayState, PlayerSave, ScreenId } from './game/types';
import { HomeScreen } from './screens/HomeScreen';
import { LevelSelectScreen } from './screens/LevelSelectScreen';
import { GameplayScreen } from './screens/GameplayScreen';
import { LevelCompleteScreen, LevelFailedScreen } from './screens/ResultScreens';
import {
  AchievementsScreen,
  DailyScreen,
  EndlessScreen,
  LeaderboardScreen,
  ShopScreen,
  SettingsScreen,
} from './screens/ExtraScreens';
import { WorldMapScreen } from './screens/WorldMapScreen';
import {
  loadSave,
  recordDaily,
  recordEndless,
  recordLevelResult,
  writeSave,
} from './store/progression';

type Mode = 'campaign' | 'daily' | 'endless';

function App() {
  const [save, setSave] = useState<PlayerSave>(() => loadSave());
  const [screen, setScreen] = useState<ScreenId>('home');
  const [worldFilter, setWorldFilter] = useState<number | undefined>();
  const [game, setGame] = useState<GameplayState | null>(null);
  const [mode, setMode] = useState<Mode>('campaign');
  const [activeLevel, setActiveLevel] = useState(1);
  const [towCharges, setTowCharges] = useState(1);
  const [endlessWave, setEndlessWave] = useState(1);

  useEffect(() => {
    writeSave(save);
  }, [save]);

  const navigate = useCallback((target: string, world?: number) => {
    if (world !== undefined) setWorldFilter(world);
    setScreen(target as ScreenId);
  }, []);

  const beginLevel = (levelId: number, playMode: Mode = 'campaign') => {
    const config =
      playMode === 'daily'
        ? buildDailyConfig()
        : playMode === 'endless'
          ? buildEndlessConfig(endlessWave)
          : buildLevelConfig(levelId);
    setMode(playMode);
    setActiveLevel(levelId);
    outcomeHandled.current = null;
    setGame(startGame(config));
    setTowCharges(1);
    setScreen('gameplay');
  };

  const outcomeHandled = useRef<number | null>(null);

  useEffect(() => {
    if (!game) return;
    const token = game.moves * 1000 + game.score + (game.status === 'won' ? 1 : 0);
    if (outcomeHandled.current === token) return;

    if (game.status === 'won') {
      outcomeHandled.current = token;
      const stars = starsForResult(game);
      setSave((prev) => {
        let next = prev;
        if (mode === 'campaign' && activeLevel > 0) {
          next = recordLevelResult(next, activeLevel, stars, game.score, game.moves);
        } else if (mode === 'daily') {
          next = recordDaily(next, game.score);
        } else if (mode === 'endless') {
          next = recordEndless(next, game.score);
        }
        return next;
      });
      setScreen('complete');
    } else if (game.status === 'lost') {
      outcomeHandled.current = token;
      setScreen('failed');
    }
  }, [game, mode, activeLevel]);

  const handleShopPurchase = (cost: number, reward: string) => {
    if (reward === 'coins' && save.gems >= cost) {
      setSave((s) => ({ ...s, gems: s.gems - cost, coins: s.coins + 500 }));
    } else if (reward === 'tow' && save.coins >= cost) {
      setSave((s) => ({ ...s, coins: s.coins - cost }));
      setTowCharges((c) => c + 3);
    }
  };

  if (screen === 'gameplay' && game) {
    return (
      <GameplayScreen
        state={game}
        onUpdate={setGame}
        onExit={() => setScreen(mode === 'campaign' ? 'levelSelect' : 'home')}
        towAvailable={towCharges > 0}
        onUseTow={() => setTowCharges((c) => c - 1)}
      />
    );
  }

  if (screen === 'complete' && game) {
    const stars = starsForResult(game);
    const hasNext = mode === 'campaign' && activeLevel < TOTAL_LEVELS;
    return (
      <LevelCompleteScreen
        stars={stars}
        score={game.score}
        moves={game.moves}
        hasNext={hasNext}
        onNext={() => beginLevel(activeLevel + 1)}
        onRetry={() => beginLevel(activeLevel, mode)}
        onHome={() => setScreen('home')}
      />
    );
  }

  if (screen === 'failed' && game) {
    return (
      <LevelFailedScreen
        reason={game.message}
        onRetry={() => beginLevel(activeLevel, mode)}
        onHome={() => setScreen('home')}
      />
    );
  }

  switch (screen) {
    case 'home':
      return <HomeScreen save={save} onNavigate={navigate} />;
    case 'worldMap':
      return <WorldMapScreen save={save} onNavigate={navigate} />;
    case 'levelSelect':
      return (
        <LevelSelectScreen
          save={save}
          worldFilter={worldFilter}
          onBack={() => setScreen(worldFilter !== undefined ? 'worldMap' : 'home')}
          onPlay={(id) => beginLevel(id)}
        />
      );
    case 'daily':
      return (
        <DailyScreen
          save={save}
          onBack={() => setScreen('home')}
          onPlay={() => beginLevel(-1, 'daily')}
          onNavigate={navigate}
        />
      );
    case 'endless':
      return (
        <EndlessScreen
          save={save}
          onBack={() => setScreen('home')}
          onPlay={(wave) => {
            setEndlessWave(wave);
            beginLevel(-wave, 'endless');
          }}
        />
      );
    case 'achievements':
      return (
        <AchievementsScreen
          save={save}
          onBack={() => setScreen('home')}
          onNavigate={navigate}
        />
      );
    case 'leaderboard':
      return (
        <LeaderboardScreen
          save={save}
          onBack={() => setScreen('home')}
          onNavigate={navigate}
        />
      );
    case 'shop':
      return (
        <ShopScreen
          save={save}
          onBack={() => setScreen('home')}
          onNavigate={navigate}
          onPurchase={handleShopPurchase}
        />
      );
    case 'settings':
      return (
        <SettingsScreen
          save={save}
          onBack={() => setScreen('home')}
          onChange={(settings) => setSave((s) => ({ ...s, settings }))}
        />
      );
    default:
      return <HomeScreen save={save} onNavigate={navigate} />;
  }
}

export default App;
