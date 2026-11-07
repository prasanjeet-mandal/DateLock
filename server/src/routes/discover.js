import express from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/discover
// Query params: mode, collegeId, scope, year, interest
router.get('/', authMiddleware, (req, res) => {
  const { mode, collegeId, scope, year, interest } = req.query;

  const filters = {
    mode,
    collegeId,
    scope,
    year,
    interest
  };

  const candidates = db.getDiscoveryCandidates(req.user.id, filters);
  res.json({
    total: candidates.length,
    candidates
  });
});

export default router;
