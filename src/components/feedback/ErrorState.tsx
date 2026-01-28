import * as React from 'react';
import { AlertCircle, WifiOff, ServerCrash, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ErrorType = 'generic' | 'network' | 'server' | 'notFound';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

const errorConfig: Record<ErrorType, { icon: React.ElementType; title: string; description: string }> = {
  generic: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
  },
  network: {
    icon: WifiOff,
    title: 'No connection',
    description: 'Please check your internet connection and try again.',
  },
  server: {
    icon: ServerCrash,
    title: 'Server error',
    description: 'Our servers are having trouble. Please try again later.',
  },
  notFound: {
    icon: AlertCircle,
    title: 'Not found',
    description: 'The resource you\'re looking for doesn\'t exist.',
  },
};

export function ErrorState({ 
  type = 'generic',
  title,
  description,
  onRetry,
  className 
}: ErrorStateProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      'animate-fade-in-up',
      className
    )}>
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-destructive" />
      </div>
      
      <h3 className="font-semibold text-lg mb-1">
        {title || config.title}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {description || config.description}
      </p>
      
      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline" 
          className="rounded-xl"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
