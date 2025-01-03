export type FeedingMode = {
  type: 'bottle' | 'breast';
  side?: 'left' | 'right';
  volume?: {
    amount: number;
    unit: 'oz' | 'ml';
  };
};

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