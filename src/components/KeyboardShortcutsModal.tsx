import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'n', desc: 'New Task (Focus Quick Add with natural language parsing)' },
    { key: 'x', desc: 'Complete selected task (or schedule next occurrence if recurring)' },
    { key: '/', desc: 'Focus global search input bar' },
    { key: 'j / ↓', desc: 'Navigate downward through task list' },
    { key: 'k / ↑', desc: 'Navigate upward through task list' },
    { key: 'Enter / e', desc: 'Open full detail editor for selected task' },
    { key: 'd / Delete', desc: 'Delete currently selected task' },
    { key: 'Esc', desc: 'Close modals / clear quick-add focus / deselect' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-base text-white">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
            {shortcuts.map(({ key, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-900/60 text-xs">
                <span className="text-slate-300 font-medium">{desc}</span>
                <kbd className="font-mono bg-slate-800 text-red-400 border border-slate-700 px-2 py-1 rounded shadow-sm text-xs font-bold shrink-0 ml-2">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
