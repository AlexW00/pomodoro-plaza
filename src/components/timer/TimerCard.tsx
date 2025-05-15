import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTimerContext } from '@/contexts/TimerContext';
import { TimerData } from '@/types/timer';
import { calculateProgress, formatTime } from '@/utils/commonUtils';
import {
  CheckCircleIcon,
  PauseIcon,
  PlayIcon,
  SquareIcon
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TimerCardProps {
  timer: TimerData;
}

export function TimerCard({ timer }: TimerCardProps) {
  const { state, startTimer, pauseTimer, stopTimer, updateTimer, resetTimer } = useTimerContext();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(timer.title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingDailyLimit, setIsEditingDailyLimit] = useState(false);
  const [dailyLimitValue, setDailyLimitValue] = useState(timer.dailyLimit.toString());
  const dailyLimitInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingTimerValue, setIsEditingTimerValue] = useState(false);
  const [timerValue, setTimerValue] = useState(
    formatTime(timer.durationMinutes * 60)
  );
  const timerValueInputRef = useRef<HTMLInputElement>(null);
  
  // Add ref for the hidden color input
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  // Determine if this timer is active
  const isActive = state.activeTimer?.id === timer.id;
  const isPaused = isActive && state.activeTimer?.isPaused;
  
  // Determine if break is active
  const isBreakActive = state.breakTimer.isActive;
  
  // Check if daily limit reached
  const isLimitReached = timer.usedToday >= timer.dailyLimit;
  
  // Calculate remaining uses
  const remainingUses = timer.dailyLimit - timer.usedToday;
  
  // Generate dynamic styles based on timer color
  const cardStyle = {
    borderTop: `4px solid ${timer.color}`,
  };
  
  // Progress calculation for active timer
  const progress = isActive && state.activeTimer
    ? calculateProgress(
        state.activeTimer.timeRemaining,
        timer.durationMinutes * 60
      )
    : 0;
  
  // Effect to focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
    }
  }, [isEditingTitle]);

  // Effect to focus daily limit input when editing starts
  useEffect(() => {
    if (isEditingDailyLimit) {
      dailyLimitInputRef.current?.focus();
    }
  }, [isEditingDailyLimit]);

  // Effect to focus main timer value input when editing starts
  useEffect(() => {
    if (isEditingTimerValue) {
      timerValueInputRef.current?.select();
    }
  }, [isEditingTimerValue]);

  // Reusable handler for input blur
  const handleInputBlur = <T,>(currentValue: string, initialValue: T, updateFn: (newValue: T) => void, parseFn: (value: string) => T | undefined, revertFn: () => void) => {
    const parsedValue = parseFn(currentValue);
    if (parsedValue !== undefined && parsedValue !== initialValue) {
      updateFn(parsedValue);
    } else {
      revertFn();
    }
  };

  // Reusable handler for input key down
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement>, revertFn?: () => void) => {
    if (e.key === 'Enter') {
      ref.current?.blur();
    } else if (e.key === 'Escape') {
      revertFn?.();
      ref.current?.blur();
    }
  };

  // Parsing and validation for timer value input
  const parseTimerValue = (value: string): number | undefined => {
    const parts = value.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      if (!isNaN(minutes) && !isNaN(seconds) && seconds >= 0 && seconds < 60) {
        return minutes + (seconds > 0 ? 1 : 0);
      }
    } else {
      const minutesOnly = parseInt(value, 10);
      if (!isNaN(minutesOnly) && minutesOnly > 0 && minutesOnly <= 9999) {
        return minutesOnly;
      }
    }
    return undefined; // Indicate invalid input
  };

  // Handle saving title on blur or Enter key
  const handleTitleBlur = () => {
    handleInputBlur(
      titleValue,
      timer.title,
      (newValue) => updateTimer({ ...timer, title: newValue }),
      (value) => value.trim() !== '' ? value.trim() : undefined,
      () => setTitleValue(timer.title)
    );
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleInputKeyDown(e, titleInputRef, () => setTitleValue(timer.title));
  };

  // Handle saving daily limit on blur or Enter key
  const handleDailyLimitBlur = () => {
    handleInputBlur(
      dailyLimitValue,
      timer.dailyLimit,
      (newValue) => updateTimer({ ...timer, dailyLimit: newValue }),
      (value) => {
        const parsed = parseInt(value, 10);
        return !isNaN(parsed) && parsed > 0 && parsed <= 10 ? parsed : undefined;
      },
      () => setDailyLimitValue(timer.dailyLimit.toString())
    );
    setIsEditingDailyLimit(false);
  };

  const handleDailyLimitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleInputKeyDown(e, dailyLimitInputRef, () => setDailyLimitValue(timer.dailyLimit.toString()));
  };

  // Handle saving main timer value on blur or Enter key
  const handleTimerValueBlur = () => {
    handleInputBlur(
      timerValue,
      timer.durationMinutes,
      (newValue) => updateTimer({ ...timer, durationMinutes: newValue }),
      parseTimerValue,
      () => setTimerValue(formatTime(timer.durationMinutes * 60))
    );
    setIsEditingTimerValue(false);
  };

  const handleTimerValueKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleInputKeyDown(e, timerValueInputRef, () => setTimerValue(formatTime(timer.durationMinutes * 60)));
  };

  const handleStartPause = () => {
    if (isActive && !isPaused) {
      pauseTimer(timer.id);
    } else {
      startTimer(timer.id);
    }
  };

  // Handle color change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTimer({ ...timer, color: e.target.value });
  };
  
  // Trigger hidden color input click
  const triggerColorPicker = () => {
    colorInputRef.current?.click();
  };
  
  return (
    <>
      <Card
        style={cardStyle}
        className="h-full flex flex-col"
        draggable="true"
        onDragStart={(e) => {
          e.dataTransfer.setData("timerId", timer.id);
        }}
      >
        <CardHeader className="pb-2 flex flex-row justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <Input
                  ref={titleInputRef}
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  className="text-lg font-medium h-6 px-1 py-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              ) : (
                <h3 className="font-medium cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                  {timer.title}
                </h3>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge
              variant={isLimitReached ? "destructive" : "outline"}
              className="whitespace-nowrap cursor-pointer"
              onClick={() => {
                if (isLimitReached) {
                  if (window.confirm('Are you sure you want to reset the daily usage for this timer?')) {
                    resetTimer(timer.id);
                  }
                } else if (!isActive) {
                  setIsEditingDailyLimit(true);
                }
              }}
              style={isLimitReached ? { backgroundColor: timer.color, color: 'white' } : {}}
            >
              {isLimitReached ? (
                <span className="flex items-center gap-1">
                  <CheckCircleIcon className="h-3 w-3" />
                  Completed
                </span>
              ) : (
                isEditingDailyLimit ? (
                  <Input
                    ref={dailyLimitInputRef}
                    value={dailyLimitValue}
                    onChange={(e) => setDailyLimitValue(e.target.value)}
                    onBlur={handleDailyLimitBlur}
                    onKeyDown={handleDailyLimitKeyDown}
                    type="number"
                    min="1"
                    max="10"
                    className="text-xs font-medium h-4 w-10 px-1 py-0 focus-visible:ring-0 focus-visible:ring-offset-0 inline text-center bg-transparent border-none"
                  />
                ) : (
                  `${remainingUses} of ${timer.dailyLimit} left`
                )
              )}
            </Badge>

            {/* Color Swatch and Hidden Input */}
            <div
              className="w-4 h-4 rounded-full cursor-pointer border border-gray-300 dark:border-gray-700"
              style={{ backgroundColor: timer.color }}
              onClick={triggerColorPicker}
              title="Change timer color"
            ></div>
            <input
              ref={colorInputRef}
              type="color"
              value={timer.color}
              onChange={handleColorChange}
              className="sr-only" // Visually hide the input
            />

            {state.breakTimer.isActive && state.breakTimer.completedTimerId === timer.id && (
              <span
                className="block w-3 h-3 rounded-full bg-blue-500"
                title="Break in progress"
                aria-label="Break in progress for this timer"
              ></span>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow py-4">
          <div
            className="relative flex items-center justify-center h-32 rounded-md text-4xl font-mono font-bold transition-colors overflow-hidden bg-gray-200 dark:bg-gray-800 cursor-pointer"
            onClick={() => !isActive && !isBreakActive && setIsEditingTimerValue(true)}
          >
            {isActive && state.activeTimer && (
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-linear"
                style={{
                  backgroundColor: timer.color,
                  height: `${progress}%`,
                }}
              ></div>
            )}
            <div className="relative z-10 w-[180px] text-center overflow-hidden" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {isEditingTimerValue ? (
                <Input
                   ref={timerValueInputRef}
                   value={timerValue}
                   onChange={(e) => setTimerValue(e.target.value)}
                   onBlur={handleTimerValueBlur}
                   onKeyDown={handleTimerValueKeyDown}
                   type="text"
                   className="text-4xl font-mono font-bold h-full w-full px-1 py-0 text-center bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                   style={{ color: timer.color }}
                />
              ) : (
                isActive && state.activeTimer ? (
                  formatTime(state.activeTimer.timeRemaining)
                ) : (
                  formatTime(timer.durationMinutes * 60)
                )
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 flex justify-center gap-2">
          <div className="flex gap-2 items-center">
            {isActive && !isPaused && (
              <Button
                variant="destructive"
                size="sm"
                onClick={stopTimer}
                className="flex items-center gap-2"
              >
                <SquareIcon className="h-4 w-4" />
                Cancel
              </Button>
            )}

            <Button
              variant={isActive && !isPaused ? "secondary" : "default"}
              onClick={handleStartPause}
              disabled={isLimitReached || isBreakActive || (!!state.activeTimer && !isActive)}
            >
              {isActive && !isPaused ? (
                <>
                  <PauseIcon className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4 mr-2" />
                  {isPaused ? "Resume" : "Start"}
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}