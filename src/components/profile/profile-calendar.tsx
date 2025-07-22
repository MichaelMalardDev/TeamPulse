
'use client';

import { Calendar } from '@/components/ui/calendar';
import { TeamMember, WorkStatus } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { isSameDay, startOfDay } from 'date-fns';
import { Building, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProfileCalendarProps = {
  member: TeamMember;
};

export default function ProfileCalendar({ member }: ProfileCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const remoteDays = member.history
    .filter((day) => day.status === 'Remote')
    .map((day) => day.date);

  const officeDays = member.history
    .filter((day) => day.status === 'In Office')
    .map((day) => day.date);

  const statusMap = new Map<string, WorkStatus>();
  member.history.forEach(h => {
    statusMap.set(startOfDay(h.date).toISOString(), h.status);
  });
  
  const getStatusForDay = (day: Date): WorkStatus | null => {
      const dayString = startOfDay(day).toISOString();
      return statusMap.get(dayString) || null;
  }

  const handleDayClick = (day: Date) => {
    const status = getStatusForDay(day);
    if(status) {
        setSelectedDay(day);
        setPopoverOpen(true);
    } else {
        setPopoverOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <div />
        </PopoverTrigger>
        <Calendar
          mode="single"
          onDayClick={handleDayClick}
          className="p-0"
          modifiers={{
            remote: remoteDays,
            office: officeDays,
          }}
          modifiersClassNames={{
            remote: 'bg-blue-500/20 text-blue-200',
            office: 'bg-green-500/20 text-green-200',
          }}
          disabled={(date) => date < new Date('1900-01-01')}
          components={{
            DayContent: (props) => {
              const status = getStatusForDay(props.date);
              const isSelected = selectedDay && isSameDay(props.date, selectedDay);
              
              if (status) {
                return (
                    <PopoverTrigger 
                        asChild 
                        onClick={() => handleDayClick(props.date)}
                        className={cn("w-full h-full rounded-md", isSelected && "ring-2 ring-primary")}
                    >
                        <span>{props.date.getDate()}</span>
                    </PopoverTrigger>
                );
              }
              return <span>{props.date.getDate()}</span>;
            },
          }}
        />
        {selectedDay && getStatusForDay(selectedDay) && (
            <PopoverContent 
                align="center" 
                side="top" 
                className="w-auto p-4"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="flex items-center gap-3">
                    {getStatusForDay(selectedDay) === 'In Office' ? (
                        <Building className="h-5 w-5 text-green-400" />
                    ) : (
                        <Laptop className="h-5 w-5 text-blue-400" />
                    )}
                    <span className="font-medium text-foreground">{getStatusForDay(selectedDay)}</span>
                </div>
            </PopoverContent>
        )}
      </Popover>
      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-green-500/20 border border-green-500" />
          <span>In Office</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-blue-500/20 border border-blue-500" />
          <span>Remote</span>
        </div>
      </div>
    </div>
  );
}
