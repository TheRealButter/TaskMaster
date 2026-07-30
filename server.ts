import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initCronJobs } from './server/cron.js';
import {
  addTask,
  completeTask,
  deleteTask,
  getAllTasks,
  getProjects,
  getSetting,
  getTaskById,
  setSetting,
  updateTask,
} from './server/db.js';
import { send7amDigest, sendNtfyNotification } from './server/ntfy.js';
import { parseQuickAdd } from './src/lib/parser.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Tasks API
  app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await getAllTasks();
      res.json(tasks);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      let taskData = req.body;
      if (req.body.input) {
        // Natural language quick add string
        const parsed = parseQuickAdd(req.body.input);
        taskData = {
          ...parsed,
          notes: req.body.notes || '',
        };
      }
      const newCreated = await addTask(taskData);
      res.status(201).json(newCreated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  app.put('/api/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await updateTask(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/tasks/:id/complete', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const task = await getTaskById(id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      if (task.completed) {
        // Uncomplete
        const uncompleted = await updateTask(id, { completed: false });
        return res.json({ completedTask: uncompleted, nextTask: null });
      } else {
        // Complete (and schedule next if recurring)
        const result = await completeTask(id);
        return res.json(result);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await deleteTask(id);
      res.json({ success: true, id });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // Projects API
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await getProjects();
      res.json(projects);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // CLI Endpoint: `t add "..."` or `t list`
  app.post('/api/cli/add', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text prompt is required' });
      }

      const parsed = parseQuickAdd(text);
      const created = await addTask(parsed);

      res.status(201).json({
        success: true,
        message: `Task #${created.id} created: "${created.title}"`,
        task: created,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/cli/list', async (req, res) => {
    try {
      const tasks = await getAllTasks();
      const active = tasks.filter(t => !t.completed);
      res.json(active);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // Settings & Ntfy API
  app.get('/api/settings', async (req, res) => {
    try {
      const topic = await getSetting('ntfy_topic', process.env.NTFY_TOPIC || '');
      res.json({
        ntfy_topic: topic,
        env_default: process.env.NTFY_TOPIC || '',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      const { ntfy_topic } = req.body;
      if (typeof ntfy_topic === 'string') {
        await setSetting('ntfy_topic', ntfy_topic.trim());
      }
      res.json({ success: true, ntfy_topic });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/ntfy/test', async (req, res) => {
    try {
      const envTopic = process.env.NTFY_TOPIC || '';
      const topic = req.body.topic || (await getSetting('ntfy_topic', envTopic)) || envTopic;

      if (!topic) {
        return res.status(400).json({ success: false, error: 'No ntfy topic specified' });
      }

      const result = await sendNtfyNotification(
        topic,
        '🔔 TaskMaster Test Push',
        'Mobile push notifications are working perfectly! You will receive due task reminders and 7AM morning digests here.',
        2,
        ['sparkles', 'check']
      );

      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: msg });
    }
  });

  app.post('/api/ntfy/digest', async (req, res) => {
    try {
      const result = await send7amDigest();
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: msg });
    }
  });

  // Initialize Cron Jobs
  initCronJobs();

  // 2. Vite Middleware integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TaskMaster server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
