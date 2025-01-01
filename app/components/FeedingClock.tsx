'use client'

import { useState, useEffect } from 'react';

type Props = {
  isActive: boolean;
  onStart: () => void;
  onStop: (duration: number) => void;
  disabled: boolean;
  timezone: string;
};

export default function FeedingClock({ isActive, onStart, onStop, disabled, timezone }: Props) {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [mounted]);

  useEffect(() => {
    if (isActive && !startTime) {
      setStartTime(new Date());
    } else if (!isActive && startTime) {
      const duration = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      onStop(duration);
      setStartTime(null);
    }
  }, [isActive, startTime, onStop]);

  const formatTime = (date: Date) => {
    if (!mounted) return '--:--:-- --';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: timezone,
    }).format(date);
  };

  if (!mounted) {
    return (
      <div className="text-center">
        <div className="text-4xl font-bold mb-4 dark:text-white">--:--:-- --</div>
        <button
          disabled
          className="px-8 py-4 rounded-full text-white text-lg font-bold bg-gray-400 cursor-not-allowed"
        >
          Start Feeding
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-4xl font-bold mb-4 dark:text-white">
        {formatTime(currentTime)}
      </div>
      <button
        onClick={isActive ? () => onStop(0) : onStart}
        disabled={disabled}
        className={`px-8 py-4 rounded-full text-white text-lg font-bold ${
          isActive
            ? 'bg-red-500 hover:bg-red-600'
            : disabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600'
        } transition-colors`}
      >
        {isActive ? 'Stop Feeding' : 'Start Feeding'}
      </button>
    </div>
  );
} 