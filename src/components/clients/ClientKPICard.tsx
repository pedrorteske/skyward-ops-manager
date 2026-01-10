import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientKPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'info' | 'success';
  subtitle?: string;
}

const variantStyles = {
  default: {
    ring: 'ring-primary/20',
    bg: 'bg-gradient-to-br from-primary/10 to-primary/5',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    valueColor: 'text-primary',
  },
  primary: {
    ring: 'ring-accent/20',
    bg: 'bg-gradient-to-br from-accent/10 to-accent/5',
    iconBg: 'bg-accent/20',
    iconColor: 'text-accent-foreground',
    valueColor: 'text-accent-foreground',
  },
  info: {
    ring: 'ring-info/20',
    bg: 'bg-gradient-to-br from-info/10 to-info/5',
    iconBg: 'bg-info/20',
    iconColor: 'text-info',
    valueColor: 'text-info',
  },
  success: {
    ring: 'ring-success/20',
    bg: 'bg-gradient-to-br from-success/10 to-success/5',
    iconBg: 'bg-success/20',
    iconColor: 'text-success',
    valueColor: 'text-success',
  },
};

export function ClientKPICard({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'default',
  subtitle 
}: ClientKPICardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn(
      "relative flex flex-col items-center justify-center p-6 rounded-full aspect-square",
      "ring-2 transition-all duration-300 hover:scale-105 hover:shadow-lg",
      "min-w-[160px] max-w-[180px]",
      styles.ring,
      styles.bg
    )}>
      {/* Icon */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center mb-2",
        styles.iconBg
      )}>
        <Icon className={cn("w-5 h-5", styles.iconColor)} />
      </div>
      
      {/* Value */}
      <span className={cn(
        "text-3xl font-bold tracking-tight",
        styles.valueColor
      )}>
        {value}
      </span>
      
      {/* Title */}
      <span className="text-xs font-medium text-muted-foreground text-center mt-1 px-2 leading-tight">
        {title}
      </span>
      
      {/* Subtitle */}
      {subtitle && (
        <span className="text-[10px] text-muted-foreground/70 mt-0.5">
          {subtitle}
        </span>
      )}
    </div>
  );
}
