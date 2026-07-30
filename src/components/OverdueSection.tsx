import React from 'react';
import { AlertCircle, Check, Flag, Calendar, Hash, FileText } from 'lucide-react';
import { Task } from '../types';

interface OverdueSectionProps {
  tasks: Task[];
  selectedIndex: number;
  onSelectTask: (task: Task, index: number) => void;
  onToggleComplete: (id: number) => void;
  onOpenDetail: (task: Task) => void;
  startIndex: number;
}

export const OverdueSection: React.FC<OverdueSectionProps> = ({
  tasks,
  selectedIndex,
  onSelectTask,
  onToggleComplete,
  onOpenDetail,
  startIndex,
}) => {
  if (tasks.length === 0) return null;

  return (
    <div className="bg-red-950/40 border-2 border-red-500/50 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-500/30 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center animate-pulse">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-red-400 tracking-wide uppercase">
              Pinned Overdue Tasks ({tasks.length})
            </h3>
            <p className="text-[11px] text-red-300/80">Needs immediate attention</p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
          OVERDUE
        </span>
      </div>

      {/* Task items list */}
      <div className="space-y-2">
        {tasks.map((task, idx) => {
          const globalIdx = startIndex + idx;
          const isSelected = selectedIndex === globalIdx;

          return (
            <div
              key={task.id}
              onClick={() => onSelectTask(task, globalIdx)}
              onDoubleClick={() => onOpenDetail(task)}
              className={`group flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                isSelected
                  ? 'bg-red-900/40 border-red-400 ring-2 ring-red-500/50 shadow-md'
                  : 'bg-slate-900/80 border-red-900/60 hover:border-red-500/40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Complete checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task.id);
                  }}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                    isSelected ? 'border-red-400 hover:bg-red-500/20' : 'border-red-500/40 hover:bg-red-500/10'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 text-transparent group-hover:text-red-400 transition" />
                </button>

                {/* Content */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100 truncate">
                      {task.title}
                    </span>
                    {task.notes && (
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" title="Has notes" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                    {/* Due Date */}
                    <div className="flex items-center gap-1 text-red-400 font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>{task.due_date?.replace('T', ' ')}</span>
                    </div>

                    {/* Project */}
                    <div className="flex items-center gap-0.5 text-slate-400">
                      <Hash className="w-3 h-3" />
                      <span>{task.project}</span>
                    </div>

                    {/* Priority */}
                    {task.priority <= 3 && (
                      <div className="flex items-center gap-0.5 font-bold text-red-400">
                        <Flag className="w-3 h-3" />
                        <span>P{task.priority}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action hints */}
              <div className="flex items-center gap-2 shrink-0">
                {isSelected && (
                  <span className="text-[10px] font-mono bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">
                    Press 'x' to complete
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetail(task);
                  }}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
