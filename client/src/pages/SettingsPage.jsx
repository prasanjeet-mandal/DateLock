import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { safetyApi, profileApi, adminApi } from '../services/api';
import { Sliders, Eye, EyeOff, UserX, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const { profile, updateProfileData } = useAuth();
  const [discoveryEnabled, setDiscoveryEnabled] = useState(profile?.discoveryEnabled !== false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    safetyApi.getBlockedUsers()
      .then(res => setBlockedUsers(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleDiscovery = async () => {
    const nextVal = !discoveryEnabled;
    setDiscoveryEnabled(nextVal);
    try {
      const res = await profileApi.updateProfile({ discoveryEnabled: nextVal });
      updateProfileData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnblock = async (targetUserId) => {
    try {
      await safetyApi.unblockUser(targetUserId);
      setBlockedUsers(prev => prev.filter(p => p.userId !== targetUserId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all demo data back to pristine seed state? This will restore original accounts and matches.')) {
      return;
    }
    setResetting(true);
    try {
      await adminApi.resetDemoData();
      alert('Demo dataset reset successfully! Reloading...');
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-3xl mx-auto px-4 py-8 pb-24 text-pink-50">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-pink-400" />
          <span>Privacy & Account Settings</span>
        </h1>
        <p className="text-xs text-pink-200/70 mt-1">
          Manage discovery visibility, safety blocks, and demo options.
        </p>
      </div>

      <div className="space-y-6">
        {/* Discovery Visibility Toggle (Ghost Mode) */}
        <div className="glass-panel-elevated p-6 rounded-3xl border border-pink-500/25 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {discoveryEnabled ? <Eye className="w-4 h-4 text-pink-400" /> : <EyeOff className="w-4 h-4 text-pink-300/40" />}
              <span>Discovery Visibility (Ghost Mode)</span>
            </h3>
            <p className="text-xs text-pink-200/70 mt-1 max-w-md">
              When turned off, your profile will be hidden from new discovery candidate decks.
            </p>
          </div>

          <button
            onClick={handleToggleDiscovery}
            className={`w-14 h-8 rounded-full p-1 transition-all ${
              discoveryEnabled ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-glow-pink' : 'bg-slate-700'
            }`}
          >
            <div className={`w-6 h-6 rounded-full bg-white transition-all ${
              discoveryEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Blocked Accounts List */}
        <div className="glass-panel-elevated p-6 rounded-3xl border border-pink-500/25">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <UserX className="w-4 h-4 text-rose-400" />
            <span>Blocked Accounts</span>
          </h3>
          <p className="text-xs text-pink-200/70 mb-4">
            Blocked users cannot view your card or send you messages.
          </p>

          {blockedUsers.length === 0 ? (
            <div className="text-xs text-pink-300/50 py-4 text-center">
              No blocked users.
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((u) => (
                <div
                  key={u.userId}
                  className="p-3 rounded-2xl bg-pink-500/5 border border-pink-500/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-xl object-cover" />
                    <div>
                      <div className="text-xs font-bold text-white">{u.displayName}</div>
                      <div className="text-[10px] text-pink-300/60">{u.college?.name}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblock(u.userId)}
                    className="px-3 py-1 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-xs text-pink-200 font-semibold"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evaluator Demo Reset */}
        <div className="glass-panel-elevated p-6 rounded-3xl border border-pink-500/25 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-pink-400" />
              <span>Reset Demo Seed Data</span>
            </h3>
            <p className="text-xs text-pink-200/70 mt-1 max-w-md">
              Restores all sample student profiles, initial mutual matches, messages, and reports to default.
            </p>
          </div>

          <button
            onClick={handleResetDemoData}
            disabled={resetting}
            className="px-4 py-2 rounded-2xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/35 text-xs font-bold text-pink-200 transition-all shadow-glow-pink"
          >
            {resetting ? 'Resetting...' : 'Reset Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
