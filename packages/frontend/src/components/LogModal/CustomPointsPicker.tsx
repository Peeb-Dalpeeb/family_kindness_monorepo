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
      className="bg-surface/50 border border-muted-espresso/10 p-4 rounded-2xl space-y-2 mt-2"
    >
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-primary-espresso">Select Custom Points Value:</span>
        <span className="text-xs font-mono font-bold text-kindness bg-kindness/10 px-2.5 py-1 rounded-lg">
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
              onClick={() => { onSelect(val); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                isActive
                  ? 'bg-kindness text-white'
                  : 'bg-canvas text-primary-espresso border border-muted-espresso/10 hover:bg-surface'
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
