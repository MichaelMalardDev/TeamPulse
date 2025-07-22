'use server';
/**
 * @fileOverview Suggests the best day for a team meeting based on presence.
 *
 * - suggestMeetingDay - A function that suggests the best day for a meeting.
 * - SuggestMeetingDayInput - The input type for the suggestMeetingDay function.
 * - SuggestMeetingDayOutput - The return type for the suggestMeetingDay function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestMeetingDayInputSchema = z.object({
  teamData: z.array(z.object({
    name: z.string().describe("Team member's name."),
    history: z.array(z.object({
      date: z.string().describe("Date in YYYY-MM-DD format."),
      status: z.string().describe("Presence status: 'In Office' or 'Remote'."),
    })).describe("The member's presence history and future plans."),
  })).describe("An array of team members and their presence data."),
});

export type SuggestMeetingDayInput = z.infer<typeof SuggestMeetingDayInputSchema>;

const SuggestMeetingDayOutputSchema = z.object({
  suggestedDay: z.string().describe("The best day for a meeting in YYYY-MM-DD format. Should be a future weekday."),
  expectedAttendees: z.number().describe("The number of team members expected to be 'In Office' on that day."),
  justification: z.string().describe("A brief, friendly (1-2 sentence) justification for why this day was chosen."),
});

export type SuggestMeetingDayOutput = z.infer<typeof SuggestMeetingDayOutputSchema>;

export async function suggestMeetingDay(input: SuggestMeetingDayInput): Promise<SuggestMeetingDayOutput> {
  return suggestMeetingDayFlow(input);
}

const suggestMeetingDayPrompt = ai.definePrompt({
  name: 'suggestMeetingDayPrompt',
  input: { schema: SuggestMeetingDayInputSchema },
  output: { schema: SuggestMeetingDayOutputSchema },
  prompt: `You are an AI assistant helping a team manager find the best day for a team meeting or event.
Your goal is to maximize in-person attendance.

Analyze the provided team presence data, which includes past history and future planned statuses.
Identify the future weekday with the highest number of team members marked as 'In Office'.
Do not suggest weekends or past dates. Today's date is ${new Date().toISOString().split('T')[0]}.

Provide the best day, the number of people expected in the office, and a short, friendly justification.

Team Data:
{{#each teamData}}
- Member: {{name}}
  - Presence:
  {{#each history}}
    - {{date}}: {{status}}
  {{/each}}
{{/each}}`,
});

const suggestMeetingDayFlow = ai.defineFlow(
  {
    name: 'suggestMeetingDayFlow',
    inputSchema: SuggestMeetingDayInputSchema,
    outputSchema: SuggestMeetingDayOutputSchema,
  },
  async (input) => {
    const { output } = await suggestMeetingDayPrompt(input);
    return output!;
  }
);
