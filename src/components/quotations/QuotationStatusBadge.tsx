import { cn } from '@/lib/utils';
import { QuotationStatus, quotationStatusLabels } from '@/types/aviation';

interface QuotationStatusBadgeProps {
  status: QuotationStatus;
  className?: string;
}

const statusStyles: Record<QuotationStatus, string> = {
  created: 'bg-muted text-muted-foreground border-muted-foreground/30',
  sent: 'bg-info/15 text-info border-info/30',
  approved: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
};

export function QuotationStatusBadge({ status, className }: QuotationStatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
      statusStyles[status],
      className
    )}>
      {quotationStatusLabels[status]}
    </span>
  );
}
