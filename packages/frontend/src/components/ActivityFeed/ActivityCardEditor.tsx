import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  KindnessEntry,
  FamilyMember,
  PointsCategory,
  KINDNESS_CATEGORIES,
  CATEGORY_METADATA,
  POINTS_MATRIX,
  OTHER_POINT_OPTIONS,
  DESCRIPTION_MAX_LENGTH,
  resolvePoints,
} from '@family-kindness/shared';

interface ActivityCardEditorProps {
  entry: KindnessEntry;
  familyMembers: FamilyMember[];
  onSave: (updatedEntry: KindnessEntry) => void;
  onCancel: () => void;
}

/**
 * Inline editor for a single activity card.
 *
 * Mounted fresh each time the user clicks "Edit" (via a key-based remount
 * in the parent), so `useState` initializers safely pull from `entry` props
 * without requiring any synchronization effects.
 */
export const ActivityCardEditor: React.FC<ActivityCardEditorProps> = ({
  entry,
  familyMembers,
  onSave,
  onCancel,
}) => {
  const [editDesc, setEditDesc] = useState<string>(entry.description);
  const [editPoints, setEditPoints] = useState<number>(entry.pointsAwarded);
  const [editCategory, setEditCategory] = useState<PointsCategory>(entry.category);
  const [editSubBy, setEditSubBy] = useState<string>(entry.submittedBy);
  const [editBeneficiary, setEditBeneficiary] = useState<string>(entry.beneficiary);

  const handleSave = () => {
    if (!editDesc.trim() || editDesc.length > DESCRIPTION_MAX_LENGTH) {
      return; // prevent saving invalid entries
    }
    if (editSubBy === editBeneficiary) {
      return; // prevent logging for self
    }

    onSave({
      ...entry,
      description: editDesc.trim(),
      pointsAwarded: editPoints,
      category: editCategory,
      submittedBy: editSubBy,
      beneficiary: editBeneficiary,
    });
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="border-muted-espresso/10 flex items-center justify-between border-b pb-3">
        <h5 className="text-kindness text-xs font-bold tracking-wider uppercase">
          🛠️ Inline Card Editor
        </h5>
        <span className="text-muted-espresso font-mono text-[10px]">
          ID: {entry.id}
        </span>
      </div>

      {/* Edit Roles Inputs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-primary-espresso mb-1 block text-xs font-bold">
            From (Submitter):
          </label>
          <select
            value={editSubBy}
            onChange={(e) => {
              setEditSubBy(e.target.value);
            }}
            className="bg-canvas border-muted-espresso/10 text-primary-espresso focus:ring-kindness w-full rounded-xl border p-2 text-xs focus:border-transparent focus:ring-1 focus:outline-none"
          >
            {familyMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.avatar && (m.avatar.includes('.') || m.avatar.startsWith('/'))
                  ? ''
                  : `${m.avatar} `}
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-primary-espresso mb-1 block text-xs font-bold">
            To (Beneficiary):
          </label>
          <select
            value={editBeneficiary}
            onChange={(e) => {
              setEditBeneficiary(e.target.value);
            }}
            className="bg-canvas border-muted-espresso/10 text-primary-espresso focus:ring-kindness w-full rounded-xl border p-2 text-xs focus:border-transparent focus:ring-1 focus:outline-none"
          >
            {familyMembers
              .filter((m) => m.id !== editSubBy)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.avatar && (m.avatar.includes('.') || m.avatar.startsWith('/'))
                    ? ''
                    : `${m.avatar} `}
                  {m.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Edit Category and Points */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-primary-espresso mb-1 block text-xs font-bold">
            Category:
          </label>
          <select
            value={editCategory}
            onChange={(e) => {
              const cat = e.target.value as PointsCategory;
              setEditCategory(cat);
              if (cat !== 'Other') {
                setEditPoints(resolvePoints(cat));
              } else if (!(OTHER_POINT_OPTIONS as readonly number[]).includes(editPoints)) {
                setEditPoints(OTHER_POINT_OPTIONS[0]);
              }
            }}
            className="bg-canvas border-muted-espresso/10 text-primary-espresso focus:ring-kindness w-full rounded-xl border p-2 text-xs focus:border-transparent focus:ring-1 focus:outline-none"
          >
            {KINDNESS_CATEGORIES.map((cat) => {
              const meta = CATEGORY_METADATA[cat];
              const ptsLabel = cat === 'Other'
                ? 'Custom variable'
                : `${String(POINTS_MATRIX[cat])} pts`;
              return (
                <option key={cat} value={cat}>
                  {meta.icon} {cat} ({ptsLabel})
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="text-primary-espresso mb-1 block text-xs font-bold">
            Points Awarded:
          </label>
          <select
            value={editPoints}
            onChange={(e) => {
              setEditPoints(Number(e.target.value));
            }}
            disabled={editCategory !== 'Other'}
            className="bg-canvas border-muted-espresso/10 text-primary-espresso focus:ring-kindness w-full rounded-xl border p-2 text-xs focus:border-transparent focus:ring-1 focus:outline-none disabled:opacity-60"
          >
            {OTHER_POINT_OPTIONS.map((val) => (
              <option key={val} value={val}>
                +{val} pts
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Edit Textarea Description */}
      <div className="space-y-1">
        <label className="text-primary-espresso block text-xs font-bold">
          Description text (Max {DESCRIPTION_MAX_LENGTH} Chars):
        </label>
        <textarea
          value={editDesc}
          onChange={(e) => {
            setEditDesc(e.target.value);
          }}
          rows={2}
          className="bg-canvas border-muted-espresso/10 text-primary-espresso focus:ring-kindness w-full rounded-xl border p-2 text-xs focus:border-transparent focus:ring-1 focus:outline-none"
        />
        <div className="text-muted-espresso text-right font-mono text-[10px]">
          {editDesc.length} / {DESCRIPTION_MAX_LENGTH} characters
        </div>
      </div>

      {/* Confirm Buttons */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="border-muted-espresso/10 text-primary-espresso bg-canvas hover:bg-surface hover:text-kindness flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all"
        >
          <X className="h-3.5 w-3.5" /> Close
        </button>
        <button
          type="button"
          disabled={
            editDesc.length === 0 ||
            editDesc.length > DESCRIPTION_MAX_LENGTH ||
            editSubBy === editBeneficiary
          }
          onClick={handleSave}
          className="bg-kindness hover:bg-kindness/90 flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" /> Save Changes
        </button>
      </div>
    </div>
  );
};
