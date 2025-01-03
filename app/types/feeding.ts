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
  startTime: Date;
  endTime: Date;
  duration: number;
}

export interface FeedingSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  mode: FeedingMode;
  feedingIntervals: FeedingInterval[];
  pausedIntervals: { start: Date; end?: Date }[];
}

export interface Settings {
  timezone: string;
  volumeUnit: 'oz' | 'ml';
  needsVolumeConversion?: boolean;
  previousUnit?: 'oz' | 'ml';
} 