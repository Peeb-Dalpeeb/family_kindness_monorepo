import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Plus } from 'lucide-react';
import { METER_THRESHOLD, type DashboardMetrics, type FamilyMember, type PointsCategory } from '@family-kindness/shared';
import { MilestoneBanner } from '../components/MilestoneBanner';
import { RadialGauge } from '../components/RadialGauge';
import { LogModal } from '../components/LogModal';
import { CinematicMilestone } from '../components/CinematicMilestone';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPoints: 0,
    completedMilestones: 0,
    currentProgressPoints: 0,
    percentage: 0,
    totalLogs: 0,
  });

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [celebrationMilestoneCount, setCelebrationMilestoneCount] = useState(0);
  const [isRadialGlowActive, setIsRadialGlowActive] = useState(false);

  // Fetch initial dashboard data
  useEffect(() => {
    void fetchMetrics();
    void fetchMembers();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/meter-status');
      if (response.ok) {
        const data = (await response.json()) as DashboardMetrics;
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = (await response.json()) as FamilyMember[];
        setMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch family members:', error);
    }
  };

  const handleAddNewEntry = async (newEntryData: {
    submittedBy: string;
    beneficiary: string;
    category: PointsCategory;
    pointsAwarded: number;
    description: string;
  }) => {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntryData),
      });

      if (!response.ok) {
        const errData = (await response.json()) as { message?: string };
        alert(errData.message || 'Validation failed. Please verify inputs.');
        return;
      }

      // Re-fetch metrics and check if milestone was crossed
      const prevMilestones = metrics.completedMilestones;
      
      const metricsResponse = await fetch('/api/meter-status');
      if (metricsResponse.ok) {
        const nextMetrics = (await metricsResponse.json()) as DashboardMetrics;
        setMetrics(nextMetrics);

        if (nextMetrics.completedMilestones > prevMilestones) {
          // Trigger celebration
          setCelebrationMilestoneCount(nextMetrics.completedMilestones);
          setIsRadialGlowActive(true);
          setTimeout(() => {
            setIsCelebrationOpen(true);
          }, 600);
        }
      }
    } catch (error) {
      console.error('Failed to save log entry:', error);
      alert('Network error. Unable to submit log.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-16">
      {/* 1. Top-Anchored Milestone Achievement indicator Banner */}
      <MilestoneBanner completedMilestones={metrics.completedMilestones} />

      {/* 2. Primary Focal Central Radial progress scale */}
      <div className="bg-surface/20 border border-muted-espresso/10 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
        
        {/* Minimal decoration */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[10px] bg-canvas px-2 text-muted-espresso border border-muted-espresso/5 py-1 rounded-lg">
          <Activity className="w-3 h-3 text-kindness" />
          <span>Weekly House Goal</span>
        </div>

        {/* Radial Gauge Dial */}
        <RadialGauge 
          percentage={metrics.percentage} 
          currentPoints={metrics.currentProgressPoints} 
          isGlowActive={isRadialGlowActive || metrics.completedMilestones > 0}
        />

        {/* Small statistic indicators helping children visually map points */}
        <div className="grid grid-cols-3 gap-6 max-w-sm w-full mx-auto text-center border-t border-muted-espresso/10 pt-5 mt-2">
          <div>
            <span className="block text-[10px] text-muted-espresso uppercase font-bold">Total Points</span>
            <span className="text-sm font-extrabold text-primary-espresso tabular-nums">{metrics.totalPoints}</span>
          </div>
          <div className="border-r border-l border-muted-espresso/10">
            <span className="block text-[10px] text-muted-espresso uppercase font-bold">Next Milestone</span>
            <span className="text-sm font-extrabold text-kindness tabular-nums">{METER_THRESHOLD} pt</span>
          </div>
          <div>
            <span className="block text-[10px] text-muted-espresso uppercase font-bold">Logged Acts</span>
            <span className="text-sm font-extrabold text-primary-espresso tabular-nums">{metrics.totalLogs}</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Target Action Hook */}
      <div className="flex flex-col items-center justify-center pt-2">
        <motion.button
          id="open-log-modal"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setIsLogModalOpen(true); }}
          className="px-8 py-5 rounded-full bg-kindness hover:bg-kindness/95 text-white font-extrabold tracking-wide hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer shadow-md select-none border border-kindness/10"
        >
          <Plus className="w-5 h-5 shrink-0" strokeWidth={3} />
          <span className="text-sm md:text-base">+ Log a New Act of Kindness</span>
        </motion.button>
        
        <p className="text-[10px] md:text-xs text-muted-espresso mt-3">
          Tap anywhere above to open log screen. Best configured on shared kitchen tablets or wall dashboards.
        </p>
      </div>

      {/* LOG CONTEXT MODAL OVERLAY SHEET */}
      <LogModal
        isOpen={isLogModalOpen}
        onClose={() => { setIsLogModalOpen(false); }}
        onSubmit={(entry) => { void handleAddNewEntry(entry); }}
        familyMembers={members}
      />

      {/* CINEMATIC SUCCESS MILESTONE FULL OVERLAY SCREEN */}
      <CinematicMilestone
        isOpen={isCelebrationOpen}
        onClose={() => {
          setIsCelebrationOpen(false);
          setIsRadialGlowActive(false);
        }}
        milestoneNumber={celebrationMilestoneCount}
      />
    </div>
  );
};
