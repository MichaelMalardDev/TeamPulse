
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CalendarCheck, Loader2, Wand2, Users, Building, Laptop, CalendarX } from 'lucide-react';
import { suggestMeetingDayAction } from '@/app/summary/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const initialState = {
  result: undefined,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-5 w-5" />
          Find Best Day
        </>
      )}
    </Button>
  );
}

export default function MeetingScheduler() {
  const [state, formAction] = useActionState(suggestMeetingDayAction, initialState);

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Find the Perfect Day</CardTitle>
          <CardDescription>
            Click the button below and our AI will analyze your team's planned presence to find the day with the highest in-office attendance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {state.result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-card border-primary/50 shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
                        <CalendarCheck className="h-8 w-8" />
                    </div>
                    <CardDescription className="pt-4">The best day for your team event is:</CardDescription>
                    <CardTitle className="text-4xl font-bold tracking-tight">
                        {format(parseISO(state.result.suggestedDay), 'EEEE, MMMM do')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-lg font-medium">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span>Expected In Office: <strong>{state.result.expectedAttendees} people</strong></span>
                    </div>
                    <p className="text-muted-foreground max-w-md mx-auto">{state.result.justification}</p>
                </CardContent>
                {state.result.attendees && state.result.attendees.length > 0 && (
                <CardFooter className="flex-col items-stretch p-4 sm:p-6 border-t">
                    <h3 className="text-lg font-semibold text-center mb-4">Team Status on {format(parseISO(state.result.suggestedDay), 'MMM do')}</h3>
                     <Accordion type="single" collapsible className="w-full">
                        {state.result.attendees.map((attendee) => (
                           <AccordionItem value={attendee.userId} key={attendee.userId}>
                             <AccordionTrigger className="hover:no-underline">
                               <div className="flex items-center gap-4">
                                 <Avatar className="h-10 w-10">
                                   <AvatarImage src={attendee.avatarUrl} alt={attendee.name} data-ai-hint="person portrait" />
                                   <AvatarFallback>{attendee.name.substring(0, 2)}</AvatarFallback>
                                 </Avatar>
                                 <div className="text-left">
                                   <p className="font-semibold">{attendee.name}</p>
                                   <p className="text-sm text-muted-foreground">{attendee.role}</p>
                                 </div>
                               </div>
                             </AccordionTrigger>
                             <AccordionContent>
                               <div className="flex items-center gap-2 pl-14">
                                {attendee.status === 'In Office' ? (
                                    <div className="flex items-center gap-2 text-green-400">
                                        <Building className="h-4 w-4" />
                                        <span className="font-medium">In Office</span>
                                    </div>
                                ) : attendee.status === 'Remote' ? (
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <Laptop className="h-4 w-4" />
                                        <span className="font-medium">Remote</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CalendarX className="h-4 w-4" />
                                        <span className="font-medium">No Status</span>
                                    </div>
                                )}
                               </div>
                             </AccordionContent>
                           </AccordionItem>
                        ))}
                    </Accordion>
                </CardFooter>
                )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {state.error && (
        <Card className="bg-destructive/20 border-destructive">
            <CardHeader className="flex-row items-center gap-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>An Error Occurred</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{state.error}</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
