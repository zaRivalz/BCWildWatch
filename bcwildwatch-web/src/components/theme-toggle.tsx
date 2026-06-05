'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Icon } from '@/components/icons';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // next-themes can only resolve the theme on the client; defer icon choice to
  // after mount to avoid a hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {/* Render a stable icon until mounted to avoid hydration mismatch */}
      {mounted && isDark ? <Icon.sun size={19} /> : <Icon.moon size={19} />}
    </button>
  );
}
