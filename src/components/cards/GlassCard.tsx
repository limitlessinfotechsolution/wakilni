import * as React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'heavy' | 'gradient';
  glow?: boolean;
  hoverable?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'light', glow = false, hoverable = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border transition-all',
          variant === 'light' && 'glass-card',
          variant === 'heavy' && 'glass-card-heavy',
          variant === 'gradient' && [
            'bg-gradient-to-br from-card/95 to-card/80',
            'backdrop-blur-xl border-white/20 dark:border-white/10',
          ],
          glow && 'hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]',
          hoverable && 'hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]',
          'duration-200',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

interface GlassCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const GlassCardHeader = React.forwardRef<HTMLDivElement, GlassCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-4 md:p-6', className)}
      {...props}
    />
  )
);
GlassCardHeader.displayName = 'GlassCardHeader';

interface GlassCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const GlassCardContent = React.forwardRef<HTMLDivElement, GlassCardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-4 md:p-6 pt-0', className)} {...props} />
  )
);
GlassCardContent.displayName = 'GlassCardContent';

interface GlassCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const GlassCardFooter = React.forwardRef<HTMLDivElement, GlassCardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-4 md:p-6 pt-0', className)}
      {...props}
    />
  )
);
GlassCardFooter.displayName = 'GlassCardFooter';

export { GlassCard, GlassCardHeader, GlassCardContent, GlassCardFooter };
