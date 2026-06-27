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
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-semibold text-primary-espresso flex items-center gap-1.5">
          <span>{label}</span>
        </label>
        {error && (
          <span className="text-xs font-medium text-amber-success flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </span>
        )}
      </div>

      {placeholder ? (
        <div className="border border-dashed border-muted-espresso/15 rounded-2xl p-4 text-center text-xs text-muted-espresso bg-surface/20">
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
                onClick={() => { onSelect(member.id); }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-kindness bg-kindness/5 scale-102 ring-1 ring-kindness/30'
                    : 'border-muted-espresso/10 hover:border-muted-espresso/20 bg-surface/25'
                }`}
              >
                {member.avatar && (member.avatar.includes('.') || member.avatar.startsWith('/')) ? (
                  <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover mb-1 select-none" />
                ) : (
                  <span className="text-2xl mb-1">{member.avatar}</span>
                )}
                <span className="text-xs font-semibold text-primary-espresso truncate w-full">
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
