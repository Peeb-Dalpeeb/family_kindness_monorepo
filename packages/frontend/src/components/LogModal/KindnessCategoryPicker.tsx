import React from 'react';
import { AlertCircle } from 'lucide-react';
import { PointsCategory } from '@family-kindness/shared';

/** Static category definitions — allocated once outside the render cycle. */
const CATEGORIES = [
  { cat: 'Kind Words' as const, pts: 10, label: '💬 Kind Words', desc: 'Compliment or support' },
  { cat: 'Showing Gratitude' as const, pts: 15, label: '🙏 Gratitude', desc: 'Appreciation gesture' },
  { cat: 'Helping Hand' as const, pts: 20, label: '🤝 Helping Hand', desc: 'Household chore or aid' },
  { cat: 'Other' as const, pts: null, label: '✨ Other Option', desc: 'Customizable points' },
] as const;

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
        {CATEGORIES.map((item) => {
          const isSelected = selectedCategory === item.cat;
          return (
            <button
              key={item.cat}
              type="button"
              onClick={() => { onSelect(item.cat); }}
              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-kindness bg-kindness/5 ring-1 ring-kindness/30'
                  : 'border-muted-espresso/10 hover:border-muted-espresso/20 bg-surface/25'
              }`}
            >
              <span className="text-sm font-bold text-primary-espresso">{item.label}</span>
              <span className="text-xs text-muted-espresso mt-0.5 leading-tight">{item.desc}</span>
              <span className="text-xs font-mono font-bold mt-2 text-kindness bg-kindness-light/40 px-2 py-0.5 rounded-md">
                {item.pts !== null ? `+${String(item.pts)} Pts` : 'Custom Pts'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
