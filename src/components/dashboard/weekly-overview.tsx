
'use client';

import { useState, useEffect } from 'react';
import { TeamMember, WorkStatus } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addDays, format, isToday, startOfDay, isWeekend, isFuture } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { updateFutureStatus } from '@/lib/firestore';

type WeeklyOverviewProps = {
  team: TeamMember[];
  onTeamUpdate: (updatedTeam: TeamMember[]) => void;
};

function StatusToggleButton({
  status,
  currentStatus,
  onStatusChange,
}: {
  status: WorkStatus;
  currentStatus: WorkStatus | null;
  onStatusChange: (status: WorkStatus) => void;
}) {
  const Icon = status === 'In Office' ? Building : Laptop;
  const isActive = status === currentStatus;

  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="lg"
      className={cn("w-full justify-start", isActive ? "shadow-md" : "")}
      onClick={() => onStatusChange(status)}
    >
      <Icon className="mr-2 h-5 w-5" />
      {status}
    </Button>
  );
}

export default function WeeklyOverview({ team, onTeamUpdate }: WeeklyOverviewProps) {
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [today, setToday] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<{ member: TeamMember, day: Date } | null>(null);
  const [newStatus, setNewStatus] = useState<WorkStatus | null>(null);

  useEffect(() => {
    const todayDate = startOfDay(new Date());
    setToday(todayDate);
    
    let days: Date[] = [];
    let currentDate = todayDate;
    while(days.length < 5) {
      if (!isWeekend(currentDate)) {
        days.push(currentDate);
      }
      currentDate = addDays(currentDate, 1);
    }
    setWeekDays(days);
  }, []);

  const getStatusForDay = (member: TeamMember, day: Date): WorkStatus | undefined => {
    if (!today) return undefined;
    const targetDay = startOfDay(day);
    const historyEntry = member.history.find(h => startOfDay(h.date).getTime() === targetDay.getTime());
    
    if (historyEntry) return historyEntry.status;
    if (isToday(day)) return member.status;
    if (isFuture(day)) return 'In Office'; // Default for future dates
    
    return undefined;
  }

  const handleOpenDialog = (member: TeamMember, day: Date) => {
    const currentStatus = getStatusForDay(member, day);
    setSelectedEntry({ member, day });
    setNewStatus(currentStatus || 'In Office');
  };
  
  const handleStatusUpdate = async () => {
    if (!selectedEntry || !newStatus) return;

    const { member, day } = selectedEntry;
    
    await updateFutureStatus(member.id, day, newStatus);
    onTeamUpdate(team); // This will trigger a re-fetch of all data

    setSelectedEntry(null);
    setNewStatus(null);
  };
  
  if (!today) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">This Week</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
            <Card>
                <CardContent className="p-0">
                   <Skeleton className="h-96" />
                </CardContent>
            </Card>
        </div>
    );
  }

  const inOfficeCount = team.filter(member => getStatusForDay(member, today) === 'In Office').length;
  const remoteCount = team.filter(member => getStatusForDay(member, today) === 'Remote').length;


  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">This Week</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Office</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inOfficeCount}</div>
            <p className="text-xs text-muted-foreground">
              {inOfficeCount === 1 ? 'member' : 'members'} in the office today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Remote</CardTitle>
            <Laptop className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remoteCount}</div>
            <p className="text-xs text-muted-foreground">
               {remoteCount === 1 ? 'member' : 'members'} working remotely today
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[240px]">Team Member</TableHead>
                {weekDays.map((day) => (
                  <TableHead 
                    key={day.toISOString()} 
                    className={cn(
                      "text-center rounded-t-lg", 
                      isToday(day) ? 'bg-primary/10 text-primary' : ''
                    )}
                  >
                     <p className="text-sm font-medium">{format(day, 'EEE')}</p>
                     <p className="text-3xl font-bold">{format(day, 'd')}</p>
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
                      <TableCell 
                        key={day.toISOString()} 
                        className={cn("text-center cursor-pointer hover:bg-muted/50", isToday(day) ? 'bg-primary/10' : '')}
                        onClick={() => handleOpenDialog(member, day)}
                      >
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

      <Dialog open={!!selectedEntry} onOpenChange={(isOpen) => !isOpen && setSelectedEntry(null)}>
        <DialogContent>
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle>Update Status for {selectedEntry.member.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  on {format(selectedEntry.day, 'EEEE, MMMM d')}
                </p>
              </DialogHeader>
              <div className="py-4 space-y-2">
                  <StatusToggleButton 
                    status="In Office"
                    currentStatus={newStatus}
                    onStatusChange={setNewStatus}
                  />
                  <StatusToggleButton 
                    status="Remote"
                    currentStatus={newStatus}
                    onStatusChange={setNewStatus}
                  />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedEntry(null)}>Cancel</Button>
                <Button onClick={handleStatusUpdate}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
