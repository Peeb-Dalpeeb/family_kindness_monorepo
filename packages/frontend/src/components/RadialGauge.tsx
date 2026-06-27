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
  isGlowActive 
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
      <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
        {/* Decorative backdrop glow */}
        <div className={`absolute inset-6 rounded-full bg-kindness/5 blur-3xl transition-all duration-1000 ${
          isGlowActive ? 'bg-amber-500/20 scale-110 blur-4xl' : ''
        }`} />

        {/* Core SVG Gauge Structure */}
        <svg 
          viewBox="0 0 240 240" 
          className={`w-full h-full transform -rotate-90 transition-all duration-700 ${
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
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
          <div className="flex items-baseline justify-center -mb-2">
            <span 
              className={`text-6xl md:text-7xl font-bold font-sans tracking-tight tabular-nums transition-colors duration-700 ${
                isGlowActive ? 'text-amber-success' : 'text-primary-espresso'
              }`}
            >
              {percentage}
            </span>
            <span className={`text-2xl md:text-3xl font-medium ml-0.5 ${
              isGlowActive ? 'text-amber-success' : 'text-kindness'
            }`}>%</span>
          </div>

          <span className="text-[10px] md:text-xs font-mono font-medium text-muted-espresso uppercase tracking-widest mt-2">
            {currentPoints} / {METER_THRESHOLD.toLocaleString()} Points
          </span>

          <div className="w-3/4 border-t border-muted-espresso/10 my-2.5" />

          {/* Subtext readout EXACTLY as specified in guidelines */}
          <p className="text-[11px] md:text-xs text-muted-espresso leading-normal max-w-[170px] font-medium font-sans">
            Filled toward our {METER_THRESHOLD.toLocaleString()} pt milestone.
          </p>
        </div>
      </div>
    </div>
  );
};
