import express from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { otpService } from '../services/otpService.js';

const router = express.Router();

// GET /api/verification/status
router.get('/status', authMiddleware, (req, res) => {
  const profile = db.findProfileByUserId(req.user.id);
  const request = db.getVerificationForUser(req.user.id);
  res.json({
    status: profile ? profile.verificationStatus : 'not_submitted',
    request: request || null
  });
});

// POST /api/verification/send-college-otp
// Dispatches OTP to student's institutional / college email (.ac.in / college domain)
router.post('/send-college-otp', authMiddleware, async (req, res) => {
  const { collegeEmail, collegeId } = req.body;
  if (!collegeEmail || !collegeEmail.includes('@')) {
    return res.status(400).json({ error: 'Valid college email address is required.' });
  }

  const profile = db.findProfileByUserId(req.user.id);
  const targetCollegeId = collegeId || profile?.collegeId || 'iitr';
  const college = db.getCollegeById(targetCollegeId);

  const result = await otpService.createAndSendOtp({
    email: collegeEmail,
    purpose: 'college_verification',
    collegeName: college ? college.name : 'Roorkee College'
  });

  if (!result.success) {
    return res.status(400).json({
      error: result.error,
      cooldownSeconds: result.cooldownSeconds
    });
  }

  res.json(result);
});

// POST /api/verification/verify-college-otp
// Validates institutional email OTP and instantly approves the student's campus badge
router.post('/verify-college-otp', authMiddleware, (req, res) => {
  const { collegeEmail, otp } = req.body;
  if (!collegeEmail || !otp) {
    return res.status(400).json({ error: 'College email and 6-digit code are required.' });
  }

  const result = otpService.verifyOtp({
    email: collegeEmail,
    otp,
    purpose: 'college_verification'
  });

  if (!result.success) {
    return res.status(400).json({
      error: result.error,
      remainingAttempts: result.remainingAttempts
    });
  }

  // Instantly approve verification status
  const updatedProfile = db.upsertProfile(req.user.id, {
    verificationStatus: 'verified',
    collegeEmail: collegeEmail.toLowerCase()
  });

  // Record verified submission in verifications table
  const verifications = db.getVerifications();
  const existingReqIdx = verifications.findIndex(v => v.userId === req.user.id);
  const now = new Date().toISOString();

  const record = {
    id: `req_${Date.now()}`,
    userId: req.user.id,
    collegeId: updatedProfile.collegeId || 'iitr',
    collegeEmail: collegeEmail.toLowerCase(),
    studentRollNumber: `VERIFIED-EMAIL:${collegeEmail}`,
    submittedAt: now,
    status: 'approved',
    reviewedBy: 'system_otp_verification',
    reviewedAt: now,
    adminNotes: `Automated instant verification via verified college mail OTP (${collegeEmail})`
  };

  if (existingReqIdx >= 0) {
    verifications[existingReqIdx] = record;
  } else {
    verifications.push(record);
  }

  // Create celebratory notification
  db.createNotification({
    userId: req.user.id,
    type: 'verification',
    title: '🎓 Student Verification Approved!',
    message: `Your college email (${collegeEmail}) has been verified. Your profile now has the official verified campus badge.`,
    link: '/verification',
    data: { status: 'approved', collegeEmail }
  });

  res.json({
    success: true,
    verified: true,
    message: 'Institutional email successfully verified! Official student badge activated.',
    profile: updatedProfile
  });
});

// POST /api/verification/submit
// Manual / Simulated roll number submission fallback
router.post('/submit', authMiddleware, (req, res) => {
  const { rollNumber, collegeId } = req.body;
  if (!rollNumber) {
    return res.status(400).json({ error: 'Student Roll Number or Demo Enrollment ID is required' });
  }

  const profile = db.findProfileByUserId(req.user.id);
  const college = collegeId || (profile ? profile.collegeId : 'iitr');

  const reqObj = db.submitVerification(req.user.id, college, rollNumber);
  res.status(201).json({
    success: true,
    message: 'Simulated verification request submitted for review.',
    request: reqObj
  });
});

export default router;
