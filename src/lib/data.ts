
export type WorkStatus = 'In Office' | 'Remote' | 'No Status';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  status: WorkStatus;
  history: { date: Date; status: WorkStatus }[];
}
