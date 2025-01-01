export type FeedingMode = {
  type: 'bottle' | 'breast';
  side?: 'left' | 'right';
  volume?: {
    amount: number;
    unit: 'oz' | 'ml';
  };
};

export type FeedingInterval = {
  mode: FeedingMode;
  startTime: Date;
  endTime: Date;
  duration: number;
};

export type PausedInterval = {
  start: Date;
  end: Date;
};

export type FeedingSession = {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  mode: FeedingMode;
  feedingIntervals: FeedingInterval[];
  pausedIntervals?: PausedInterval[];
};

export type Settings = {
  timezone: string;
  volumeUnit: 'oz' | 'ml';
  needsVolumeConversion?: boolean;
  previousUnit?: 'oz' | 'ml';
}; 