import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-subtle transition-colors hover:border-accent hover:text-accent"
      title={`Theme: ${theme}`}
    >
      {theme === 'light' && <Sun className="h-4.5 w-4.5" />}
      {theme === 'dark' && <Moon className="h-4.5 w-4.5" />}
      {theme === 'system' && <Monitor className="h-4.5 w-4.5" />}
    </button>
  );
}
