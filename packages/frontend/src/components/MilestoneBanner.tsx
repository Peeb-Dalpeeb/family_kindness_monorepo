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
        className="bg-surface/30 border-muted-espresso/5 flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3"
      >
        <p className="text-muted-espresso font-sans text-xs font-medium">
          Let's spread positivity to fill our progress meter towards our goal of{' '}
          {METER_THRESHOLD.toLocaleString()} points.
        </p>
        <span className="text-muted-espresso bg-surface shrink-0 rounded px-2 py-1 font-mono text-[10px] font-bold tracking-wider uppercase">
          Goal: {METER_THRESHOLD.toLocaleString()} pts
        </span>
      </div>
    );
  }

  return (
    <div
      id="banner-celebrate"
      className="bg-surface/30 border-muted-espresso/5 flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <span className="bg-kindness h-1.5 w-1.5 shrink-0 rounded-full" />
        <p className="text-primary-espresso font-sans text-xs font-medium">
          Communal Kindness Meter successfully filled{' '}
          <strong className="text-kindness font-bold">
            {completedMilestones} {completedMilestones === 1 ? 'time' : 'times'}
          </strong>
          .
        </p>
      </div>
      <span className="text-kindness bg-kindness/10 shrink-0 rounded px-2.5 py-1 font-mono text-[10px] font-bold">
        Meter ×{completedMilestones}
      </span>
    </div>
  );
};
