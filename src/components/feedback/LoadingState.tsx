import * as React from 'react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingState({ 
  variant = 'spinner', 
  size = 'md', 
  text,
  className 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3 py-8',
      className
    )}>
      {variant === 'spinner' && (
        <div className={cn(
          'rounded-full border-2 border-muted border-t-primary animate-spin',
          sizeClasses[size]
        )} />
      )}
      
      {variant === 'dots' && (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-full bg-primary animate-bounce-subtle',
                size === 'sm' ? 'h-1.5 w-1.5' : size === 'lg' ? 'h-3 w-3' : 'h-2 w-2'
              )}
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      )}
      
      {variant === 'pulse' && (
        <div className={cn(
          'rounded-full bg-primary/20 animate-pulse-scale',
          sizeClasses[size]
        )}>
          <div className="w-full h-full rounded-full bg-primary/40 animate-ping" />
        </div>
      )}
      
      {variant === 'skeleton' && (
        <div className="w-full space-y-3">
          <div className="h-4 bg-muted rounded-lg animate-shimmer" />
          <div className="h-4 bg-muted rounded-lg w-3/4 animate-shimmer" style={{ animationDelay: '100ms' }} />
          <div className="h-4 bg-muted rounded-lg w-1/2 animate-shimmer" style={{ animationDelay: '200ms' }} />
        </div>
      )}
      
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn(
      'rounded-2xl border bg-card p-4 space-y-3',
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted animate-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4 animate-shimmer" />
          <div className="h-3 bg-muted rounded w-1/2 animate-shimmer" />
        </div>
      </div>
      <div className="h-20 bg-muted rounded-lg animate-shimmer" />
    </div>
  );
}

interface SkeletonListProps {
  count?: number;
  className?: string;
}

export function SkeletonList({ count = 3, className }: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-3 p-3 rounded-xl border bg-card"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="h-12 w-12 rounded-xl bg-muted animate-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-2/3 animate-shimmer" />
            <div className="h-3 bg-muted rounded w-1/3 animate-shimmer" />
          </div>
          <div className="h-8 w-16 bg-muted rounded-lg animate-shimmer" />
        </div>
      ))}
    </div>
  );
}
