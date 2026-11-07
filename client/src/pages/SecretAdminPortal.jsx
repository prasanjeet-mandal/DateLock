import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import { ShieldCheck, ShieldAlert, KeyRound, Lock, Mail, Eye, EyeOff, Sparkles, Terminal } from 'lucide-react';

export default function SecretAdminPortal() {
  const { user, isAdmin, login } = useAuth();

  const [adminEmail, setAdminEmail] = useState('admin@demo.com');
  const [adminPassword, setAdminPassword] = useState('demo123');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated with administrative privileges, render the Admin Dashboard
  if (user && isAdmin) {
    return <AdminDashboard />;
  }

  // Otherwise, render the dedicated Secret Authentication Vault
  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (!adminPasskey.trim()) {
      setError('Master 2FA Passkey is required to access the Administrative Vault.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(adminEmail.trim(), adminPassword, adminPasskey.trim());
      if (data.user?.role !== 'admin') {
        setError('Unauthorized: Provided credentials lack system moderator privileges.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication rejected: Invalid administrator credentials or passkey.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoPasskey = () => {
    setAdminPasskey('DL_ADMIN_MASTER_SECURE_2026_ROORKEE');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden bg-[#07030a] text-pink-50">
      {/* Dark obsidian ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-3xl bg-[#120718]/90 border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative z-10">
        
        {/* Terminal Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 mb-2">
            <Terminal className="w-3 h-3" />
            <span>Secured Administrative Vault</span>
          </div>
          <h1 className="text-2xl font-black text-white">DateLock Moderator Gate</h1>
          <p className="text-xs text-pink-200/60 mt-1 max-w-xs mx-auto">
            This administrative terminal is secluded from public navigation. Dual-factor authorization required.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/35 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-pink-200 mb-1.5">Master Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono"
                placeholder="admin@demo.com"
              />
              <Mail className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-pink-200 mb-1.5">Admin Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-xs"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-pink-300/70 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Master 2FA Security Passkey</span>
              </label>
              <button
                type="button"
                onClick={handleFillDemoPasskey}
                className="text-[10px] text-pink-400 hover:text-pink-300 hover:underline font-mono"
              >
                Auto-fill Demo Key
              </button>
            </div>
            <input
              type="password"
              required
              value={adminPasskey}
              onChange={(e) => setAdminPasskey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs font-mono tracking-wider focus:border-amber-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.25)] outline-none"
              placeholder="DL_ADMIN_MASTER_SECURE_2026_ROORKEE"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white font-extrabold text-sm shadow-[0_4px_25px_rgba(245,158,11,0.3)] hover:opacity-95 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Verifying Authorization...' : 'Unlock Administrative Vault'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-pink-300/40 font-mono">
          Security Level: Tier-3 Dual Authentication &bull; DateLock Core
        </div>
      </div>
    </div>
  );
}
