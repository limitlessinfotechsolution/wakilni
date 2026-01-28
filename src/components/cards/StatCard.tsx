import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconBgColor?: string;
  variant?: 'default' | 'gradient' | 'glass';
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ 
    className, 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    iconBgColor = 'bg-primary/10',
    variant = 'default',
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl p-4 md:p-5',
          'transition-all duration-200',
          'hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]',
          variant === 'default' && 'bg-card border border-border/50 shadow-sm',
          variant === 'gradient' && 'bg-gradient-to-br from-primary to-primary/80 text-white',
          variant === 'glass' && 'glass-card',
          className
        )}
        {...props}
      >
        {/* Background decoration */}
        {Icon && (
          <div className="absolute -right-4 -top-4 opacity-5">
            <Icon className="h-24 w-24" />
          </div>
        )}

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-medium truncate',
              variant === 'gradient' ? 'text-white/80' : 'text-muted-foreground'
            )}>
              {title}
            </p>
            
            <div className="mt-2 flex items-baseline gap-2">
              <span className={cn(
                'text-2xl md:text-3xl font-bold tracking-tight',
                variant === 'gradient' ? 'text-white' : 'gradient-text-sacred'
              )}>
                {value}
              </span>
              
              {trend && (
                <span className={cn(
                  'text-xs font-medium px-1.5 py-0.5 rounded-full',
                  trend.isPositive 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            
            {subtitle && (
              <p className={cn(
                'mt-1 text-xs',
                variant === 'gradient' ? 'text-white/70' : 'text-muted-foreground'
              )}>
                {subtitle}
              </p>
            )}
          </div>

          {Icon && (
            <div className={cn(
              'flex-shrink-0 p-2.5 rounded-xl',
              variant === 'gradient' 
                ? 'bg-white/20' 
                : iconBgColor
            )}>
              <Icon className={cn(
                'h-5 w-5',
                variant === 'gradient' ? 'text-white' : 'text-primary'
              )} />
            </div>
          )}
        </div>
      </div>
    );
  }
);
StatCard.displayName = 'StatCard';

export { StatCard };
