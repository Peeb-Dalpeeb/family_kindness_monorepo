import React from 'react';
import { motion } from 'motion/react';
import { METER_THRESHOLD } from '@family-kindness/shared';

interface RadialGaugeProps {
  percentage: number;
  currentPoints: number;
  isGlowActive: boolean; // Activated on milestone celebration
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  percentage,
  currentPoints,
  isGlowActive,
}) => {
  // SVG circles measurements
  const radius = 100;
  const strokeWidth = 12;
  const cx = 120;
  const cy = 120;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke offset representing progress
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div
      id="central-radial-gauge"
      className="flex flex-col items-center justify-center py-6 select-none"
    >
      <div className="relative flex h-72 w-72 items-center justify-center md:h-80 md:w-80">
        {/* Decorative backdrop glow */}
        <div
          className={`bg-kindness/5 absolute inset-6 rounded-full blur-3xl transition-all duration-1000 ${
            isGlowActive ? 'blur-4xl scale-110 bg-amber-500/20' : ''
          }`}
        />

        {/* Core SVG Gauge Structure */}
        <svg
          viewBox="0 0 240 240"
          className={`h-full w-full -rotate-90 transform transition-all duration-700 ${
            isGlowActive ? 'glow-amber-effect scale-102' : 'glow-effect'
          }`}
        >
          {/* Track 1: Soft shadow ring */}
          <circle
            cx={cx}
            cy={cy}
            r={radius + 4}
            fill="none"
            stroke="var(--bg-surface)"
            strokeWidth={1}
            className="opacity-40"
          />

          {/* Track 2: Soft neutral appliance background path */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--bg-surface)"
            strokeWidth={strokeWidth}
          />

          {/* Active Track: Fills smoothly with accent-kindness or amber-gold on milestone */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={isGlowActive ? '#F59E0B' : 'var(--accent-kindness)'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: 'spring', stiffness: 45, damping: 15 }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Readout Text Dashboard */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center">
          <div className="-mb-2 flex items-baseline justify-center">
            <span
              className={`font-sans text-6xl font-bold tracking-tight tabular-nums transition-colors duration-700 md:text-7xl ${
                isGlowActive ? 'text-amber-success' : 'text-primary-espresso'
              }`}
            >
              {percentage}
            </span>
            <span
              className={`ml-0.5 text-2xl font-medium md:text-3xl ${
                isGlowActive ? 'text-amber-success' : 'text-kindness'
              }`}
            >
              %
            </span>
          </div>

          <span className="text-muted-espresso mt-2 font-mono text-[10px] font-medium tracking-widest uppercase md:text-xs">
            {currentPoints} / {METER_THRESHOLD.toLocaleString()} Points
          </span>

          <div className="border-muted-espresso/10 my-2.5 w-3/4 border-t" />

          {/* Subtext readout EXACTLY as specified in guidelines */}
          <p className="text-muted-espresso max-w-[170px] font-sans text-[11px] leading-normal font-medium md:text-xs">
            Filled toward our {METER_THRESHOLD.toLocaleString()} pt milestone.
          </p>
        </div>
      </div>
    </div>
  );
};
