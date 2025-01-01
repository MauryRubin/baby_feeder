'use client'

import { useState, useEffect } from 'react';
import FeedingModeSelector from './FeedingModeSelector';
import FeedingClock from './FeedingClock';
import FeedingHistory from './FeedingHistory';
import TimezoneSelector from './TimezoneSelector';
import { FeedingMode, FeedingSession, Settings, FeedingInterval } from '../types/feeding';
import Settings from './Settings';
import Timer from './Timer';

export default function FeedingTracker() {
  const [mounted, setMounted] = useState(false);
  const [selectedMode, setSelectedMode] = useState<FeedingMode | null>(null);
  const [isFeeding, setIsFeeding] = useState(false);
  const [feedingSessions, setFeedingSessions] = useState<FeedingSession[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [settings, setSettings] = useState<Settings>({
    timezone: (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        return 'UTC';
      }
    })(),
    volumeUnit: 'oz'
  });
  const [isPaused, setIsPaused] = useState(false);
  const [pausedDurations, setPausedDurations] = useState<{ start: Date; end?: Date }[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [feedingIntervals, setFeedingIntervals] = useState<FeedingInterval[]>([]);
  const [currentIntervalStart, setCurrentIntervalStart] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Convert volumes when unit changes
    if (settings.needsVolumeConversion && settings.previousUnit) {
      const convertVolume = (amount: number, from: 'oz' | 'ml', to: 'oz' | 'ml'): number => {
        if (from === to) return amount;
        // Convert oz to ml
        if (from === 'oz' && to === 'ml') {
          return Number((amount * 29.5735).toFixed(0));
        }
        // Convert ml to oz
        return Number((amount / 29.5735).toFixed(1));
      };

      // Convert volumes in feeding intervals
      setFeedingIntervals(prevIntervals => 
        prevIntervals.map(interval => {
          if (interval.mode.type === 'bottle' && interval.mode.volume) {
            return {
              ...interval,
              mode: {
                ...interval.mode,
                volume: {
                  amount: convertVolume(
                    interval.mode.volume.amount,
                    settings.previousUnit!,
                    settings.volumeUnit
                  ),
                  unit: settings.volumeUnit
                }
              }
            };
          }
          return interval;
        })
      );

      // Convert volume in selected mode if it exists
      if (selectedMode?.type === 'bottle' && selectedMode.volume) {
        setSelectedMode({
          ...selectedMode,
          volume: {
            amount: convertVolume(
              selectedMode.volume.amount,
              settings.previousUnit!,
              settings.volumeUnit
            ),
            unit: settings.volumeUnit
          }
        });
      }

      // Convert volumes in existing sessions
      setFeedingSessions(prevSessions => 
        prevSessions.map(session => ({
          ...session,
          mode: session.mode.type === 'bottle' && session.mode.volume ? {
            ...session.mode,
            volume: {
              amount: convertVolume(
                session.mode.volume.amount,
                settings.previousUnit!,
                settings.volumeUnit
              ),
              unit: settings.volumeUnit
            }
          } : session.mode,
          feedingIntervals: session.feedingIntervals.map(interval => {
            if (interval.mode.type === 'bottle' && interval.mode.volume) {
              return {
                ...interval,
                mode: {
                  ...interval.mode,
                  volume: {
                    amount: convertVolume(
                      interval.mode.volume.amount,
                      settings.previousUnit!,
                      settings.volumeUnit
                    ),
                    unit: settings.volumeUnit
                  }
                }
              };
            }
            return interval;
          })
        }))
      );

      // Clear the conversion flags after updating
      setSettings(prev => ({
        ...prev,
        needsVolumeConversion: false,
        previousUnit: undefined
      }));
    }
  }, [settings]);

  const isValidMode = (mode: FeedingMode | null): boolean => {
    if (!mode) return false;
    if (mode.type === 'bottle') return true;
    return mode.type === 'breast' && !!mode.side;
  };

  const handleModeSelect = (mode: FeedingMode) => {
    if (!isFeeding || isPaused) {
      // When selecting a new mode, preserve any existing volume from the previous mode
      if (selectedMode?.type === 'bottle' && selectedMode.volume && mode.type === 'breast') {
        // Store the volume before switching to breast
        const volumeToStore = selectedMode.volume;
        
        // Record the bottle interval before switching to breast
        if (currentIntervalStart) {
          const now = new Date();
          const intervalDuration = Math.floor((now.getTime() - currentIntervalStart.getTime()) / 1000);
          setFeedingIntervals(prev => [...prev, {
            mode: {
              type: 'bottle',
              volume: {
                amount: volumeToStore.amount,
                unit: settings.volumeUnit
              }
            },
            startTime: currentIntervalStart,
            endTime: now,
            duration: intervalDuration
          }]);
          setCurrentIntervalStart(now);
        }
      }
      
      // Ensure volume is properly set for bottle mode
      if (mode.type === 'bottle' && mode.volume) {
        mode = {
          ...mode,
          volume: {
            amount: Number(mode.volume.amount),
            unit: settings.volumeUnit
          }
        };
      }
      
      setSelectedMode(mode);
    }
  };

  const handleStartFeeding = () => {
    const now = new Date();
    setIsFeeding(true);
    setIsPaused(false);
    setStartTime(now);
    setCurrentIntervalStart(now);
    setPausedDurations([]);
    setTotalDuration(0);
    setFeedingIntervals([]);
  };

  const handlePauseFeeding = () => {
    const now = new Date();
    setIsPaused(true);
    setPausedDurations(prev => [...prev, { start: now }]);

    // Record the current feeding interval with the current selected mode
    if (currentIntervalStart && selectedMode) {
      const intervalDuration = Math.floor((now.getTime() - currentIntervalStart.getTime()) / 1000);
      
      // Create the interval with the appropriate mode data
      const interval: FeedingInterval = {
        mode: selectedMode.type === 'bottle' 
          ? {
              type: 'bottle',
              volume: selectedMode.volume // Preserve the volume for bottle feeds
            }
          : {
              type: 'breast',
              side: selectedMode.side
            },
        startTime: currentIntervalStart,
        endTime: now,
        duration: intervalDuration
      };
      
      setFeedingIntervals(prev => [...prev, interval]);
      setCurrentIntervalStart(null);
    }
  };

  const handleResumeFeeding = () => {
    const now = new Date();
    setIsPaused(false);
    setCurrentIntervalStart(now); // Set new interval start time on resume
    setPausedDurations(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].end = now;
      }
      return updated;
    });
  };

  const handleStopFeeding = (duration: number) => {
    if (startTime && selectedMode) {
      const endTime = new Date();
      
      // Record the final feeding interval with the current selected mode
      if (currentIntervalStart) {
        const finalInterval = {
          mode: selectedMode.type === 'bottle' 
            ? {
                type: 'bottle',
                volume: selectedMode.volume // Preserve the volume for bottle feeds
              }
            : {
                type: 'breast',
                side: selectedMode.side
              },
          startTime: currentIntervalStart,
          endTime,
          duration: Math.floor((endTime.getTime() - currentIntervalStart.getTime()) / 1000)
        };
        setFeedingIntervals(prev => [...prev, finalInterval]);
      }

      // Calculate total paused duration
      const pausedMilliseconds = pausedDurations.reduce((total, pause) => {
        const endPause = pause.end || endTime;
        return total + (endPause.getTime() - pause.start.getTime());
      }, 0);

      const adjustedDuration = Math.max(0, duration - Math.floor(pausedMilliseconds / 1000));

      // Create the session with all intervals and the last used mode
      const newSession: FeedingSession = {
        id: Date.now().toString(),
        startTime,
        endTime,
        duration: adjustedDuration,
        mode: selectedMode.type === 'bottle' 
          ? {
              type: 'bottle',
              volume: selectedMode.volume // Preserve the volume in session mode
            }
          : {
              type: 'breast',
              side: selectedMode.side
            },
        feedingIntervals: [...feedingIntervals, ...(currentIntervalStart ? [{
          mode: selectedMode.type === 'bottle' 
            ? {
                type: 'bottle',
                volume: selectedMode.volume // Preserve the volume in final interval
              }
            : {
                type: 'breast',
                side: selectedMode.side
              },
          startTime: currentIntervalStart,
          endTime,
          duration: Math.floor((endTime.getTime() - currentIntervalStart.getTime()) / 1000)
        }] : [])],
        pausedIntervals: pausedDurations.map(pause => ({
          start: pause.start,
          end: pause.end || endTime
        }))
      };

      setFeedingSessions(prev => [...prev, newSession]);
    }
    // Reset states
    setIsFeeding(false);
    setStartTime(null);
    setCurrentIntervalStart(null);
    setPausedDurations([]);
    setTotalDuration(0);
    setFeedingIntervals([]);
  };

  const handleUpdateSession = (updatedSession: FeedingSession) => {
    setFeedingSessions(prevSessions => {
      // If the session exists, update it
      if (prevSessions.some(session => session.id === updatedSession.id)) {
        return prevSessions.map(session =>
          session.id === updatedSession.id ? updatedSession : session
        );
      }
      // If it's a new session, add it to the array
      return [...prevSessions, updatedSession];
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    setFeedingSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  if (!mounted) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="space-y-4 mb-6">
            <div className="flex gap-4 justify-center">
              <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
          <div className="text-center">
            <div className="h-12 w-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-14 w-40 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <FeedingModeSelector 
          selectedMode={selectedMode} 
          onModeSelect={handleModeSelect}
          disabled={isFeeding && !isPaused}
          settings={settings}
        />
        <Timer
          isActive={isFeeding}
          isPaused={isPaused}
          onStart={handleStartFeeding}
          onPause={handlePauseFeeding}
          onResume={handleResumeFeeding}
          onStop={handleStopFeeding}
          disabled={!isValidMode(selectedMode)}
          totalDuration={totalDuration}
        />
        <FeedingHistory 
          sessions={feedingSessions} 
          timezone={settings.timezone}
          onUpdateSession={handleUpdateSession}
          onDeleteSession={handleDeleteSession}
          settings={settings}
        />
      </div>
      <Settings 
        settings={settings}
        onSettingsChange={setSettings}
      />
    </>
  );
} 