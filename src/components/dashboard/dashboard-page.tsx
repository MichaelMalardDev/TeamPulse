'use client';

import { useState } from 'react';
import { teamData, currentUser, TeamMember, WorkStatus } from '@/lib/data';
import StatusSelector from './status-selector';
import TeamOverview from './team-overview';
import WeeklyOverview from './weekly-overview';

export default function DashboardPage() {
  const [team, setTeam] = useState<TeamMember[]>(teamData);
  const [currentStatus, setCurrentStatus] = useState<WorkStatus>(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysRecord = currentUser.history.find(h => h.date.toISOString().startsWith(today));
    return todaysRecord ? todaysRecord.status : 'In Office';
  });

  const handleStatusChange = (newStatus: WorkStatus) => {
    setCurrentStatus(newStatus);
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const updatedTeam = team.map((member) => {
      if (member.id === currentUser.id) {
        const historyIndex = member.history.findIndex(h => h.date.toISOString().startsWith(todayString));
        const newHistory = [...member.history];
        if (historyIndex > -1) {
          newHistory[historyIndex] = { ...newHistory[historyIndex], status: newStatus };
        } else {
          newHistory.push({ date: today, status: newStatus });
        }
        return { ...member, status: newStatus, history: newHistory };
      }
      return member;
    });
    setTeam(updatedTeam);
    
    // Also update the master data so it's reflected across the app
    const userInTeamData = teamData.find(m => m.id === currentUser.id);
    if(userInTeamData) {
      const historyIndex = userInTeamData.history.findIndex(h => h.date.toISOString().startsWith(todayString));
      if(historyIndex > -1) {
        userInTeamData.history[historyIndex].status = newStatus;
      } else {
        userInTeamData.history.push({ date: today, status: newStatus });
      }
      userInTeamData.status = newStatus;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Your team's status at a glance.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Status Today</h2>
        <StatusSelector currentStatus={currentStatus} onStatusChange={handleStatusChange} />
      </div>

      <WeeklyOverview team={team} />

      <TeamOverview team={team} />
    </div>
  );
}
