import { Layout } from '../components/Layout';

interface CompleteProps {
  stars: number;
  score: number;
  moves: number;
  onNext: () => void;
  onRetry: () => void;
  onHome: () => void;
  hasNext: boolean;
}

export function LevelCompleteScreen({
  stars,
  score,
  moves,
  onNext,
  onRetry,
  onHome,
  hasNext,
}: CompleteProps) {
  return (
    <Layout title="Flow Complete!" subtitle="Level cleared">
      <div className="result-card win">
        <p className="stars-big">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
        <p>Score: {score}</p>
        <p>Moves used: {moves}</p>
        <div className="menu-grid">
          {hasNext && (
            <button type="button" className="primary-btn" onClick={onNext}>
              Next Level
            </button>
          )}
          <button type="button" className="secondary-btn" onClick={onRetry}>
            Retry
          </button>
          <button type="button" className="ghost-btn" onClick={onHome}>
            Home
          </button>
        </div>
      </div>
    </Layout>
  );
}

interface FailedProps {
  reason: string;
  onRetry: () => void;
  onHome: () => void;
}

export function LevelFailedScreen({ reason, onRetry, onHome }: FailedProps) {
  return (
    <Layout title="Gridlock!" subtitle="Level failed">
      <div className="result-card lose">
        <p>{reason}</p>
        <div className="menu-grid">
          <button type="button" className="primary-btn" onClick={onRetry}>
            Retry
          </button>
          <button type="button" className="ghost-btn" onClick={onHome}>
            Home
          </button>
        </div>
      </div>
    </Layout>
  );
}
