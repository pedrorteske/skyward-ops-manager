import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface HomeKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  href?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: {
    card: 'bg-card border-border hover:border-primary/30',
    icon: 'bg-muted text-muted-foreground',
  },
  primary: {
    card: 'bg-primary/5 border-primary/20 hover:border-primary/40',
    icon: 'bg-primary/10 text-primary',
  },
  success: {
    card: 'bg-green-500/5 border-green-500/20 hover:border-green-500/40',
    icon: 'bg-green-500/10 text-green-600',
  },
  warning: {
    card: 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40',
    icon: 'bg-amber-500/10 text-amber-600',
  },
  danger: {
    card: 'bg-red-500/5 border-red-500/20 hover:border-red-500/40',
    icon: 'bg-red-500/10 text-red-600',
  },
};

export function HomeKPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  variant = 'default',
}: HomeKPICardProps) {
  const styles = variantStyles[variant];

  const content = (
    <Card className={cn(
      'transition-all duration-200 cursor-pointer',
      styles.card
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', styles.icon)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}
