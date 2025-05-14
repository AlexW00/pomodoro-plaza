export type TimerPriority = 'low' | 'medium' | 'high';

export interface TimerData {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  dailyLimit: number;
  usedToday: number;
  color: string;
  priority?: TimerPriority;
  position: number;
}

export interface ActiveTimer {
  id: string;
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
}

export interface TimerBreak {
  isActive: boolean;
  timeRemaining: number;
  completedTimerId: string | null;
}

export interface TimerState {
  timers: TimerData[];
  activeTimer: ActiveTimer | null;
  breakTimer: TimerBreak;
  lastResetDay: string;
}