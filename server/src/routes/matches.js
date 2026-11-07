import express from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/matches
router.get('/', authMiddleware, (req, res) => {
  const matches = db.getMatchesForUser(req.user.id);
  res.json(matches);
});

// POST /api/matches/:matchId/unmatch
router.post('/:matchId/unmatch', authMiddleware, (req, res) => {
  const { matchId } = req.params;
  const match = db.getMatches().find(m => m.id === matchId && m.users.includes(req.user.id));
  if (!match) {
    return res.status(404).json({ error: 'Match not found or unauthorized' });
  }

  db.unmatch(matchId);
  res.json({ success: true, message: 'Unmatched successfully' });
});

export default router;
