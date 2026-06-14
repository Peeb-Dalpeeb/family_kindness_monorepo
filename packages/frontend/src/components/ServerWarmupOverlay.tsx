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
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-canvas p-6 select-none transition-colors duration-300">
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
                className="absolute inset-0 rounded-full bg-kindness/20"
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
            <h2 className="text-primary-espresso text-2xl font-bold tracking-tight mb-3">
              Initializing Kindness Tracker
            </h2>

            {/* Informational copy */}
            <p className="text-muted-espresso text-sm font-medium mb-6 leading-relaxed max-w-sm">
              {getLoadingMessage()}
            </p>

            {/* Indeterminate loading feedback */}
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Spinner */}
              <div className="border-kindness/20 border-t-kindness h-6 w-6 animate-spin rounded-full border-3" />
              
              {/* Live elapsed timer */}
              <span className="font-mono text-xs font-semibold text-muted-espresso/80 tracking-wide select-none">
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
            <div className="bg-red-500/10 text-red-500 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
              <AlertCircle className="h-7 w-7" />
            </div>

            <h3 className="text-primary-espresso text-xl font-bold tracking-tight mb-2">
              Connection Trouble
            </h3>

            <p className="text-muted-espresso text-xs font-medium mb-6 leading-relaxed">
              We couldn't connect to the backend server. The database might be undergoing maintenance, or you have lost connection to the internet.
            </p>

            <button
              onClick={() => { void handleManualRetry(); }}
              disabled={isRetrying}
              className="bg-kindness hover:bg-kindness/95 active:scale-95 text-white flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl font-bold cursor-pointer transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed select-none"
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
