import { Badge } from '@/components/ui/badge';
import { GenDecStatus, GENDEC_STATUS_LABELS } from '@/types/gendec';
import { FileEdit, CheckCircle, Archive } from 'lucide-react';

interface GenDecStatusBadgeProps {
  status: GenDecStatus;
}

const statusConfig: Record<GenDecStatus, { variant: 'default' | 'secondary' | 'outline'; icon: typeof FileEdit; className: string }> = {
  draft: {
    variant: 'secondary',
    icon: FileEdit,
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  completed: {
    variant: 'default',
    icon: CheckCircle,
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  archived: {
    variant: 'outline',
    icon: Archive,
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
};

export const GenDecStatusBadge = ({ status }: GenDecStatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {GENDEC_STATUS_LABELS[status]}
    </Badge>
  );
};
