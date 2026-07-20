/* eslint-disable react-refresh/only-export-components */
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link,
} from '@tanstack/react-router';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import { HomePage } from './pages/HomePage';
import { CompressPage } from './pages/CompressPage';
import { TextOverlay } from './pages/TextOverlay';
import { JsonFormatPage } from './pages/JsonFormatPage';

// Root Layout Component
function RootLayout() {
  useTheme();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <NavHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

const navLinkClass = 'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors';

function NavHeader() {
  return (
    <header className="border-b border-line bg-surface/80 px-6 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent transition-transform group-hover:-rotate-6">
              <svg className="h-5 w-5 text-accent-ink" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="8" cy="8" r="2.4" />
                <circle cx="16" cy="8" r="2.4" />
                <circle cx="8" cy="16" r="2.4" />
                <circle cx="16" cy="16" r="2.4" />
              </svg>
            </div>
            <h1 className="font-display text-lg tracking-tight">Pegboard</h1>
          </Link>

          <nav className="flex items-center gap-1 border-l border-line pl-6">
            <Link
              to="/compress"
              className={navLinkClass}
              activeProps={{ className: 'bg-accent text-accent-ink' }}
              inactiveProps={{ className: 'text-subtle hover:bg-well hover:text-ink' }}
            >
              Compress
            </Link>
            <Link
              to="/overlay"
              className={navLinkClass}
              activeProps={{ className: 'bg-accent text-accent-ink' }}
              inactiveProps={{ className: 'text-subtle hover:bg-well hover:text-ink' }}
            >
              Overlay
            </Link>
            <Link
              to="/json"
              className={navLinkClass}
              activeProps={{ className: 'bg-accent text-accent-ink' }}
              inactiveProps={{ className: 'text-subtle hover:bg-well hover:text-ink' }}
            >
              JSON
            </Link>
          </nav>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

// Create Root Route
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Create Index Route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

// Create Compress Route
const compressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compress',
  component: CompressPage,
});

// Create Overlay Route
const overlayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/overlay',
  component: TextOverlay,
  validateSearch: (search: Record<string, unknown>): { img?: string } => ({
    img: typeof search.img === 'string' ? search.img : undefined,
  }),
});

// Create JSON Route
const jsonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/json',
  component: JsonFormatPage,
  validateSearch: (search: Record<string, unknown>): { d?: string; m?: boolean; u?: boolean } => ({
    d: typeof search.d === 'string' ? search.d : undefined,
    m: search.m === true || search.m === 'true' ? true : undefined,
    u: search.u === false || search.u === 'false' ? false : undefined,
  }),
});

// Create Route Tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  compressRoute,
  overlayRoute,
  jsonRoute,
]);

// Create and Export Router
export const router = createRouter({ routeTree });

// Type Registration
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
