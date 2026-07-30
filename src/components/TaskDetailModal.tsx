import React, { useState, useEffect } from 'react';
import { X, Calendar, Hash, Flag, Repeat, Trash2, Check, Clock } from 'lucide-react';
import { Task } from '../types';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, updates: Partial<Task>) => void;
  onDelete: (id: number) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [project, setProject] = useState('inbox');
  const [priority, setPriority] = useState(4);
  const [rrule, setRrule] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setNotes(task.notes || '');
      setProject(task.project || 'inbox');
      setPriority(task.priority || 4);
      setRrule(task.rrule || '');

      if (task.due_date) {
        if (task.due_date.includes('T')) {
          const [d, t] = task.due_date.split('T');
          setDueDate(d);
          setDueTime(t.slice(0, 5));
        } else {
          setDueDate(task.due_date);
          setDueTime('');
        }
      } else {
        setDueDate('');
        setDueTime('');
      }
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let fullDueDate: string | null = null;
    let hasTime = false;

    if (dueDate) {
      if (dueTime) {
        fullDueDate = `${dueDate}T${dueTime}:00`;
        hasTime = true;
      } else {
        fullDueDate = dueDate;
        hasTime = false;
      }
    }

    onSave(task.id, {
      title: title.trim(),
      notes: notes.trim(),
      due_date: fullDueDate,
      has_due_time: hasTime,
      project: project.trim().toLowerCase(),
      priority,
      rrule: rrule.trim() || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              Task #{task.id}
            </span>
            <h3 className="font-bold text-base text-white">Task Details</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free-text Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add extra context, links, sub-tasks, or notes..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Grid: Project & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Project */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Project (#tag)</span>
              </label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="inbox, home, work..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                <span>Priority</span>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { p: 1, label: 'P1', color: 'bg-red-500/20 text-red-400 border-red-500/50' },
                  { p: 2, label: 'P2', color: 'bg-amber-500/20 text-amber-400 border-amber-500/50' },
                  { p: 3, label: 'P3', color: 'bg-sky-500/20 text-sky-400 border-sky-500/50' },
                  { p: 4, label: 'P4', color: 'bg-slate-700/40 text-slate-300 border-slate-600/50' },
                ].map(({ p, label, color }) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition ${
                      priority === p ? `${color} ring-1 ring-white/20` : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid: Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Due Time (Optional)</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Recurrence (rrule) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Repeat className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recurring Schedule (rrule string)</span>
            </label>
            <input
              type="text"
              value={rrule}
              onChange={(e) => setRrule(e.target.value)}
              placeholder='e.g., "every day", "every mon,thu", "every 1st", "FREQ=WEEKLY;BYDAY=MO,TH"'
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-[11px] text-slate-400">
              Completing a recurring task automatically calculates & schedules the next occurrence!
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                onDelete(task.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/20 rounded-xl transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Task</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-lg transition"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
