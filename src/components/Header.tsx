import React from 'react';
import { Search, Bell, Keyboard, CheckCircle2, Sparkles } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onOpenShortcuts: () => void;
  onOpenNtfySettings: () => void;
  ntfyTopic: string;
  onQuickAddTrigger: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  searchInputRef,
  onOpenShortcuts,
  onOpenNtfySettings,
  ntfyTopic,
  onQuickAddTrigger,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo and title */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-white leading-none">TaskMaster</h1>
                <span className="text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">SQLite</span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">Keyboard-first Todoist replacement</p>
            </div>
          </div>

          <button
            onClick={onQuickAddTrigger}
            className="sm:hidden flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm active:scale-95"
          >
            <span>+ Task</span>
            <kbd className="bg-red-700/60 text-[10px] px-1 py-0.5 rounded text-red-100 font-mono">n</kbd>
          </button>
        </div>

        {/* Global Search input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, notes, #projects... (press '/')"
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg pl-9 pr-12 py-1.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-block bg-slate-700/60 text-slate-400 text-[11px] font-mono px-1.5 py-0.5 rounded border border-slate-600/50">
            /
          </kbd>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Quick Add Button */}
          <button
            onClick={onQuickAddTrigger}
            className="hidden sm:flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Task</span>
            <kbd className="bg-red-700/60 text-[10px] px-1.5 py-0.5 rounded text-red-100 font-mono">n</kbd>
          </button>

          {/* Ntfy Status Badge */}
          <button
            onClick={onOpenNtfySettings}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg transition"
            title="Configure ntfy mobile notifications"
          >
            <Bell className={`w-3.5 h-3.5 ${ntfyTopic ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline font-mono text-[11px] max-w-[100px] truncate">
              {ntfyTopic ? `ntfy:${ntfyTopic}` : 'ntfy setup'}
            </span>
          </button>

          {/* Keyboard Shortcuts Button */}
          <button
            onClick={onOpenShortcuts}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition"
            title="Keyboard Shortcuts Cheat Sheet"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
