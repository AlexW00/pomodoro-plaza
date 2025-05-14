import { useTimerContext } from '@/contexts/TimerContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { AlarmClockIcon, ClockIcon, ShareIcon } from 'lucide-react';

export function Header() {
  const { state, timeUntilReset, getShareableLink } = useTimerContext();
  const { toast } = useToast();
  
  const handleShare = () => {
    const link = getShareableLink();
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link)
        .then(() => {
          toast({
            title: "Link copied!",
            description: "Shareable link has been copied to clipboard",
          });
        })
        .catch(() => {
          toast({
            title: "Couldn't copy link",
            description: "Please copy it manually: " + link,
            variant: "destructive"
          });
        });
    } else {
      toast({
        title: "Couldn't copy link",
        description: "Please copy it manually: " + link,
        variant: "destructive"
      });
    }
  };
  
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
      <div className="flex items-center">
        <AlarmClockIcon className="h-8 w-8 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">TimeSpot</h1>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">
            Reset in: <Badge variant="outline">{timeUntilReset()}</Badge>
          </span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ShareIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Share Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleShare}>
              Copy shareable link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}