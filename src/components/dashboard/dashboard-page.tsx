
'use client';

import { useState, useEffect } from 'react';
import { TeamMember } from '@/lib/data';
import { getAllTeamMembers } from '@/lib/firestore';
import TeamOverview from './team-overview';
import WeeklyOverview from './weekly-overview';
import { useAuth } from '@/hooks/use-auth';
import UpdatePresenceDialog from './update-presence-dialog';
import { motion } from 'framer-motion';

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


  const handleTeamUpdate = (updatedMember: TeamMember) => {
    setTeam(prevTeam => prevTeam.map(member => member.id === updatedMember.id ? updatedMember : member));
    if (currentUser && currentUser.id === updatedMember.id) {
        setCurrentUser(updatedMember);
    }
  }

  if (loading || isLoadingTeam || !currentUser) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
       <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Your team's status at a glance.</p>
            </div>
            <UpdatePresenceDialog member={currentUser} onUpdate={handleTeamUpdate} />
          </div>
      </motion.div>

      <WeeklyOverview team={team} currentUser={currentUser} onTeamUpdate={handleTeamUpdate} />

      <TeamOverview team={team} />
    </div>
  );
}
