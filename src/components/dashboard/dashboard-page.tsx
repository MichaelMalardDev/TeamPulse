
'use client';

import { useState, useEffect } from 'react';
import { TeamMember, WorkStatus } from '@/lib/data';
import { getAllTeamMembers, updateUserStatus } from '@/lib/firestore';
import StatusSelector from './status-selector';
import TeamOverview from './team-overview';
import WeeklyOverview from './weekly-overview';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { teamMember, loading } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [currentStatus, setCurrentStatus] = useState<WorkStatus>('In Office');
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);

  const fetchTeamData = async () => {
    setIsLoadingTeam(true);
    const teamData = await getAllTeamMembers();
    setTeam(teamData);
    setIsLoadingTeam(false);
  };
  
  useEffect(() => {
    fetchTeamData();
  }, []);

  useEffect(() => {
    if (teamMember) {
      const userInTeam = team.find(m => m.id === teamMember.id);
      if (userInTeam) {
        setCurrentUser(userInTeam);
        setCurrentStatus(userInTeam.status);
      } else if (teamMember) {
         // This handles the case where the logged-in user's data is loaded
         // before the full team data is fetched.
        setCurrentUser(teamMember);
        setCurrentStatus(teamMember.status);
      }
    }
  }, [teamMember, team]);


  const handleTeamUpdate = (updatedTeam: TeamMember[]) => {
    setTeam(updatedTeam);
    fetchTeamData();
  }

  const handleStatusChange = async (newStatus: WorkStatus) => {
    if (!currentUser) return;
    
    setCurrentStatus(newStatus);
    await updateUserStatus(currentUser.id, newStatus);
    
    // Refresh data after update
    fetchTeamData();
  };

  if (loading || isLoadingTeam || !currentUser) {
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

      <WeeklyOverview team={team} onTeamUpdate={fetchTeamData} />

      <TeamOverview team={team} />
    </div>
  );
}
