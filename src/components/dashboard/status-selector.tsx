import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WorkStatus } from '@/lib/data';
import { Building, Laptop } from 'lucide-react';

type StatusSelectorProps = {
  currentStatus: WorkStatus;
  onStatusChange: (status: WorkStatus) => void;
};

export default function StatusSelector({ currentStatus, onStatusChange }: StatusSelectorProps) {
  return (
    <div className="flex gap-4">
      <Button
        variant={currentStatus === 'In Office' ? 'default' : 'outline'}
        size="lg"
        onClick={() => onStatusChange('In Office')}
        className={cn(
          "transition-all duration-200 text-base px-6 py-3",
          currentStatus === 'In Office' ? 'shadow-lg shadow-primary/30' : ''
        )}
      >
        <Building className="mr-2 h-5 w-5" />
        In Office
      </Button>
      <Button
        variant={currentStatus === 'Remote' ? 'default' : 'outline'}
        size="lg"
        onClick={() => onStatusChange('Remote')}
        className={cn(
          "transition-all duration-200 text-base px-6 py-3",
          currentStatus === 'Remote' ? 'shadow-lg shadow-primary/30' : ''
        )}
      >
        <Laptop className="mr-2 h-5 w-5" />
        Remote
      </Button>
    </div>
  );
}
