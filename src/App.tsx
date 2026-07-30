import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { QuickAddInput } from './components/QuickAddInput';
import { OverdueSection } from './components/OverdueSection';
import { UpcomingView } from './components/UpcomingView';
import { TaskList } from './components/TaskList';
import { TaskDetailModal } from './components/TaskDetailModal';
import { NtfySettingsModal } from './components/NtfySettingsModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { Task, ViewMode, ProjectSummary } from './types';
import { Sun, Calendar, Inbox, CheckCircle, Hash, Plus, Sparkles } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [ntfyTopic, setNtfyTopic] = useState('');
  const [loading, setLoading] = useState(true);

  // Filters & Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Task for Keyboard Navigation
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Modals & Refs
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDefaultProject, setQuickAddDefaultProject] = useState<string | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isNtfyModalOpen, setIsNtfyModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Toast notification message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const quickAddInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Fetch data from backend API
  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.ntfy_topic) {
          setNtfyTopic(data.ntfy_topic);
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    Promise.all([fetchTasks(), fetchProjects(), fetchSettings()]).finally(() => {
      setLoading(false);
    });
  }, []);

  // 2. Task Mutations
  const handleQuickAddSubmit = async (input: string, notes?: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, notes }),
      });
      if (res.ok) {
        const newTask = await res.json();
        showToast(`✔ Task created: "${newTask.title}"`);
        fetchTasks();
        fetchProjects();
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleToggleComplete = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/tasks/${id}/complete`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.nextTask) {
          showToast(`✔ Task completed! Next occurrence scheduled for ${data.nextTask.due_date}`);
        } else if (data.completedTask?.completed) {
          showToast(`✔ Completed task: "${data.completedTask.title}"`);
        } else {
          showToast(`Uncompleted task.`);
        }
        fetchTasks();
        fetchProjects();
      }
    } catch (err) {
      console.error('Error completing task:', err);
    }
  }, []);

  const handleDeleteTask = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Deleted task.`);
        fetchTasks();
        fetchProjects();
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  }, []);

  const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        showToast(`Updated task details.`);
        fetchTasks();
        fetchProjects();
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleSaveTopic = async (topic: string) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ntfy_topic: topic }),
      });
      if (res.ok) {
        setNtfyTopic(topic);
        showToast(`Saved ntfy topic: ${topic}`);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  // 3. Computed Date & Filter Logic
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Active uncompleted tasks
  const activeTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    return activeTasks.filter((t) => {
      if (!t.due_date) return false;
      const dateOnly = t.due_date.split('T')[0];
      return dateOnly < todayStr;
    });
  }, [activeTasks, todayStr]);

  // Due today tasks
  const todayTasks = useMemo(() => {
    return activeTasks.filter((t) => {
      if (!t.due_date) return false;
      const dateOnly = t.due_date.split('T')[0];
      return dateOnly === todayStr;
    });
  }, [activeTasks, todayStr]);

  // Upcoming tasks (next 7 days)
  const next7DaysStr = useMemo(() => {
    const list: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      list.push(`${year}-${month}-${day}`);
    }
    return list;
  }, [now]);

  const upcomingTasks = useMemo(() => {
    return activeTasks.filter((t) => {
      if (!t.due_date) return false;
      const dateOnly = t.due_date.split('T')[0];
      return next7DaysStr.includes(dateOnly);
    });
  }, [activeTasks, next7DaysStr]);

  // Filter tasks based on viewMode & selected filters
  const displayedTasks = useMemo(() => {
    let result = tasks;

    // View filter
    if (viewMode === 'today') {
      result = activeTasks.filter((t) => {
        if (!t.due_date) return false;
        const dateOnly = t.due_date.split('T')[0];
        return dateOnly <= todayStr; // Includes overdue & today
      });
    } else if (viewMode === 'upcoming') {
      result = upcomingTasks;
    } else if (viewMode === 'completed') {
      result = tasks.filter((t) => t.completed);
    } else if (viewMode === 'all') {
      result = activeTasks;
    } else if (viewMode === 'project' && selectedProject) {
      result = activeTasks.filter((t) => t.project.toLowerCase() === selectedProject.toLowerCase());
    }

    // Secondary Priority filter
    if (selectedPriority !== null) {
      result = result.filter((t) => t.priority === selectedPriority);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.project.toLowerCase().includes(q) ||
          (t.rrule && t.rrule.toLowerCase().includes(q))
      );
    }

    return result;
  }, [tasks, activeTasks, upcomingTasks, viewMode, selectedProject, selectedPriority, searchQuery, todayStr]);

  // 4. Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside input / textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (e.key === 'Escape') {
          target.blur();
          setIsQuickAddOpen(false);
          setIsNtfyModalOpen(false);
          setIsShortcutsModalOpen(false);
          setEditingTask(null);
        }
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setQuickAddDefaultProject(selectedProject || undefined);
        setIsQuickAddOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        if (displayedTasks.length > 0 && selectedIndex < displayedTasks.length) {
          const targetTask = displayedTasks[selectedIndex];
          if (targetTask) {
            handleToggleComplete(targetTask.id);
          }
        }
      } else if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, Math.max(0, displayedTasks.length - 1)));
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (displayedTasks.length > 0 && selectedIndex < displayedTasks.length) {
          const targetTask = displayedTasks[selectedIndex];
          if (targetTask) setEditingTask(targetTask);
        }
      } else if (e.key === 'Delete' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (displayedTasks.length > 0 && selectedIndex < displayedTasks.length) {
          const targetTask = displayedTasks[selectedIndex];
          if (targetTask) handleDeleteTask(targetTask.id);
        }
      } else if (e.key === 'Escape') {
        setIsQuickAddOpen(false);
        setIsNtfyModalOpen(false);
        setIsShortcutsModalOpen(false);
        setEditingTask(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayedTasks, selectedIndex, selectedProject, handleToggleComplete, handleDeleteTask]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchInputRef={searchInputRef}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onOpenNtfySettings={() => setIsNtfyModalOpen(true)}
        ntfyTopic={ntfyTopic}
        onQuickAddTrigger={() => {
          setQuickAddDefaultProject(selectedProject || undefined);
          setIsQuickAddOpen(true);
        }}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row min-h-0">
        {/* Sidebar */}
        <Sidebar
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          projects={projects}
          todayCount={todayTasks.length}
          overdueCount={overdueTasks.length}
          upcomingCount={upcomingTasks.length}
          allCount={activeTasks.length}
          completedCount={tasks.filter((t) => t.completed).length}
          onNewProject={() => {
            const p = prompt('Enter new project hashtag name:');
            if (p && p.trim()) {
              setViewMode('project');
              setSelectedProject(p.trim().toLowerCase());
            }
          }}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 font-medium px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs">{toastMessage}</span>
            </div>
          )}

          {/* View Title Banner */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              {viewMode === 'today' && <Sun className="w-6 h-6 text-amber-400" />}
              {viewMode === 'upcoming' && <Calendar className="w-6 h-6 text-sky-400" />}
              {viewMode === 'all' && <Inbox className="w-6 h-6 text-indigo-400" />}
              {viewMode === 'completed' && <CheckCircle className="w-6 h-6 text-emerald-400" />}
              {viewMode === 'project' && <Hash className="w-6 h-6 text-slate-400" />}

              <div>
                <h2 className="text-xl font-bold text-white tracking-tight capitalize flex items-center gap-2">
                  <span>
                    {viewMode === 'project' && selectedProject
                      ? `#${selectedProject}`
                      : viewMode === 'today'
                      ? 'Today'
                      : viewMode === 'upcoming'
                      ? 'Upcoming (Next 7 Days)'
                      : viewMode === 'completed'
                      ? 'Completed Archive'
                      : 'All Active Tasks'}
                  </span>
                  {selectedPriority && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      Priority P{selectedPriority}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">
                  {displayedTasks.length} {displayedTasks.length === 1 ? 'task' : 'tasks'} found
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setQuickAddDefaultProject(selectedProject || undefined);
                setIsQuickAddOpen(true);
              }}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-md transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Task</span>
              <kbd className="hidden sm:inline-block bg-red-700/60 text-[10px] px-1.5 py-0.5 rounded font-mono">
                n
              </kbd>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading tasks from SQLite database...
            </div>
          ) : viewMode === 'upcoming' && !searchQuery && !selectedPriority ? (
            /* Upcoming Grouped View */
            <UpcomingView
              tasks={tasks}
              selectedIndex={selectedIndex}
              onSelectTask={(task, idx) => {
                setEditingTask(task);
                setSelectedIndex(idx);
              }}
              onToggleComplete={handleToggleComplete}
              onOpenDetail={(task) => setEditingTask(task)}
              onQuickAddForDate={(dateStr) => {
                setQuickAddDefaultProject(selectedProject || undefined);
                setIsQuickAddOpen(true);
              }}
            />
          ) : (
            /* Standard View (Today, All, Project, Completed) */
            <div className="space-y-6">
              {/* Pinned Overdue Tasks section at top of Today view */}
              {viewMode === 'today' && overdueTasks.length > 0 && !searchQuery && (
                <OverdueSection
                  tasks={overdueTasks}
                  selectedIndex={selectedIndex}
                  onSelectTask={(task, idx) => setSelectedIndex(idx)}
                  onToggleComplete={handleToggleComplete}
                  onOpenDetail={(task) => setEditingTask(task)}
                  startIndex={0}
                />
              )}

              {/* Task list */}
              <TaskList
                tasks={displayedTasks}
                selectedIndex={selectedIndex}
                onSelectTask={(task, idx) => setSelectedIndex(idx)}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onOpenDetail={(task) => setEditingTask(task)}
                onSaveNotes={(id, notes) => handleUpdateTask(id, { notes })}
                startIndex={viewMode === 'today' ? overdueTasks.length : 0}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <QuickAddInput
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={handleQuickAddSubmit}
        quickAddInputRef={quickAddInputRef}
        defaultProject={quickAddDefaultProject}
      />

      <TaskDetailModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleUpdateTask}
        onDelete={handleDeleteTask}
      />

      <NtfySettingsModal
        isOpen={isNtfyModalOpen}
        onClose={() => setIsNtfyModalOpen(false)}
        topic={ntfyTopic}
        onSaveTopic={handleSaveTopic}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}
