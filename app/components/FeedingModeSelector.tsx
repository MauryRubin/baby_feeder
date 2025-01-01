'use client'

import { FeedingMode, Settings } from '../types/feeding';
import { useState } from 'react';

type Props = {
  selectedMode: FeedingMode | null;
  onModeSelect: (mode: FeedingMode) => void;
  disabled: boolean;
  settings: Settings;
};

export default function FeedingModeSelector({ selectedMode, onModeSelect, disabled, settings }: Props) {
  const [volume, setVolume] = useState<number | undefined>(selectedMode?.type === 'bottle' ? selectedMode.volume?.amount : undefined);

  const handleModeSelect = (newMode: Partial<FeedingMode>) => {
    if (newMode.type === 'bottle') {
      onModeSelect({
        type: 'bottle',
        volume: volume ? { amount: volume, unit: settings.volumeUnit } : undefined
      });
    } else if (newMode.type === 'breast' && newMode.side) {
      onModeSelect({
        type: 'breast',
        side: newMode.side
      });
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => handleModeSelect({ type: 'bottle' })}
          className={`px-6 py-3 rounded-lg ${
            selectedMode?.type === 'bottle'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          disabled={disabled}
        >
          🍼 Bottle
        </button>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleModeSelect({ type: 'breast', side: 'left' })}
            className={`px-6 py-2 rounded-lg ${
              selectedMode?.type === 'breast' && selectedMode.side === 'left'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            disabled={disabled}
          >
            🤱 Left
          </button>
          <button
            onClick={() => handleModeSelect({ type: 'breast', side: 'right' })}
            className={`px-6 py-2 rounded-lg ${
              selectedMode?.type === 'breast' && selectedMode.side === 'right'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            disabled={disabled}
          >
            🤱 Right
          </button>
        </div>
      </div>

      {selectedMode?.type === 'bottle' && (
        <div className="max-w-xs mx-auto">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Volume ({settings.volumeUnit})
          </label>
          <input
            type="number"
            value={volume ?? ''}
            onChange={(e) => {
              const inputValue = e.target.value;
              const newVolume = inputValue ? Number(inputValue) : undefined;
              setVolume(newVolume);
              
              // Only update the mode if we have a valid number
              if (newVolume !== undefined) {
                onModeSelect({
                  type: 'bottle',
                  volume: {
                    amount: newVolume,
                    unit: settings.volumeUnit
                  }
                });
              }
            }}
            disabled={disabled}
            min="0"
            step={settings.volumeUnit === 'oz' ? '0.5' : '5'}
            placeholder={`Enter amount in ${settings.volumeUnit}`}
            className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
          />
        </div>
      )}
    </div>
  );
} 