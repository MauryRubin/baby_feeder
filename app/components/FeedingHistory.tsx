'use client'

import { useState, useEffect, useMemo } from 'react';
import { FeedingSession, Settings, FeedingInterval, FeedingMode, BottleMode } from '../types/feeding';
import EditFeedingModal from './EditFeedingModal';

// Add type validation helper
const isValidDate = (date: any): date is Date | string => {
  if (date instanceof Date) return true;
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }
  return false;
};

// Update the toDate function
const toDate = (date: Date | string): Date => {
  if (date instanceof Date) return date;
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    console.error('Invalid date:', date);
    return new Date(); // Fallback to current date
  }
  return parsed;
};

type Props = {
  sessions: FeedingSession[];
  timezone: string;
  onUpdateSession: (updatedSession: FeedingSession) => void;
  onDeleteSession: (sessionId: string) => void;
  settings: Settings;
};

// Type guard for bottle mode
const isBottleMode = (mode: FeedingMode): mode is BottleMode => 
  mode.type === 'bottle';

export default function FeedingHistory({ sessions, timezone, onUpdateSession, onDeleteSession, settings }: Props) {
  const [mounted, setMounted] = useState(false);
  const [editingSession, setEditingSession] = useState<FeedingSession | null>(null);
  const [deletingSession, setDeletingSession] = useState<FeedingSession | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'volume' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTime = (date: Date | string) => {
    if (!mounted) return '--:--';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
      hour12: true,
    }).format(toDate(date));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleSaveEdit = (updatedSession: FeedingSession) => {
    onUpdateSession(updatedSession);
    setEditingSession(null);
  };

  const formatDate = (date: Date | string) => {
    if (!mounted) return '--/--';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: timezone,
    }).format(toDate(date));
  };

  // Calculate stats
  const stats = useMemo(() => {
    let totalVolume = 0;
    let totalDuration = 0;
    let totalFeeds = 0;

    sessions.forEach(session => {
      if (session.duration) {
        totalDuration += session.duration;
      }
      totalFeeds++;
      
      session.feedingIntervals.forEach(interval => {
        if (isBottleMode(interval.mode)) {
          totalVolume += interval.mode.volume.amount;
        }
      });
    });

    return {
      avgVolume: totalFeeds > 0 ? Math.round(totalVolume / totalFeeds * 10) / 10 : 0,
      avgDuration: totalFeeds > 0 ? Math.round(totalDuration / totalFeeds) : 0,
      totalFeeds
    };
  }, [sessions]);

  // Sort sessions with safe date handling
  const sortedSessions = useMemo(() => {
    const calculateTotalVolume = (session: FeedingSession) => {
      return session.feedingIntervals.reduce((sum, interval) => {
        if (isBottleMode(interval.mode)) {
          return sum + interval.mode.volume.amount;
        }
        return sum;
      }, 0);
    };

    return [...sessions].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = toDate(b.startTime).getTime() - toDate(a.startTime).getTime();
          break;
        case 'volume':
          const volumeA = calculateTotalVolume(a);
          const volumeB = calculateTotalVolume(b);
          comparison = volumeB - volumeA;
          break;
        case 'duration':
          comparison = (b.duration || 0) - (a.duration || 0);
          break;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });
  }, [sessions, sortBy, sortOrder]);

  const handleAddNewSession = () => {
    const now = new Date();
    const defaultInterval: FeedingInterval = {
      mode: { type: 'breast', side: 'left' },
      startTime: now,
      endTime: new Date(now.getTime() + 15 * 60000),
      duration: 900
    };

    const defaultSession: FeedingSession = {
      id: `new-${Date.now()}`,
      startTime: now,
      endTime: new Date(now.getTime() + 15 * 60000),
      duration: 900,
      mode: { type: 'breast', side: 'left' },
      feedingIntervals: [defaultInterval],
      pausedIntervals: []
    };
    
    setEditingSession(defaultSession);
  };

  if (!mounted) {
    return (
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Feeding History</h2>
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Feeding Stats</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg Volume</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">
            {stats.avgVolume}{settings.volumeUnit}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg Duration</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatDuration(stats.avgDuration)}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Feeds</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">
            {stats.totalFeeds}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Feeding History</h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleAddNewSession}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Add Feed
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'volume' | 'duration')}
            className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
          >
            <option value="date">Date</option>
            <option value="volume">Volume</option>
            <option value="duration">Duration</option>
          </select>
          <button
            onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {sortedSessions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">No feeding sessions recorded yet</p>
      ) : (
        <div className="space-y-4">
          {sortedSessions.map(session => (
            <div
              key={session.id}
              className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="flex justify-between items-center">
                <div className="flex-grow">
                  <div className="text-gray-900 dark:text-white font-medium">
                    {session.feedingIntervals.map((interval, idx) => (
                      <span key={idx}>
                        {idx > 0 && " → "}
                        {interval.mode.type === 'bottle' ? '🍼' : '🤱'} 
                        {interval.mode.type}
                        {interval.mode.side && ` (${interval.mode.side})`}
                        {interval.mode.volume && ` - ${interval.mode.volume.amount}${interval.mode.volume.unit}`}
                        {` (${formatDuration(interval.duration)})`}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(session.startTime)} • {formatTime(session.startTime)} - {formatTime(session.endTime)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingSession(session)}
                    className="p-2 text-blue-500 hover:text-blue-600"
                    aria-label="Edit session"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeletingSession(session)}
                    className="p-2 text-red-500 hover:text-red-600"
                    aria-label="Delete session"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingSession && (
        <EditFeedingModal
          session={editingSession}
          onSave={handleSaveEdit}
          onCancel={() => {
            setEditingSession(null);
          }}
          settings={settings}
        />
      )}

      {deletingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Delete Feeding Session</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this feeding session? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeletingSession(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteSession(deletingSession.id);
                  setDeletingSession(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 