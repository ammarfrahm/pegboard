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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <NavHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavHeader() {
  return (
    <header className="border-b-2 px-6 py-4" style={{ borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-8 h-8 flex items-center justify-center transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <svg className="w-5 h-5" style={{ color: 'var(--accent-foreground)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" strokeWidth={2} />
                <rect x="14" y="3" width="7" height="7" strokeWidth={2} />
                <rect x="3" y="14" width="7" height="7" strokeWidth={2} />
                <rect x="14" y="14" width="7" height="7" strokeWidth={2} />
              </svg>
            </div>
            <h1 className="font-display text-xl tracking-tight group-hover:text-[var(--accent)] transition-colors">
              PEGBOARD
            </h1>
          </Link>

          <nav className="flex items-center gap-2 border-l-2 pl-6" style={{ borderColor: 'var(--border)' }}>
            <Link
              to="/compress"
              className="px-3 py-1.5 text-sm font-mono transition-all border-2"
              activeProps={{
                style: {
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  borderColor: 'var(--accent)',
                }
              }}
              inactiveProps={{
                style: {
                  backgroundColor: 'transparent',
                  color: 'var(--muted)',
                  borderColor: 'transparent',
                }
              }}
            >
              COMPRESS
            </Link>
            <Link
              to="/overlay"
              className="px-3 py-1.5 text-sm font-mono transition-all border-2"
              activeProps={{
                style: {
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  borderColor: 'var(--accent)',
                }
              }}
              inactiveProps={{
                style: {
                  backgroundColor: 'transparent',
                  color: 'var(--muted)',
                  borderColor: 'transparent',
                }
              }}
            >
              OVERLAY
            </Link>
            <Link
              to="/json"
              className="px-3 py-1.5 text-sm font-mono transition-all border-2"
              activeProps={{
                style: {
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  borderColor: 'var(--accent)',
                }
              }}
              inactiveProps={{
                style: {
                  backgroundColor: 'transparent',
                  color: 'var(--muted)',
                  borderColor: 'transparent',
                }
              }}
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
