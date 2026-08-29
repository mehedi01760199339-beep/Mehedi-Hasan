import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';

interface PullToRefreshContainerProps {
  onRefresh: () => Promise<void> | void;
  isRefreshing: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}

const PULL_THRESHOLD = 75; // px required to trigger refresh
const MAX_PULL_DISTANCE = 120; // maximum visual drag distance

export const PullToRefreshContainer: React.FC<PullToRefreshContainerProps> = ({
  onRefresh,
  isRefreshing,
  children,
  disabled = false,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientY: number) => {
    if (disabled || isRefreshing) return;
    // Check if container or target is scrolled to the top
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop <= 0) {
      startYRef.current = clientY;
      setIsPulling(true);
    }
  };

  const handleMove = useCallback((clientY: number) => {
    if (startYRef.current === null || disabled || isRefreshing) return;
    const diff = clientY - startYRef.current;
    if (diff > 0) {
      // Apply rubber-band damping
      const dampedDistance = Math.min(MAX_PULL_DISTANCE, Math.pow(diff, 0.85) * 1.8);
      setPullDistance(dampedDistance);
    } else {
      setPullDistance(0);
    }
  }, [disabled, isRefreshing]);

  const handleEnd = useCallback(async () => {
    if (startYRef.current === null) return;
    startYRef.current = null;
    setIsPulling(false);

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setPullDistance(50); // Keep spinner visible during refresh
      try {
        await onRefresh();
      } finally {
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isPulling && e.touches.length === 1) {
      handleMove(e.touches[0].clientY);
    }
  };

  const onTouchEnd = () => {
    handleEnd();
  };

  // Mouse handlers for desktop browser preview
  const isMouseDownRef = useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isMouseDownRef.current = true;
      handleStart(e.clientY);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isMouseDownRef.current && isPulling) {
      handleMove(e.clientY);
    }
  };

  const onMouseUp = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      handleEnd();
    }
  };

  useEffect(() => {
    if (!isRefreshing && pullDistance > 0 && !isPulling) {
      setPullDistance(0);
    }
  }, [isRefreshing, pullDistance, isPulling]);

  const progressRatio = Math.min(1, pullDistance / PULL_THRESHOLD);
  const isReadyToRelease = pullDistance >= PULL_THRESHOLD;

  return (
    <div
      ref={containerRef}
      id="pull-to-refresh-container"
      className="relative w-full h-full flex flex-col overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Android SwipeRefresh Indicator Badge */}
      <div
        id="swipe-refresh-indicator"
        style={{
          transform: `translateY(${pullDistance > 0 || isRefreshing ? Math.max(10, pullDistance * 0.7) : -60}px)`,
          opacity: pullDistance > 10 || isRefreshing ? 1 : 0,
          transition: isPulling ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease',
        }}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 bg-white text-slate-800 rounded-full shadow-lg border border-slate-200"
      >
        <div className="relative flex items-center justify-center">
          {isRefreshing ? (
            <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#004D40' }} />
          ) : (
            <div
              style={{ transform: `rotate(${progressRatio * 360}deg)` }}
              className="flex items-center justify-center transition-transform duration-75"
            >
              {isReadyToRelease ? (
                <RefreshCw className="w-4 h-4" style={{ color: '#004D40' }} />
              ) : (
                <ArrowDown className="w-4 h-4 text-slate-500" />
              )}
            </div>
          )}
        </div>
        <span className="text-xs font-semibold tracking-tight text-slate-700">
          {isRefreshing
            ? 'রিফ্রেশ হচ্ছে...'
            : isReadyToRelease
            ? 'ছেড়ে দিন (Release to reload)'
            : 'নিচে টানুন (Pull to refresh)'}
        </span>
      </div>

      {/* Main Content with subtle displacement when pulling */}
      <div
        style={{
          transform: `translateY(${pullDistance * 0.25}px)`,
          transition: isPulling ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="flex-1 w-full h-full flex flex-col overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
};
