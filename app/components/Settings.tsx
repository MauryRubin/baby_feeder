'use client'

import { useState } from 'react';
import TimezoneSelector from './TimezoneSelector';
import { Settings } from '../types/feeding';

type Props = {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
};

export default function Settings({ settings, onSettingsChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleVolumeUnitChange = (newVolumeUnit: 'oz' | 'ml') => {
    if (newVolumeUnit === settings.volumeUnit) return;
    onSettingsChange({ 
      ...settings, 
      volumeUnit: newVolumeUnit,
      needsVolumeConversion: true,
      previousUnit: settings.volumeUnit
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Settings"
      >
        <svg
          className="w-6 h-6 text-gray-600 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <TimezoneSelector 
                value={settings.timezone} 
                onChange={(timezone) => onSettingsChange({ ...settings, timezone })} 
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Volume Unit
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVolumeUnitChange('oz')}
                    className={`px-4 py-2 rounded-lg ${
                      settings.volumeUnit === 'oz'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Ounces (oz)
                  </button>
                  <button
                    onClick={() => handleVolumeUnitChange('ml')}
                    className={`px-4 py-2 rounded-lg ${
                      settings.volumeUnit === 'ml'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Milliliters (ml)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 