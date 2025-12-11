import { Task, TimeInput, AmPm } from '../types';

/**
 * Converts TimeInput to minutes from midnight (0-1439).
 */
export const toMinutes = (time: TimeInput): number => {
  let h = parseInt(time.hours, 10);
  const m = parseInt(time.minutes, 10);
  
  if (isNaN(h)) h = 0;
  
  if (time.ampm === 'PM' && h !== 12) h += 12;
  if (time.ampm === 'AM' && h === 12) h = 0;
  
  return h * 60 + m;
};

/**
 * Formats minutes from midnight back to a readable string (e.g., "4:30 PM").
 */
export const formatMinutesToTime = (totalMinutes: number): string => {
  let h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
};

/**
 * Converts total minutes to TimeInput object
 */
export const minutesToTimeInput = (totalMinutes: number): TimeInput => {
  let h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  
  if (h > 12) h -= 12;
  if (h === 0) h = 12;

  return {
    hours: h.toString().padStart(2, '0'),
    minutes: m.toString().padStart(2, '0'),
    ampm
  };
};

/**
 * Adds minutes to a TimeInput and returns a new TimeInput
 */
export const addMinutes = (start: TimeInput, minutesToAdd: number): TimeInput => {
  const startMins = toMinutes(start);
  const newMins = (startMins + minutesToAdd) % 1440; // Wrap around 24h
  return minutesToTimeInput(newMins);
};

/**
 * Returns a Date object for the given TimeInput, assuming it refers to today.
 */
export const timeInputToDate = (time: TimeInput): Date => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const minutes = toMinutes(time);
  date.setMinutes(minutes);
  return date;
};

/**
 * Returns a formatted duration string (e.g., "1h 30m").
 */
export const formatDuration = (start: TimeInput, end: TimeInput): string => {
  const diff = toMinutes(end) - toMinutes(start);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

/**
 * Validates a list of tasks for overlap and logical consistency.
 * Returns an error string or null if valid.
 */
export const validateTasks = (tasks: Task[]): string | null => {
  if (tasks.length === 0) return "Please add at least one task.";

  const tasksWithMinutes = tasks.map(t => ({
    ...t,
    startMin: toMinutes(t.start),
    endMin: toMinutes(t.end)
  }));

  for (let i = 0; i < tasksWithMinutes.length; i++) {
    const task = tasksWithMinutes[i];
    
    // Check internal validity
    if (!task.name.trim()) return `Task #${i + 1} is missing a name.`;
    if (task.endMin <= task.startMin) return `Task "${task.name}" ends before it starts.`;

    // Check overlaps
    for (let j = 0; j < tasksWithMinutes.length; j++) {
      if (i === j) continue;
      const other = tasksWithMinutes[j];
      
      // Check if task i overlaps with task j
      // Overlap exists if (StartA < EndB) and (EndA > StartB)
      if (task.startMin < other.endMin && task.endMin > other.startMin) {
        return `Task "${task.name}" overlaps with "${other.name}".`;
      }
    }
  }

  return null;
};

/**
 * Sorts tasks by start time.
 */
export const sortTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
};

/**
 * Generates a unique ID.
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const getNowMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

export const getCurrentTimeInput = (): TimeInput => {
  return minutesToTimeInput(getNowMinutes());
};

/**
 * Shifts a task (extended end time) and all subsequent tasks by X minutes.
 * Used when running late.
 */
export const shiftSchedule = (tasks: Task[], fromIndex: number, minutes: number): Task[] => {
  const newTasks = [...tasks];
  
  if (fromIndex < 0 || fromIndex >= tasks.length) return tasks;

  // Extend current task's end time
  newTasks[fromIndex] = {
      ...newTasks[fromIndex],
      end: addMinutes(newTasks[fromIndex].end, minutes)
  };

  // Shift subsequent tasks' start and end
  for (let i = fromIndex + 1; i < newTasks.length; i++) {
      newTasks[i] = {
          ...newTasks[i],
          start: addMinutes(newTasks[i].start, minutes),
          end: addMinutes(newTasks[i].end, minutes)
      };
  }

  return newTasks;
};
