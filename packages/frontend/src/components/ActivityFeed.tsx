import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  Edit3, 
  Calendar, 
  ArrowRight, 
  Check, 
  X, 
  FileText
} from 'lucide-react';
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
  const [editBenToDelete, setEditBen] = useState<string>('');

  // Helper dictionary lookup for quick resolution
  const memberMap = React.useMemo(() => {
    return new Map(familyMembers.map(m => [m.id, m]));
  }, [familyMembers]);

  const handleStartEdit = (entry: KindnessEntry) => {
    setEditingId(entry.id);
    setEditDesc(entry.description);
    setEditPoints(entry.pointsAwarded);
    setEditCategory(entry.category);
    setEditSubBy(entry.submittedBy);
    setEditBen(entry.beneficiary);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = (entry: KindnessEntry) => {
    if (!editDesc.trim() || editDesc.length > 200) {
      return; // prevent saving invalid entries
    }
    if (editSubBy === editBenToDelete) {
      return; // prevent logging for self
    }

    onUpdate({
      ...entry,
      description: editDesc.trim(),
      pointsAwarded: editPoints,
      category: editCategory,
      submittedBy: editSubBy,
      beneficiary: editBenToDelete,
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
      <div className="text-center py-12 px-6 border-2 border-dashed border-muted-espresso/10 rounded-3xl bg-surface/10">
        <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mx-auto text-muted-espresso mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-primary-espresso">No acts of kindness logged yet</p>
        <p className="text-xs text-muted-espresso mt-1">Tap "+ Log a New Act of Kindness" to register the very first household action.</p>
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
                  ? 'border-kindness bg-surface/75 ring-1 ring-kindness/25 p-5' 
                  : 'border-muted-espresso/10 hover:border-muted-espresso/15 bg-surface/30 p-4'
              }`}
            >
              {isEditing ? (
                /* Inline Editing View */
                <div className="space-y-4 animate-fade-in">
                  <div className="border-b border-muted-espresso/10 pb-3 flex justify-between items-center">
                    <h5 className="font-bold text-xs text-kindness uppercase tracking-wider">
                      🛠️ Inline Card Editor
                    </h5>
                    <span className="text-[10px] font-mono text-muted-espresso">
                      ID: {entry.id}
                    </span>
                  </div>

                  {/* Edit Roles Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-primary-espresso mb-1">
                        From (Submitter):
                      </label>
                      <select
                        value={editSubBy}
                        onChange={(e) => { setEditSubBy(e.target.value); }}
                        className="w-full text-xs p-2 rounded-xl bg-canvas border border-muted-espresso/10 text-primary-espresso focus:outline-none focus:ring-1 focus:ring-kindness focus:border-transparent"
                      >
                        {familyMembers.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.avatar && (m.avatar.includes('.') || m.avatar.startsWith('/')) ? '' : `${m.avatar} `}{m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-primary-espresso mb-1">
                        To (Beneficiary):
                      </label>
                      <select
                        value={editBenToDelete}
                        onChange={(e) => { setEditBen(e.target.value); }}
                        className="w-full text-xs p-2 rounded-xl bg-canvas border border-muted-espresso/10 text-primary-espresso focus:outline-none focus:ring-1 focus:ring-kindness focus:border-transparent"
                      >
                        {familyMembers
                          .filter(m => m.id !== editSubBy)
                          .map(m => (
                            <option key={m.id} value={m.id}>
                              {m.avatar && (m.avatar.includes('.') || m.avatar.startsWith('/')) ? '' : `${m.avatar} `}{m.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Edit Category and Points */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-primary-espresso mb-1">
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
                        className="w-full text-xs p-2 rounded-xl bg-canvas border border-muted-espresso/10 text-primary-espresso focus:outline-none focus:ring-1 focus:ring-kindness focus:border-transparent"
                      >
                        <option value="Kind Words">💬 Kind Words (10 pts)</option>
                        <option value="Showing Gratitude">🙏 Showing Gratitude (15 pts)</option>
                        <option value="Helping Hand">🤝 Helping Hand (20 pts)</option>
                        <option value="Other">✨ Other (Custom variable)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-primary-espresso mb-1">
                        Points Awarded:
                      </label>
                      <select
                        value={editPoints}
                        onChange={(e) => { setEditPoints(Number(e.target.value)); }}
                        disabled={editCategory !== 'Other'}
                        className="w-full text-xs p-2 rounded-xl bg-canvas border border-muted-espresso/10 text-primary-espresso focus:outline-none focus:ring-1 focus:ring-kindness focus:border-transparent disabled:opacity-60"
                      >
                        {[5, 10, 15, 20].map(val => (
                          <option key={val} value={val}>
                            +{val} pts
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Edit Textarea Description */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-primary-espresso">
                      Description text (Max 200 Chars):
                    </label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => { setEditDesc(e.target.value); }}
                      rows={2}
                      className="w-full text-xs p-2 rounded-xl bg-canvas border border-muted-espresso/10 text-primary-espresso focus:outline-none focus:ring-1 focus:ring-kindness focus:border-transparent"
                    />
                    <div className="text-[10px] text-right font-mono text-muted-espresso">
                      {editDesc.length} / 200 characters
                    </div>
                  </div>

                  {/* Confirm Buttons */}
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded-lg border border-muted-espresso/10 text-primary-espresso font-semibold text-xs bg-canvas hover:bg-surface hover:text-kindness transition-all cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Close
                    </button>
                    <button
                      type="button"
                      disabled={editDesc.length === 0 || editDesc.length > 200 || editSubBy === editBenToDelete}
                      onClick={() => { handleSaveEdit(entry); }}
                      className="px-3 py-1.5 rounded-lg text-white font-bold text-xs bg-kindness hover:bg-kindness/90 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <Check className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary Readable Card View */
                <div className="space-y-3">
                  
                  {/* Card Header Metadata Row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    
                    {/* Character Identities & Direction Indicator */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary-espresso">
                      {/* Submitter */}
                      <div className="flex items-center gap-1.5 bg-canvas/60 px-2.5 py-1 rounded-full border border-muted-espresso/5">
                        {submitter?.avatar && (submitter.avatar.includes('.') || submitter.avatar.startsWith('/')) ? (
                          <img src={submitter.avatar} alt={submitter.name} className="w-5 h-5 rounded-full object-cover select-none" />
                        ) : (
                          <span className="text-sm">{submitter?.avatar || '❓'}</span>
                        )}
                        <span>{submitter?.name || 'Unknown'}</span>
                      </div>
                      
                      <ArrowRight className="w-3 h-3 text-muted-espresso shrink-0" />
                      
                      {/* Beneficiary */}
                      <div className="flex items-center gap-1.5 bg-canvas/60 px-2.5 py-1 rounded-full border border-muted-espresso/5">
                        {beneficiaryInstance?.avatar && (beneficiaryInstance.avatar.includes('.') || beneficiaryInstance.avatar.startsWith('/')) ? (
                          <img src={beneficiaryInstance.avatar} alt={beneficiaryInstance.name} className="w-5 h-5 rounded-full object-cover select-none" />
                        ) : (
                          <span className="text-sm">{beneficiaryInstance?.avatar || '❓'}</span>
                        )}
                        <span>{beneficiaryInstance?.name || 'Unknown'}</span>
                      </div>
                    </div>

                    {/* Numeric Points indicator badge */}
                    <div className="flex items-center gap-1 bg-kindness/10 border border-kindness/20 text-kindness px-3 py-1 rounded-full font-mono font-bold text-xs">
                      +{entry.pointsAwarded} Pts
                    </div>

                  </div>

                  {/* 200-character descriptive log text highlighted elements */}
                  <div className="bg-canvas/50 border border-muted-espresso/5 rounded-xl p-3 text-xs md:text-sm text-primary-espresso leading-relaxed italic relative overflow-hidden">
                    <span className="absolute left-1 top-1 text-2xl text-muted-espresso/10 font-serif">“</span>
                    <span className="relative z-10 pl-3 block font-sans">
                      {entry.description}
                    </span>
                  </div>

                  {/* Card Footer: Timing & Controls */}
                  <div className="flex items-center justify-between gap-4 pt-1 text-[11px] text-muted-espresso">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-espresso" />
                      <span>{formatTime(entry.timestamp)}</span>
                      <span className="opacity-40">•</span>
                      <span className="font-medium text-kindness bg-kindness/5 px-1.5 py-0.5 rounded">
                        {entry.category}
                      </span>
                    </div>

                    {/* ALWAYS visible Management Control buttons for Admin */}
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { handleStartEdit(entry); }}
                          className="flex items-center gap-1 px-2 py-1 bg-canvas hover:bg-kindness-light/30 text-primary-espresso hover:text-kindness rounded-md border border-muted-espresso/10 hover:border-kindness/20 transition-all cursor-pointer font-semibold font-sans"
                          title="Edit log details"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        
                        <button
                          onClick={() => { onDelete(entry.id); }}
                          className="flex items-center gap-1 px-2 py-1 bg-canvas hover:bg-red-50 text-muted-espresso hover:text-red-500 rounded-md border border-muted-espresso/10 hover:border-red-500/20 transition-all cursor-pointer font-semibold font-sans"
                          title="Delete this act permanently"
                        >
                          <Trash2 className="w-3 h-3" />
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
