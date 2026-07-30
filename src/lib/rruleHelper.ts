import * as rrulePkg from 'rrule';

const RRule = rrulePkg.RRule || (rrulePkg as any).default?.RRule || (rrulePkg as any).default;

/**
 * Calculates the next due date for a recurring task based on its current due date / completion time
 * and its rrule string (e.g. "every day", "every mon,thu", "every 1st", "FREQ=WEEKLY;BYDAY=MO,TH").
 */
export function getNextDueDate(currentDueDateStr: string | null, rruleStr: string): { due_date: string; has_due_time: boolean } {
  const baseDate = currentDueDateStr ? new Date(currentDueDateStr) : new Date();
  // Ensure baseDate is valid
  if (isNaN(baseDate.getTime())) {
    baseDate.setTime(Date.now());
  }

  const hasDueTime = currentDueDateStr ? currentDueDateStr.includes('T') && !currentDueDateStr.endsWith('T00:00:00') : false;
  const hours = hasDueTime ? baseDate.getHours() : 9;
  const minutes = hasDueTime ? baseDate.getMinutes() : 0;

  const ruleLower = rruleStr.toLowerCase().trim();

  // Custom friendly phrases
  let nextDate = new Date(baseDate);

  if (ruleLower === 'every day' || ruleLower === 'daily') {
    nextDate.setDate(nextDate.getDate() + 1);
  } else if (ruleLower === 'every week' || ruleLower === 'weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (ruleLower === 'every 2 weeks') {
    nextDate.setDate(nextDate.getDate() + 14);
  } else if (ruleLower === 'every month' || ruleLower === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else if (ruleLower === 'every year' || ruleLower === 'yearly') {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else if (ruleLower.startsWith('every ') && ruleLower.includes('1st')) {
    // Next 1st of month
    nextDate.setMonth(nextDate.getMonth() + 1);
    nextDate.setDate(1);
  } else if (ruleLower.includes('mon') || ruleLower.includes('tue') || ruleLower.includes('wed') || ruleLower.includes('thu') || ruleLower.includes('fri') || ruleLower.includes('sat') || ruleLower.includes('sun')) {
    // Weekday match e.g. "every mon,thu"
    const targetDays: number[] = [];
    if (ruleLower.includes('sun')) targetDays.push(0);
    if (ruleLower.includes('mon')) targetDays.push(1);
    if (ruleLower.includes('tue')) targetDays.push(2);
    if (ruleLower.includes('wed')) targetDays.push(3);
    if (ruleLower.includes('thu')) targetDays.push(4);
    if (ruleLower.includes('fri')) targetDays.push(5);
    if (ruleLower.includes('sat')) targetDays.push(6);

    if (targetDays.length > 0) {
      let found = false;
      for (let i = 1; i <= 7; i++) {
        const checkDate = new Date(baseDate);
        checkDate.setDate(checkDate.getDate() + i);
        if (targetDays.includes(checkDate.getDay())) {
          nextDate = checkDate;
          found = true;
          break;
        }
      }
      if (!found) {
        nextDate.setDate(nextDate.getDate() + 7);
      }
    } else {
      nextDate.setDate(nextDate.getDate() + 1);
    }
  } else {
    // Try standard RRule parsing
    try {
      const rule = RRule.fromString(rruleStr);
      const nextOccurrence = rule.after(baseDate);
      if (nextOccurrence) {
        nextDate = nextOccurrence;
      } else {
        nextDate.setDate(nextDate.getDate() + 1);
      }
    } catch {
      // Fallback: +1 day
      nextDate.setDate(nextDate.getDate() + 1);
    }
  }

  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const day = String(nextDate.getDate()).padStart(2, '0');

  if (hasDueTime) {
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return {
      due_date: `${year}-${month}-${day}T${hh}:${mm}:00`,
      has_due_time: true,
    };
  }

  return {
    due_date: `${year}-${month}-${day}`,
    has_due_time: false,
  };
}
