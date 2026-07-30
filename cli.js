#!/usr/bin/env node

/**
 * TaskMaster CLI Tool - `t`
 * Usage:
 *   t add "call Sam tomorrow 4pm #home p2"
 *   t list
 *   t complete 5
 */

import http from 'http';

const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

const command = process.argv[2];
const args = process.argv.slice(3);

function request(path, method, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function main() {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log(`
\x1b[1m\x1b[36mTaskMaster CLI (t)\x1b[0m
Usage:
  t add "call Sam tomorrow 4pm #home p2"   \x1b[90mQuick-add with natural language\x1b[0m
  t list                                  \x1b[90mList active tasks\x1b[0m
  t complete <id>                         \x1b[90mMark task as completed\x1b[0m

Examples:
  t add "Pay electricity bill on 1st #finance p1"
  t add "Read chapter 4 tonight 8pm p3"
`);
    return;
  }

  if (command === 'add') {
    const text = args.join(' ');
    if (!text) {
      console.error('\x1b[31mError: Please provide task text, e.g., t add "Buy milk tomorrow #shopping p2"\x1b[0m');
      process.exit(1);
    }

    try {
      const res = await request('/api/cli/add', 'POST', { text });
      if (res.success && res.task) {
        console.log(`\x1b[32m✔ Created task #${res.task.id}:\x1b[0m \x1b[1m${res.task.title}\x1b[0m`);
        if (res.task.due_date) console.log(`  \x1b[33m📅 Due:\x1b[0m ${res.task.due_date}`);
        console.log(`  \x1b[34m🏷 Project:\x1b[0m #${res.task.project}`);
        console.log(`  \x1b[35m🚩 Priority:\x1b[0m P${res.task.priority}`);
        if (res.task.rrule) console.log(`  \x1b[36m🔁 Recurrence:\x1b[0m ${res.task.rrule}`);
      } else {
        console.error('Error creating task:', res.error || res);
      }
    } catch {
      console.error('\x1b[31mCould not connect to TaskMaster server. Is the server running on port 3000?\x1b[0m');
    }
  } else if (command === 'list' || command === 'ls') {
    try {
      const tasks = await request('/api/cli/list', 'GET');
      if (Array.isArray(tasks)) {
        if (tasks.length === 0) {
          console.log('\x1b[32mNo active tasks! All caught up.\x1b[0m');
          return;
        }

        console.log(`\x1b[1m\x1b[36mActive Tasks (${tasks.length}):\x1b[0m`);
        tasks.forEach((t) => {
          const pColor = t.priority === 1 ? '\x1b[31m[P1]\x1b[0m' : t.priority === 2 ? '\x1b[33m[P2]\x1b[0m' : t.priority === 3 ? '\x1b[34m[P3]\x1b[0m' : '\x1b[90m[P4]\x1b[0m';
          const dueStr = t.due_date ? ` \x1b[33m(Due: ${t.due_date.replace('T', ' ')})\x1b[0m` : '';
          console.log(`  #${t.id.toString().padEnd(3)} ${pColor} \x1b[1m${t.title}\x1b[0m \x1b[36m#${t.project}\x1b[0m${dueStr}`);
        });
      }
    } catch {
      console.error('\x1b[31mCould not connect to TaskMaster server.\x1b[0m');
    }
  } else if (command === 'complete' || command === 'x' || command === 'done') {
    const id = args[0];
    if (!id) {
      console.error('\x1b[31mError: Please provide task ID, e.g., t complete 3\x1b[0m');
      process.exit(1);
    }
    try {
      const res = await request(`/api/tasks/${id}/complete`, 'POST');
      if (res.completedTask) {
        console.log(`\x1b[32m✔ Completed task #${id}: "${res.completedTask.title}"\x1b[0m`);
        if (res.nextTask) {
          console.log(`\x1b[36m🔁 Next occurrence scheduled for ${res.nextTask.due_date}\x1b[0m`);
        }
      } else {
        console.error('Error completing task:', res.error || res);
      }
    } catch {
      console.error('\x1b[31mCould not connect to TaskMaster server.\x1b[0m');
    }
  } else {
    // Default: treat full string as quick add!
    const fullText = [command, ...args].join(' ');
    try {
      const res = await request('/api/cli/add', 'POST', { text: fullText });
      if (res.success && res.task) {
        console.log(`\x1b[32m✔ Created task #${res.task.id}:\x1b[0m \x1b[1m${res.task.title}\x1b[0m`);
      }
    } catch {
      console.error('\x1b[31mCould not connect to TaskMaster server.\x1b[0m');
    }
  }
}

main();
