import React from 'react';
import { AlertCircle } from 'lucide-react';
import { FamilyMember } from '@family-kindness/shared';

interface MemberPickerProps {
  label: string;
  members: FamilyMember[];
  selectedId: string;
  onSelect: (id: string) => void;
  error?: string;
  gridCols?: string;
  /** Optional placeholder shown when the picker is disabled / waiting for a prerequisite */
  placeholder?: string;
}

export const MemberPicker: React.FC<MemberPickerProps> = ({
  label,
  members,
  selectedId,
  onSelect,
  error,
  gridCols = 'grid-cols-3 sm:grid-cols-6',
  placeholder,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-primary-espresso flex items-center gap-1.5 text-sm font-semibold">
          <span>{label}</span>
        </label>
        {error && (
          <span className="text-amber-success flex items-center gap-1 text-xs font-medium">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </span>
        )}
      </div>

      {placeholder ? (
        <div className="border-muted-espresso/15 text-muted-espresso bg-surface/20 rounded-2xl border border-dashed p-4 text-center text-xs">
          {placeholder}
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-2`}>
          {members.map((member) => {
            const isSelected = selectedId === member.id;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => {
                  onSelect(member.id);
                }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                  isSelected
                    ? 'border-kindness bg-kindness/5 ring-kindness/30 scale-102 ring-1'
                    : 'border-muted-espresso/10 hover:border-muted-espresso/20 bg-surface/25'
                }`}
              >
                {member.avatar && (member.avatar.includes('.') || member.avatar.startsWith('/')) ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="mb-1 h-8 w-8 rounded-full object-cover select-none"
                  />
                ) : (
                  <span className="mb-1 text-2xl">{member.avatar}</span>
                )}
                <span className="text-primary-espresso w-full truncate text-xs font-semibold">
                  {member.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
