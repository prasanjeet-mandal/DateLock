import React, { useRef, useState, useEffect } from 'react';
import { Mail, Clock, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

export default function OtpInput({
  email,
  length = 6,
  onComplete,
  onResend,
  previewOtp = null,
  previewUrl = null,
  loading = false,
  error = ''
}) {
  const [digits, setDigits] = useState(Array(length).fill(''));
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    const digit = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-focus next input
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Trigger onComplete if all slots filled
    if (newDigits.every(d => d !== '')) {
      onComplete?.(newDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);

    const nextFocusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextFocusIndex]?.focus();

    if (pastedData.length === length) {
      onComplete?.(pastedData);
    }
  };

  const handleResendClick = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await onResend?.();
      setCooldown(60);
      setDigits(Array(length).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error(err);
    } finally {
      setResending(false);
    }
  };

  const handleFillPreview = () => {
    if (!previewOtp) return;
    const chars = previewOtp.slice(0, length).split('');
    const newDigits = Array(length).fill('');
    chars.forEach((c, idx) => { newDigits[idx] = c; });
    setDigits(newDigits);
    inputRefs.current[length - 1]?.focus();
    onComplete?.(previewOtp);
  };

  return (
    <div className="w-full space-y-5">
      {/* Header Info */}
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center mx-auto shadow-glow-pink">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Check Your Inbox</h3>
        <p className="text-xs text-pink-200/70 max-w-xs mx-auto">
          We sent a 6-digit verification code to{' '}
          <span className="font-semibold text-pink-300 break-all">{email}</span>
        </p>
      </div>

      {/* 6 Digit Input Boxes */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 px-1" onPaste={handlePaste}>
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={el => inputRefs.current[idx] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`w-10 h-12 sm:w-12 sm:h-14 rounded-2xl text-center text-lg sm:text-2xl font-black font-mono tracking-wider transition-all duration-200 outline-none shrink-0 ${
              digit
                ? 'bg-pink-500/20 border-2 border-pink-400 text-white shadow-glow-pink scale-105'
                : 'bg-white/5 border border-pink-500/20 text-pink-200 focus:border-pink-400 focus:bg-pink-500/10 focus:shadow-glow-pink'
            }`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
          {error}
        </div>
      )}

      {/* Live Webmail Preview / Auto-fill Helper for Demo SMTP */}
      {previewUrl && (
        <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/25 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-xs text-pink-200 font-semibold">
            <span>📬 Demo Mail Dispatched!</span>
          </div>
          <p className="text-[11px] text-pink-300/70">
            Preview the real branded email and retrieve the 6-digit code in the live webmail viewer:
          </p>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pink-500/25 hover:bg-pink-500/40 text-pink-100 text-xs font-bold transition-all border border-pink-400/30 shadow-glow-pink"
          >
            <span>Open Live Ethereal Webmail ↗</span>
          </a>
        </div>
      )}

      {previewOtp && (
        <div className="text-center">
          <button
            type="button"
            onClick={handleFillPreview}
            className="inline-flex items-center gap-1.5 text-xs text-pink-300/80 hover:text-white transition-colors underline font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Auto-fill test code: <strong className="text-pink-200">{previewOtp}</strong></span>
          </button>
        </div>
      )}

      {/* Resend Cooldown & Action */}
      <div className="flex items-center justify-center gap-2 text-xs">
        {cooldown > 0 ? (
          <div className="flex items-center gap-1.5 text-pink-300/60 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Resend code in <strong className="text-pink-300 font-mono">0:{cooldown < 10 ? `0${cooldown}` : cooldown}</strong></span>
          </div>
        ) : (
          <button
            type="button"
            disabled={resending}
            onClick={handleResendClick}
            className="flex items-center gap-1.5 text-pink-300 hover:text-white font-bold hover:underline transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Sending...' : 'Resend Verification Code'}
          </button>
        )}
      </div>
    </div>
  );
}
