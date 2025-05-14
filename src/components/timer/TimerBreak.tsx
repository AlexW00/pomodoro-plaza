import { useTimerContext } from '@/contexts/TimerContext';
import { Progress } from '@/components/ui/progress';
import { formatTime } from '@/utils/commonUtils';
import { BREAK_DURATION_MINUTES } from '@/contexts/TimerContext';
import { CoffeeIcon } from 'lucide-react';

export function TimerBreak() {
  const { state } = useTimerContext();
  const { breakTimer } = state;
  
  // Only render when break is active
  if (!breakTimer.isActive) return null;
  
  // Calculate progress
  const totalBreakSeconds = BREAK_DURATION_MINUTES * 60;
  const progress = ((totalBreakSeconds - breakTimer.timeRemaining) / totalBreakSeconds) * 100;
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          <CoffeeIcon className="h-16 w-16 text-primary mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Break Time</h2>
          <p className="text-center text-muted-foreground mb-6">
            Take a moment to rest and recharge before your next focus session
          </p>
          
          <div className="w-full mb-4">
            <Progress value={progress} className="h-3" />
          </div>
          
          <div className="text-4xl font-mono font-bold mb-6">
            {formatTime(breakTimer.timeRemaining)}
          </div>
          
          <p className="text-sm text-muted-foreground">
            You cannot start another timer until your break is complete
          </p>
        </div>
      </div>
    </div>
  );
}