import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Left-sliding Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Navigation Menu'}
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white text-stone-900 shadow-2xl border-r border-stone-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="bg-emerald-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div className="min-w-0 pr-2">
            {title && (
              <h2 className="text-sm font-black tracking-tight text-white truncate">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[11px] text-emerald-200 font-mono truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-800 text-emerald-100 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close navigation drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content (Menu items & Language Switcher) */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 text-left">
          {children}
        </div>
      </aside>
    </div>
  );
};
