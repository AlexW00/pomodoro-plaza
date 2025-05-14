import { useState } from 'react';
import { useTimerContext } from '@/contexts/TimerContext';
import { TimerData } from '@/types/timer';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimerForm } from './TimerForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { calculateProgress, formatTime } from '@/utils/commonUtils';
import { 
  PlayIcon, 
  PauseIcon, 
  EditIcon,
  GripIcon,
  CheckCircleIcon
} from 'lucide-react';

interface TimerCardProps {
  timer: TimerData;
}

export function TimerCard({ timer }: TimerCardProps) {
  const { state, startTimer, pauseTimer } = useTimerContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  
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
  
  const handleStartPause = () => {
    if (isActive && !isPaused) {
      pauseTimer(timer.id);
    } else {
      startTimer(timer.id);
    }
  };
  
  return (
    <>
      <Card style={cardStyle} className="h-full flex flex-col">
        <CardHeader className="pb-2 flex flex-row justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{timer.title}</h3>
              <GripIcon className="h-4 w-4 text-muted-foreground cursor-grab" />
            </div>
            <p className="text-sm text-muted-foreground">
              {timer.description || `${timer.durationMinutes} min timer`}
            </p>
          </div>
          
          <Badge 
            variant={isLimitReached ? "destructive" : "outline"}
            className="whitespace-nowrap"
          >
            {isLimitReached ? (
              <span className="flex items-center gap-1">
                <CheckCircleIcon className="h-3 w-3" />
                Completed
              </span>
            ) : (
              `${remainingUses} of ${timer.dailyLimit} left`
            )}
          </Badge>
        </CardHeader>
        
        <CardContent className="flex-grow py-4">
          <div
            className="flex items-center justify-center h-32 rounded-md text-4xl font-mono font-bold transition-colors overflow-hidden"
            style={{ 
              backgroundColor: `${timer.color}20`, 
              color: timer.color 
            }}
          >
            <div className="w-[180px] text-center">
              {isActive && state.activeTimer ? (
                formatTime(state.activeTimer.timeRemaining)
              ) : (
                formatTime(timer.durationMinutes * 60)
              )}
            </div>
          </div>
          
          {isActive && (
            <Progress value={progress} className="h-2 mt-4" />
          )}
        </CardContent>
        
        <CardFooter className="pt-2 flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant={isActive && !isPaused ? "secondary" : "default"}
            onClick={handleStartPause}
            disabled={isLimitReached || isBreakActive}
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
        </CardFooter>
      </Card>
      
      {/* Edit Timer Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <TimerForm 
            timer={timer} 
            onClose={() => setIsEditOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}