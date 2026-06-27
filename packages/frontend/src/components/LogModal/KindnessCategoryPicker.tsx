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
      <div className="flex items-baseline justify-between">
        <label className="text-primary-espresso text-sm font-semibold">
          What kind of kindness is this?
        </label>
        {error && (
          <span className="text-amber-success flex items-center gap-1 text-xs font-medium">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {KINDNESS_CATEGORIES.map((cat) => {
          const meta = CATEGORY_METADATA[cat];
          const isSelected = selectedCategory === cat;
          const pts = cat === 'Other' ? null : POINTS_MATRIX[cat];
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onSelect(cat);
              }}
              className={`flex cursor-pointer flex-col items-start rounded-2xl border p-3 text-left transition-all ${
                isSelected
                  ? 'border-kindness bg-kindness/5 ring-kindness/30 ring-1'
                  : 'border-muted-espresso/10 hover:border-muted-espresso/20 bg-surface/25'
              }`}
            >
              <span className="text-primary-espresso text-sm font-bold">
                {meta.icon} {meta.label}
              </span>
              <span className="text-muted-espresso mt-0.5 text-xs leading-tight">{meta.desc}</span>
              <span className="text-kindness bg-kindness-light/40 mt-2 rounded-md px-2 py-0.5 font-mono text-xs font-bold">
                {pts !== null ? `+${String(pts)} Pts` : 'Custom Pts'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
