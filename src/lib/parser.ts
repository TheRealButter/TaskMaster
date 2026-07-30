import * as chrono from 'chrono-node';
import { QuickAddParsed } from '../types';

/**
 * Parses a natural language task quick-add string.
 * Examples:
 * - "call Sam tomorrow 4pm #home p2"
 * - "pay bills every 1st #finance p1"
 * - "buy groceries on friday #shopping"
 */
export function parseQuickAdd(input: string): QuickAddParsed {
  let text = input.trim();
  if (!text) {
    return {
      title: '',
      due_date: null,
      has_due_time: false,
      project: 'inbox',
      priority: 4,
      rrule: null,
    };
  }

  // 1. Priority extraction (p1, p2, p3, p4)
  let priority = 4;
  const priorityMatch = text.match(/\b(p[1-4]|P[1-4])\b/);
  if (priorityMatch) {
    const pNum = parseInt(priorityMatch[1].toLowerCase().replace('p', ''), 10);
    if (!isNaN(pNum)) {
      priority = pNum;
    }
    text = text.replace(priorityMatch[0], '').trim();
  }

  // 2. Project tag extraction (#project)
  let project = 'inbox';
  const projectMatch = text.match(/#([a-zA-Z0-9_\-]+)/);
  if (projectMatch) {
    project = projectMatch[1].toLowerCase();
    text = text.replace(projectMatch[0], '').trim();
  }

  // 3. Recurrence extraction (every day, every mon,thu, every 1st, every week, etc.)
  let rrule: string | null = null;
  const recurMatch = text.match(/\bevery\s+([a-zA-Z0-9,\s]+?\b)/i) || text.match(/\b(daily|weekly|monthly)\b/i);
  if (recurMatch) {
    const rawRecur = recurMatch[0].trim().toLowerCase();
    // Validate if it's a valid recurrence phrase or part of date
    if (!rawRecur.includes('tomorrow') && !rawRecur.includes('today')) {
      rrule = rawRecur;
      text = text.replace(recurMatch[0], '').trim();
    }
  }

  // 4. Date & Time parsing using chrono-node
  let due_date: string | null = null;
  let has_due_time = false;

  const results = chrono.parse(text, new Date(), { forwardDate: true });
  if (results && results.length > 0) {
    const result = results[0];
    const dateObj = result.start.date();
    has_due_time = result.start.isCertain('hour');

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    if (has_due_time) {
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      due_date = `${year}-${month}-${day}T${hours}:${minutes}:00`;
    } else {
      due_date = `${year}-${month}-${day}`;
    }

    // Remove the date string part from task title
    text = text.replace(result.text, '').trim();
  }

  // Clean title
  let title = text.replace(/\s+/g, ' ').trim();
  if (!title) {
    title = input.trim();
  }

  return {
    title,
    due_date,
    has_due_time,
    project,
    priority,
    rrule,
  };
}
