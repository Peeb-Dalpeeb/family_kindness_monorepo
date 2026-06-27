import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText } from 'lucide-react';
import { KindnessEntry, FamilyMember } from '@family-kindness/shared';
import { ActivityCardDisplay } from './ActivityCardDisplay';
import { ActivityCardEditor } from './ActivityCardEditor';

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

  // Helper dictionary lookup for quick resolution
  const memberMap = React.useMemo(() => {
    return new Map(familyMembers.map((m) => [m.id, m]));
  }, [familyMembers]);

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
          Tap &quot;+ Log a New Act of Kindness&quot; to register the very first household action.
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
                <ActivityCardEditor
                  key={`editor-${entry.id}`}
                  entry={entry}
                  familyMembers={familyMembers}
                  onSave={(updatedEntry) => {
                    onUpdate(updatedEntry);
                    setEditingId(null);
                  }}
                  onCancel={() => { setEditingId(null); }}
                />
              ) : (
                <ActivityCardDisplay
                  entry={entry}
                  submitter={submitter}
                  beneficiary={beneficiaryInstance}
                  isAdmin={isAdmin}
                  onStartEdit={() => { setEditingId(entry.id); }}
                  onDelete={onDelete}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
