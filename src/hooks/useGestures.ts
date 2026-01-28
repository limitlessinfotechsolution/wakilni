import { useCallback, useRef, useState, useEffect } from 'react';

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  isSwiping: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
}

interface SwipeConfig {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: (direction: SwipeState['direction']) => void;
}

export function useSwipeGesture<T extends HTMLElement>(config: SwipeConfig = {}) {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeStart,
    onSwipeEnd,
  } = config;

  const ref = useRef<T>(null);
  const [state, setState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    isSwiping: false,
    direction: null,
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      isSwiping: true,
      direction: null,
    });
    onSwipeStart?.();
  }, [onSwipeStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!state.isSwiping) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;
    
    let direction: SwipeState['direction'] = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    setState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX,
      deltaY,
      direction,
    }));
  }, [state.isSwiping, state.startX, state.startY]);

  const handleTouchEnd = useCallback(() => {
    const { deltaX, deltaY, direction } = state;
    
    if (Math.abs(deltaX) > threshold && (direction === 'left' || direction === 'right')) {
      if (direction === 'left') onSwipeLeft?.();
      if (direction === 'right') onSwipeRight?.();
    }
    
    if (Math.abs(deltaY) > threshold && (direction === 'up' || direction === 'down')) {
      if (direction === 'up') onSwipeUp?.();
      if (direction === 'down') onSwipeDown?.();
    }

    onSwipeEnd?.(direction);
    
    setState(prev => ({
      ...prev,
      isSwiping: false,
    }));
  }, [state, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipeEnd]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { ref, state };
}

interface LongPressConfig {
  delay?: number;
  onLongPress?: () => void;
  onPressStart?: () => void;
  onPressEnd?: () => void;
}

export function useLongPress<T extends HTMLElement>(config: LongPressConfig = {}) {
  const { delay = 500, onLongPress, onPressStart, onPressEnd } = config;
  
  const ref = useRef<T>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const [isPressed, setIsPressed] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState(false);

  const start = useCallback(() => {
    setIsPressed(true);
    onPressStart?.();
    
    timerRef.current = setTimeout(() => {
      setIsLongPressed(true);
      onLongPress?.();
    }, delay);
  }, [delay, onLongPress, onPressStart]);

  const stop = useCallback(() => {
    setIsPressed(false);
    setIsLongPressed(false);
    onPressEnd?.();
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [onPressEnd]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', start, { passive: true });
    element.addEventListener('touchend', stop, { passive: true });
    element.addEventListener('touchcancel', stop, { passive: true });
    element.addEventListener('mousedown', start);
    element.addEventListener('mouseup', stop);
    element.addEventListener('mouseleave', stop);

    return () => {
      element.removeEventListener('touchstart', start);
      element.removeEventListener('touchend', stop);
      element.removeEventListener('touchcancel', stop);
      element.removeEventListener('mousedown', start);
      element.removeEventListener('mouseup', stop);
      element.removeEventListener('mouseleave', stop);
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [start, stop]);

  return { ref, isPressed, isLongPressed };
}

interface PullToRefreshConfig {
  threshold?: number;
  onRefresh: () => Promise<void>;
}

export function usePullToRefresh<T extends HTMLElement>(config: PullToRefreshConfig) {
  const { threshold = 80, onRefresh } = config;
  
  const ref = useRef<T>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (ref.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    // Apply resistance
    const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);
    setPullDistance(resistedDistance);
  }, [isPulling, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    
    setPullDistance(0);
    setIsPulling(false);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / threshold, 1);
  const isTriggered = pullDistance >= threshold;

  return { ref, pullDistance, isRefreshing, isPulling, progress, isTriggered };
}
