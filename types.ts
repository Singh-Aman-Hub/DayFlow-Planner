
export type AmPm = 'AM' | 'PM';

export interface TimeInput {
  hours: string;
  minutes: string;
  ampm: AmPm;
}

export interface Task {
  id: string;
  name: string;
  start: TimeInput;
  end: TimeInput;
}

export interface Plan {
  id: string;
  savedAt: string; // ISO string
  tasks: Task[];
}

export interface HistoryEntry extends Plan {}

export type AppView = 'PLANNER' | 'TIMER' | 'HISTORY' | 'NOTES';

export interface AppState {
  view: AppView;
  currentPlan: Plan | null;
}
