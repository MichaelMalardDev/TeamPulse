
'use server';

import { suggestMeetingDay, SuggestMeetingDayOutput } from '@/ai/flows/suggest-meeting-day';
import { getAllTeamMembers } from '@/lib/firestore';
import { z } from 'zod';

export type ActionState = {
  result?: SuggestMeetingDayOutput;
  error?: string;
};

export async function suggestMeetingDayAction(): Promise<ActionState> {
  try {
    const teamMembers = await getAllTeamMembers();
    
    // We only need names and history for the AI
    const teamData = teamMembers.map(member => ({
        name: member.name,
        role: member.role,
        avatarUrl: member.avatarUrl,
        // Convert history dates to simple ISO strings
        history: member.history.map(h => ({
            date: h.date.toISOString().split('T')[0],
            status: h.status,
        }))
    }));

    const result = await suggestMeetingDay({ teamData });
    return { result };
  } catch (e: any) {
    return {
      error: e.message || 'An unexpected error occurred.',
    };
  }
}
