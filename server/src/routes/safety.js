import express from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/safety/report
router.post('/report', authMiddleware, (req, res) => {
  const { targetUserId, reason, description } = req.body;
  if (!targetUserId || !reason) {
    return res.status(400).json({ error: 'targetUserId and reason are required' });
  }

  const report = db.submitReport(req.user.id, targetUserId, reason, description || '');
  res.status(201).json({
    success: true,
    message: 'Report submitted. Admin moderation team will review this demo profile.',
    report
  });
});

// POST /api/safety/block
router.post('/block', authMiddleware, (req, res) => {
  const { targetUserId } = req.body;
  if (!targetUserId) {
    return res.status(400).json({ error: 'targetUserId is required' });
  }

  db.blockUser(req.user.id, targetUserId);
  res.json({
    success: true,
    message: 'User blocked successfully. They will not appear in discovery or messaging.'
  });
});

// POST /api/safety/unblock
router.post('/unblock', authMiddleware, (req, res) => {
  const { targetUserId } = req.body;
  if (!targetUserId) {
    return res.status(400).json({ error: 'targetUserId is required' });
  }

  db.unblockUser(req.user.id, targetUserId);
  res.json({ success: true, message: 'User unblocked' });
});

// GET /api/safety/blocks
router.get('/blocks', authMiddleware, (req, res) => {
  const blockedIds = db.getBlockedUserIds(req.user.id);
  const profiles = db.getProfiles().filter(p => blockedIds.includes(p.userId));
  res.json(profiles);
});

export default router;
