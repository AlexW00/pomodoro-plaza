import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { TIMER_COLORS, useTimerContext } from '@/contexts/TimerContext';
import { useToast } from '@/hooks/use-toast';
import { TimerData } from '@/types/timer';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(50, 'Title is too long'),
  durationMinutes: z.number().min(1).max(120),
  dailyLimit: z.number().min(1).max(10),
  color: z.string(),
});

interface TimerFormProps {
  timer?: TimerData;
  onClose: () => void;
}

export function TimerForm({ timer, onClose }: TimerFormProps) {
  const { addTimer, updateTimer, deleteTimer } = useTimerContext();
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState<string>(
    timer?.color || TIMER_COLORS[0]
  );
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: timer?.title || '',
      durationMinutes: timer?.durationMinutes || 25,
      dailyLimit: timer?.dailyLimit || 4,
      color: timer?.color || TIMER_COLORS[0],
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (timer) {
      // Update existing timer
      updateTimer({
        ...timer,
        ...values,
        color: selectedColor,
      });
      toast({
        title: "Timer updated",
        description: "Your timer has been updated successfully",
      });
    } else {
      // Add new timer
      addTimer({
        ...values,
        color: selectedColor,
      });
      toast({
        title: "Timer created",
        description: "Your new timer has been created successfully",
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (timer) {
      deleteTimer(timer.id);
      toast({
        title: "Timer deleted",
        description: "Your timer has been deleted successfully",
      });
      onClose();
    }
  };
  
  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {timer ? 'Edit Timer' : 'Create New Timer'}
        </h2>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Deep Work" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes): {field.value}</FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={120}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Set the timer duration between 1 and 120 minutes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dailyLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Usage Limit: {field.value}</FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  How many times this timer can be used per day
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timer Color</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {TIMER_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color);
                          field.onChange(color);
                        }}
                        className={`w-8 h-8 rounded-full ${
                          selectedColor === color
                            ? 'ring-2 ring-offset-2 ring-ring'
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-between items-center gap-6 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-6">
              {timer && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2Icon className="h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button type="submit" className={`${timer ? 'text-white' : 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'}`}>
                {timer ? 'Update Timer' : 'Create Timer'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}