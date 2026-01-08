import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionButtonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  variant?: 'primary' | 'info' | 'success';
}

const variantStyles = {
  primary: {
    bg: 'bg-gradient-to-br from-primary to-primary/80',
    hover: 'hover:from-primary/90 hover:to-primary/70',
    shadow: 'hover:shadow-primary/25',
    iconBg: 'bg-white/20',
  },
  info: {
    bg: 'bg-gradient-to-br from-info to-info/80',
    hover: 'hover:from-info/90 hover:to-info/70',
    shadow: 'hover:shadow-info/25',
    iconBg: 'bg-white/20',
  },
  success: {
    bg: 'bg-gradient-to-br from-success to-success/80',
    hover: 'hover:from-success/90 hover:to-success/70',
    shadow: 'hover:shadow-success/25',
    iconBg: 'bg-white/20',
  },
};

export function QuickActionButton({
  icon: Icon,
  title,
  description,
  onClick,
  variant = 'primary',
}: QuickActionButtonProps) {
  const styles = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-4 p-5 rounded-xl text-left transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]',
        'text-white min-w-[240px] flex-1',
        styles.bg,
        styles.hover,
        styles.shadow
      )}
    >
      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', styles.iconBg)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-semibold text-base">{title}</h3>
        <p className="text-sm text-white/80">{description}</p>
      </div>
    </button>
  );
}
