# TaskMaster ⚡

Keyboard-first personal task manager to replace Todoist. Built with Node.js, Express, Vite, React, Tailwind CSS, and a single file SQLite database (`tasks.db`).

---

## 🚀 Key Features

- **Keyboard-First Interface**: Complete tasks, search, navigate, and add tasks without touching your mouse.
- **Natural Language Quick-Add**: Parses dates, times, `#projects`, `p1-p3` priorities, and recurrence rules on the fly with `chrono-node`.
- **SQLite Single File Persistence**: All data stored locally in `./tasks.db`. Easy to back up or copy.
- **Recurring Tasks (`rrule`)**: Automatic calculation of the next occurrence when completing a recurring task (e.g. `"every day"`, `"every mon,thu"`, `"every 1st"`).
- **Views**: Pinned Overdue section, Today view, Upcoming 7-day grouped view, and Per-project `#tag` views.
- **Mobile Push Notifications (`ntfy.sh`)**: Background minute-cron checks for due tasks and pushes instant alerts to your phone, plus a 7:00 AM daily morning digest.
- **Terminal CLI (`t`)**: Capture tasks from any terminal window using `t add "..."`.

---

## 📁 Where the Database Lives

The SQLite database file is stored at the root of the project directory:

```bash
./tasks.db
```

### Backing Up Your Tasks
To back up all your tasks, notes, projects, and settings, simply copy `tasks.db`:

```bash
cp tasks.db ~/Backups/tasks-backup.db
```

---

## 📱 Mobile Push Notifications via ntfy

TaskMaster pushes due task notifications and a 7:00 AM morning digest to your phone using [ntfy.sh](https://ntfy.sh).

### Phone Setup Instructions:

1. **Install the App**:
   - **iOS**: Download `ntfy` from the App Store.
   - **Android**: Download `ntfy` from Google Play Store or F-Droid.
2. **Subscribe to Topic**:
   - Open the ntfy app on your phone.
   - Tap **+ (Subscribe to topic)**.
   - Enter your unique topic name (e.g., `hloni-taskmaster-alerts`).
3. **Configure in TaskMaster**:
   - Click the **ntfy** status badge in the TaskMaster web header (or set `NTFY_TOPIC` in `.env`).
   - Enter your topic name and click **Save**.
   - Click **Send Test Push** to verify instant notification on your phone!

---

## 💻 Terminal CLI (`t`)

You can quickly capture tasks or list active tasks directly from your terminal using the `./t` CLI script.

### CLI Usage:

```bash
# Quick-add a task using natural language
./t add "call Sam tomorrow 4pm #home p2"

# Shortcut: typing text directly without "add"
./t "buy groceries on friday #shopping p1"

# List active tasks
./t list

# Mark task #3 as completed
./t complete 3
```

---

## ⌨️ Keyboard Shortcuts Cheat Sheet

| Key | Action |
| --- | --- |
| <kbd>n</kbd> | Focus Quick-Add input bar (natural language parser) |
| <kbd>x</kbd> | Complete currently selected task |
| <kbd>/</kbd> | Focus global search input bar |
| <kbd>j</kbd> / <kbd>↓</kbd> | Navigate downward in task list |
| <kbd>k</kbd> / <kbd>↑</kbd> | Navigate upward in task list |
| <kbd>Enter</kbd> / <kbd>e</kbd> | Open full detail editor for selected task |
| <kbd>d</kbd> / <kbd>Delete</kbd> | Delete currently selected task |
| <kbd>Esc</kbd> | Close quick-add / clear focus / close modals |

---

## 📝 Natural Language Quick-Add Examples

When typing into the Quick-Add box (<kbd>n</kbd>) or CLI (`./t add`):

- `"call Sam tomorrow 4pm #home p2"`
  - **Title**: `call Sam`
  - **Due**: Tomorrow at 4:00 PM
  - **Project**: `#home`
  - **Priority**: `P2`

- `"pay electricity bill every 1st #finance p1"`
  - **Title**: `pay electricity bill`
  - **Due**: 1st of month
  - **Recurrence**: `every 1st`
  - **Project**: `#finance`
  - **Priority**: `P1` (Urgent Red)

- `"water plants every mon,thu #home"`
  - **Title**: `water plants`
  - **Recurrence**: `every mon,thu`
  - **Project**: `#home`
