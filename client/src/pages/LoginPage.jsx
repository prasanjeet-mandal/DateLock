import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('student1@demo.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, switchDemoPersona } = useAuth();
  const navigate = useNavigate();

  // Student Authentication
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      navigate('/discover');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Student 1-Click Fast Switch
  const handleQuickDemo = async (role, studentIndex) => {
    setError('');
    setLoading(true);
    try {
      await switchDemoPersona(role, studentIndex);
      navigate('/discover');
    } catch (err) {
      setError('Failed to switch demo persona.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden bg-[#0e0612] text-pink-50">
      {/* Ambient pinkish background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-3xl glass-panel-elevated border border-pink-500/25 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 mb-4 shadow-glow-pink">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Sign In</h1>
          <p className="text-xs text-pink-200/70 mt-1">Sign in to your college campus network</p>
        </div>

        {/* 1-Click Fast Demo Autofill Bar (Students Only) */}
        <div className="mb-6 p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-pink-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Student Demo Profiles:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student', 1)}
              className="py-1.5 px-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-xs text-pink-100 font-semibold transition-all text-center"
            >
              👨‍💻 Aarav
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('student', 2)}
              className="py-1.5 px-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-xs text-rose-100 font-semibold transition-all text-center"
            >
              👩‍🎨 Ananya
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('student', 3)}
              className="py-1.5 px-2 rounded-xl bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-400/40 text-xs text-fuchsia-100 font-semibold transition-all text-center"
            >
              🏎 Rohan
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-pink-200 mb-1.5">Campus Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-sm"
                placeholder="student1@demo.com"
              />
              <Mail className="w-4 h-4 text-pink-400/70 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-pink-200 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 rounded-2xl glass-input text-sm"
                placeholder="demo123"
              />
              <Lock className="w-4 h-4 text-pink-400/70 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-pink-300/70 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-glow-pink mt-6"
          >
            {loading ? 'Authenticating...' : 'Sign In as Student'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-pink-200/60">
          New to DateLock?{' '}
          <Link to="/register" className="text-pink-300 hover:underline font-semibold">
            Create Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
