import React from 'react';
import { Trash2, Edit3, Calendar, ArrowRight } from 'lucide-react';
import { KindnessEntry, FamilyMember } from '@family-kindness/shared';

interface ActivityCardDisplayProps {
  entry: KindnessEntry;
  submitter: FamilyMember | undefined;
  beneficiary: FamilyMember | undefined;
  isAdmin: boolean;
  onStartEdit: () => void;
  onDelete: (id: string) => void;
}

/** Formats epoch milliseconds into a readable short date string. */
const formatTime = (epochMs: number) => {
  const d = new Date(epochMs);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const ActivityCardDisplay: React.FC<ActivityCardDisplayProps> = ({
  entry,
  submitter,
  beneficiary,
  isAdmin,
  onStartEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-3">
      {/* Card Header Metadata Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Character Identities & Direction Indicator */}
        <div className="text-primary-espresso flex items-center gap-2 text-xs font-semibold">
          {/* Submitter */}
          <div className="bg-canvas/60 border-muted-espresso/5 flex items-center gap-1.5 rounded-full border px-2.5 py-1">
            {submitter?.avatar &&
            (submitter.avatar.includes('.') || submitter.avatar.startsWith('/')) ? (
              <img
                src={submitter.avatar}
                alt={submitter.name}
                className="h-5 w-5 rounded-full object-cover select-none"
              />
            ) : (
              <span className="text-sm">{submitter?.avatar || '❓'}</span>
            )}
            <span>{submitter?.name || 'Unknown'}</span>
          </div>

          <ArrowRight className="text-muted-espresso h-3 w-3 shrink-0" />

          {/* Beneficiary */}
          <div className="bg-canvas/60 border-muted-espresso/5 flex items-center gap-1.5 rounded-full border px-2.5 py-1">
            {beneficiary?.avatar &&
            (beneficiary.avatar.includes('.') || beneficiary.avatar.startsWith('/')) ? (
              <img
                src={beneficiary.avatar}
                alt={beneficiary.name}
                className="h-5 w-5 rounded-full object-cover select-none"
              />
            ) : (
              <span className="text-sm">{beneficiary?.avatar || '❓'}</span>
            )}
            <span>{beneficiary?.name || 'Unknown'}</span>
          </div>
        </div>

        {/* Numeric Points indicator badge */}
        <div className="bg-kindness/10 border-kindness/20 text-kindness flex items-center gap-1 rounded-full border px-3 py-1 font-mono text-xs font-bold">
          +{entry.pointsAwarded} Pts
        </div>
      </div>

      {/* 200-character descriptive log text highlighted elements */}
      <div className="bg-canvas/50 border-muted-espresso/5 text-primary-espresso relative overflow-hidden rounded-xl border p-3 text-xs leading-relaxed italic md:text-sm">
        <span className="text-muted-espresso/10 absolute top-1 left-1 font-serif text-2xl">
          &ldquo;
        </span>
        <span className="relative z-10 block pl-3 font-sans">{entry.description}</span>
      </div>

      {/* Card Footer: Timing & Controls */}
      <div className="text-muted-espresso flex items-center justify-between gap-4 pt-1 text-[11px]">
        <div className="flex items-center gap-1.5">
          <Calendar className="text-muted-espresso h-3.5 w-3.5" />
          <span>{formatTime(entry.timestamp)}</span>
          <span className="opacity-40">•</span>
          <span className="text-kindness bg-kindness/5 rounded px-1.5 py-0.5 font-medium">
            {entry.category}
          </span>
        </div>

        {/* ALWAYS visible Management Control buttons for Admin */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onStartEdit(); }}
              className="bg-canvas hover:bg-kindness-light/30 text-primary-espresso hover:text-kindness border-muted-espresso/10 hover:border-kindness/20 flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 font-sans font-semibold transition-all"
              title="Edit log details"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => { onDelete(entry.id); }}
              className="bg-canvas text-muted-espresso border-muted-espresso/10 flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 font-sans font-semibold transition-all hover:border-red-500/20 hover:bg-red-50 hover:text-red-500"
              title="Delete this act permanently"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
