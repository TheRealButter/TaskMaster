import React from 'react';
import { Calendar, Plus, Check, FileText, Repeat, Flag, Hash } from 'lucide-react';
import { Task } from '../types';

interface UpcomingViewProps {
  tasks: Task[];
  selectedIndex: number;
  onSelectTask: (task: Task, index: number) => void;
  onToggleComplete: (id: number) => void;
  onOpenDetail: (task: Task) => void;
  onQuickAddForDate: (dateStr: string) => void;
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({
  tasks,
  selectedIndex,
  onSelectTask,
  onToggleComplete,
  onOpenDetail,
  onQuickAddForDate,
}) => {
  // Generate next 7 days starting today
  const days: { dateStr: string; label: string; sublabel: string; isToday: boolean }[] = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    let label = '';
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else {
      label = d.toLocaleDateString('en-US', { weekday: 'long' });
    }

    const sublabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days.push({ dateStr, label, sublabel, isToday: i === 0 });
  }

  // Group active tasks by due date
  let globalItemIndex = 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <span>Upcoming (Next 7 Days)</span>
          </h2>
          <p className="text-xs text-slate-400">Grouped day by day</p>
        </div>
      </div>

      <div className="space-y-6">
        {days.map((dayObj) => {
          const dayTasks = tasks.filter((t) => {
            if (!t.due_date || t.completed) return false;
            return t.due_date.startsWith(dayObj.dateStr);
          });

          return (
            <div
              key={dayObj.dateStr}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className={`font-bold text-base ${dayObj.isToday ? 'text-red-400' : 'text-slate-200'}`}>
                    {dayObj.label}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {dayObj.sublabel}
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                    {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>

                <button
                  onClick={() => onQuickAddForDate(dayObj.dateStr)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/80 px-2.5 py-1 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5 text-red-400" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* Tasks for this day */}
              {dayTasks.length === 0 ? (
                <div className="py-3 text-center text-xs text-slate-400 italic">
                  No tasks scheduled for {dayObj.label.toLowerCase()}.
                </div>
              ) : (
                <div className="space-y-2">
                  {dayTasks.map((task) => {
                    const currentIdx = globalItemIndex++;
                    const isSelected = selectedIndex === currentIdx;

                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task, currentIdx)}
                        onDoubleClick={() => onOpenDetail(task)}
                        className={`group flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-red-500/80 ring-2 ring-red-500/30 shadow-md'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Complete checkbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleComplete(task.id);
                            }}
                            className="w-5 h-5 rounded-md border border-slate-600 hover:border-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition shrink-0"
                          >
                            <Check className="w-3.5 h-3.5 text-transparent group-hover:text-emerald-400 transition" />
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-100 truncate">
                                {task.title}
                              </span>
                              {task.notes && (
                                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" title="Has notes" />
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                              {task.has_due_time && (
                                <span className="text-amber-400 font-mono">
                                  {task.due_date?.split('T')[1]?.slice(0, 5)}
                                </span>
                              )}
                              <span className="flex items-center gap-0.5">
                                <Hash className="w-3 h-3 text-slate-500" />
                                {task.project}
                              </span>
                              {task.rrule && (
                                <span className="flex items-center gap-0.5 text-emerald-400">
                                  <Repeat className="w-3 h-3" />
                                  {task.rrule}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Priority Badge & Edit button */}
                        <div className="flex items-center gap-2 shrink-0">
                          {task.priority <= 3 && (
                            <div
                              className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border ${
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
