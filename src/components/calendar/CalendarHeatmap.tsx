import { CompletedTimer } from '@/types/timer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface CalendarHeatmapProps {
  completedTimers: CompletedTimer[];
  className?: string;
}

interface DayData {
  date: Date;
  count: number;
  timers: CompletedTimer[];
}

export function CalendarHeatmap({ completedTimers, className }: CalendarHeatmapProps) {
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Calculate number of months to show based on screen width
  const getMonthsToShow = (width: number): number => {
    if (width < 480) return 3; // Mobile: 3 months
    if (width < 768) return 6; // Tablet: 6 months  
    if (width < 1024) return 9; // Small desktop: 9 months
    return 12; // Large desktop: 12 months (full year)
  };

  // Generate date range based on number of months
  const generateDateRange = (monthsToShow: number = 12) => {
    const dates: Date[] = [];
    const today = new Date();
    const daysToShow = Math.floor(monthsToShow * 30.44); // Average days per month
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    
    return dates;
  };

  // Group completed timers by date
  const groupTimersByDate = (timers: CompletedTimer[]): Map<string, CompletedTimer[]> => {
    const grouped = new Map<string, CompletedTimer[]>();
    
    timers.forEach(timer => {
      const date = new Date(timer.completedAt);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(timer);
    });
    
    return grouped;
  };

  // Create day data for heatmap
  const createDayData = (monthsToShow: number): DayData[] => {
    const dates = generateDateRange(monthsToShow);
    const groupedTimers = groupTimersByDate(completedTimers);
    
    return dates.map(date => {
      const dateKey = date.toISOString().split('T')[0];
      const dayTimers = groupedTimers.get(dateKey) || [];
      
      return {
        date,
        count: dayTimers.length,
        timers: dayTimers
      };
    });
  };

  // Get color intensity based on count
  const getIntensityColor = (count: number): string => {
    if (count === 0) return 'bg-gray-200 dark:bg-gray-800';
    if (count <= 2) return 'bg-green-200 dark:bg-green-900';
    if (count <= 4) return 'bg-green-300 dark:bg-green-800';
    if (count <= 6) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-500 dark:bg-green-600';
  };

  // Format tooltip content
  const formatTooltip = (dayData: DayData): string => {
    const dateStr = dayData.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (dayData.count === 0) {
      return `${dateStr}\nNo timers completed`;
    }
    
    const timerSummary = dayData.timers.reduce((acc, timer) => {
      acc[timer.timerTitle] = (acc[timer.timerTitle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const summaryText = Object.entries(timerSummary)
      .map(([title, count]) => `${title}: ${count}`)
      .join('\n');
    
    return `${dateStr}\n${dayData.count} timer${dayData.count === 1 ? '' : 's'} completed\n\n${summaryText}`;
  };

  // Group days into weeks
  const groupIntoWeeks = (days: DayData[]): DayData[][] => {
    const weeks: DayData[][] = [];
    let currentWeek: DayData[] = [];
    
    // Add empty days at the beginning if needed to align with Sunday start
    const firstDay = days[0];
    const firstDayOfWeek = firstDay.date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyDate = new Date(firstDay.date);
      emptyDate.setDate(emptyDate.getDate() - (firstDayOfWeek - i));
      currentWeek.push({
        date: emptyDate,
        count: 0,
        timers: []
      });
    }
    
    days.forEach(day => {
      currentWeek.push(day);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Add the last incomplete week if needed
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const monthsToShow = getMonthsToShow(screenWidth);
  const dayData = createDayData(monthsToShow);
  const weeks = groupIntoWeeks(dayData);


  return (
    <TooltipProvider>
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">Timer Activity</h3>
            <p className="text-sm text-muted-foreground">
              Last {monthsToShow} month{monthsToShow === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-800"></div>
              <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
              <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800"></div>
              <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600"></div>
            </div>
            <span>More</span>
          </div>
        </div>
        
        <div className="w-full">
          {/* Calendar grid */}
          <div className="flex">
            {/* Heatmap grid */}
            <div className="flex gap-1 flex-1 justify-center">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <Tooltip key={`${weekIndex}-${dayIndex}`}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'w-3 h-3 rounded-sm cursor-pointer transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-gray-400',
                            getIntensityColor(day.count)
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="whitespace-pre-line">
                        {formatTooltip(day)}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}