import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTimerContext } from '@/contexts/TimerContext';
import { AlarmClockIcon, PlusIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface HeaderProps {
  onAddTimerClick: () => void;
}

export function Header({ onAddTimerClick }: HeaderProps) {
  const { state, updateGlobalPauseDuration } = useTimerContext();
  const [pauseValue, setPauseValue] = useState(() => state?.globalPauseDurationMinutes?.toString() || '5');
  const pauseInputRef = useRef<HTMLInputElement>(null);

  const handlePauseBlur = () => {
    const newValue = parseInt(pauseValue, 10);
    if (!isNaN(newValue) && newValue > 0 && newValue !== state?.globalPauseDurationMinutes) {
      updateGlobalPauseDuration(newValue);
    } else {
      setPauseValue(state?.globalPauseDurationMinutes?.toString() || '5');
    }
  };

  const handlePauseKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      pauseInputRef.current?.blur();
    }
  };
  
  useEffect(() => {
    setPauseValue(state?.globalPauseDurationMinutes?.toString() || '5');
  }, [state?.globalPauseDurationMinutes]);

  return (
    <header className="flex flex-row justify-between items-center py-4 gap-4">
      <div className="flex items-center min-w-0 flex-shrink">
        <AlarmClockIcon className="h-8 w-8 mr-2 text-primary flex-shrink-0" />
        <h1 className="text-2xl font-bold truncate">Pomodoro Plaza</h1>
      </div>
      
      <div className="flex flex-row items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span className="text-sm text-muted-foreground hidden sm:inline">Pause (min):</span>
          <span className="text-sm text-muted-foreground sm:hidden">Break:</span>
          <Input
            ref={pauseInputRef}
            value={pauseValue}
            onChange={(e) => setPauseValue(e.target.value)}
            onBlur={handlePauseBlur}
            onKeyDown={handlePauseKeyDown}
            type="number"
            min="1"
            className="text-sm h-6 w-12 px-1 py-0 focus-visible:ring-0 focus-visible:ring-offset-0 inline text-center bg-transparent border-none"
          />
        </div>

        <Button variant="outline" size="sm" onClick={onAddTimerClick} className="flex items-center gap-1 whitespace-nowrap">
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Add Timer</span>
        </Button>
      </div>
    </header>
  );
}