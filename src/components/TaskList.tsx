import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Hash,
  Flag,
  Repeat,
  FileText,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  selectedIndex: number;
  onSelectTask: (task: Task, index: number) => void;
  onToggleComplete: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onOpenDetail: (task: Task) => void;
  onSaveNotes: (id: number, notes: string) => void;
  startIndex?: number;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedIndex,
  onSelectTask,
  onToggleComplete,
  onDeleteTask,
  onOpenDetail,
  onSaveNotes,
  startIndex = 0,
}) => {
  const [expandedTaskIds, setExpandedTaskIds] = useState<number[]>([]);
  const [editingNotesTaskId, setEditingNotesTaskId] = useState<number | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  const toggleNotesExpand = (id: number, currentNotes: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedTaskIds.includes(id)) {
      setExpandedTaskIds(expandedTaskIds.filter((item) => item !== id));
      setEditingNotesTaskId(null);
    } else {
      setExpandedTaskIds([...expandedTaskIds, id]);
      setTempNotes(currentNotes);
    }
  };

  const handleSaveNotesInline = (id: number, e: React.FormEvent) => {
    e.preventDefault();
    onSaveNotes(id, tempNotes);
    setEditingNotesTaskId(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-200">All clear! No tasks found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Press <kbd className="bg-slate-800 text-red-400 px-1.5 py-0.5 rounded font-mono font-bold">n</kbd> anywhere to add a new task with natural language.
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-2">
      {tasks.map((task, idx) => {
        const globalIdx = startIndex + idx;
        const isSelected = selectedIndex === globalIdx;
        const isExpanded = expandedTaskIds.includes(task.id);
        const isEditingNotes = editingNotesTaskId === task.id;

        // Due date formatting & overdue check
        let dateBadgeClass = 'text-slate-400 bg-slate-800/80 border-slate-700/60';
        let isOverdue = false;

        if (task.due_date && !task.completed) {
          const dateOnly = task.due_date.split('T')[0];
          if (dateOnly < todayStr) {
            isOverdue = true;
            dateBadgeClass = 'text-red-400 bg-red-500/15 border-red-500/30 font-semibold';
          } else if (dateOnly === todayStr) {
            dateBadgeClass = 'text-amber-400 bg-amber-500/15 border-amber-500/30 font-semibold';
          } else {
            dateBadgeClass = 'text-sky-400 bg-sky-500/15 border-sky-500/30';
          }
        }

        return (
          <div
            key={task.id}
            onClick={() => onSelectTask(task, globalIdx)}
            onDoubleClick={() => onOpenDetail(task)}
            className={`group rounded-xl border transition cursor-pointer overflow-hidden ${
              isSelected
                ? 'bg-slate-800/95 border-red-500 ring-2 ring-red-500/40 shadow-lg'
                : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700/80'
            }`}
          >
            <div className="p-3.5 flex items-start justify-between gap-3">
              {/* Left Side: Checkbox & Main Info */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {/* Complete Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task.id);
                  }}
                  className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition shrink-0 ${
                    task.completed
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                      : isSelected
                      ? 'border-red-400 hover:bg-emerald-500/20 hover:border-emerald-400'
                      : 'border-slate-600 hover:border-emerald-400 hover:bg-emerald-500/20'
                  }`}
                  title={task.completed ? 'Mark uncompleted' : 'Mark completed (Shortcut: x)'}
                >
                  <Check className={`w-3.5 h-3.5 ${task.completed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 text-emerald-400'} transition`} />
                </button>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold tracking-tight transition ${
                        task.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Recurrence Badge */}
                    {task.rrule && (
                      <span className="flex items-center gap-1 text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                        <Repeat className="w-3 h-3" />
                        <span>{task.rrule}</span>
                      </span>
                    )}
                  </div>

                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Due Date */}
                    {task.due_date && (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${dateBadgeClass}`}>
                        <Calendar className="w-3 h-3" />
                        <span>
                          {isOverdue ? 'Overdue: ' : ''}
                          {task.due_date.replace('T', ' ')}
                        </span>
                      </div>
                    )}

                    {/* Project */}
                    <div className="flex items-center gap-0.5 text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded-md font-mono">
                      <Hash className="w-3 h-3 text-slate-500" />
                      <span>{task.project}</span>
                    </div>

                    {/* Priority */}
                    {task.priority <= 3 && (
                      <div
                        className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border ${
                          task.priority === 1
                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                            : task.priority === 2
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                        }`}
                      >
                        <Flag className="w-3 h-3" />
                        <span>P{task.priority}</span>
                      </div>
                    )}

                    {/* Notes Toggle */}
                    <button
                      type="button"
                      onClick={(e) => toggleNotesExpand(task.id, task.notes || '', e)}
                      className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md transition ${
                        task.notes
                          ? 'bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-700'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>{task.notes ? 'Notes' : '+ Note'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side Action buttons */}
              <div className="flex items-center gap-1 shrink-0 opacity-90 group-hover:opacity-100 transition">
                {isSelected && (
                  <span className="hidden sm:inline-block text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                    [x] complete
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetail(task);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Edit task details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notes Expand Drawer */}
            {isExpanded && (
              <div className="bg-slate-950/80 border-t border-slate-800/80 p-3 space-y-2 text-xs">
                {isEditingNotes ? (
                  <form onSubmit={(e) => handleSaveNotesInline(task.id, e)} className="space-y-2">
                    <textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Add detailed task notes..."
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingNotesTaskId(null)}
                        className="px-2 py-1 text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-semibold rounded"
                      >
                        Save Notes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                      {task.notes ? task.notes : <span className="text-slate-400 italic">No notes added yet.</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTempNotes(task.notes || '');
                        setEditingNotesTaskId(task.id);
                      }}
                      className="text-slate-400 hover:text-white text-[11px] font-medium underline shrink-0"
                    >
                      {task.notes ? 'Edit Notes' : 'Add Note'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
