import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, AlertCircle, RefreshCw } from 'lucide-react';

interface ServerWarmupOverlayProps {
  onConnected: () => void;
}

export const ServerWarmupOverlay: React.FC<ServerWarmupOverlayProps> = ({ onConnected }) => {
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<'sleeping' | 'offline'>('sleeping');
  const [isRetrying, setIsRetrying] = useState(false);

  // References to clear timers cleanly on unmount or status changes
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const secondsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);

  // Dynamic message based on elapsed seconds
  const getLoadingMessage = () => {
    if (elapsed < 10) {
      return 'Waking up the Kindness Tracker... 🌤️';
    } else if (elapsed < 25) {
      return 'Almost there! The server is stretching and getting ready...';
    } else {
      return 'Warming up the database. Thanks for your patience!';
    }
  };

  const checkConnection = async () => {
    if (isCheckingRef.current) return false;
    isCheckingRef.current = true;

    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        onConnected();
        return true;
      }
    } catch {
      // Log error internally, do not break the UI
      console.log('Backend health check attempt failed (normal during spin-up).');
    } finally {
      isCheckingRef.current = false;
    }
    return false;
  };

  const startChecking = () => {
    setStatus('sleeping');
    setIsRetrying(false);

    // 1. Run immediate check
    void checkConnection();

    // 2. Start linear poll every 2.5 seconds
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(() => {
      void checkConnection();
    }, 2500);

    // 3. Start elapsed seconds counter
    if (secondsTimerRef.current) clearInterval(secondsTimerRef.current);
    secondsTimerRef.current = setInterval(() => {
      setElapsed((prev) => {
        // If elapsed exceeds 60 seconds, transition to offline state
        if (prev >= 60) {
          setStatus('offline');
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Trigger check on mount
  useEffect(() => {
    startChecking();

    // Cleanup functions to prevent memory leaks and zombie intervals
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (secondsTimerRef.current) clearInterval(secondsTimerRef.current);
    };
  }, []);

  // Monitor status changes. If we transition to offline, clear the polling timers
  useEffect(() => {
    if (status === 'offline') {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      if (secondsTimerRef.current) {
        clearInterval(secondsTimerRef.current);
        secondsTimerRef.current = null;
      }
    }
  }, [status]);

  const handleManualRetry = async () => {
    setIsRetrying(true);
    const connected = await checkConnection();
    if (connected) {
      return;
    }

    // Reset elapsed count and restart linear poll if still offline
    setElapsed(0);
    startChecking();
  };

  return (
    <div className="bg-canvas fixed inset-0 z-9999 flex items-center justify-center p-6 transition-colors duration-300 select-none">
      <AnimatePresence mode="wait">
        {status === 'sleeping' ? (
          <motion.div
            key="sleeping"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex max-w-md flex-col items-center text-center"
          >
            {/* Pulsing visual element */}
            <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
              {/* Pulsing ring background */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.0, 0.3],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="bg-kindness/20 absolute inset-0 rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="bg-kindness glow-effect flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-lg"
              >
                <Heart className="h-10 w-10 fill-white" />
              </motion.div>
            </div>

            {/* Title */}
            <h2 className="text-primary-espresso mb-3 text-2xl font-bold tracking-tight">
              Initializing Kindness Tracker
            </h2>

            {/* Informational copy */}
            <p className="text-muted-espresso mb-6 max-w-sm text-sm leading-relaxed font-medium">
              {getLoadingMessage()}
            </p>

            {/* Indeterminate loading feedback */}
            <div className="flex w-full flex-col items-center gap-3">
              {/* Spinner */}
              <div className="border-kindness/20 border-t-kindness h-6 w-6 animate-spin rounded-full border-3" />

              {/* Live elapsed timer */}
              <span className="text-muted-espresso/80 font-mono text-xs font-semibold tracking-wide select-none">
                Elapsed: {elapsed}s / ~30s waking window
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="offline"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="border-muted-espresso/10 bg-surface/40 flex max-w-md flex-col items-center rounded-3xl border p-8 text-center shadow-lg backdrop-blur-md"
          >
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <AlertCircle className="h-7 w-7" />
            </div>

            <h3 className="text-primary-espresso mb-2 text-xl font-bold tracking-tight">
              Connection Trouble
            </h3>

            <p className="text-muted-espresso mb-6 text-xs leading-relaxed font-medium">
              We couldn't connect to the backend server. The database might be undergoing
              maintenance, or you have lost connection to the internet.
            </p>

            <button
              onClick={() => {
                void handleManualRetry();
              }}
              disabled={isRetrying}
              className="bg-kindness hover:bg-kindness/95 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-bold text-white shadow-md transition-all select-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Retrying connection...' : 'Try Reconnecting'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
