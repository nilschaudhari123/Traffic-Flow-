import type { ReactNode } from 'react';

interface Props {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Layout({ title, subtitle, onBack, children, footer }: Props) {
  return (
    <div className="app-shell">
      <header className="app-header">
        {onBack ? (
          <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
            ←
          </button>
        ) : (
          <span className="header-spacer" />
        )}
        <div className="header-titles">
          {title && <h1>{title}</h1>}
          {subtitle && <p>{subtitle}</p>}
        </div>
        <span className="header-spacer" />
      </header>
      <main className="app-main">{children}</main>
      {footer && <footer className="app-footer">{footer}</footer>}
    </div>
  );
}

export function NavBar({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: (id: string) => void;
}) {
  const items = [
    { id: 'home', label: 'Home' },
    { id: 'worldMap', label: 'Worlds' },
    { id: 'shop', label: 'Shop' },
    { id: 'leaderboard', label: 'Ranks' },
    { id: 'achievements', label: 'Goals' },
  ];
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={active === item.id ? 'active' : ''}
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
