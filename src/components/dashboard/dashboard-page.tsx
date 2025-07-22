'use client';

import { useState } from 'react';
import { teamData, currentUser, TeamMember, WorkStatus } from '@/lib/data';
import StatusSelector from './status-selector';
import TeamOverview from './team-overview';

export default function DashboardPage() {
  const [team, setTeam] = useState<TeamMember[]>(teamData);
  const [currentStatus, setCurrentStatus] = useState<WorkStatus>(currentUser.status);

  const handleStatusChange = (newStatus: WorkStatus) => {
    setCurrentStatus(newStatus);
    setTeam((prevTeam) =>
      prevTeam.map((member) =>
        member.id === currentUser.id ? { ...member, status: newStatus } : member
      )
    );
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

      <TeamOverview team={team} />
    </div>
  );
}
