import { useState } from 'react';
import { useTimerContext } from '@/contexts/TimerContext';
import { TimerGrid } from './TimerGrid';
import { Header } from './Header';
import { TimerForm } from '../timer/TimerForm';
import { TimerBreak } from '../timer/TimerBreak';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PlusIcon } from 'lucide-react';

export function Dashboard() {
  const { state } = useTimerContext();
  const [isAddTimerOpen, setIsAddTimerOpen] = useState(false);
  
  return (
    <div className="container mx-auto max-w-6xl">
      <Header />
      
      {/* Break timer overlay - shown when a break is active */}
      {state.breakTimer.isActive && <TimerBreak />}
      
      {/* Main content */}
      <div className="my-6">
        {state.timers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-medium mb-4">No timers yet</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Create your first timer to get started with your productivity journey.
            </p>
            <Button 
              onClick={() => setIsAddTimerOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusIcon size={16} />
              Create Timer
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">My Timers</h2>
              <Button 
                variant="outline"
                onClick={() => setIsAddTimerOpen(true)}
                className="flex items-center gap-2"
              >
                <PlusIcon size={16} />
                Add Timer
              </Button>
            </div>
            
            <TimerGrid />
          </>
        )}
      </div>
      
      {/* Add timer dialog */}
      <Dialog open={isAddTimerOpen} onOpenChange={setIsAddTimerOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <TimerForm onClose={() => setIsAddTimerOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}