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
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; delay: number; color: string; size: number }>
  >([]);

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
        className="bg-primary-espresso/90 fixed inset-0 z-100 flex items-center justify-center overflow-hidden p-4 backdrop-blur-md"
      >
        {/* Falling Fireworks/Confetti Sparkles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -20, x: `${String(p.x)}vw`, opacity: 0, rotate: 0 }}
              animate={{
                y: '110vh',
                opacity: [0, 1, 1, 0],
                rotate: 360,
                x: `${String(p.x + (Math.random() * 10 - 5))}vw`,
              }}
              transition={{
                duration: Math.random() * 3 + 3,
                delay: p.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}`,
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
          className="bg-canvas border-amber-success/30 relative w-full max-w-lg overflow-hidden rounded-[36px] border p-6 text-center shadow-2xl md:p-8"
        >
          {/* Internal radiant amber light circle glows */}
          <div className="bg-amber-success/20 absolute -top-12 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl" />

          <div className="relative space-y-6">
            {/* Animated Big Medal Banner */}
            <div className="flex justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="bg-amber-success/15 border-amber-success/40 text-amber-success relative inline-block rounded-full border p-5"
              >
                <Award className="h-16 w-16" />
                <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                  <Star className="h-5 w-5 animate-pulse fill-amber-500 text-amber-500" />
                </div>
              </motion.div>
            </div>

            {/* Sparkles Floating Around Title */}
            <div className="space-y-2">
              <span className="text-amber-success bg-amber-success/10 rounded-full px-3.5 py-1.5 font-mono text-xs font-bold tracking-widest uppercase">
                ★ House milestone achieved ★
              </span>

              <h2 className="text-primary-espresso mt-3 text-3xl leading-tight font-extrabold tracking-tight md:text-4xl">
                Kindness Meter Overflow!
              </h2>

              <p className="text-muted-espresso mx-auto mt-2 max-w-sm font-sans text-sm leading-relaxed">
                Thank you, family! Every kind word, warm gesture, and helping hand filled our heart
                tracker once more!
              </p>
            </div>

            {/* Verification Statistics and Badge Tally info */}
            <div className="bg-surface/60 border-muted-espresso/10 mx-auto flex max-w-sm items-center justify-around gap-4 rounded-2xl border p-5 shadow-xs md:rounded-3xl">
              <div className="text-center">
                <span className="text-muted-espresso block text-[10px] font-bold tracking-wider uppercase">
                  Milestone Tally
                </span>
                <span className="text-amber-success font-mono text-2xl font-black">
                  {milestoneNumber}x Filled
                </span>
              </div>
              <div className="bg-muted-espresso/15 h-8 w-px" />
              <div className="text-center">
                <span className="text-muted-espresso block text-[10px] font-bold tracking-wider uppercase">
                  Total Contribution
                </span>
                <span className="text-primary-espresso font-mono text-2xl font-black">
                  {(milestoneNumber * METER_THRESHOLD).toLocaleString()} pts
                </span>
              </div>
            </div>

            {/* Celebratory heart-warming greeting */}
            <p className="text-kindness flex items-center justify-center gap-1.5 text-xs font-semibold">
              <Heart className="fill-kindness text-kindness h-4 w-4 animate-pulse" />
              <span>Great job! A special treat or fun family outing is in order!</span>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </p>

            {/* Action button to return back to dashboard */}
            <button
              onClick={onClose}
              className="bg-amber-success mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-4.5 font-bold text-white shadow-md transition-all hover:bg-amber-600 hover:shadow-lg"
              type="button"
            >
              <span>Keep Spreading Kindness!</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
