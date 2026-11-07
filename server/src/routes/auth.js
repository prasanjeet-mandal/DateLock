import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { signToken, authMiddleware } from '../middleware/auth.js';
import { otpService } from '../services/otpService.js';

const router = express.Router();

// POST /api/auth/send-otp
// Dispatches 6-digit email OTP for registration or verification
router.post('/send-otp', async (req, res) => {
  const { email, purpose } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const result = await otpService.createAndSendOtp({
    email,
    purpose: purpose || 'registration'
  });

  if (!result.success) {
    return res.status(400).json({
      error: result.error,
      cooldownSeconds: result.cooldownSeconds
    });
  }

  res.json(result);
});

// POST /api/auth/verify-otp
// Validates submitted 6-digit OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp, purpose } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and 6-digit code are required.' });
  }

  const result = otpService.verifyOtp({
    email,
    otp,
    purpose: purpose || 'registration'
  });

  if (!result.success) {
    return res.status(400).json({
      error: result.error,
      remainingAttempts: result.remainingAttempts
    });
  }

  res.json(result);
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password, adminSecurityKey } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Check email or use demo accounts.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch && password !== 'demo123') { // Allow standard demo password fallback
    return res.status(401).json({ error: 'Invalid password. For demo accounts use: demo123' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'This demo account is suspended.' });
  }

  // HIGH-SECURITY LOCKDOWN: Admin accounts require the Master Security Passkey (2FA)
  if (user.role === 'admin') {
    const providedKey = adminSecurityKey || req.body.adminKey || req.headers['x-admin-secret-key'];
    const expectedKey = process.env.ADMIN_SECRET_KEY || 'DL_ADMIN_MASTER_SECURE_2026_ROORKEE';

    if (!providedKey || providedKey !== expectedKey) {
      db.logAdminAction(
        'unauthorized_outsider',
        'admin_login_rejected_missing_passkey',
        'security_lockdown',
        req.ip || 'unknown',
        'Login attempt to admin account rejected: Missing or invalid Master Security Passkey'
      );
      return res.status(403).json({
        error: 'Security Enforcement: Admin accounts require the Master Security Passkey (2FA) to access the system.'
      });
    }

    db.logAdminAction(
      user.id,
      'admin_login_successful',
      'auth',
      req.ip || 'unknown',
      'Administrator authenticated successfully with 2FA Master Passkey'
    );
  }

  const token = signToken(user);
  const profile = db.findProfileByUserId(user.id);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    },
    profile
  });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, displayName, collegeId, course, age, gender, connectionPreference, otp, emailVerified } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Verify email status: check if already verified in Step 2 OTP flow or verify supplied OTP
  let isEmailVerified = false;

  if (otpService.isEmailVerified(email, 'registration')) {
    isEmailVerified = true;
    otpService.consumeVerifiedEmail(email, 'registration');
  } else if (otp) {
    const otpRes = otpService.verifyOtp({ email, otp, purpose: 'registration' });
    if (!otpRes.success) {
      return res.status(400).json({ error: otpRes.error });
    }
    isEmailVerified = true;
  } else if (emailVerified) {
    isEmailVerified = true;
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newUser = {
    id: newUserId,
    email,
    password: passwordHash,
    role: 'student',
    status: 'active',
    emailVerified: isEmailVerified,
    createdAt: new Date().toISOString()
  };

  db.createUser(newUser);

  // Create initial profile
  const newProfile = db.upsertProfile(newUserId, {
    displayName: displayName || email.split('@')[0],
    age: age || 20,
    gender: gender || 'Other',
    collegeId: collegeId || 'iitr',
    course: course || 'General Studies',
    year: '1st Year',
    bio: 'Excited to explore campus life and meet new friends!',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    avatar3dSeed: `${displayName || 'Student'}-${collegeId || 'IITR'}`,
    connectionPreference: connectionPreference || 'both',
    discoveryScope: 'both',
    discoveryEnabled: true,
    interests: ['coding', 'indie_music', 'cafe_hopping'],
    verificationStatus: 'not_submitted',
    vibePrompt: 'Say hi if you like coffee and good conversations!'
  });

  const token = signToken(newUser);

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status
    },
    profile: newProfile
  });
});

// POST /api/auth/switch-demo
// 1-Click Fast Persona Switcher (Locked down for Student Personas only)
router.post('/switch-demo', (req, res) => {
  const { role, studentIndex, adminSecretKey } = req.body;
  let targetUser;

  if (role === 'admin') {
    // SECURITY LOCKDOWN: Outsiders cannot switch to admin!
    const providedKey = adminSecretKey || req.body.adminKey || req.headers['x-admin-secret-key'];
    const expectedKey = process.env.ADMIN_SECRET_KEY || 'DL_ADMIN_MASTER_SECURE_2026_ROORKEE';

    if (!providedKey || providedKey !== expectedKey) {
      db.logAdminAction(
        'unauthorized_visitor',
        'admin_switch_blocked',
        'security_lockdown',
        req.ip || 'unknown',
        'Attempted to switch to admin without Master Security Key'
      );
      return res.status(403).json({
        error: 'Security Enforcement: Admin role requires Master Security Passkey.'
      });
    }

    targetUser = db.findUserById('usr_admin');
  } else {
    const studentId = studentIndex === 2 ? 'usr_student_2' : (studentIndex === 3 ? 'usr_student_3' : 'usr_student_1');
    targetUser = db.findUserById(studentId);
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Demo user persona not found.' });
  }

  const token = signToken(targetUser);
  const profile = db.findProfileByUserId(targetUser.id);

  res.json({
    token,
    user: {
      id: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      status: targetUser.status
    },
    profile
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const profile = db.findProfileByUserId(req.user.id);
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status
    },
    profile
  });
});

export default router;
