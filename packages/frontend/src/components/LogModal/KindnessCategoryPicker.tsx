import React from 'react';
import { AlertCircle } from 'lucide-react';
import {
  PointsCategory,
  KINDNESS_CATEGORIES,
  CATEGORY_METADATA,
  POINTS_MATRIX,
} from '@family-kindness/shared';

interface KindnessCategoryPickerProps {
  selectedCategory: PointsCategory | '';
  onSelect: (category: PointsCategory) => void;
  error?: string;
}

export const KindnessCategoryPicker: React.FC<KindnessCategoryPickerProps> = ({
  selectedCategory,
  onSelect,
  error,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-semibold text-primary-espresso">
          What kind of kindness is this?
        </label>
        {error && (
          <span className="text-xs font-medium text-amber-success flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {KINDNESS_CATEGORIES.map((cat) => {
          const meta = CATEGORY_METADATA[cat];
          const isSelected = selectedCategory === cat;
          const pts = cat === 'Other' ? null : POINTS_MATRIX[cat];
          return (
            <button
              key={cat}
              type="button"
              onClick={() => { onSelect(cat); }}
              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-kindness bg-kindness/5 ring-1 ring-kindness/30'
                  : 'border-muted-espresso/10 hover:border-muted-espresso/20 bg-surface/25'
              }`}
            >
              <span className="text-sm font-bold text-primary-espresso">{meta.icon} {meta.label}</span>
              <span className="text-xs text-muted-espresso mt-0.5 leading-tight">{meta.desc}</span>
              <span className="text-xs font-mono font-bold mt-2 text-kindness bg-kindness-light/40 px-2 py-0.5 rounded-md">
                {pts !== null ? `+${String(pts)} Pts` : 'Custom Pts'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
