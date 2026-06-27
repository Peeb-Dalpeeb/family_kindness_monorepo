import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { type KindnessEntry, type FamilyMember, type DashboardMetrics } from '@family-kindness/shared';
import { ActivityFeed } from '../components/ActivityFeed';
import { apiFetch } from '../lib/api';

export const Admin: React.FC = () => {
  const [entries, setEntries] = useState<KindnessEntry[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPoints: 0,
    completedMilestones: 0,
    currentProgressPoints: 0,
    percentage: 0,
    totalLogs: 0,
  });

  // Fetch admin logs and members
  useEffect(() => {
    void fetchLogsAndData();
  }, []);

  const fetchLogsAndData = async () => {
    const [logs, users, stats] = await Promise.all([
      apiFetch<KindnessEntry[]>('/api/admin/logs'),
      apiFetch<FamilyMember[]>('/api/users'),
      apiFetch<DashboardMetrics>('/api/meter-status'),
    ]);

    if (logs && users && stats) {
      setEntries(logs);
      setMembers(users);
      setMetrics(stats);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this act of kindness? This will deduct its points from the collective meter.')) {
      return;
    }

    try {
      const response = await fetch(`/api/logs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Reload all data
        void fetchLogsAndData();
      } else {
        const err = (await response.json()) as { message?: string };
        alert(err.message || 'Failed to delete log entry.');
      }
    } catch (error) {
      console.error('Delete request failed:', error);
    }
  };

  const handleUpdateEntry = async (updated: KindnessEntry) => {
    try {
      const response = await fetch(`/api/logs/${updated.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submittedBy: updated.submittedBy,
          beneficiary: updated.beneficiary,
          category: updated.category,
          pointsAwarded: updated.pointsAwarded,
          description: updated.description,
        }),
      });

      if (response.ok) {
        void fetchLogsAndData();
      } else {
        const err = (await response.json()) as { message?: string };
        alert(err.message || 'Failed to update log entry.');
      }
    } catch (error) {
      console.error('Update request failed:', error);
    }
  };

  const memberCounts = entries.reduce<Record<string, { given: number; recv: number }>>(
    (acc, entry) => {
      acc[entry.submittedBy] ??= { given: 0, recv: 0 };
      acc[entry.submittedBy].given += 1;
      acc[entry.beneficiary] ??= { given: 0, recv: 0 };
      acc[entry.beneficiary].recv += 1;
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Admin Header with info */}
      <div className="bg-surface/50 border border-muted-espresso/10 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base md:text-lg text-primary-espresso flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-kindness" />
            <span>Parental Chronicle & Logs hub</span>
          </h3>
          <p className="text-xs text-muted-espresso mt-0.5">
            Complete chronological oversight of household kindness values. Use inline edit capabilities to fix descriptions or reward values.
          </p>
        </div>
      </div>

      {/* Total score panel admin display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs', value: entries.length, color: 'text-primary-espresso' },
          { label: 'Combined Points Earned', value: `${String(metrics.totalPoints)} pts`, color: 'text-kindness' },
          { label: 'Times Met Fill Limit', value: metrics.completedMilestones, color: 'text-amber-success' },
          { label: 'Registered Relatives', value: members.length, color: 'text-primary-espresso' }
        ].map((item, i) => (
          <div key={i} className="bg-canvas border border-muted-espresso/10 p-4 rounded-2xl shadow-xs text-center">
            <span className="block text-[10px] text-muted-espresso font-bold uppercase tracking-wider">{item.label}</span>
            <span className={`text-xl font-bold mt-1 block ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Interactive Family members tray representation */}
      <div className="bg-surface/15 border border-muted-espresso/5 rounded-3xl p-5 space-y-3.5">
        <div className="flex justify-between items-center px-1">
          <div className="space-y-0.5">
            <h4 className="text-xs font-extrabold text-primary-espresso uppercase tracking-wider">
              Our Household members
            </h4>
            <p className="text-[10px] text-muted-espresso">Family member contributions and stats for acts of kindness.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {members.map((m) => {
            const counts = memberCounts[m.id] ?? { given: 0, recv: 0 };
            const submitCount = counts.given;
            const beneficiaryCount = counts.recv;
            return (
              <div 
                key={m.id} 
                className="bg-canvas border border-muted-espresso/10 p-3 rounded-2xl flex flex-col items-center text-center shadow-xs"
              >
                {m.avatar && (m.avatar.includes('.') || m.avatar.startsWith('/')) ? (
                  <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover mb-1 select-none" />
                ) : (
                  <span className="text-2xl mb-1 select-none">{m.avatar}</span>
                )}
                <span className="text-xs font-bold text-primary-espresso truncate w-full">{m.name}</span>
                <span className="text-[9px] text-muted-espresso mt-0.5 uppercase tracking-wide">
                  ★ {submitCount} Given • {beneficiaryCount} Recv
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search/Sort header helper for large logs */}
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-sm text-primary-espresso">
          Acts of Kindness Ledger ({entries.length})
        </h4>
        <span className="text-xs text-muted-espresso font-medium select-none bg-surface/30 px-2.5 py-1 rounded-lg border border-muted-espresso/5">
          🔒 Live Database Ledger
        </span>
      </div>

      {/* Unbroken chronological layout feed */}
      <ActivityFeed 
        entries={entries}
        familyMembers={members}
        onDelete={(id) => { void handleDeleteEntry(id); }}
        onUpdate={(entry) => { void handleUpdateEntry(entry); }}
        isAdmin={true}
      />
    </div>
  );
};
