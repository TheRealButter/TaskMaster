import cron from 'node-cron';
import { getAllTasks, getSetting, updateTask } from './db.js';
import { send7amDigest, sendNtfyNotification } from './ntfy.js';

export function initCronJobs() {
  console.log('⏰ Initializing TaskMaster background cron jobs...');

  // 1. Minute check for due tasks
  cron.schedule('* * * * *', async () => {
    try {
      const topic = (await getSetting('ntfy_topic', process.env.NTFY_TOPIC || '')) || process.env.NTFY_TOPIC;
      if (!topic) return;

      const tasks = await getAllTasks();
      const now = new Date();

      for (const task of tasks) {
        if (task.completed || task.reminded || !task.due_date) continue;

        let isDueNow = false;
        const taskDate = new Date(task.due_date);

        if (isNaN(taskDate.getTime())) continue;

        if (task.has_due_time) {
          // Compare exact minute
          if (taskDate.getTime() <= now.getTime()) {
            isDueNow = true;
          }
        } else {
          // Date-only task: check if due date is today or past and time is past 9:00 AM
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const taskDateOnly = task.due_date.split('T')[0];
          if (taskDateOnly <= todayStr && now.getHours() >= 9) {
            isDueNow = true;
          }
        }

        if (isDueNow) {
          console.log(`🔔 Task "${task.title}" is due! Sending ntfy alert...`);
          const title = `Task Due: ${task.title}`;
          const message = `Project: #${task.project}\nPriority: P${task.priority}${task.notes ? '\nNotes: ' + task.notes : ''}`;
          
          await sendNtfyNotification(topic, title, message, task.priority, ['alarm_clock', task.project]);
          await updateTask(task.id, { reminded: true });
        }
      }
    } catch (err) {
      console.error('Error in minute cron job:', err);
    }
  });

  // 2. 7:00 AM Daily Digest
  cron.schedule('0 7 * * *', async () => {
    console.log('🌅 Running 7:00 AM task digest...');
    try {
      await send7amDigest();
    } catch (err) {
      console.error('Error in 7 AM digest cron job:', err);
    }
  });
}
