import { getAllTasks, getSetting } from './db.js';

export async function sendNtfyNotification(
  topic: string,
  title: string,
  message: string,
  priority = 3,
  tags: string[] = ['memo']
): Promise<{ success: boolean; error?: string }> {
  if (!topic || !topic.trim()) {
    return { success: false, error: 'No ntfy topic provided' };
  }

  const cleanTopic = topic.trim().replace(/^https?:\/\/ntfy\.sh\//, '');

  // Map priority 1-4 to ntfy priority (1=P1 Urgent -> 5 max, 2=P2 High -> 4, 3=P3 Normal -> 3, 4=P4 Low -> 2)
  let ntfyPriority = '3';
  if (priority === 1) ntfyPriority = '5';
  else if (priority === 2) ntfyPriority = '4';
  else if (priority === 3) ntfyPriority = '3';
  else if (priority === 4) ntfyPriority = '2';

  try {
    const res = await fetch(`https://ntfy.sh/${cleanTopic}`, {
      method: 'POST',
      headers: {
        'Title': title,
        'Priority': ntfyPriority,
        'Tags': tags.join(','),
      },
      body: message,
    });

    if (res.ok) {
      return { success: true };
    } else {
      const text = await res.text();
      return { success: false, error: `ntfy HTTP ${res.status}: ${text}` };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function send7amDigest(): Promise<{ success: boolean; taskCount: number; error?: string }> {
  const envTopic = process.env.NTFY_TOPIC || '';
  const topic = (await getSetting('ntfy_topic', envTopic)) || envTopic;

  if (!topic) {
    return { success: false, taskCount: 0, error: 'No ntfy topic configured' };
  }

  const tasks = await getAllTasks();
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const activeTasks = tasks.filter(t => !t.completed);

  // Overdue
  const overdueTasks = activeTasks.filter(t => {
    if (!t.due_date) return false;
    const dateOnly = t.due_date.split('T')[0];
    return dateOnly < todayStr;
  });

  // Due today
  const todayTasks = activeTasks.filter(t => {
    if (!t.due_date) return false;
    const dateOnly = t.due_date.split('T')[0];
    return dateOnly === todayStr;
  });

  if (overdueTasks.length === 0 && todayTasks.length === 0) {
    // Send quiet morning check-in
    const result = await sendNtfyNotification(
      topic,
      '🌅 TaskMaster Morning Digest',
      'You have no overdue or due tasks scheduled for today. Have a great day!',
      3,
      ['sunny', 'sparkles']
    );
    return { ...result, taskCount: 0 };
  }

  let bodyLines = [];
  if (overdueTasks.length > 0) {
    bodyLines.push(`🚨 OVERDUE (${overdueTasks.length}):`);
    overdueTasks.slice(0, 5).forEach(t => {
      bodyLines.push(`• [P${t.priority}] ${t.title} (#${t.project})`);
    });
    if (overdueTasks.length > 5) bodyLines.push(`...and ${overdueTasks.length - 5} more overdue.`);
    bodyLines.push('');
  }

  if (todayTasks.length > 0) {
    bodyLines.push(`📅 DUE TODAY (${todayTasks.length}):`);
    todayTasks.slice(0, 8).forEach(t => {
      const timePart = t.has_due_time && t.due_date?.includes('T') ? ` at ${t.due_date.split('T')[1].slice(0, 5)}` : '';
      bodyLines.push(`• [P${t.priority}] ${t.title}${timePart} (#${t.project})`);
    });
    if (todayTasks.length > 8) bodyLines.push(`...and ${todayTasks.length - 8} more due today.`);
  }

  const totalCount = overdueTasks.length + todayTasks.length;
  const result = await sendNtfyNotification(
    topic,
    `🌅 Today's Task Digest (${totalCount} tasks)`,
    bodyLines.join('\n'),
    overdueTasks.length > 0 ? 1 : 2,
    ['calendar', 'memo']
  );

  return { ...result, taskCount: totalCount };
}
