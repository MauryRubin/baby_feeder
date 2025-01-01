'use client'

import { useState } from 'react';
import { FeedingMode, FeedingSession, FeedingInterval, Settings } from '../types/feeding';

type Props = {
  session: FeedingSession;
  onSave: (updatedSession: FeedingSession) => void;
  onCancel: () => void;
  settings: Settings;
};

export default function EditFeedingModal({ session, onSave, onCancel, settings }: Props) {
  const [date, setDate] = useState(() => {
    const d = new Date(session.startTime);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [intervals, setIntervals] = useState<FeedingInterval[]>(session.feedingIntervals);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateTimeRange = (startTime: Date, endTime: Date, index: number): boolean => {
    if (endTime < startTime) {
      setErrors(prev => ({
        ...prev,
        [`interval-${index}`]: 'End time cannot be before start time'
      }));
      return false;
    }
    
    // Clear error if valid
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[`interval-${index}`];
      return updated;
    });
    return true;
  };

  const handleIntervalUpdate = (index: number, updates: Partial<FeedingInterval>) => {
    setIntervals(prev => {
      const updated = [...prev];
      const currentInterval = { ...updated[index] };

      if (updates.mode?.type === 'bottle') {
        // Preserve existing volume if available
        currentInterval.mode = {
          type: 'bottle',
          volume: {
            amount: currentInterval.mode.type === 'bottle' ? currentInterval.mode.volume?.amount || 0 : 0,
            unit: settings.volumeUnit
          }
        };
      } else if (updates.mode?.type === 'breast') {
        currentInterval.mode = {
          type: 'breast',
          side: 'left'
        };
      }

      // Handle volume updates separately
      if (updates.mode?.volume) {
        currentInterval.mode = {
          type: 'bottle',
          volume: {
            amount: updates.mode.volume.amount,
            unit: settings.volumeUnit
          }
        };
      }

      updated[index] = {
        ...currentInterval,
        ...updates,
        mode: currentInterval.mode
      };
      return updated;
    });
  };

  const handleDeleteInterval = (index: number) => {
    setIntervals(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddInterval = () => {
    const lastInterval = intervals[intervals.length - 1];
    const newInterval: FeedingInterval = {
      mode: { type: 'breast', side: 'left' },
      startTime: lastInterval ? new Date(lastInterval.endTime) : new Date(session.startTime),
      endTime: lastInterval ? new Date(lastInterval.endTime.getTime() + 5 * 60000) : new Date(session.startTime.getTime() + 5 * 60000),
      duration: 300 // 5 minutes default
    };
    setIntervals(prev => [...prev, newInterval]);
  };

  const handleSave = () => {
    // Validate all intervals
    let isValid = true;
    intervals.forEach((interval, index) => {
      if (!validateTimeRange(new Date(interval.startTime), new Date(interval.endTime), index)) {
        isValid = false;
      }
    });

    if (!isValid) {
      return; // Don't save if there are validation errors
    }

    // Sort intervals by start time
    const sortedIntervals = [...intervals].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    // Apply the selected date to all intervals
    const [year, month, day] = date.split('-').map(Number);
    sortedIntervals.forEach(interval => {
      const startTime = new Date(interval.startTime);
      const endTime = new Date(interval.endTime);
      
      startTime.setFullYear(year, month - 1, day);
      endTime.setFullYear(year, month - 1, day);
      
      // Handle case where feeding crosses midnight
      if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }
      
      interval.startTime = startTime;
      interval.endTime = endTime;
    });

    // Calculate total duration and validate times
    let totalDuration = 0;
    sortedIntervals.forEach((interval, i) => {
      totalDuration += interval.duration;
      
      // Ensure intervals don't overlap
      if (i > 0) {
        const prevEnd = new Date(sortedIntervals[i-1].endTime);
        if (new Date(interval.startTime) < prevEnd) {
          interval.startTime = prevEnd;
          interval.duration = Math.floor((new Date(interval.endTime).getTime() - prevEnd.getTime()) / 1000);
        }
      }
    });

    const updatedSession: FeedingSession = {
      ...session,
      startTime: sortedIntervals[0].startTime,
      endTime: sortedIntervals[sortedIntervals.length - 1].endTime,
      duration: totalDuration,
      mode: sortedIntervals[sortedIntervals.length - 1].mode, // Last used mode
      feedingIntervals: sortedIntervals
    };

    onSave(updatedSession);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {session.id.startsWith('new-') ? 'Add Feeding Session' : 'Edit Feeding Session'}
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Feeding Intervals</h3>
              <button
                onClick={handleAddInterval}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Interval
              </button>
            </div>

            {intervals.map((interval, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900 dark:text-white">Interval {index + 1}</h4>
                  <button
                    onClick={() => handleDeleteInterval(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Feed Type
                    </label>
                    <select
                      value={interval.mode.type}
                      onChange={(e) => handleIntervalUpdate(index, {
                        mode: { ...interval.mode, type: e.target.value as 'bottle' | 'breast' }
                      })}
                      className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                    >
                      <option value="bottle">Bottle</option>
                      <option value="breast">Breast</option>
                    </select>
                  </div>

                  {interval.mode.type === 'breast' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Side
                      </label>
                      <select
                        value={interval.mode.side || 'left'}
                        onChange={(e) => handleIntervalUpdate(index, {
                          mode: { ...interval.mode, side: e.target.value as 'left' | 'right' }
                        })}
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  )}

                  {interval.mode.type === 'bottle' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Volume ({settings.volumeUnit})
                      </label>
                      <input
                        type="number"
                        value={interval.mode.volume?.amount || ''}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          handleIntervalUpdate(index, {
                            mode: {
                              type: 'bottle',
                              volume: {
                                amount: newValue === '' ? 0 : parseFloat(newValue),
                                unit: settings.volumeUnit
                              }
                            }
                          });
                        }}
                        min="0"
                        step={settings.volumeUnit === 'oz' ? '0.5' : '5'}
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={new Date(interval.startTime).toTimeString().slice(0, 5)}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        const newDate = new Date(interval.startTime);
                        newDate.setHours(hours, minutes);
                        handleIntervalUpdate(index, { startTime: newDate });
                      }}
                      className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={new Date(interval.endTime).toTimeString().slice(0, 5)}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        const newDate = new Date(interval.endTime);
                        newDate.setHours(hours, minutes);
                        handleIntervalUpdate(index, { 
                          endTime: newDate,
                          duration: Math.floor((newDate.getTime() - new Date(interval.startTime).getTime()) / 1000)
                        });
                      }}
                      className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                </div>

                {errors[`interval-${index}`] && (
                  <div className="mt-2 text-red-500 text-sm">
                    {errors[`interval-${index}`]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {session.id.startsWith('new-') ? 'Add Feed' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
} 