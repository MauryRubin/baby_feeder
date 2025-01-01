'use client'

import { useState, useEffect } from 'react';

type Props = {
  isActive: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: (duration: number) => void;
  disabled: boolean;
  totalDuration: number;
  idleTimeout?: number; // in minutes, defaults to 30
};

export default function Timer({ 
  isActive, 
  isPaused, 
  onStart, 
  onPause, 
  onResume, 
  onStop, 
  disabled, 
  totalDuration,
  idleTimeout = 30 
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(totalDuration);
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, mounted]);

  useEffect(() => {
    // Handle idle timeout when paused
    if (isPaused) {
      const timeout = setTimeout(() => {
        if (confirm(`This feeding session has been paused for ${idleTimeout} minutes. Would you like to end it?`)) {
          handleStop();
        }
      }, idleTimeout * 60 * 1000);
      setIdleTimer(timeout);
    } else {
      if (idleTimer) {
        clearTimeout(idleTimer);
        setIdleTimer(null);
      }
    }

    return () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
    };
  }, [isPaused, idleTimeout]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStop = () => {
    onStop(time);
    setTime(0);
  };

  if (!mounted) {
    return (
      <div className="text-center">
        <div className="text-4xl font-bold mb-4 dark:text-white">00:00</div>
        <div className="space-x-4">
          <button disabled className="px-6 py-3 rounded-full text-white text-lg font-bold bg-gray-400 cursor-not-allowed">
            Start Feeding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-4xl font-bold mb-4 dark:text-white">
        {formatTime(time)}
      </div>
      <div className="space-x-4">
        {!isActive && (
          <button
            onClick={onStart}
            disabled={disabled}
            className={`px-6 py-3 rounded-full text-white text-lg font-bold ${
              disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            } transition-colors`}
          >
            Start Feeding
          </button>
        )}
        {isActive && !isPaused && (
          <>
            <button
              onClick={onPause}
              className="px-6 py-3 rounded-full text-white text-lg font-bold bg-yellow-500 hover:bg-yellow-600 transition-colors"
            >
              Pause
            </button>
            <button
              onClick={handleStop}
              className="px-6 py-3 rounded-full text-white text-lg font-bold bg-red-500 hover:bg-red-600 transition-colors"
            >
              End Feed
            </button>
          </>
        )}
        {isActive && isPaused && (
          <>
            <button
              onClick={onResume}
              className="px-6 py-3 rounded-full text-white text-lg font-bold bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              Resume
            </button>
            <button
              onClick={handleStop}
              className="px-6 py-3 rounded-full text-white text-lg font-bold bg-red-500 hover:bg-red-600 transition-colors"
            >
              End Feed
            </button>
          </>
        )}
      </div>
    </div>
  );
} 