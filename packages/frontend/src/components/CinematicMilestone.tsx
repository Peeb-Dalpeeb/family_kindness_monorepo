import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, Heart, ChevronRight, Star } from 'lucide-react';
import { METER_THRESHOLD } from '@family-kindness/shared';

interface CinematicMilestoneProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneNumber: number;
}

export const CinematicMilestone: React.FC<CinematicMilestoneProps> = ({
  isOpen,
  onClose,
  milestoneNumber,
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; color: string; size: number }>>([]);

  // Generate unique falling confetti-like celebratory sparkles on active trigger
  useEffect(() => {
    if (isOpen) {
      const colors = ['#D96B43', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];
      const generated = Array.from({ length: 48 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage offset
        y: Math.random() * -100 - 10, // start above viewport
        delay: Math.random() * 2,
        color: colors[i % colors.length],
        size: Math.random() * 8 + 6, // px size
      }));
      setParticles(generated);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="cinematic-milestone-overlay"
        className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-primary-espresso/90 backdrop-blur-md overflow-hidden"
      >
        {/* Falling Fireworks/Confetti Sparkles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -20, x: `${String(p.x)}vw`, opacity: 0, rotate: 0 }}
              animate={{ 
                y: '110vh', 
                opacity: [0, 1, 1, 0],
                rotate: 360,
                x: `${String(p.x + (Math.random() * 10 - 5))}vw`
              }}
              transition={{ 
                duration: Math.random() * 3 + 3, 
                delay: p.delay,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}`
              }}
            />
          ))}
        </div>

        {/* Celebratory Central Card Dialog Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 15, stiffness: 180 }}
          className="relative max-w-lg w-full bg-canvas border border-amber-success/30 rounded-[36px] p-6 md:p-8 text-center shadow-2xl overflow-hidden"
        >
          {/* Internal radiant amber light circle glows */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-success/20 rounded-full blur-3xl" />

          <div className="relative space-y-6">
            
            {/* Animated Big Medal Banner */}
            <div className="flex justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.12, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="p-5 rounded-full bg-amber-success/15 border border-amber-success/40 text-amber-success relative inline-block"
              >
                <Award className="w-16 h-16" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                </div>
              </motion.div>
            </div>

            {/* Sparkles Floating Around Title */}
            <div className="space-y-2">
              <span className="text-xs uppercase font-mono tracking-widest font-bold text-amber-success bg-amber-success/10 px-3.5 py-1.5 rounded-full">
                ★ House milestone achieved ★
              </span>
              
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary-espresso tracking-tight leading-tight mt-3">
                Kindness Meter Overflow!
              </h2>

              <p className="text-sm text-muted-espresso font-sans max-w-sm mx-auto mt-2 leading-relaxed">
                Thank you, family! Every kind word, warm gesture, and helping hand filled our heart tracker once more!
              </p>
            </div>

            {/* Verification Statistics and Badge Tally info */}
            <div className="bg-surface/60 border border-muted-espresso/10 p-5 rounded-2xl md:rounded-3xl max-w-sm mx-auto flex items-center justify-around gap-4 shadow-xs">
              <div className="text-center">
                <span className="block text-[10px] text-muted-espresso uppercase font-bold tracking-wider">Milestone Tally</span>
                <span className="text-2xl font-black text-amber-success font-mono">{milestoneNumber}x Filled</span>
              </div>
              <div className="h-8 w-px bg-muted-espresso/15" />
              <div className="text-center">
                <span className="block text-[10px] text-muted-espresso uppercase font-bold tracking-wider">Total Contribution</span>
                <span className="text-2xl font-black text-primary-espresso font-mono">{(milestoneNumber * METER_THRESHOLD).toLocaleString()} pts</span>
              </div>
            </div>

            {/* Celebratory heart-warming greeting */}
            <p className="text-xs text-kindness font-semibold flex items-center justify-center gap-1.5">
              <Heart className="w-4 h-4 fill-kindness text-kindness animate-pulse" />
              <span>Great job! A special treat or fun family outing is in order!</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </p>

            {/* Action button to return back to dashboard */}
            <button
              onClick={onClose}
              className="w-full py-4.5 bg-amber-success hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              type="button"
            >
              <span>Keep Spreading Kindness!</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
