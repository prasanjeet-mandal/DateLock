import express from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/likes
// Body: { targetUserId: string, type: 'like' | 'pass' }
router.post('/', authMiddleware, (req, res) => {
  const { targetUserId, type } = req.body;
  if (!targetUserId) {
    return res.status(400).json({ error: 'targetUserId is required' });
  }

  if (targetUserId === req.user.id) {
    return res.status(400).json({ error: 'Cannot like yourself' });
  }

  const result = db.addLike(req.user.id, targetUserId, type || 'like');

  if (result.isMatch) {
    const partnerProfile = db.findProfileByUserId(targetUserId);
    return res.json({
      success: true,
      isMatch: true,
      match: result.match,
      partner: partnerProfile
    });
  }

  res.json({
    success: true,
    isMatch: false,
    like: result.like
  });
});

// POST /api/likes/undo
// Rewind / Undo last swipe action
router.post('/undo', authMiddleware, (req, res) => {
  const result = db.undoLastAction(req.user.id);
  if (!result) {
    return res.status(400).json({ error: 'No recent action to undo.' });
  }

  const restoredProfile = db.findProfileByUserId(result.undoneUserId);
  res.json({
    success: true,
    message: 'Action undone',
    restoredProfile
  });
});

export default router;
