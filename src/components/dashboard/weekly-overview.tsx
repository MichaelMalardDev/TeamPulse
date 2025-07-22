'use client';

import { TeamMember } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addDays, format, isToday, startOfDay } from 'date-fns';

type WeeklyOverviewProps = {
  team: TeamMember[];
};

export default function WeeklyOverview({ team }: WeeklyOverviewProps) {
  const today = startOfDay(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">This Week</h2>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayString = day.toISOString().split('T')[0];
          return (
            <Card key={dayString} className={cn(isToday(day) ? 'border-primary' : '')}>
              <CardHeader className="p-4">
                <CardTitle className="text-base text-center">
                  <p className="text-sm font-medium text-muted-foreground">{format(day, 'EEE')}</p>
                  <p className="text-2xl font-bold">{format(day, 'd')}</p>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-2">
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold text-green-400 mb-1 px-2">
                    <Building className="h-4 w-4" /> In Office
                  </h3>
                  <div className="space-y-1">
                    {team
                      .filter(member => member.history.find(h => h.date.toISOString().startsWith(dayString) && h.status === 'In Office'))
                      .map(member => (
                        <div key={member.id} className="flex items-center gap-2 p-1 rounded-md hover:bg-secondary">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback>{member.name.substring(0, 1)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">{member.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1 px-2">
                    <Laptop className="h-4 w-4" /> Remote
                  </h3>
                   <div className="space-y-1">
                    {team
                      .filter(member => member.history.find(h => h.date.toISOString().startsWith(dayString) && h.status === 'Remote'))
                      .map(member => (
                        <div key={member.id} className="flex items-center gap-2 p-1 rounded-md hover:bg-secondary">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback>{member.name.substring(0, 1)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">{member.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
