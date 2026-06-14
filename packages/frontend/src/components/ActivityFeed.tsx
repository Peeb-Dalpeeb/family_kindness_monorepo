import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Edit3, Calendar, ArrowRight, Check, X, FileText } from 'lucide-react';
import { KindnessEntry, FamilyMember, PointsCategory } from '@family-kindness/shared';

interface ActivityFeedProps {
  entries: KindnessEntry[];
  familyMembers: FamilyMember[];
  onDelete: (id: string) => void;
  onUpdate: (updatedEntry: KindnessEntry) => void;
  isAdmin: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  entries,
  familyMembers,
  onDelete,
  onUpdate,
  isAdmin,
}) => {
  // State to track which entry is being edited inline
  const [editingId, setEditingId] = useState<string | null>(null);

  // Inline edit state
  const [editDesc, setEditDesc] = useState<string>('');
  const [editPoints, setEditPoints] = useState<number>(10);
  const [editCategory, setEditCategory] = useState<PointsCategory>('Kind Words');
  const [editSubBy, setEditSubBy] = useState<string>('');
  const [editBeneficiary, setEditBeneficiary] = useState<string>('');

  // Helper dictionary lookup for quick resolution
  const memberMap = React.useMemo(() => {
    return new Map(familyMembers.map((m) => [m.id, m]));
  }, [familyMembers]);

  const handleStartEdit = (entry: KindnessEntry) => {
    setEditingId(entry.id);
    setEditDesc(entry.description);
    setEditPoints(entry.pointsAwarded);
    setEditCategory(entry.category);
    setEditSubBy(entry.submittedBy);
    setEditBeneficiary(entry.beneficiary);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = (entry: KindnessEntry) => {
    if (!editDesc.trim() || editDesc.length > 200) {
      return; // prevent saving invalid entries
    }
    if (editSubBy === editBeneficiary) {
      return; // prevent logging for self
    }

    onUpdate({
      ...entry,
      description: editDesc.trim(),
      pointsAwarded: editPoints,
      category: editCategory,
      submittedBy: editSubBy,
      beneficiary: editBeneficiary,
    });
    setEditingId(null);
  };

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

  if (entries.length === 0) {
    return (
      <div className="border-muted-espresso/10 bg-surface/10 rounded-3xl border-2 border-dashed px-6 py-12 text-center">
        <div className="bg-surface text-muted-espresso mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
          <FileText className="h-6 w-6" />
        </div>
        <p className="text-primary-espresso text-sm font-semibold">
          No acts of kindness logged yet
        </p>
        <p className="text-muted-espresso mt-1 text-xs">
          Tap "+ Log a New Act of Kindness" to register the very first household action.
        </p>
      </div>
    );
  }

  return (
    <div id="activity-timeline" className="space-y-4">
      <AnimatePresence initial={false}>
        {entries.map((entry) => {
          const isEditing = editingId === entry.id;
          const submitter = memberMap.get(entry.submittedBy);
          const beneficiaryInstance = memberMap.get(entry.beneficiary);

          return (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-2xl border transition-all ${
                isEditing
                  ? 'border-kindness bg-surface/75 ring-kindness/25 p-5 ring-1'
                  : 'border-muted-espresso/10 hover:border-muted-espresso/15 bg-surface/30 p-4'
              }`}
            >
              {isEditing ? (
                /* Inline Editing View */
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
                          if (cat === 'Kind Words') setEditPoints(10);
                          else if (cat === 'Showing Gratitude') setEditPoints(15);
                          else if (cat === 'Helping Hand') setEditPoints(20);
                        }}
                        className="bg-canvas border-muted-espresso/10 text-primary-espresso focus:ring-kindness w-full rounded-xl border p-2 text-xs focus:border-transparent focus:ring-1 focus:outline-none"
                      >
                        <option value="Kind Words">💬 Kind Words (10 pts)</option>
                        <option value="Showing Gratitude">🙏 Showing Gratitude (15 pts)</option>
                        <option value="Helping Hand">🤝 Helping Hand (20 pts)</option>
                        <option value="Other">✨ Other (Custom variable)</option>
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
                        {[5, 10, 15, 20].map((val) => (
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
                      Description text (Max 200 Chars):
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
                      {editDesc.length} / 200 characters
                    </div>
                  </div>

                  {/* Confirm Buttons */}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="border-muted-espresso/10 text-primary-espresso bg-canvas hover:bg-surface hover:text-kindness flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all"
                    >
                      <X className="h-3.5 w-3.5" /> Close
                    </button>
                    <button
                      type="button"
                      disabled={
                        editDesc.length === 0 ||
                        editDesc.length > 200 ||
                        editSubBy === editBeneficiary
                      }
                      onClick={() => {
                        handleSaveEdit(entry);
                      }}
                      className="bg-kindness hover:bg-kindness/90 flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all disabled:opacity-40"
                    >
                      <Check className="h-3.5 w-3.5" /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary Readable Card View */
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
                        {beneficiaryInstance?.avatar &&
                        (beneficiaryInstance.avatar.includes('.') ||
                          beneficiaryInstance.avatar.startsWith('/')) ? (
                          <img
                            src={beneficiaryInstance.avatar}
                            alt={beneficiaryInstance.name}
                            className="h-5 w-5 rounded-full object-cover select-none"
                          />
                        ) : (
                          <span className="text-sm">{beneficiaryInstance?.avatar || '❓'}</span>
                        )}
                        <span>{beneficiaryInstance?.name || 'Unknown'}</span>
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
                      “
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
                          onClick={() => {
                            handleStartEdit(entry);
                          }}
                          className="bg-canvas hover:bg-kindness-light/30 text-primary-espresso hover:text-kindness border-muted-espresso/10 hover:border-kindness/20 flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 font-sans font-semibold transition-all"
                          title="Edit log details"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => {
                            onDelete(entry.id);
                          }}
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
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
