export interface BottleMode {
  type: 'bottle';
  volume: {
    amount: number;
    unit: 'oz' | 'ml';
  };
}

export interface BreastMode {
  type: 'breast';
  side: 'left' | 'right';
}

export type FeedingMode = BottleMode | BreastMode;

export interface FeedingInterval {
  mode: FeedingMode;
  startTime: Date | string;
  endTime: Date | string;
  duration: number;
}

export interface FeedingSession {
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  duration: number;
  mode: FeedingMode;
  feedingIntervals: FeedingInterval[];
  pausedIntervals: { start: Date | string; end?: Date | string }[];
}

export interface Settings {
  timezone: string;
  volumeUnit: 'oz' | 'ml';
  needsVolumeConversion?: boolean;
  previousUnit?: 'oz' | 'ml';
} 