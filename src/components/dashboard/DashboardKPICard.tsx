import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardKPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const variantStyles = {
  default: {
    bg: 'bg-card',
    border: 'border-border',
    icon: 'bg-muted text-muted-foreground',
    text: 'text-foreground',
  },
  primary: {
    bg: 'bg-primary/5',
    border: 'border-primary/20',
    icon: 'bg-primary/20 text-primary',
    text: 'text-primary',
  },
  success: {
    bg: 'bg-success/5',
    border: 'border-success/20',
    icon: 'bg-success/20 text-success',
    text: 'text-success',
  },
  warning: {
    bg: 'bg-warning/5',
    border: 'border-warning/20',
    icon: 'bg-warning/20 text-warning',
    text: 'text-warning',
  },
  danger: {
    bg: 'bg-destructive/5',
    border: 'border-destructive/20',
    icon: 'bg-destructive/20 text-destructive',
    text: 'text-destructive',
  },
  info: {
    bg: 'bg-info/5',
    border: 'border-info/20',
    icon: 'bg-info/20 text-info',
    text: 'text-info',
  },
};

export function DashboardKPICard({
  title,
  value,
  icon: Icon,
  description,
  variant = 'default',
  trend,
}: DashboardKPICardProps) {
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
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className={cn('text-3xl font-bold', styles.text)}>{value.toLocaleString('pt-BR')}</p>
            {trend && (
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', styles.icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
