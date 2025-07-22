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
  summary: z.string().describe('A summary of the team output, highlighting overall contributions and suggesting task re-balancing opportunities.'),
});

export type SummarizeTeamOutputOutput = z.infer<typeof SummarizeTeamOutputOutputSchema>;

export async function summarizeTeamOutput(input: SummarizeTeamOutputInput): Promise<SummarizeTeamOutputOutput> {
  return summarizeTeamOutputFlow(input);
}

const summarizeTeamOutputPrompt = ai.definePrompt({
  name: 'summarizeTeamOutputPrompt',
  input: {schema: SummarizeTeamOutputInputSchema},
  output: {schema: SummarizeTeamOutputOutputSchema},
  prompt: `You are a team productivity expert. Review the daily outputs of the remote team members and provide a summary of their overall contributions, as well as suggestions for task re-balancing to improve overall team productivity.

Team Output:
{{#each teamOutput}}
Member: {{memberName}}
Output: {{dailyOutput}}
\n
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
