'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  /** 'fixed' = pojok kanan atas layar, 'inline' = dalam flow layout */
  position?: 'fixed' | 'inline';
}

export function ThemeToggle({ className = '', position = 'fixed' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const base = `
    relative p-2.5 rounded-xl transition-all duration-300
    text-muted-foreground hover:text-foreground
    bg-card/80 hover:bg-muted backdrop-blur-sm
    border border-border/50 hover:border-border
    shadow-sm hover:shadow-md
    cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
  `;

  const fixedClass = 'fixed top-4 right-4 z-[9999]';

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
      aria-label="Toggle theme"
      className={`${base} ${position === 'fixed' ? fixedClass : ''} ${className}`}
    >
      <Sun
        className={`w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
          theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
        }`}
      />
      <Moon
        className={`w-4 h-4 transition-all duration-300 ${
          theme === 'dark' ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
      />
    </button>
  );
}
