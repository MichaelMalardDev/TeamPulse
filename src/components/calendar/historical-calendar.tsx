'use client';

import { Calendar } from '@/components/ui/calendar';
import { TeamMember, WorkStatus } from '@/lib/data';
import { useState } from 'react';

type HistoricalCalendarProps = {
  member: TeamMember;
};

export default function HistoricalCalendar({ member }: HistoricalCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const remoteDays = member.history
    .filter((day) => day.status === 'Remote')
    .map((day) => day.date);

  const officeDays = member.history
    .filter((day) => day.status === 'In Office')
    .map((day) => day.date);

  return (
    <div className="py-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
        modifiers={{
          remote: remoteDays,
          office: officeDays,
        }}
        modifiersClassNames={{
          remote: 'bg-blue-500/20 text-blue-200',
          office: 'bg-green-500/20 text-green-200',
        }}
        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
      />
      <div className="mt-4 space-y-2 text-sm">
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
