import crypto from 'crypto';
import { sendOtpEmail } from './emailService.js';

// In-memory OTP storage map: key = `${purpose}:${email.toLowerCase()}`
// Value: { otp, expiresAt, attempts, lastSentAt, collegeName }
const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;  // 60 seconds
const MAX_ATTEMPTS = 5;

function getKey(email, purpose) {
  return `${purpose || 'default'}:${email.trim().toLowerCase()}`;
}

export const otpService = {
  // Generate secure 6-digit numeric OTP
  generateOtp() {
    return crypto.randomInt(100000, 999999).toString();
  },

  // Create and dispatch OTP to recipient email
  async createAndSendOtp({ email, purpose = 'registration', collegeName = '' }) {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Valid email address is required.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const key = getKey(normalizedEmail, purpose);
    const existing = otpStore.get(key);
    const now = Date.now();

    // Enforce 60-second cooldown between resends
    if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
      return {
        success: false,
        error: `Please wait ${waitSeconds} seconds before requesting a new code.`,
        cooldownSeconds: waitSeconds
      };
    }

    const otp = this.generateOtp();
    const expiresAt = now + OTP_EXPIRY_MS;

    otpStore.set(key, {
      otp,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
      collegeName
    });

    // Send email (via Gmail, Resend, SMTP or test simulation)
    const emailResult = await sendOtpEmail({
      to: normalizedEmail,
      otp,
      purpose,
      collegeName
    });

    if (!emailResult.success && process.env.NODE_ENV !== 'test') {
      return {
        success: false,
        error: emailResult.error || 'Failed to dispatch verification email. Please check your credentials in server/.env',
        notConfigured: emailResult.notConfigured
      };
    }

    return {
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
      expiresInSeconds: Math.ceil(OTP_EXPIRY_MS / 1000),
      cooldownSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
      mode: emailResult.mode,
      previewUrl: emailResult.previewUrl || null,
      previewOtp: process.env.NODE_ENV === 'test' ? (emailResult.previewOtp || null) : null
    };
  },

  // Verify submitted OTP
  verifyOtp({ email, otp, purpose = 'registration' }) {
    if (!email || !otp) {
      return { success: false, error: 'Email and 6-digit code are required.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const key = getKey(normalizedEmail, purpose);
    const record = otpStore.get(key);

    if (!record) {
      return {
        success: false,
        error: 'No active verification code found for this email. Please request a new code.'
      };
    }

    const now = Date.now();

    // Check expiration
    if (now > record.expiresAt) {
      otpStore.delete(key);
      return {
        success: false,
        error: 'Verification code has expired. Please request a fresh code.'
      };
    }

    // Check attempt lockout
    if (record.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(key);
      return {
        success: false,
        error: 'Too many incorrect attempts. This code has been invalidated for security. Please request a new code.'
      };
    }

    // Check OTP match
    const cleanOtp = String(otp).trim();
    if (record.otp !== cleanOtp) {
      record.attempts += 1;
      const remaining = MAX_ATTEMPTS - record.attempts;
      return {
        success: false,
        error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        remainingAttempts: remaining
      };
    }

    // Successful verification -> remove OTP to prevent replay attacks
    const collegeName = record.collegeName;
    otpStore.delete(key);

    // Record verified status for registration completion (15-minute grace window)
    otpStore.set(`verified:${purpose}:${normalizedEmail}`, {
      verifiedAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000,
      collegeName
    });

    return {
      success: true,
      verified: true,
      email: normalizedEmail,
      purpose,
      collegeName
    };
  },

  // Check if an email was already verified via OTP within the grace period
  isEmailVerified(email, purpose = 'registration') {
    if (!email) return false;
    const normalizedEmail = email.trim().toLowerCase();
    const verifiedRecord = otpStore.get(`verified:${purpose}:${normalizedEmail}`);
    if (verifiedRecord && Date.now() < verifiedRecord.expiresAt) {
      return true;
    }
    return false;
  },

  // Consume verified status upon account creation
  consumeVerifiedEmail(email, purpose = 'registration') {
    if (!email) return false;
    const normalizedEmail = email.trim().toLowerCase();
    const verified = this.isEmailVerified(normalizedEmail, purpose);
    if (verified) {
      otpStore.delete(`verified:${purpose}:${normalizedEmail}`);
      return true;
    }
    return false;
  },

  // Clear OTP manually if needed
  clearOtp(email, purpose) {
    const key = getKey(email, purpose);
    otpStore.delete(key);
    otpStore.delete(`verified:${purpose}:${email.trim().toLowerCase()}`);
  }
};
