'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { generateSummaryAction } from '@/app/summary/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Plus, Trash2, Wand2 } from 'lucide-react';
import { teamData } from '@/lib/data';
import { useEffect } from 'react';

const initialState = {
  summary: undefined,
  error: undefined,
  issues: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-5 w-5" />
          Generate Summary
        </>
      )}
    </Button>
  );
}

export default function TeamSummaryForm() {
  const [state, formAction] = useFormState(generateSummaryAction, initialState);

  const remoteTeamMembers = teamData.filter(member => member.status === 'Remote');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Daily Outputs</CardTitle>
          <CardDescription>
            Add the daily output for each remote team member.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
              {remoteTeamMembers.map((member, index) => (
                  <div key={member.id} className="space-y-2 p-4 border rounded-lg bg-background">
                      <input type="hidden" name={`teamOutput[${index}].memberName`} value={member.name} />
                      <Label htmlFor={`output-${index}`} className="font-semibold">{member.name}</Label>
                      <Textarea
                          id={`output-${index}`}
                          name={`teamOutput[${index}].dailyOutput`}
                          placeholder={`What did ${member.name} work on today?`}
                          rows={3}
                          className="bg-card"
                      />
                  </div>
              ))}
              {remoteTeamMembers.length === 0 && (
                <p className="text-sm text-muted-foreground p-4 text-center">No remote team members to summarize.</p>
              )}
          </CardContent>
          <CardFooter>
            {remoteTeamMembers.length > 0 && <SubmitButton />}
          </CardFooter>
        </form>
      </Card>

      <AnimatePresence>
        {state.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="text-primary" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{state.summary}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {state.error && (
        <Card className="bg-destructive/20 border-destructive">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{state.error}</p>
            {state.issues && (
              <ul className="list-disc pl-5 mt-2">
                {state.issues.map((issue, i) => (
                  <li key={i}>{issue.message}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
