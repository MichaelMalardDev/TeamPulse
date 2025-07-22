'use server';

import { summarizeTeamOutput, SummarizeTeamOutputInput } from '@/ai/flows/summarize-team-output';
import { z } from 'zod';

const ActionInputSchema = z.object({
  teamOutput: z.array(
    z.object({
      memberName: z.string().min(1, 'Member name is required.'),
      dailyOutput: z.string().min(1, 'Daily output is required.'),
    })
  ).min(1, 'At least one team member is required.'),
});

type ActionState = {
  summary?: string;
  error?: string;
  issues?: z.ZodIssue[];
};

export async function generateSummaryAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const formObject = Object.fromEntries(formData.entries());
  
  const teamOutput = [];
  let i = 0;
  while(formObject[`teamOutput[${i}].memberName`]) {
    teamOutput.push({
      memberName: formObject[`teamOutput[${i}].memberName`],
      dailyOutput: formObject[`teamOutput[${i}].dailyOutput`],
    });
    i++;
  }

  const validation = ActionInputSchema.safeParse({ teamOutput });
  
  if (!validation.success) {
    return {
      error: 'Invalid input.',
      issues: validation.error.issues,
    };
  }

  try {
    const result = await summarizeTeamOutput(validation.data);
    return { summary: result.summary };
  } catch (e: any) {
    return {
      error: e.message || 'An unexpected error occurred.',
    };
  }
}
