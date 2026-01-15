import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CircularOutlineKPIProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const variantStyles = {
  default: {
    stroke: 'stroke-muted-foreground',
    text: 'text-foreground',
    bg: 'bg-card',
    border: 'border-border',
  },
  primary: {
    stroke: 'stroke-primary',
    text: 'text-primary',
    bg: 'bg-primary/5',
    border: 'border-primary/20',
  },
  success: {
    stroke: 'stroke-success',
    text: 'text-success',
    bg: 'bg-success/5',
    border: 'border-success/20',
  },
  warning: {
    stroke: 'stroke-warning',
    text: 'text-warning',
    bg: 'bg-warning/5',
    border: 'border-warning/20',
  },
  danger: {
    stroke: 'stroke-destructive',
    text: 'text-destructive',
    bg: 'bg-destructive/5',
    border: 'border-destructive/20',
  },
  info: {
    stroke: 'stroke-info',
    text: 'text-info',
    bg: 'bg-info/5',
    border: 'border-info/20',
  },
};

export function CircularOutlineKPI({
  title,
  value,
  icon: Icon,
  description,
  variant = 'default',
}: CircularOutlineKPIProps) {
  const styles = variantStyles[variant];
  const circleRadius = 42;
  const circumference = 2 * Math.PI * circleRadius;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all duration-200 hover:shadow-md flex flex-col items-center',
        styles.bg,
        styles.border
      )}
    >
      {/* Circular indicator with value inside */}
      <div className="relative w-28 h-28 mb-3">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle (subtle) */}
          <circle
            cx="50"
            cy="50"
            r={circleRadius}
            fill="none"
            strokeWidth="4"
            className="stroke-muted/30"
          />
          {/* Main circle outline */}
          <circle
            cx="50"
            cy="50"
            r={circleRadius}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className={styles.stroke}
            strokeDasharray={circumference}
            strokeDashoffset="0"
          />
        </svg>
        {/* Value centered inside */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={cn('w-5 h-5 mb-1', styles.text)} />
          <span className={cn('text-2xl font-bold', styles.text)}>
            {value.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Title and description below */}
      <p className="text-sm font-medium text-foreground text-center">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground text-center mt-0.5">{description}</p>
      )}
    </div>
  );
}
