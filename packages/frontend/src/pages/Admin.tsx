import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import {
  type KindnessEntry,
  type FamilyMember,
  type DashboardMetrics,
} from '@family-kindness/shared';
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
    if (
      !window.confirm(
        'Are you absolutely sure you want to delete this act of kindness? This will deduct its points from the collective meter.',
      )
    ) {
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
    <div className="animate-fade-in space-y-6 pb-16">
      {/* Admin Header with info */}
      <div className="bg-surface/50 border-muted-espresso/10 flex flex-col justify-between gap-4 rounded-3xl border p-5 md:flex-row md:items-center">
        <div>
          <h3 className="text-primary-espresso flex items-center gap-2 text-base font-bold md:text-lg">
            <ShieldAlert className="text-kindness h-5 w-5" />
            <span>Parental Chronicle & Logs hub</span>
          </h3>
          <p className="text-muted-espresso mt-0.5 text-xs">
            Complete chronological oversight of household kindness values. Use inline edit
            capabilities to fix descriptions or reward values.
          </p>
        </div>
      </div>

      {/* Total score panel admin display */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Total Logs', value: entries.length, color: 'text-primary-espresso' },
          {
            label: 'Combined Points Earned',
            value: `${String(metrics.totalPoints)} pts`,
            color: 'text-kindness',
          },
          {
            label: 'Times Met Fill Limit',
            value: metrics.completedMilestones,
            color: 'text-amber-success',
          },
          { label: 'Registered Relatives', value: members.length, color: 'text-primary-espresso' },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-canvas border-muted-espresso/10 rounded-2xl border p-4 text-center shadow-xs"
          >
            <span className="text-muted-espresso block text-[10px] font-bold tracking-wider uppercase">
              {item.label}
            </span>
            <span className={`mt-1 block text-xl font-bold ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Interactive Family members tray representation */}
      <div className="bg-surface/15 border-muted-espresso/5 space-y-3.5 rounded-3xl border p-5">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-0.5">
            <h4 className="text-primary-espresso text-xs font-extrabold tracking-wider uppercase">
              Our Household members
            </h4>
            <p className="text-muted-espresso text-[10px]">
              Family member contributions and stats for acts of kindness.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
          {members.map((m) => {
            const counts = memberCounts[m.id] ?? { given: 0, recv: 0 };
            const submitCount = counts.given;
            const beneficiaryCount = counts.recv;
            return (
              <div
                key={m.id}
                className="bg-canvas border-muted-espresso/10 flex flex-col items-center rounded-2xl border p-3 text-center shadow-xs"
              >
                {m.avatar && (m.avatar.includes('.') || m.avatar.startsWith('/')) ? (
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="mb-1 h-8 w-8 rounded-full object-cover select-none"
                  />
                ) : (
                  <span className="mb-1 text-2xl select-none">{m.avatar}</span>
                )}
                <span className="text-primary-espresso w-full truncate text-xs font-bold">
                  {m.name}
                </span>
                <span className="text-muted-espresso mt-0.5 text-[9px] tracking-wide uppercase">
                  ★ {submitCount} Given • {beneficiaryCount} Recv
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search/Sort header helper for large logs */}
      <div className="flex items-center justify-between">
        <h4 className="text-primary-espresso text-sm font-bold">
          Acts of Kindness Ledger ({entries.length})
        </h4>
        <span className="text-muted-espresso bg-surface/30 border-muted-espresso/5 rounded-lg border px-2.5 py-1 text-xs font-medium select-none">
          🔒 Live Database Ledger
        </span>
      </div>

      {/* Unbroken chronological layout feed */}
      <ActivityFeed
        entries={entries}
        familyMembers={members}
        onDelete={(id) => {
          void handleDeleteEntry(id);
        }}
        onUpdate={(entry) => {
          void handleUpdateEntry(entry);
        }}
        isAdmin={true}
      />
    </div>
  );
};
