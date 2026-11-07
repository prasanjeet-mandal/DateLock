import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PersonaBar() {
  const { user, profile, switchDemoPersona } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = async (role, studentIndex) => {
    try {
      await switchDemoPersona(role, studentIndex);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/discover');
      }
    } catch (err) {
      console.error('Persona switch error:', err);
    }
  };

  return (
    <div className="bg-[#0e0612]/95 backdrop-blur-md border-b border-pink-500/20 py-1.5 px-4 text-xs z-50 sticky top-0">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Demo Environment Notice in Pink */}
        <div className="flex items-center gap-2 text-pink-200/70">
          <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-pulse shadow-glow-pink" />
          <span className="font-semibold text-pink-300">DEMO MODE:</span>
          <span className="hidden sm:inline text-pink-200/60">Simulated profiles for Roorkee & nearby colleges.</span>
        </div>

        {/* 1-Click Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] text-pink-300/50 font-medium mr-1 hidden md:inline">Instant Personas:</span>

          <button
            onClick={() => handleSwitch('student', 1)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              user?.email === 'student1@demo.com'
                ? 'bg-pink-500/25 text-pink-200 border border-pink-400/50 shadow-glow-pink'
                : 'bg-pink-500/5 hover:bg-pink-500/15 text-pink-100/70 border border-pink-500/10'
            }`}
          >
            <span>👨‍💻 Aarav (IITR)</span>
          </button>

          <button
            onClick={() => handleSwitch('student', 2)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              user?.email === 'student2@demo.com'
                ? 'bg-rose-500/25 text-rose-200 border border-rose-400/50 shadow-glow-rose'
                : 'bg-pink-500/5 hover:bg-pink-500/15 text-pink-100/70 border border-pink-500/10'
            }`}
          >
            <span>👩‍🎨 Ananya (COER)</span>
          </button>

          <button
            onClick={() => handleSwitch('student', 3)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              user?.email === 'student3@demo.com'
                ? 'bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-400/50 shadow-glow-fuchsia'
                : 'bg-pink-500/5 hover:bg-pink-500/15 text-pink-100/70 border border-pink-500/10'
            }`}
          >
            <span>🏎 Rohan (Quantum)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
