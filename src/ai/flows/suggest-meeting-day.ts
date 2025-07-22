
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
    id: z.string().describe("Team member's unique ID."),
    name: z.string().describe("Team member's name."),
    role: z.string().describe("Team member's role."),
    avatarUrl: z.string().describe("URL for the team member's avatar."),
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
  attendees: z.array(z.object({
    userId: z.string().describe("Team member's unique ID."),
    name: z.string().describe("Team member's name."),
    role: z.string().describe("Team member's role as a string."),
    avatarUrl: z.string().describe("URL for the team member's avatar."),
    status: z.string().describe("The member's status for the suggested day ('In Office', 'Remote', or 'No Status')."),
  })).describe("A list of all team members and their status for the suggested day."),
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
Your analysis must only consider future weekdays. Today's date is ${new Date().toISOString().split('T')[0]}. Ignore any dates before today.

From the future dates, identify the weekday with the highest number of team members marked as 'In Office'.
If there's a tie, suggest the earliest possible day.

For the suggested day, you must provide a list of all team members, including their unique userId, their role as a string, and their status for that specific day. If a member has no status recorded for that day, their status should be 'No Status'.

Provide the best day, the number of people expected in the office, a short, friendly justification, and the list of all team members with their statuses for that day.

Team Data:
{{#each teamData}}
- Member: {{name}} (ID: {{id}}, Role: {{role}}, Avatar: {{avatarUrl}})
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
