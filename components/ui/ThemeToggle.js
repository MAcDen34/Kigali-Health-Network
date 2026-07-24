'use client';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ThemeToggle({ className = '' }) {
  const { state, dispatch } = useApp();
  const isDark = state.theme === 'dark';

  return (
    <button
      onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-2.5 rounded-xl hover:bg-h-bg transition-colors text-h-text-muted ${className}`}
    >
      {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
    </button>
  );
}
