import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Heart, Sun, Moon, Home, Lock } from 'lucide-react';
import { Dashboard } from './pages/Dashboard.js';
import { Admin } from './pages/Admin.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';

function AppContent() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-canvas text-primary-espresso min-h-screen px-4 py-10 transition-colors duration-300">
      {/* Header */}
      <header className="border-muted-espresso/10 mx-auto mb-10 flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-5 max-w-4xl">
        <div className="flex items-center gap-3">
          <div className="bg-kindness flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm">
            <Heart className="h-5 w-5 fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              Family Kindness Tracker
            </h1>
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
