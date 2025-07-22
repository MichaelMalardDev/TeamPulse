'use client';

import { TeamMember, WorkStatus } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addDays, format, isToday, startOfDay } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type WeeklyOverviewProps = {
  team: TeamMember[];
};

export default function WeeklyOverview({ team }: WeeklyOverviewProps) {
  const today = startOfDay(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const getStatusForDay = (member: TeamMember, day: Date): WorkStatus | undefined => {
    const dayString = day.toISOString().split('T')[0];
    const historyEntry = member.history.find(h => h.date.toISOString().startsWith(dayString));
    return historyEntry?.status;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">This Week</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[240px]">Team Member</TableHead>
                {weekDays.map((day) => (
                  <TableHead key={day.toISOString()} className={cn("text-center", isToday(day) ? 'text-primary' : '')}>
                     <p className="text-sm font-medium text-muted-foreground">{format(day, 'EEE')}</p>
                     <p className="text-2xl font-bold">{format(day, 'd')}</p>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </TableCell>
                  {weekDays.map((day) => {
                    const status = getStatusForDay(member, day);
                    return (
                      <TableCell key={day.toISOString()} className={cn("text-center", isToday(day) ? 'bg-secondary/50' : '')}>
                        {status === 'In Office' && (
                          <div className="flex flex-col items-center justify-center gap-1 text-green-400">
                            <Building className="h-5 w-5" />
                            <span className="text-xs font-semibold">In Office</span>
                          </div>
                        )}
                        {status === 'Remote' && (
                          <div className="flex flex-col items-center justify-center gap-1 text-blue-400">
                            <Laptop className="h-5 w-5" />
                            <span className="text-xs font-semibold">Remote</span>
                          </div>
                        )}
                         {!status && <span className="text-muted-foreground">-</span>}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
