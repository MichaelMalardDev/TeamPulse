
'use client';

import { useState, useEffect } from 'react';
import { TeamMember } from '@/lib/data';
import { getAllTeamMembers } from '@/lib/firestore';
import TeamOverview from './team-overview';
import WeeklyOverview from './weekly-overview';
import { useAuth } from '@/hooks/use-auth';
import UpdatePresenceDialog from './update-presence-dialog';

export default function DashboardPage() {
  const { teamMember, loading } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
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
      } else if (teamMember) {
         // This handles the case where the logged-in user's data is loaded
         // before the full team data is fetched.
        setCurrentUser(teamMember);
      }
    }
  }, [teamMember, team]);


  const handleTeamUpdate = (updatedTeam: TeamMember[]) => {
    setTeam(updatedTeam);
    fetchTeamData();
  }

  if (loading || isLoadingTeam || !currentUser) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Your team's status at a glance.</p>
        </div>
        <UpdatePresenceDialog member={currentUser} onUpdate={fetchTeamData} />
      </div>

      <WeeklyOverview team={team} onTeamUpdate={fetchTeamData} />

      <TeamOverview team={team} />
    </div>
  );
}
