import { TeamMember } from '@/lib/data';
import UserStatusCard from './user-status-card';
import { AnimatePresence, motion } from 'framer-motion';

type TeamOverviewProps = {
  team: TeamMember[];
};

export default function TeamOverview({ team }: TeamOverviewProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Team Overview</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <AnimatePresence>
          {team.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <UserStatusCard member={member} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
