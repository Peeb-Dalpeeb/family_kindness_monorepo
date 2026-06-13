import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Heart, Sun, Moon, Home, Lock, WifiOff, Loader2 } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ServerWarmupOverlay } from './components/ServerWarmupOverlay';

type ConnectionStatus = 'connected' | 'sleeping' | 'offline';

function AppContent() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('sleeping');
  const [isInitiallyLoaded, setIsInitiallyLoaded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    let active = true;

    const verifyConnection = async () => {
      // If the ping takes longer than 1.5s, update status to 'sleeping' in the header
      const warningTimeout = setTimeout(() => {
        if (active) {
          setConnectionStatus((prev) => (prev === 'connected' ? 'sleeping' : prev));
        }
      }, 1500);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => { controller.abort(); }, 5000); // 5s timeout on health ping

        const res = await fetch('/api/health', { signal: controller.signal });
        clearTimeout(timeoutId);
        clearTimeout(warningTimeout);

        if (res.ok && active) {
          setConnectionStatus('connected');
          setIsInitiallyLoaded(true);
        } else if (active) {
          setConnectionStatus((prev) => (prev === 'sleeping' ? 'sleeping' : 'offline'));
        }
      } catch {
        clearTimeout(warningTimeout);
        if (active) {
          setConnectionStatus((prev) => (prev === 'sleeping' ? 'sleeping' : 'offline'));
        }
      }
    };

    // Initial check
    void verifyConnection();

    // Setup focus and visibility event listeners
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void verifyConnection();
      }
    };

    const handleFocus = () => {
      void verifyConnection();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Clean up event listeners and references on unmount to prevent leaks and cascades
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  if (connectionStatus === 'sleeping' && !isInitiallyLoaded) {
    return (
      <ServerWarmupOverlay
        onConnected={() => {
          setConnectionStatus('connected');
          setIsInitiallyLoaded(true);
        }}
      />
    );
  }

  return (
    <div className="bg-canvas text-primary-espresso min-h-screen px-4 py-10 transition-colors duration-300">
      {/* Header */}
      <header className="border-muted-espresso/10 mx-auto mb-10 flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-5 max-w-4xl">
        <div className="flex items-center gap-3">
          <div className="bg-kindness flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm">
            <Heart className="h-5 w-5 fill-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                Family Kindness Tracker
              </h1>
              
              {/* Connection Badges */}
              {connectionStatus === 'connected' && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 select-none">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  Connected
                </span>
              )}
              {connectionStatus === 'sleeping' && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/15 animate-pulse select-none">
                  <Loader2 className="h-2.5 w-2.5 animate-spin text-amber-500" />
                  Server Sleeping
                </span>
              )}
              {connectionStatus === 'offline' && (
                <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-600 dark:text-red-400 border border-red-500/15 select-none">
                  <WifiOff className="h-2.5 w-2.5 text-red-500" />
                  Offline
                </span>
              )}
            </div>
            <p className="text-muted-espresso text-xs font-medium">
              Turning household acts of gratitude and aid into shared wins.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Theme Switcher */}
          <button
            onClick={() => { setThemeMode(themeMode === 'light' ? 'dark' : 'light'); }}
            className="border-muted-espresso/10 text-muted-espresso hover:bg-surface hover:text-primary-espresso cursor-pointer rounded-xl border p-2.5 transition-all"
            title="Toggle theme mode"
          >
            {themeMode === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>

          {/* Navigation Controls */}
          <div className="bg-surface/50 p-1 rounded-2xl border border-muted-espresso/10 flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                isActive('/dashboard')
                  ? 'bg-canvas text-kindness shadow-xs ring-1 ring-kindness/5'
                  : 'text-muted-espresso hover:text-primary-espresso'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                isActive('/admin')
                  ? 'bg-canvas text-kindness shadow-xs ring-1 ring-kindness/5'
                  : 'text-muted-espresso hover:text-primary-espresso'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Parent Hub</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="mx-auto max-w-4xl">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-muted-espresso/10 text-muted-espresso/70 mx-auto mt-12 max-w-4xl border-t py-8 text-center text-[11px] select-none space-y-1">
        <p>© 2026 Family Kindness Tracker — MERN Monorepo v1.0.0</p>
        <p className="font-mono text-[10px]">Deployed Mode Node Ingress Injected • Port Localhost</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
