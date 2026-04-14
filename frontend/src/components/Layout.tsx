import { NavLink, Outlet } from 'react-router-dom';
import { GlobalFiltersBar } from './GlobalFiltersBar';

const navItems = [
  { to: '/overview', label: 'Overview' },
  { to: '/audience', label: 'Audience' },
  { to: '/content', label: 'Content' },
  { to: '/quality', label: 'Quality' },
  { to: '/explorer', label: 'Explorer' }
];

export function Layout() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
              Video Analytics Engine
            </p>
            <h1 className="text-lg font-semibold">DBMS Analytics Console</h1>
          </div>
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-1 text-xs text-[var(--text-secondary)]">
            Multi-page dashboard
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="surface-card p-3">
          <nav className="flex gap-2 lg:flex-col">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--accent-100)] text-[var(--accent-600)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)]'
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="space-y-4">
          <GlobalFiltersBar />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
