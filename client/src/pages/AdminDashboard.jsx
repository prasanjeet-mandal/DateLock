import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import {
  Shield,
  Users,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Heart,
  RefreshCw,
  Check,
  X,
  Search,
  Building
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [verifications, setVerifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, verRes, repRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getVerifications(),
        adminApi.getReports(),
        adminApi.getUsers()
      ]);
      setStats(statsRes.data);
      setVerifications(verRes.data || []);
      setReports(repRes.data || []);
      setUsersList(usersRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleReviewVerification = async (id, status) => {
    try {
      await adminApi.updateVerification(id, {
        status,
        adminNotes: `Reviewed by admin on ${new Date().toLocaleDateString()}`
      });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewReport = async (id, status) => {
    try {
      await adminApi.updateReport(id, {
        status,
        adminNotes: `Resolved by moderator on ${new Date().toLocaleDateString()}`
      });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await adminApi.updateUserStatus(id, nextStatus);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demo data back to default?')) return;
    try {
      await adminApi.resetDemoData();
      alert('Demo data reset successfully.');
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 text-pink-50">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-pink-400" />
            <span>Admin & Moderation Portal</span>
          </h1>
          <p className="text-xs text-pink-200/70 mt-1">
            Simulated administrative oversight, student verification queue, and community moderation.
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          className="px-4 py-2.5 rounded-2xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/35 text-xs font-bold text-pink-200 flex items-center gap-2 transition-all shadow-glow-pink"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset All Demo Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div className="p-4 rounded-2xl glass-panel border border-pink-500/15">
            <div className="text-xs text-pink-300/60">Total Students</div>
            <div className="text-2xl font-extrabold text-white mt-1">{stats.totalUsers}</div>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-pink-500/15">
            <div className="text-xs text-pink-300/60">Total Matches</div>
            <div className="text-2xl font-extrabold text-pink-400 mt-1">{stats.totalMatches}</div>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-pink-500/15">
            <div className="text-xs text-pink-300/60">Total Messages</div>
            <div className="text-2xl font-extrabold text-rose-400 mt-1">{stats.totalMessages}</div>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-pink-500/15">
            <div className="text-xs text-pink-300/60">Verified Profiles</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.verifiedProfiles}</div>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-pink-500/15">
            <div className="text-xs text-pink-300/60">Pending Verif.</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{stats.pendingVerifications}</div>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-pink-500/15">
            <div className="text-xs text-pink-300/60">Open Reports</div>
            <div className="text-2xl font-extrabold text-rose-500 mt-1">{stats.openReports}</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-pink-500/15 gap-4 mb-6">
        {[
          { id: 'overview', label: 'Campus Analytics' },
          { id: 'verifications', label: `Verifications (${verifications.filter(v => v.status === 'pending').length})` },
          { id: 'reports', label: `Safety Reports (${reports.filter(r => r.status === 'pending').length})` },
          { id: 'users', label: 'Demo Accounts' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-pink-400 text-pink-300'
                : 'border-transparent text-pink-300/50 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Campus Analytics */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl glass-panel-elevated border border-pink-500/20">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-pink-400" />
              <span>Roorkee Institutions Enrolment Distribution</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.collegeDistribution || {}).map(([college, count]) => (
                <div key={college}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-pink-100">{college}</span>
                    <span className="text-pink-300">{count} profiles</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-pink-500/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-glow-pink"
                      style={{ width: `${Math.min(100, count * 15)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel-elevated border border-pink-500/20">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Connection Preference Split</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.preferenceDistribution || {}).map(([pref, count]) => (
                <div key={pref}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-pink-100 capitalize">{pref}</span>
                    <span className="text-rose-300">{count} users</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-pink-500/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500"
                      style={{ width: `${Math.min(100, count * 20)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Verifications Queue */}
      {activeTab === 'verifications' && (
        <div className="glass-panel-elevated rounded-3xl border border-pink-500/20 overflow-hidden">
          <div className="p-4 border-b border-pink-500/15 text-xs font-bold text-pink-300/70 uppercase tracking-wider">
            Simulated Student Verification Review Queue
          </div>
          <div className="divide-y divide-pink-500/10">
            {verifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-pink-300/50">No verification requests found.</div>
            ) : (
              verifications.map((item) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                      alt=""
                      className="w-12 h-12 rounded-2xl object-cover border border-pink-500/25"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{item.studentName}</div>
                      <div className="text-xs text-pink-300 font-semibold">{item.collegeName}</div>
                      <div className="text-[11px] font-mono text-pink-200/60 mt-0.5">
                        Demo Roll No: <strong className="text-pink-100">{item.studentRollNumber}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold capitalize ${
                      item.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : item.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {item.status}
                    </span>

                    {item.status === 'pending' && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => handleReviewVerification(item.id, 'approved')}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1 shadow-glow-pink"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReviewVerification(item.id, 'rejected')}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs hover:bg-rose-500/30 transition-all flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Safety & Moderation Reports */}
      {activeTab === 'reports' && (
        <div className="glass-panel-elevated rounded-3xl border border-pink-500/20 overflow-hidden">
          <div className="p-4 border-b border-pink-500/15 text-xs font-bold text-pink-300/70 uppercase tracking-wider">
            Reported Profiles Queue
          </div>
          <div className="divide-y divide-pink-500/10">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-xs text-pink-300/50">No active reports. Community is safe!</div>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Reported: {r.reportedName}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                        {r.reason}
                      </span>
                    </div>
                    <div className="text-xs text-pink-200/70 mt-1">{r.description || 'No description provided.'}</div>
                    <div className="text-[11px] text-pink-300/50 mt-0.5">Reported by: {r.reporterName}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold capitalize ${
                      r.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {r.status}
                    </span>

                    {r.status === 'pending' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleReviewReport(r.id, 'resolved')}
                          className="px-3 py-1.5 rounded-xl bg-pink-500/20 text-pink-200 font-bold text-xs hover:bg-pink-500/30"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleReviewReport(r.id, 'dismissed')}
                          className="px-3 py-1.5 rounded-xl bg-pink-500/10 text-pink-300 font-bold text-xs hover:bg-pink-500/20"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Demo Accounts Management */}
      {activeTab === 'users' && (
        <div className="glass-panel-elevated rounded-3xl border border-pink-500/20 overflow-hidden">
          <div className="p-4 border-b border-pink-500/15 text-xs font-bold text-pink-300/70 uppercase tracking-wider">
            Student Demo Accounts ({usersList.length})
          </div>
          <div className="divide-y divide-pink-500/10 max-h-[500px] overflow-y-auto">
            {usersList.map((u) => (
              <div key={u.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{u.profile?.displayName || u.email}</span>
                    <span className="text-[10px] text-pink-300">{u.profile?.college}</span>
                  </div>
                  <div className="text-pink-200/60">{u.email} • {u.role}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    u.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {u.status}
                  </span>

                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleUserStatus(u.id, u.status)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        u.status === 'active'
                          ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                          : 'bg-pink-500/20 text-pink-200 hover:bg-pink-500/30'
                      }`}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
