import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useTimerContext } from '@/contexts/TimerContext';
import { useState } from 'react';
import { CalendarHeatmap } from '../calendar';
import { TimerBreak } from '../timer/TimerBreak';
import { TimerForm } from '../timer/TimerForm';
import { Header } from './Header';
import { TimerGrid } from './TimerGrid';

export function Dashboard() {
  const { state, deleteTimer } = useTimerContext();
  const [isAddTimerOpen, setIsAddTimerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringTrash, setIsHoveringTrash] = useState(false);
  
  return (
    <div 
      className="container mx-auto max-w-6xl"
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={(e) => {
        // Check if the drag is leaving the entire container
        if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
          setIsDragging(false);
        }
      }}
      onDragEnd={() => setIsDragging(false)}
    >
      <Header onAddTimerClick={() => setIsAddTimerOpen(true)} />
      
      {/* Break timer overlay - shown when a break is active */}
      {state.breakTimer.isActive && <TimerBreak />}
      
      {/* Main content */}
      <div className="my-6">
        {state.timers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <h2 className="text-2xl font-medium mb-4">No timers yet</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Create your first timer to get started with your productivity journey.
            </p>
          </div>
        ) : (
          <>
            <TimerGrid />
            <div className="mt-12">
              <CalendarHeatmap completedTimers={state.completedTimers} />
            </div>
          </>
        )}
      </div>
      
      {/* Trash Bin */}
      {isDragging && (
        <div 
          className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-20 text-white flex items-center justify-center rounded-t-xl shadow-lg z-50 transition-colors ${isHoveringTrash ? 'bg-red-700' : 'bg-red-500'}`}
          onDragOver={(e) => e.preventDefault()} // Allow drop
          onDragEnter={() => setIsHoveringTrash(true)}
          onDragLeave={() => setIsHoveringTrash(false)}
          onDrop={(e) => {
            const timerId = e.dataTransfer.getData("timerId");
            if (timerId) {
              deleteTimer(timerId);
            }
            setIsDragging(false);
            setIsHoveringTrash(false);
          }}
        >
          Drop to Delete
        </div>
      )}
      
      {/* Add timer dialog */}
      <Dialog open={isAddTimerOpen} onOpenChange={setIsAddTimerOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <TimerForm onClose={() => setIsAddTimerOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}