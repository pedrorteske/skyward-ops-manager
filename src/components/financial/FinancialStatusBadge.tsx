import { cn } from '@/lib/utils';
import { FinancialDocumentStatus, financialStatusLabels, financialStatusColors } from '@/types/financial';

interface FinancialStatusBadgeProps {
  status: FinancialDocumentStatus;
  className?: string;
}

export function FinancialStatusBadge({ status, className }: FinancialStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        financialStatusColors[status],
        className
      )}
    >
      {financialStatusLabels[status]}
    </span>
  );
}
