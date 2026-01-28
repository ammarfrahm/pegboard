import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 flex items-center justify-center border-2 transition-colors"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'transparent',
        color: 'var(--foreground)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.color = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.color = 'var(--foreground)';
      }}
      title={`Current: ${theme}`}
    >
      {/* Light mode - geometric sun */}
      {theme === 'light' && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="10" y="10" width="4" height="4" strokeWidth={2} />
          <path strokeLinecap="square" strokeWidth={2} d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07l-2.83 2.83m-8.48 8.48l-2.83 2.83m0-14.14l2.83 2.83m8.48 8.48l2.83 2.83" />
        </svg>
      )}
      {/* Dark mode - geometric moon */}
      {theme === 'dark' && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M20 12.5a8 8 0 01-11.5 7.07A8 8 0 1112.5 4a6 6 0 007.5 8.5z" />
        </svg>
      )}
      {/* System mode - monitor */}
      {theme === 'system' && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="12" strokeWidth={2} />
          <path strokeLinecap="square" strokeWidth={2} d="M8 20h8m-4-4v4" />
        </svg>
      )}
    </button>
  );
}
