'use client'

import { useState, useEffect, useCallback } from 'react';
import { FeedingMode, FeedingSession, Settings, FeedingInterval } from '../types/feeding';
import { config } from '../lib/config';

export default function FeedingTracker() {
  const [mounted, setMounted] = useState(false);
  
  // Initialize with null to prevent hydration mismatch
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [settings, setSettings] = useState<Settings>({
    timezone: config.timezone,
    volumeUnit: config.defaultUnit
  });

  // Ensure client-side only rendering for date-dependent components
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe date conversion helper
  const toDate = (date: Date | string | null): Date | null => {
    if (!date) return null;
    try {
      return date instanceof Date ? date : new Date(date);
    } catch {
      return null;
    }
  };

  // Rest of your component...
  if (!mounted) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    // Your JSX...
  );
} 