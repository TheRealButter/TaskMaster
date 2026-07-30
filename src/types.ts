export interface Task {
  id: number;
  title: string;
  notes: string;
  due_date: string | null; // ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  has_due_time: boolean;
  project: string; // e.g. "inbox", "home", "work"
  priority: number; // 1 = P1 (Urgent/Red), 2 = P2 (Medium/Orange), 3 = P3 (Low/Blue), 4 = P4 (None/Gray)
  rrule: string | null; // Recurrence string e.g. "every day", "FREQ=WEEKLY;BYDAY=MO,TH", "every 1st"
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  reminded: boolean;
}

export interface QuickAddParsed {
  title: string;
  due_date: string | null;
  has_due_time: boolean;
  project: string;
  priority: number;
  rrule: string | null;
}

export type ViewMode = 'today' | 'upcoming' | 'project' | 'all' | 'completed';

export interface ProjectSummary {
  name: string;
  count: number;
}

export interface SystemSettings {
  ntfy_topic: string;
  auto_reminders: boolean;
  digest_time: string; // e.g. "07:00"
}
