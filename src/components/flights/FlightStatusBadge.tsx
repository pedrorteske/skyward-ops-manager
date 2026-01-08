import { cn } from '@/lib/utils';
import { FlightStatus, flightStatusLabels } from '@/types/aviation';

interface FlightStatusBadgeProps {
  status: FlightStatus;
  className?: string;
}

const statusStyles: Record<FlightStatus, string> = {
  scheduled: 'bg-info/15 text-info border-info/30',
  arrived: 'bg-success/15 text-success border-success/30',
  departed: 'bg-muted text-muted-foreground border-muted-foreground/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
  delayed: 'bg-warning/15 text-warning border-warning/30',
};

export function FlightStatusBadge({ status, className }: FlightStatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
      statusStyles[status],
      className
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full mr-1.5",
        status === 'scheduled' && "bg-info animate-pulse-live",
        status === 'arrived' && "bg-success",
        status === 'departed' && "bg-muted-foreground",
        status === 'cancelled' && "bg-destructive",
        status === 'delayed' && "bg-warning animate-pulse-live",
      )} />
      {flightStatusLabels[status]}
    </span>
  );
}
