import { toast } from '@/hooks/use-toast';
import { TimerData, TimerState } from '@/types/timer';
import { generateId } from '@/utils/commonUtils';
import { getFormattedDate } from '@/utils/stateUtils';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';

// Default timer colors
export const TIMER_COLORS = [
  '#FF5252', // Red
  '#FF9800', // Orange  
  '#FFEB3B', // Yellow
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#673AB7', // Purple
  '#F06292', // Pink
  '#00BCD4', // Cyan
];

const defaultState: TimerState = {
  timers: [],
  activeTimer: null,
  breakTimer: {
    isActive: false,
    timeRemaining: 0,
    completedTimerId: null
  },
  lastResetDay: getFormattedDate(new Date()),
  globalPauseDurationMinutes: 5,
};

interface TimerContextType {
  state: TimerState;
  addTimer: (timer: Omit<TimerData, 'id' | 'usedToday' | 'position'>) => void;
  updateTimer: (timer: TimerData) => void;
  deleteTimer: (id: string) => void;
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  stopTimer: () => void;
  updateTimerPositions: (timers: TimerData[]) => void;
  timeUntilReset: () => string;
  updateGlobalPauseDuration: (minutes: number) => void;
  stopBreakTimer: () => void;
  startBreakCountdown: () => void;
  resetTimer: (id: string) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TimerState>(() => {
    try {
      // Load from localStorage or use default state
      const saved = localStorage.getItem('timerState');
      const loadedState = saved ? JSON.parse(saved) : {};
      // Merge loaded state with default state to ensure all fields are present
      return { ...defaultState, ...loadedState };
    } catch (error) {
      console.error('Error loading state:', error);
      return defaultState;
    }
  });

  // Function to request notification permission
  const requestNotificationPermission = useCallback(() => {
    if (!("Notification" in window)) {
      console.error("This browser does not support desktop notification");
      return Promise.resolve("denied"); // Return a denied-like state for unsupported browsers
    }

    return Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
      } else {
        console.warn("Notification permission denied.");
      }
      return permission; // Return the permission status
    });
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem('timerState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, [state]);

  // Check for day change to reset daily limits
  useEffect(() => {
    const today = getFormattedDate(new Date());
    
    if (state.lastResetDay !== today) {
      setState(prev => ({
        ...prev,
        timers: prev.timers.map(timer => ({
          ...timer,
          usedToday: 0
        })),
        lastResetDay: today
      }));
      
      toast({
        title: "Daily limits reset",
        description: "Your timer usage limits have been reset for the new day.",
      });
    }
  }, [state.lastResetDay]);

  // Timer ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        // Handle active timer countdown
        if (prev.activeTimer && prev.activeTimer.isRunning) {
          const newTimeRemaining = prev.activeTimer.timeRemaining - 1;
          
          // Timer completed
          if (newTimeRemaining <= 0) {
            const completedTimerId = prev.activeTimer.id;
            const updatedTimers = prev.timers.map(timer => 
              timer.id === completedTimerId 
                ? { ...timer, usedToday: timer.usedToday + 1 }
                : timer
            );
            
            // Start break timer
            toast({
              title: "Timer completed!",
              description: "Time for a break. Take 5 minutes to rest.",
            });
            
            // Send push notification
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Pomodoro Plaza", {
                body: `Timer "${prev.timers.find(t => t.id === completedTimerId)?.title}" completed! Time for a break.`,
                icon: "/favicon.png" // You might want to add a relevant icon
              });
            }

            return {
              ...prev,
              timers: updatedTimers,
              activeTimer: null,
              breakTimer: {
                isActive: true,
                timeRemaining: prev.globalPauseDurationMinutes * 60,
                completedTimerId
              }
            };
          }
          
          // Continue countdown
          return {
            ...prev,
            activeTimer: {
              ...prev.activeTimer,
              timeRemaining: newTimeRemaining
            }
          };
        }
        
        // Handle break timer countdown
        if (prev.breakTimer.isActive) {
          const newBreakTimeRemaining = prev.breakTimer.timeRemaining - 1;
          
          // Break completed
          if (newBreakTimeRemaining <= 0) {
            toast({
              title: "Break completed",
              description: "You can now start another timer.",
            });
            
            // Send push notification
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Pomodoro Plaza", {
                body: "Your break is over. Time to start a new timer!",
                icon: "/favicon.png" // You might want to add a relevant icon
              });
            }
            
            return {
              ...prev,
              breakTimer: {
                isActive: false,
                timeRemaining: 0,
                completedTimerId: null
              }
            };
          }
          
          // Continue break countdown
          return {
            ...prev,
            breakTimer: {
              ...prev.breakTimer,
              timeRemaining: newBreakTimeRemaining
            }
          };
        }
        
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [state.globalPauseDurationMinutes]);

  const addTimer = useCallback((timerData: Omit<TimerData, 'id' | 'usedToday' | 'position'>) => {
    setState(prev => {
      const position = prev.timers.length;
      const newTimer: TimerData = {
        ...timerData,
        id: generateId(),
        usedToday: 0,
        position
      };
      
      return {
        ...prev,
        timers: [...prev.timers, newTimer]
      };
    });
  }, []);

  const updateTimer = useCallback((updatedTimer: TimerData) => {
    setState(prev => ({
      ...prev,
      timers: prev.timers.map(timer => 
        timer.id === updatedTimer.id ? updatedTimer : timer
      )
    }));
  }, []);

  const deleteTimer = useCallback((id: string) => {
    setState(prev => {
      // If this is the active timer, stop it
      if (prev.activeTimer?.id === id) {
        return {
          ...prev,
          timers: prev.timers.filter(timer => timer.id !== id),
          activeTimer: null
        };
      }
      
      return {
        ...prev,
        timers: prev.timers.filter(timer => timer.id !== id)
          .map((timer, index) => ({
            ...timer,
            position: index
          }))
      };
    });
  }, []);

  const startTimer = useCallback(async (id: string) => {
    // Request notification permission if it hasn't been granted or denied
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await requestNotificationPermission();
      // If permission is not granted after prompt, do not proceed with starting timer logic that depends on it
      if (permission !== "granted" && permission !== "denied") { // Handle cases where the promise might not resolve to granted/denied immediately
        return; // Stop if permission wasn't granted or denied (e.g., dismissed)
      }
    }

    setState(prev => {
      // Cannot start if a break is active
      if (prev.breakTimer.isActive) {
        toast({
          title: "Break in progress",
          description: "Please wait for the break to finish before starting a new timer.",
          variant: "destructive"
        });
        return prev;
      }
      
      // Find the timer
      const timer = prev.timers.find(t => t.id === id);
      
      if (!timer) {
        toast({
          title: "Timer not found",
          description: "The selected timer could not be found.",
          variant: "destructive"
        });
        return prev;
      }
      
      // Check if daily limit reached
      if (timer.usedToday >= timer.dailyLimit) {
        toast({
          title: "Daily limit reached",
          description: "You've reached the daily usage limit for this timer.",
          variant: "destructive"
        });
        return prev;
      }
      
      // If there's already an active timer, stop it
      if (prev.activeTimer && prev.activeTimer.id !== id) {
        toast({
          title: "Timer switched",
          description: "Previous timer has been stopped.",
        });
      }
      
      // If this timer is already active but paused, resume it
      if (prev.activeTimer?.id === id && prev.activeTimer?.isPaused) {
        return {
          ...prev,
          activeTimer: {
            ...prev.activeTimer,
            isRunning: true,
            isPaused: false
          }
        };
      }
      
      // Start a new timer
      return {
        ...prev,
        activeTimer: {
          id,
          timeRemaining: timer.durationMinutes * 60,
          isRunning: true,
          isPaused: false
        }
      };
    });
  }, []);

  const pauseTimer = useCallback((id: string) => {
    setState(prev => {
      if (prev.activeTimer?.id !== id || !prev.activeTimer?.isRunning) {
        return prev;
      }
      
      return {
        ...prev,
        activeTimer: {
          ...prev.activeTimer,
          isRunning: false,
          isPaused: true
        }
      };
    });
  }, []);

  const stopTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeTimer: null
    }));
  }, []);

  const updateTimerPositions = useCallback((timers: TimerData[]) => {
    setState(prev => ({
      ...prev,
      timers
    }));
  }, []);

  const timeUntilReset = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diffMs = tomorrow.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  }, []);

  const updateGlobalPauseDuration = useCallback((minutes: number) => {
    setState(prev => ({
      ...prev,
      globalPauseDurationMinutes: minutes
    }));
  }, []);

  const stopBreakTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      breakTimer: {
        isActive: false,
        timeRemaining: 0,
        completedTimerId: null,
      }
    }));
    toast({
      title: "Break skipped",
      description: "You have skipped your break.",
    });
  }, []);

  const startBreakCountdown = useCallback(() => {
    setState(prev => ({
      ...prev,
      breakTimer: {
        isActive: true,
        timeRemaining: prev.globalPauseDurationMinutes * 60,
        completedTimerId: prev.activeTimer?.id ?? null,
      }
    }));
    toast({
      title: "Break started",
      description: "Time to relax.",
    });
  }, []);

  const resetTimer = useCallback((id: string) => {
    setState(prev => {
      return {
        ...prev,
        timers: prev.timers.map(timer =>
          timer.id === id ? { ...timer, usedToday: 0 } : timer
        ),
        // Optionally stop the timer if it's currently active or its break is active
        activeTimer: prev.activeTimer?.id === id ? null : prev.activeTimer,
        breakTimer: prev.breakTimer.completedTimerId === id ? { isActive: false, timeRemaining: 0, completedTimerId: null } : prev.breakTimer,
      };
    });
    toast({
      title: "Timer reset",
      description: "The timer usage count has been reset.",
    });
  }, []);

  return (
    <TimerContext.Provider value={{
      state,
      addTimer,
      updateTimer,
      deleteTimer,
      startTimer,
      pauseTimer,
      stopTimer,
      updateTimerPositions,
      timeUntilReset,
      updateGlobalPauseDuration,
      stopBreakTimer,
      startBreakCountdown,
      resetTimer,
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};