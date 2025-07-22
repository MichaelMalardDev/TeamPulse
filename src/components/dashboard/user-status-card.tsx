
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import HistoricalCalendar from '../calendar/historical-calendar';
import { TeamMember, WorkStatus } from '@/lib/data';
import { cn } from '@/lib/utils';
import { startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

type UserStatusCardProps = {
  member: TeamMember;
};

export default function UserStatusCard({ member }: UserStatusCardProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<WorkStatus>('No Status');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const today = startOfDay(new Date());
      const todayHistory = member.history.find(
        (h) => startOfDay(h.date).getTime() === today.getTime()
      );
      setCurrentStatus(todayHistory?.status || 'No Status');
    }
  }, [member, isClient]);

  const isRemote = currentStatus === 'Remote';
  const isNoStatus = currentStatus === 'No Status';

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50">
      <CardHeader className="flex-row items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person portrait" />
          <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{member.name}</p>
          <p className="text-sm text-muted-foreground">{member.role}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStatus}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                >
                    {!isNoStatus && (
                        <span
                        className={cn(
                            'h-3 w-3 rounded-full',
                            isRemote ? 'bg-blue-400' : 'bg-green-400'
                        )}
                        />
                    )}
                    <span className="text-sm font-medium">{currentStatus}</span>
                </motion.div>
            </AnimatePresence>
        </div>
      </CardContent>
      <CardFooter>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              View History
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{member.name}'s History</SheetTitle>
            </SheetHeader>
            <HistoricalCalendar member={member} />
          </SheetContent>
        </Sheet>
      </CardFooter>
    </Card>
  );
}
