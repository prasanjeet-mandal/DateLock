import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { verificationApi } from '../services/api';
import OtpInput from '../components/common/OtpInput';
import confetti from 'canvas-confetti';
import { ShieldCheck, AlertCircle, Clock, CheckCircle2, Send, Mail, Sparkles, Award } from 'lucide-react';

export default function VerificationPage() {
  const { profile, updateProfileData } = useAuth();
  const [method, setMethod] = useState('email_otp'); // 'email_otp' | 'roll_number'
  const [collegeEmail, setCollegeEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [status, setStatus] = useState('not_submitted');
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Email OTP state
  const [otpStep, setOtpStep] = useState('input_email'); // 'input_email' | 'enter_otp'
  const [previewOtp, setPreviewOtp] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    verificationApi.getStatus()
      .then(res => {
        setStatus(res.data.status);
        setRequest(res.data.request);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // 1. Send College Mail OTP
  const handleSendCollegeOtp = async (e) => {
    e.preventDefault();
    if (!collegeEmail.includes('@')) {
      setError('Please enter a valid institutional college email.');
      return;
    }

    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const res = await verificationApi.sendCollegeOtp(collegeEmail.trim(), profile?.collegeId || 'iitr');
      setPreviewOtp(res.data.previewOtp || null);
      setPreviewUrl(res.data.previewUrl || null);
      setOtpStep('enter_otp');
      setMessage(`Verification code dispatched to ${collegeEmail}. Check your inbox!`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch college OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Resend College Mail OTP
  const handleResendCollegeOtp = async () => {
    setError('');
    const res = await verificationApi.sendCollegeOtp(collegeEmail.trim(), profile?.collegeId || 'iitr');
    setPreviewOtp(res.data.previewOtp || null);
    setPreviewUrl(res.data.previewUrl || null);
  };

  // 3. Verify College Mail OTP -> Instant Approval!
  const handleVerifyCollegeOtp = async (code) => {
    setError('');
    setSubmitting(true);
    try {
      const res = await verificationApi.verifyCollegeOtp(collegeEmail.trim(), code);
      if (res.data.verified) {
        setStatus('verified');
        updateProfileData({ verificationStatus: 'verified', collegeEmail });
        setMessage('🎓 Instant Verification Approved! Official Campus Badge Activated.');
        
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Incorrect verification code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Fallback Manual Roll Number Submission
  const handleSubmitRollNumber = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) return;

    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      const res = await verificationApi.submitVerification({
        rollNumber: rollNumber.trim(),
        collegeId: profile?.collegeId || 'iitr'
      });
      setStatus('pending');
      setRequest(res.data.request);
      updateProfileData({ verificationStatus: 'pending' });
      setMessage('Simulated verification submitted! Admins can review it in the Admin Dashboard.');
    } catch (err) {
      setError('Submission error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-3xl mx-auto px-4 py-8 pb-24 text-pink-50">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto mb-3 shadow-glow-pink">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Verification Portal</h1>
        <p className="text-xs text-pink-200/70 mt-1 max-w-md mx-auto">
          Verify your student identity to receive the verified campus badge, boosting discovery visibility and compatibility rankings.
        </p>
      </div>

      <div className="glass-panel-elevated p-8 rounded-3xl border border-pink-500/25 shadow-2xl space-y-6">
        {/* Current Status Pill */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-500/5 border border-pink-500/15">
          <div className="flex items-center gap-3">
            {status === 'verified' ? (
              <CheckCircle2 className="w-6 h-6 text-pink-400" />
            ) : status === 'pending' ? (
              <Clock className="w-6 h-6 text-amber-400 animate-spin" />
            ) : (
              <AlertCircle className="w-6 h-6 text-pink-300/60" />
            )}
            <div>
              <div className="text-xs text-pink-300/60">Current Verification Status:</div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">
                {status.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === 'verified'
              ? 'bg-pink-500/25 text-pink-200 border border-pink-400/40 shadow-glow-pink'
              : status === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
              : 'bg-white/10 text-slate-300'
          }`}>
            {status === 'verified' ? '✓ Badge Active' : status === 'pending' ? 'In Review' : 'Action Required'}
          </span>
        </div>

        {message && (
          <div className="p-3 rounded-2xl bg-pink-500/20 border border-pink-500/35 text-pink-200 text-xs font-semibold shadow-glow-pink">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {status === 'verified' ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-pink-500/20 border-2 border-pink-400 text-pink-400 flex items-center justify-center mx-auto shadow-glow-pink">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Your Student Profile is Officially Verified!</h3>
            <p className="text-xs text-pink-200/80 max-w-md mx-auto leading-relaxed">
              Your profile features the pink verified badge across all cards, feeds, and private chats. Fellow students can trust you are a genuine campus member.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>+8 Smart Compatibility Points Active on Discovery</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Method Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-pink-500/10 border border-pink-500/20">
              <button
                type="button"
                onClick={() => setMethod('email_otp')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  method === 'email_otp'
                    ? 'bg-pink-500 text-white shadow-glow-pink'
                    : 'text-pink-300/70 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>College Email OTP (Instant)</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('roll_number')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  method === 'roll_number'
                    ? 'bg-pink-500 text-white shadow-glow-pink'
                    : 'text-pink-300/70 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Student Roll Number</span>
              </button>
            </div>

            {/* TAB 1: Institutional Email OTP */}
            {method === 'email_otp' && (
              <div className="space-y-4">
                {otpStep === 'input_email' ? (
                  <form onSubmit={handleSendCollegeOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-pink-200 mb-1">
                        Institutional / College Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={collegeEmail}
                        onChange={(e) => setCollegeEmail(e.target.value)}
                        placeholder="e.g. yourname@iitr.ac.in, coer.ac.in, etc."
                        className="w-full px-4 py-3 rounded-2xl glass-input text-sm font-mono"
                      />
                      <p className="text-[11px] text-pink-300/60 mt-1">
                        Instant automated verification: we'll send a 6-digit one-time code to confirm your campus domain.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow-pink hover:opacity-95 active:scale-95 transition-all"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{submitting ? 'Dispatching Code...' : 'Send College Verification Code'}</span>
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <OtpInput
                      email={collegeEmail}
                      length={6}
                      previewOtp={previewOtp}
                      previewUrl={previewUrl}
                      loading={submitting}
                      error={error}
                      onComplete={handleVerifyCollegeOtp}
                      onResend={handleResendCollegeOtp}
                    />

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => { setOtpStep('input_email'); setError(''); }}
                        className="text-xs text-pink-300/70 hover:text-white transition-colors hover:underline"
                      >
                        ← Change Institutional Email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Manual Student Roll Number */}
            {method === 'roll_number' && (
              <form onSubmit={handleSubmitRollNumber} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-pink-200 mb-1">
                    Official College Roll Number / Enrollment ID
                  </label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. IITR/2023/CS/4012 or COER/IT/1109"
                    className="w-full px-4 py-3 rounded-2xl glass-input text-sm font-mono"
                  />
                  <p className="text-[11px] text-pink-300/50 mt-1">
                    Enter your official university roll number or student ID for verified credential review.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-200">
                  ⚠️ <strong>Privacy Protection:</strong> DateLock will never ask for your government Aadhaar or PAN card. Only institutional enrollment identifiers are verified.
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow-pink hover:opacity-95"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit for Admin Review'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
