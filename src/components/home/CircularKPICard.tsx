import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface CircularKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  href?: string;
}

export function CircularKPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
}: CircularKPICardProps) {
  const content = (
    <div className={cn(
      "relative flex flex-col items-center justify-center p-6 rounded-full aspect-square",
      "bg-gradient-to-br from-emerald-500/20 via-green-500/15 to-teal-500/10",
      "ring-2 ring-emerald-500/30",
      "transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20",
      "min-w-[160px] max-w-[180px] cursor-pointer"
    )}>
      {/* Icon */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-emerald-500/20">
        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      
      {/* Value */}
      <span className="text-3xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
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

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}
