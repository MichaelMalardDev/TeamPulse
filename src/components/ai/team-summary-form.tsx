'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Lightbulb, Loader2, Wand2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { generateSummaryAction } from '@/app/summary/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getRemoteTeamMembers } from '@/lib/firestore';
import { TeamMember } from '@/lib/data';
import { ChartTooltipContent } from '@/components/ui/chart';

const initialState = {
  result: undefined,
  error: undefined,
  issues: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-5 w-5" />
          Generate Productivity Pulse
        </>
      )}
    </Button>
  );
}

export default function TeamSummaryForm() {
  const [state, formAction] = useActionState(generateSummaryAction, initialState);
  const [remoteTeamMembers, setRemoteTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRemoteMembers() {
      setLoading(true);
      const members = await getRemoteTeamMembers();
      setRemoteTeamMembers(members);
      setLoading(false);
    }
    fetchRemoteMembers();
  }, []);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Daily Outputs</CardTitle>
          <CardDescription>
            Add the daily output for each remote team member. The AI will analyze productivity, identify blockers, and suggest improvements.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
              {loading ? (
                <p>Loading remote team members...</p>
              ) : remoteTeamMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {remoteTeamMembers.map((member, index) => (
                      <div key={member.id} className="space-y-2 p-4 border rounded-lg bg-background">
                          <input type="hidden" name={`teamOutput[${index}].memberName`} value={member.name} />
                          <Label htmlFor={`output-${index}`} className="font-semibold">{member.name}</Label>
                          <Textarea
                              id={`output-${index}`}
                              name={`teamOutput[${index}].dailyOutput`}
                              placeholder={`What did ${member.name} work on today?`}
                              rows={4}
                              className="bg-card"
                          />
                      </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-4 text-center">No remote team members to summarize.</p>
              )}
          </CardContent>
          <CardFooter>
            {!loading && remoteTeamMembers.length > 0 && <SubmitButton />}
          </CardFooter>
        </form>
      </Card>

      <AnimatePresence>
        {state.result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="text-primary" />
                  Productivity Pulse
                </CardTitle>
                 <CardDescription>{state.result.overallSummary}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer>
                    <BarChart data={state.result.productivityAnalysis}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="memberName" 
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        cursor={{fill: 'hsla(var(--muted))'}}
                        content={<ChartTooltipContent 
                          nameKey="productivityScore" 
                          labelKey="memberName" 
                          formatter={(value, name, props) => (
                            <div className="flex flex-col gap-1">
                               <p className="font-bold text-lg">{props.payload.memberName}: {value}</p>
                               <p className="text-sm text-muted-foreground">{props.payload.justification}</p>
                            </div>
                          )}
                        />}
                      />
                      <Bar dataKey="productivityScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="text-destructive" />
                    Identified Blockers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {state.result.blockers.length > 0 ? (
                    <ul className="list-disc space-y-2 pl-5">
                      {state.result.blockers.map((blocker, i) => <li key={i}>{blocker}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="text-green-500" /> No blockers identified. Great job!
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="text-yellow-400" />
                    AI Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {state.result.suggestions.length > 0 ? (
                    <ul className="list-disc space-y-2 pl-5">
                      {state.result.suggestions.map((suggestion, i) => <li key={i}>{suggestion}</li>)}
                    </ul>
                  ) : (
                     <p className="text-sm text-muted-foreground">No specific suggestions at this time.</p>
                  )}
                </CardContent>
              </Card>
            </div>
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
