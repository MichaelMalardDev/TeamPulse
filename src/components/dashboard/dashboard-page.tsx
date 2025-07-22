
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

  const handleTeamUpdate = (updatedTeam: TeamMember[]) => {
    setTeam(updatedTeam);
    // This is a simple way to update the "master" data.
    // In a real app, this would be an API call.
    updatedTeam.forEach(updatedMember => {
      const index = teamData.findIndex(m => m.id === updatedMember.id);
      if (index !== -1) {
        teamData[index] = updatedMember;
      }
    });
  }

  const handleStatusChange = (newStatus: WorkStatus) => {
    setCurrentStatus(newStatus);
    const today = new Date();
    
    const updatedTeam = team.map((member) => {
      if (member.id === currentUser.id) {
        return { ...member, status: newStatus };
      }
      return member;
    });

    const userInTeam = updatedTeam.find(m => m.id === currentUser.id);
    if(userInTeam) {
      const dayString = today.toISOString().split('T')[0];
      const historyIndex = userInTeam.history.findIndex(h => h.date.toISOString().startsWith(dayString));
      const newHistory = [...userInTeam.history];
      if (historyIndex > -1) {
        newHistory[historyIndex] = { ...newHistory[historyIndex], status: newStatus };
      } else {
        newHistory.push({ date: today, status: newStatus });
      }
      userInTeam.history = newHistory;
    }
    
    handleTeamUpdate(updatedTeam);
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

      <WeeklyOverview team={team} onTeamUpdate={handleTeamUpdate} />

      <TeamOverview team={team} />
    </div>
  );
}
