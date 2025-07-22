// Summarize remote team member daily outputs and suggest re-balancing opportunities.
'use server';

/**
 * @fileOverview Summarizes team output using a language model.
 *
 * - summarizeTeamOutput - A function that summarizes the team output.
 * - SummarizeTeamOutputInput - The input type for the summarizeTeamOutput function.
 * - SummarizeTeamOutputOutput - The return type for the summarizeTeamOutput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTeamOutputInputSchema = z.object({
  teamOutput: z.array(
    z.object({
      memberName: z.string().describe('Name of the team member.'),
      dailyOutput: z.string().describe('The daily output of the team member.'),
    })
  ).describe('An array of team member names and their respective daily outputs.'),
});

export type SummarizeTeamOutputInput = z.infer<typeof SummarizeTeamOutputInputSchema>;

const SummarizeTeamOutputOutputSchema = z.object({
  overallSummary: z.string().describe("A 2-3 sentence high-level summary of the team's work for the day."),
  productivityAnalysis: z.array(z.object({
    memberName: z.string().describe("The team member's name."),
    productivityScore: z.number().min(0).max(100).describe("A productivity score from 0 to 100 based on their output."),
    justification: z.string().describe("A brief (1-2 sentence) justification for the score."),
  })).describe("An analysis of each team member's productivity."),
  blockers: z.array(z.string()).describe("A list of potential blockers or issues identified from the team's output."),
  suggestions: z.array(z.string()).describe("A list of actionable suggestions to improve team productivity or address blockers."),
});

export type SummarizeTeamOutputOutput = z.infer<typeof SummarizeTeamOutputOutputSchema>;

export async function summarizeTeamOutput(input: SummarizeTeamOutputInput): Promise<SummarizeTeamOutputOutput> {
  return summarizeTeamOutputFlow(input);
}

const summarizeTeamOutputPrompt = ai.definePrompt({
  name: 'summarizeTeamOutputPrompt',
  input: {schema: SummarizeTeamOutputInputSchema},
  output: {schema: SummarizeTeamOutputOutputSchema},
  prompt: `You are a team productivity expert. Review the daily outputs of the remote team members.

You will provide a structured analysis including:
1.  A brief, high-level summary of the team's collective work.
2.  A productivity analysis for each member, assigning a score from 0-100. Base the score on completed tasks, progress made, and clarity of the update. Provide a short justification for each score.
3.  A list of any potential blockers or challenges mentioned. If none, return an empty array.
4.  A list of actionable suggestions for task re-balancing, collaboration, or process improvement.

Team Output:
{{#each teamOutput}}
- Member: {{memberName}}
  - Output: {{dailyOutput}}
{{/each}}`,
});

const summarizeTeamOutputFlow = ai.defineFlow(
  {
    name: 'summarizeTeamOutputFlow',
    inputSchema: SummarizeTeamOutputInputSchema,
    outputSchema: SummarizeTeamOutputOutputSchema,
  },
  async input => {
    const {output} = await summarizeTeamOutputPrompt(input);
    return output!;
  }
);
