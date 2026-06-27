import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    void checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const data = await apiFetch<{ authenticated: boolean }>('/api/auth/status');
    setIsAuthenticated(data?.authenticated ?? false);
  };

  const handleAuthSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (pinInput.length !== 4) {
      setPinError('PIN must be exactly 4 digits');
      return;
    }

    setIsVerifying(true);
    setPinError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: pinInput }),
      });

      const data = (await response.json()) as { success: boolean; message?: string };
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setPinError('');
      } else {
        setPinError(data.message || 'Incorrect PIN code. Try again.');
      }
    } catch (error) {
      console.error('Login request failed:', error);
      setPinError('Unable to connect to the authentication server.');
    } finally {
      setIsVerifying(false);
      setPinInput('');
    }
  };

  if (isAuthenticated === null) {
    // Elegant loading spinner that matches the espresso theme
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="border-kindness h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="border-muted-espresso/15 bg-surface/40 w-full rounded-3xl border p-8 text-center shadow-md backdrop-blur-xs"
        >
          <div className="bg-kindness/10 text-kindness mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
            <Lock className="h-6 w-6" />
          </div>

          <div className="mb-6 space-y-1">
            <h4 className="text-primary-espresso text-lg font-bold">
              Parent Authorization Required
            </h4>
            <p className="text-muted-espresso text-xs font-medium">
              Enter parental PIN to verify administrative access.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              void handleAuthSubmit(e);
            }}
            className="space-y-4"
          >
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                const cleanValue = e.target.value.replace(/\D/g, '');
                setPinInput(cleanValue);
                setPinError('');
              }}
              placeholder="••••"
              className="border-muted-espresso/15 focus:ring-kindness/30 bg-canvas/30 text-primary-espresso w-full rounded-xl border p-3 text-center text-2xl font-bold tracking-widest focus:border-transparent focus:ring-2 focus:outline-none"
              autoFocus
              disabled={isVerifying}
            />

            {pinError && (
              <p className="rounded-lg border border-red-500/10 bg-red-500/5 p-2.5 text-xs font-medium text-red-500">
                ⚠️ {pinError}
              </p>
            )}

            <button
              type="submit"
              disabled={isVerifying || pinInput.length !== 4}
              className="bg-kindness hover:bg-kindness/95 w-full cursor-pointer rounded-xl py-3 font-bold text-white shadow-xs transition active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify Passcode'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};
