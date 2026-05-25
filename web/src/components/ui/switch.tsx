'use client';

import * as React from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all duration-300 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2
        ${checked
          ? 'bg-primary shadow-sm shadow-primary/30'
          : 'bg-muted-foreground/20 hover:bg-muted-foreground/30'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white shadow-sm ring-0 transition-all duration-300 ease-out
          ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}
        `}
      />
    </button>
  );
}
