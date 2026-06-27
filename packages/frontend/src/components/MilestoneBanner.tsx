import React from 'react';
import { METER_THRESHOLD } from '@family-kindness/shared';

interface MilestoneBannerProps {
  completedMilestones: number;
}

export const MilestoneBanner: React.FC<MilestoneBannerProps> = ({ completedMilestones }) => {
  if (completedMilestones === 0) {
    return (
      <div 
        id="banner-welcome"
        className="w-full bg-surface/30 border border-muted-espresso/5 rounded-2xl px-4 py-3 flex items-center justify-between gap-4"
      >
        <p className="text-xs text-muted-espresso font-medium font-sans">
          Let's spread positivity to fill our progress meter towards our goal of {METER_THRESHOLD.toLocaleString()} points.
        </p>
        <span className="text-[10px] uppercase font-mono font-bold text-muted-espresso tracking-wider shrink-0 bg-surface px-2 py-1 rounded">
          Goal: {METER_THRESHOLD.toLocaleString()} pts
        </span>
      </div>
    );
  }

  return (
    <div 
      id="banner-celebrate"
      className="w-full bg-surface/30 border border-muted-espresso/5 rounded-2xl px-4 py-3 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-kindness shrink-0" />
        <p className="text-xs text-primary-espresso font-medium font-sans">
          Communal Kindness Meter successfully filled <strong className="font-bold text-kindness">{completedMilestones} {completedMilestones === 1 ? 'time' : 'times'}</strong>.
        </p>
      </div>
      <span className="text-[10px] font-mono font-bold text-kindness bg-kindness/10 px-2.5 py-1 rounded shrink-0">
        Meter ×{completedMilestones}
      </span>
    </div>
  );
};
