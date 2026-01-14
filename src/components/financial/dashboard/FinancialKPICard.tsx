import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialKPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
}

const variantStyles = {
  default: {
    bg: 'bg-card',
    border: 'border-border',
    icon: 'bg-muted text-muted-foreground',
  },
  success: {
    bg: 'bg-success/5',
    border: 'border-success/20',
    icon: 'bg-success/20 text-success',
  },
  warning: {
    bg: 'bg-warning/5',
    border: 'border-warning/20',
    icon: 'bg-warning/20 text-warning',
  },
  danger: {
    bg: 'bg-destructive/5',
    border: 'border-destructive/20',
    icon: 'bg-destructive/20 text-destructive',
  },
  info: {
    bg: 'bg-info/5',
    border: 'border-info/20',
    icon: 'bg-info/20 text-info',
  },
  primary: {
    bg: 'bg-primary/5',
    border: 'border-primary/20',
    icon: 'bg-primary/20 text-primary',
  },
};

export function FinancialKPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: FinancialKPICardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-all duration-200 hover:shadow-md',
        styles.bg,
        styles.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-bold text-foreground truncate">{value}</p>
            {trend && (
              <span
                className={cn(
                  'text-sm font-medium shrink-0',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ml-3', styles.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
