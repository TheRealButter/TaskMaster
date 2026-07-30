import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Calendar, Hash, Flag, Repeat, CornerDownLeft, X } from 'lucide-react';
import { parseQuickAdd } from '../lib/parser';
import { QuickAddParsed } from '../types';

interface QuickAddInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: string, notes?: string) => void;
  quickAddInputRef: React.RefObject<HTMLInputElement | null>;
  defaultProject?: string;
}

export const QuickAddInput: React.FC<QuickAddInputProps> = ({
  isOpen,
  onClose,
  onSubmit,
  quickAddInputRef,
  defaultProject,
}) => {
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [parsed, setParsed] = useState<QuickAddParsed>({
    title: '',
    due_date: null,
    has_due_time: false,
    project: defaultProject || 'inbox',
    priority: 4,
    rrule: null,
  });

  useEffect(() => {
    let raw = value;
    if (defaultProject && !raw.includes('#')) {
      raw = `${raw} #${defaultProject}`;
    }
    const res = parseQuickAdd(raw);
    setParsed(res);
  }, [value, defaultProject]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        quickAddInputRef.current?.focus();
      }, 50);
    } else {
      setValue('');
      setNotes('');
      setShowNotesInput(false);
    }
  }, [isOpen, quickAddInputRef]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value, notes);
    setValue('');
    setNotes('');
    setShowNotesInput(false);
    onClose();
  };

  const getPriorityBadge = (p: number) => {
    switch (p) {
      case 1:
        return { label: 'P1 Urgent', cls: 'bg-red-500/20 text-red-400 border-red-500/40' };
      case 2:
        return { label: 'P2 High', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      case 3:
        return { label: 'P3 Medium', cls: 'bg-sky-500/20 text-sky-400 border-sky-500/40' };
      default:
        return { label: 'P4 Normal', cls: 'bg-slate-700/40 text-slate-300 border-slate-600/40' };
    }
  };

  const priorityBadge = getPriorityBadge(parsed.priority);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Top banner / title */}
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
            <div className="flex items-center gap-1.5 font-semibold text-red-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Add Task (Natural Language Enabled)</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick-add Input */}
          <div className="relative">
            <input
              ref={quickAddInputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='e.g., "call Sam tomorrow 4pm #home p2" or "pay bills every 1st p1"'
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-3 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition font-medium"
              autoFocus
            />
          </div>

          {/* Notes toggle / textarea */}
          {showNotesInput ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add optional task notes..."
              rows={2}
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNotesInput(true)}
              className="text-xs text-slate-400 hover:text-slate-200 transition"
            >
              + Add detailed notes
            </button>
          )}

          {/* Live Parsed Preview Chips */}
          {value.trim() && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Parsed Task Preview
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Title */}
                <div className="font-semibold text-slate-100 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700/60">
                  {parsed.title || 'Untitled'}
                </div>

                {/* Date */}
                {parsed.due_date && (
                  <div className="flex items-center gap-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {parsed.due_date.replace('T', ' at ').slice(0, 19)}
                    </span>
                  </div>
                )}

                {/* Project */}
                <div className="flex items-center gap-1 bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded-lg">
                  <Hash className="w-3 h-3" />
                  <span>#{parsed.project}</span>
                </div>

                {/* Priority */}
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border ${priorityBadge.cls}`}>
                  <Flag className="w-3 h-3" />
                  <span>{priorityBadge.label}</span>
                </div>

                {/* Recurrence */}
                {parsed.rrule && (
                  <div className="flex items-center gap-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                    <Repeat className="w-3 h-3" />
                    <span>{parsed.rrule}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">Esc</span>
              <span>to cancel</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!value.trim()}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-md transition"
              >
                <span>Add Task</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
