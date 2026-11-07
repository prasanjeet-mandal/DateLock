import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collegeApi, authApi } from '../services/api';
import OtpInput from '../components/common/OtpInput';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Mail, Lock, User, GraduationCap } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP Verification, 3: Profile Details
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    collegeId: 'iitr',
    course: '',
    age: 20,
    gender: 'Male',
    connectionPreference: 'both'
  });
  const [colleges, setColleges] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewOtp, setPreviewOtp] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [verifiedOtpCode, setVerifiedOtpCode] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    collegeApi.getColleges()
      .then(res => setColleges(res.data))
      .catch(err => console.error(err));
  }, []);

  // STEP 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.displayName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await authApi.sendOtp(formData.email, 'registration');
      setPreviewOtp(res.data.previewOtp || null);
      setPreviewUrl(res.data.previewUrl || null);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch verification code. Please check email.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    const res = await authApi.sendOtp(formData.email, 'registration');
    setPreviewOtp(res.data.previewOtp || null);
    setPreviewUrl(res.data.previewUrl || null);
  };

  // STEP 2: Verify Submitted OTP
  const handleVerifyOtp = async (code) => {
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(formData.email, code, 'registration');
      if (res.data.verified) {
        setVerifiedOtpCode(code);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Complete Final Registration
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        ...formData,
        otp: verifiedOtpCode,
        emailVerified: true
      });
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.error || 'Account creation failed. Please check entries.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden bg-[#0e0612] text-pink-50">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg p-8 rounded-3xl glass-panel-elevated border border-pink-500/25 shadow-2xl relative z-10">
        
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between mb-8 px-2">
          {[
            { num: 1, label: 'Account' },
            { num: 2, label: 'Email OTP' },
            { num: 3, label: 'Profile' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step > s.num
                      ? 'bg-pink-500 text-white shadow-glow-pink'
                      : step === s.num
                      ? 'bg-pink-500/30 text-pink-200 border-2 border-pink-400 shadow-glow-pink'
                      : 'bg-white/5 text-pink-300/40 border border-white/10'
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-[11px] font-semibold ${step >= s.num ? 'text-pink-200' : 'text-pink-300/40'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-300 ${
                    step > s.num ? 'bg-pink-500 shadow-glow-pink' : 'bg-pink-500/15'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {step === 1 && 'Create Student Account'}
            {step === 2 && 'Email Verification'}
            {step === 3 && 'Complete Campus Profile'}
          </h1>
          <p className="text-xs text-pink-200/70 mt-1">
            {step === 1 && 'Join your exclusive student social & dating community'}
            {step === 2 && 'Confirm your email with a secure 6-digit one-time code'}
            {step === 3 && 'Tailor your vibes and connection preferences'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* STEP 1: Account Info & Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-pink-200 mb-1">Your Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="e.g. Sameer Rao"
                />
                <User className="w-4 h-4 text-pink-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-pink-200 mb-1">College Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="name@iitr.ac.in or student@demo.com"
                />
                <Mail className="w-4 h-4 text-pink-400 absolute left-3.5 top-3" />
              </div>
              <p className="text-[11px] text-pink-300/60 mt-1">
                We'll dispatch a 6-digit verification code to this address.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-pink-200 mb-1">Select Your College / University</label>
              <div className="relative">
                <select
                  value={formData.collegeId}
                  onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm bg-[#150a1b]"
                >
                  {colleges.map((col) => (
                    <option key={col.id} value={col.id} className="bg-[#150a1b] text-white">
                      {col.name} ({col.shortName})
                    </option>
                  ))}
                </select>
                <GraduationCap className="w-4 h-4 text-pink-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-pink-200 mb-1">Create Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-pink-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-glow-pink mt-6"
            >
              {loading ? 'Sending Code...' : 'Send Verification Code'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Email OTP Input */}
        {step === 2 && (
          <div className="space-y-6">
            <OtpInput
              email={formData.email}
              length={6}
              previewOtp={previewOtp}
              previewUrl={previewUrl}
              loading={loading}
              error={error}
              onComplete={handleVerifyOtp}
              onResend={handleResendOtp}
            />

            <div className="flex items-center justify-start pt-4 border-t border-pink-500/15">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs text-pink-300/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Email
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Profile Details */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Email Verified: <strong>{formData.email}</strong></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-1">Course / Branch</label>
                <input
                  type="text"
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="e.g. B.Tech Computer Science"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-1">Age (18+)</label>
                <input
                  type="number"
                  min="18"
                  max="30"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-pink-200 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-[#150a1b]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-pink-200 mb-1">Connection Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {['both', 'friendship', 'dating'].map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setFormData({ ...formData, connectionPreference: pref })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all border ${
                      formData.connectionPreference === pref
                        ? 'bg-pink-500/25 text-pink-200 border-pink-400 shadow-glow-pink'
                        : 'bg-pink-500/5 text-pink-300/60 border-pink-500/10 hover:text-white'
                    }`}
                  >
                    {pref === 'both' ? '✨ Both' : pref === 'friendship' ? '🤝 Friends' : '💘 Dating'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-2xl glass-panel text-pink-200 text-xs font-bold hover:text-white transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-glow-pink"
              >
                {loading ? 'Creating Profile...' : 'Complete & Enter DateLock'}
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-pink-200/60">
          Already have an account?{' '}
          <Link to="/login" className="text-pink-300 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
