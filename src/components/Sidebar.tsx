import React from 'react';
import { Sun, Calendar, Inbox, CheckCircle, Hash, Flag, FolderPlus } from 'lucide-react';
import { ProjectSummary, ViewMode } from '../types';

interface SidebarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedProject: string | null;
  setSelectedProject: (proj: string | null) => void;
  selectedPriority: number | null;
  setSelectedPriority: (p: number | null) => void;
  projects: ProjectSummary[];
  todayCount: number;
  overdueCount: number;
  upcomingCount: number;
  allCount: number;
  completedCount: number;
  onNewProject: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  viewMode,
  setViewMode,
  selectedProject,
  setSelectedProject,
  selectedPriority,
  setSelectedPriority,
  projects,
  todayCount,
  overdueCount,
  upcomingCount,
  allCount,
  completedCount,
  onNewProject,
}) => {
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedProject(null);
  };

  const handleProjectSelect = (projName: string) => {
    setViewMode('project');
    setSelectedProject(projName);
  };

  return (
    <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800 text-slate-300 p-4 flex flex-col justify-between shrink-0 space-y-6">
      <div className="space-y-6">
        {/* Main Nav Views */}
        <div className="space-y-1">
          <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Views
          </div>
          
          <button
            onClick={() => handleViewChange('today')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'today' && !selectedProject
                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : 'hover:bg-slate-800/80 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sun className={`w-4 h-4 ${viewMode === 'today' && !selectedProject ? 'text-red-400' : 'text-amber-400'}`} />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              {overdueCount > 0 && (
                <span className="bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">
                  {overdueCount} overdue
                </span>
              )}
              <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                {todayCount}
              </span>
            </div>
          </button>

          <button
            onClick={() => handleViewChange('upcoming')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'upcoming' && !selectedProject
                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : 'hover:bg-slate-800/80 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Upcoming</span>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
              {upcomingCount}
            </span>
          </button>

          <button
            onClick={() => handleViewChange('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'all' && !selectedProject
                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : 'hover:bg-slate-800/80 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4 text-indigo-400" />
              <span>All Tasks</span>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
              {allCount}
            </span>
          </button>

          <button
            onClick={() => handleViewChange('completed')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'completed' && !selectedProject
                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : 'hover:bg-slate-800/80 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Completed</span>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
              {completedCount}
            </span>
          </button>
        </div>

        {/* Projects / #Tags */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Projects (#tags)
            </span>
            <button
              onClick={onNewProject}
              className="text-slate-400 hover:text-white p-0.5 hover:bg-slate-800 rounded transition"
              title="Add project tag"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
            {projects.map((proj) => (
              <button
                key={proj.name}
                onClick={() => handleProjectSelect(proj.name)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  viewMode === 'project' && selectedProject === proj.name
                    ? 'bg-slate-800 text-red-400 border border-slate-700'
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{proj.name}</span>
                </div>
                {proj.count > 0 && (
                  <span className="text-xs text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-full">
                    {proj.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-1.5">
          <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Priorities
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[
              { p: 1, label: 'P1', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
              { p: 2, label: 'P2', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
              { p: 3, label: 'P3', color: 'bg-sky-500/20 text-sky-400 border-sky-500/40' },
              { p: 4, label: 'P4', color: 'bg-slate-700/40 text-slate-300 border-slate-600/40' },
            ].map(({ p, label, color }) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(selectedPriority === p ? null : p)}
                className={`flex items-center justify-center gap-1 py-1 rounded border text-xs font-semibold transition ${
                  selectedPriority === p
                    ? `${color} ring-1 ring-white/20 shadow-sm`
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Flag className="w-3 h-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Keyboard Footer Hint */}
      <div className="pt-3 border-t border-slate-800/80 text-slate-400 text-xs space-y-1.5">
        <div className="font-semibold text-slate-400 flex items-center justify-between">
          <span>Shortcuts</span>
          <span className="text-[10px] text-slate-400">Active</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
          <div className="bg-slate-800/80 px-2 py-1 rounded flex justify-between">
            <span className="text-slate-400">Add</span>
            <kbd className="text-red-400 font-bold">n</kbd>
          </div>
          <div className="bg-slate-800/80 px-2 py-1 rounded flex justify-between">
            <span className="text-slate-400">Complete</span>
            <kbd className="text-emerald-400 font-bold">x</kbd>
          </div>
          <div className="bg-slate-800/80 px-2 py-1 rounded flex justify-between">
            <span className="text-slate-400">Search</span>
            <kbd className="text-amber-400 font-bold">/</kbd>
          </div>
          <div className="bg-slate-800/80 px-2 py-1 rounded flex justify-between">
            <span className="text-slate-400">Navigate</span>
            <kbd className="text-sky-400 font-bold">j/k</kbd>
          </div>
        </div>
      </div>
    </aside>
  );
};
