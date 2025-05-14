import { useEffect, useState } from 'react';
import { useTimerContext } from '@/contexts/TimerContext';
import { TimerCard } from '../timer/TimerCard';
import { TimerData } from '@/types/timer';
import { SortableItem, SortableList } from '../sortable/SortableList';

export function TimerGrid() {
  const { state, updateTimerPositions } = useTimerContext();
  const [sortedTimers, setSortedTimers] = useState<TimerData[]>([]);
  
  // Sort timers by position
  useEffect(() => {
    const sorted = [...state.timers].sort((a, b) => a.position - b.position);
    setSortedTimers(sorted);
  }, [state.timers]);
  
  const handleDragEnd = (items: TimerData[]) => {
    // Update positions based on new order
    const updatedTimers = items.map((timer, index) => ({
      ...timer,
      position: index
    }));
    
    updateTimerPositions(updatedTimers);
  };
  
  return (
    <div className="grid gap-6">
      <SortableList
        items={sortedTimers}
        onDragEnd={handleDragEnd}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {(timer) => (
          <SortableItem id={timer.id} key={timer.id} className="h-full">
            <TimerCard timer={timer} />
          </SortableItem>
        )}
      </SortableList>
    </div>
  );
}