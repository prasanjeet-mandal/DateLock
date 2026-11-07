import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationApi } from '../../services/api';
import {
  Compass,
  Globe2,
  Heart,
  MessageCircle,
  User,
  Shield,
  LogOut,
  Sparkles,
  Sliders,
  CheckCircle2,
  Bell,
  Check,
  Download
} from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout, isAuthenticated, isAdmin } = useAuth();
  const { connectionMode, setConnectionMode, modeAura } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const isActive = (path) => location.pathname === path;

  // Load notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    notificationApi.getNotifications()
      .then(res => {
        setNotifications(res.data.notifications || []);
        setUnreadNotifCount(res.data.unreadCount || 0);
      })
      .catch(err => console.error(err));
  }, [isAuthenticated, location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-pink-500/15 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo in Pinkish Gradient */}
        <Link to={isAuthenticated ? "/discover" : "/"} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-500 to-fuchsia-500 p-0.5 shadow-glow-pink transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#120817] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-100 via-pink-200 to-rose-200 bg-clip-text text-transparent">
              Date<span className="bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">Lock</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-pink-300 ml-1.5 px-1.5 py-0.2 bg-pink-500/15 rounded border border-pink-500/20">
              {profile?.college?.city || profile?.college?.shortName || 'CAMPUS'}
            </span>
          </div>
        </Link>

        {/* Dynamic Mode Switcher (Friendship vs Dating vs Both) */}
        {isAuthenticated && !isAdmin && (
          <div className="hidden md:flex items-center p-1 rounded-2xl bg-black/40 border border-pink-500/20 backdrop-blur-md">
            <button
              onClick={() => setConnectionMode('both')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                connectionMode === 'both'
                  ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white shadow-glow-pink font-bold'
                  : 'text-pink-200/70 hover:text-white'
              }`}
            >
              ✨ Both
            </button>
            <button
              onClick={() => setConnectionMode('friendship')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                connectionMode === 'friendship'
                  ? 'bg-pink-400 text-black font-bold shadow-glow-blush'
                  : 'text-pink-200/70 hover:text-white'
              }`}
            >
              🤝 Friends
            </button>
            <button
              onClick={() => setConnectionMode('dating')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                connectionMode === 'dating'
                  ? 'bg-rose-500 text-white font-bold shadow-glow-rose'
                  : 'text-pink-200/70 hover:text-white'
              }`}
            >
              💘 Dating
            </button>
          </div>
        )}

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <>
                  <Link
                    to="/discover"
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive('/discover')
                        ? 'bg-pink-500/20 text-pink-200 border border-pink-400/35 shadow-sm'
                        : 'text-pink-100/70 hover:text-white hover:bg-pink-500/10'
                    }`}
                  >
                    <Compass className="w-4 h-4 text-pink-400" />
                    <span>Discover</span>
                  </Link>

                  <Link
                    to="/campus-3d"
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive('/campus-3d')
                        ? 'bg-pink-500/20 text-pink-200 border border-pink-400/35 shadow-sm'
                        : 'text-pink-100/70 hover:text-white hover:bg-pink-500/10'
                    }`}
                  >
                    <Globe2 className="w-4 h-4 text-pink-400" />
                    <span>Campus Map</span>
                  </Link>

                  <Link
                    to="/matches"
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive('/matches')
                        ? 'bg-pink-500/20 text-pink-200 border border-pink-400/35 shadow-sm'
                        : 'text-pink-100/70 hover:text-white hover:bg-pink-500/10'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>Matches</span>
                  </Link>

                  <Link
                    to="/messages"
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive('/messages')
                        ? 'bg-pink-500/20 text-pink-200 border border-pink-400/35 shadow-sm'
                        : 'text-pink-100/70 hover:text-white hover:bg-pink-500/10'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 text-pink-400" />
                    <span>Messages</span>
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/vault-panel-7729"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive('/vault-panel-7729')
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </>
          ) : (
            <>
              <a
                href="#download"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/25 text-xs font-semibold text-pink-200 hover:text-white transition-all mr-1"
              >
                <Download className="w-3.5 h-3.5 text-pink-400" />
                <span>Download App</span>
              </a>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-pink-200/80 hover:text-white transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-bold text-sm shadow-glow-pink hover:opacity-95 active:scale-95 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* User Controls: Notifications & Profile Pill */}
        {isAuthenticated && (
          <div className="flex items-center gap-2">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setMenuOpen(false);
                }}
                className="p-2 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 transition-all relative border border-pink-500/20"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-glow-pink animate-pulse">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {notifOpen && (
                <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-96 rounded-3xl glass-panel-elevated border border-pink-500/25 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-pink-500/15 mb-3">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-pink-400" />
                      <span>Notifications</span>
                    </span>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-pink-300 hover:text-white font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-xs text-pink-300/60">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotifOpen(false);
                            if (n.link) navigate(n.link);
                          }}
                          className={`p-3 rounded-2xl transition-all cursor-pointer border ${
                            !n.read
                              ? 'bg-pink-500/15 border-pink-400/30'
                              : 'bg-white/5 border-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="text-xs font-bold text-white mb-0.5">{n.title}</div>
                          <div className="text-xs text-pink-200/70 line-clamp-2">{n.message}</div>
                          <div className="text-[10px] text-pink-300/50 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setMenuOpen(!menuOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/25 transition-all"
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-900 border border-pink-400/50">
                  <img
                    src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-pink-100 max-w-[100px] truncate">
                  {profile?.displayName || (isAdmin ? 'Admin' : 'Student')}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel-elevated border border-pink-500/25 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-pink-500/15 mb-1">
                    <div className="text-xs font-bold text-white truncate">{profile?.displayName || user.email}</div>
                    <div className="text-[11px] text-pink-300 font-medium capitalize">{profile?.college?.name || user.role}</div>
                  </div>

                  {!isAdmin && (
                    <>
                      {/* Mobile Mode Switcher */}
                      <div className="md:hidden p-1.5 mb-1.5 bg-pink-500/10 rounded-xl border border-pink-500/20">
                        <div className="text-[10px] text-pink-300 font-semibold mb-1 px-1">Connection Mode:</div>
                        <div className="grid grid-cols-3 gap-1">
                          {['both', 'friendship', 'dating'].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setConnectionMode(mode);
                                setMenuOpen(false);
                              }}
                              className={`py-1 text-[10px] font-bold rounded-lg capitalize transition-all ${
                                connectionMode === mode
                                  ? 'bg-pink-500 text-white shadow-glow-pink'
                                  : 'text-pink-300/70 hover:text-white'
                              }`}
                            >
                              {mode === 'both' ? '✨ Both' : mode === 'friendship' ? '🤝 Friends' : '💘 Dating'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-medium text-pink-100 hover:text-white hover:bg-pink-500/15 flex items-center gap-2 transition-all"
                      >
                        <User className="w-4 h-4 text-pink-400" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/verification"
                        onClick={() => setMenuOpen(false)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-medium text-pink-100 hover:text-white hover:bg-pink-500/15 flex items-center gap-2 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Student Verification</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-medium text-pink-100 hover:text-white hover:bg-pink-500/15 flex items-center gap-2 transition-all"
                      >
                        <Sliders className="w-4 h-4 text-pink-400" />
                        <span>Privacy & Settings</span>
                      </Link>
                    </>
                  )}

                  {isAdmin && (
                    <Link
                      to="/vault-panel-7729"
                      onClick={() => setMenuOpen(false)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium text-amber-300 hover:bg-amber-500/10 flex items-center gap-2 transition-all"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <div className="border-t border-pink-500/15 my-1" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/15 flex items-center gap-2 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
