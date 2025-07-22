
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { TeamMember, WorkStatus } from '@/lib/data';
import { batchUpdateUserStatus } from '@/lib/firestore';
import { Building, Laptop, CalendarPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isWeekend } from 'date-fns';

type UpdatePresenceDialogProps = {
  member: TeamMember;
  onUpdate: () => void;
};

export default function UpdatePresenceDialog({ member, onUpdate }: UpdatePresenceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Date[] | undefined>([]);
  const [status, setStatus] = useState<WorkStatus>('In Office');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      await batchUpdateUserStatus(member.id, selectedDays, status);
      toast({
        title: 'Presence Updated',
        description: `Your status has been updated for ${selectedDays.length} day(s).`,
      });
      onUpdate();
      setIsOpen(false);
      setSelectedDays([]);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Your Presence</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label className="mb-2 block">1. Select one or more dates</Label>
            <Calendar
              mode="multiple"
              selected={selectedDays}
              onSelect={setSelectedDays}
              className="rounded-md border"
              disabled={isWeekend}
            />
          </div>
          <div>
            <Label className="mb-2 block">2. Set your status</Label>
            <RadioGroup
              value={status}
              onValueChange={(value: WorkStatus) => setStatus(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="In Office" id="in-office" />
                <Label htmlFor="in-office" className="flex items-center gap-2 cursor-pointer">
                  <Building className="h-5 w-5" />
                  In Office
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Remote" id="remote" />
                <Label htmlFor="remote" className="flex items-center gap-2 cursor-pointer">
                  <Laptop className="h-5 w-5" />
                  Remote
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
