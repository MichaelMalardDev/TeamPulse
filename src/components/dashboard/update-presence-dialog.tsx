
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { TeamMember, WorkStatus } from '@/lib/data';
import { batchUpdateUserStatus } from '@/lib/firestore';
import { Building, Laptop, CalendarPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isWeekend, format, eachDayOfInterval, startOfDay } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DateRange } from 'react-day-picker';

type UpdatePresenceDialogProps = {
  member: TeamMember;
  onUpdate: () => void;
};

type DayStatusUpdate = { date: Date; status: WorkStatus };

export default function UpdatePresenceDialog({ member, onUpdate }: UpdatePresenceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [dayStatuses, setDayStatuses] = useState<Record<string, WorkStatus>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedRange?.from && member) {
      const from = selectedRange.from;
      const to = selectedRange.to || from;
      const daysInRange = eachDayOfInterval({ start: from, end: to });
      const workDays = daysInRange.filter(day => !isWeekend(day));
      setSelectedDays(workDays);
      
      const newStatuses: Record<string, WorkStatus> = {};
      workDays.forEach(day => {
        const dayStr = day.toISOString().split('T')[0];
        const historyEntry = member.history.find(h => startOfDay(h.date).toISOString().split('T')[0] === dayStr);
        newStatuses[dayStr] = historyEntry?.status || 'In Office';
      });
      setDayStatuses(newStatuses);

    } else {
      setSelectedDays([]);
      setDayStatuses({});
    }
  }, [selectedRange, member]);


  const handleStatusChange = (day: Date, status: WorkStatus) => {
    const dayStr = day.toISOString().split('T')[0];
    setDayStatuses(prev => ({ ...prev, [dayStr]: status }));
  };

  const handleSave = async () => {
    if (!selectedDays || selectedDays.length === 0) {
      toast({
        title: 'No dates selected',
        description: 'Please select one or more dates to update.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const updates: DayStatusUpdate[] = selectedDays.map(day => ({
        date: day,
        status: dayStatuses[day.toISOString().split('T')[0]],
      }));

      await batchUpdateUserStatus(member.id, updates);
      toast({
        title: 'Presence Updated',
        description: `Your status has been updated for ${selectedDays.length} day(s).`,
      });
      onUpdate();
      setIsOpen(false);
      setSelectedRange(undefined);
      setSelectedDays([]);
      setDayStatuses({});
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update your presence. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <CalendarPlus className="mr-2" />
          Update Presence
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Your Presence</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          <div>
            <Label className="mb-2 block font-medium">1. Select a date range</Label>
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={setSelectedRange}
              className="rounded-md border"
              disabled={(date) => date < startOfDay(new Date()) || isWeekend(date)}
            />
          </div>
          <div className="flex flex-col">
            <Label className="mb-2 block font-medium">2. Set your status for each day</Label>
            <ScrollArea className="h-72 w-full flex-grow border rounded-md p-4">
                {selectedDays && selectedDays.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDays
                      .sort((a,b) => a.getTime() - b.getTime())
                      .map(day => {
                        const dayStr = day.toISOString().split('T')[0];
                        return (
                          <div key={dayStr} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <span className="font-medium">{format(day, 'EEE, MMM d')}</span>
                            <RadioGroup
                              value={dayStatuses[dayStr]}
                              onValueChange={(value: WorkStatus) => handleStatusChange(day, value)}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="In Office" id={`in-office-${dayStr}`} />
                                <Label htmlFor={`in-office-${dayStr}`} className="flex items-center gap-1 cursor-pointer text-xs">
                                  <Building className="h-4 w-4" />
                                  Office
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Remote" id={`remote-${dayStr}`} />
                                <Label htmlFor={`remote-${dayStr}`} className="flex items-center gap-1 cursor-pointer text-xs">
                                  <Laptop className="h-4 w-4" />
                                  Remote
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )
                    })}
                  </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Select a date or range to set your status.</p>
                    </div>
                )}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading || !selectedDays || selectedDays.length === 0}>
            {isLoading && <Loader2 className="mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
