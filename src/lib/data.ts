
export type WorkStatus = 'In Office' | 'Remote';

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatarUrl: string;
  status: WorkStatus;
  history: { date: Date; status: WorkStatus }[];
}

const today = new Date();
export const generateHistory = (userId: number): { date: Date; status: WorkStatus }[] => {
  const history: { date: Date; status: WorkStatus }[] = [];
  // Generate from 30 days in the past to 7 days in the future for existing users
  for (let i = -30; i <= 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    // Make history slightly random
    const isRemote = (userId + i) % 3 === 0 || (userId + i) % 5 === 0;
    history.push({
      date,
      status: isRemote ? 'Remote' : 'In Office',
    });
  }
  return history;
};

export const teamData: TeamMember[] = [
  {
    id: 1,
    name: 'Alicia Keys',
    role: 'Project Manager',
    avatarUrl: 'https://placehold.co/100x100',
    status: 'In Office',
    history: generateHistory(1),
  },
  {
    id: 2,
    name: 'Ben Affleck',
    role: 'Lead Designer',
    avatarUrl: 'https://placehold.co/100x100',
    status: 'Remote',
    history: generateHistory(2),
  },
  {
    id: 3,
    name: 'Catherine Zeta',
    role: 'Frontend Developer',
    avatarUrl: 'https://placehold.co/100x100',
    status: 'In Office',
    history: generateHistory(3),
  },
  {
    id: 4,
    name: 'David Copperfield',
    role: 'Backend Developer',
    avatarUrl: 'https://placehold.co/100x100',
    status: 'In Office',
    history: generateHistory(4),
  },
  {
    id: 5,
    name: 'Eva Mendes',
    role: 'QA Engineer',
    avatarUrl: 'https://placehold.co/100x100',
    status: 'Remote',
    history: generateHistory(5),
  },
  {
    id: 6,
    name: 'Frank Ocean',
    role: 'DevOps Specialist',
    avatarUrl: 'https://placehold.co/100x100',
    status: 'Remote',
    history: generateHistory(6),
  },
];
