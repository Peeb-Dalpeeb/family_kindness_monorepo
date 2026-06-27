import React from 'react';
import { motion } from 'motion/react';
import { OTHER_POINT_OPTIONS } from '@family-kindness/shared';

/** Point options are defined in @family-kindness/shared/constants. */

interface CustomPointsPickerProps {
  selectedPoints: number;
  onSelect: (points: number) => void;
}

export const CustomPointsPicker: React.FC<CustomPointsPickerProps> = ({
  selectedPoints,
  onSelect,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-surface/50 border-muted-espresso/10 mt-2 space-y-2 rounded-2xl border p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-primary-espresso text-xs font-semibold">
          Select Custom Points Value:
        </span>
        <span className="text-kindness bg-kindness/10 rounded-lg px-2.5 py-1 font-mono text-xs font-bold">
          +{String(selectedPoints)} Points
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {OTHER_POINT_OPTIONS.map((val) => {
          const isActive = selectedPoints === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => {
                onSelect(val);
              }}
              className={`cursor-pointer rounded-xl py-2 text-center text-xs font-bold transition-all ${
                isActive
                  ? 'bg-kindness text-white'
                  : 'bg-canvas text-primary-espresso border-muted-espresso/10 hover:bg-surface border'
              }`}
            >
              +{val} Pts
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
