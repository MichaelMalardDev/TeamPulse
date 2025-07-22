
'use client';

import { useState, useEffect } from 'react';
import { teamData, TeamMember, WorkStatus } from '@/lib/data';
import StatusSelector from './status-selector';
import TeamOverview from './team-overview';
import WeeklyOverview from './weekly-overview';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { teamMember, loading } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>(teamData);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [currentStatus, setCurrentStatus] = useState<WorkStatus>('In Office');

  useEffect(() => {
    if (teamMember) {
      const userInTeam = team.find(m => m.id === teamMember.id);
      if (userInTeam) {
        setCurrentUser(userInTeam);
        const today = new Date().toISOString().split('T')[0];
        const todaysRecord = userInTeam.history.find(h => h.date.toISOString().startsWith(today));
        setCurrentStatus(todaysRecord ? todaysRecord.status : userInTeam.status);
      } else {
        // If the user is new and was just added to teamData
        setCurrentUser(teamMember);
        setCurrentStatus(teamMember.status);
      }
    }
  }, [teamMember, team]);


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
    if (!currentUser) return;
    
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

  if (loading || !currentUser) {
    return <div>Loading user data...</div>;
  }

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
