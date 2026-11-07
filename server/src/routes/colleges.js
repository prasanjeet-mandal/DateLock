import express from 'express';
import { db } from '../db/index.js';

const router = express.Router();

// GET /api/colleges
router.get('/', (req, res) => {
  const colleges = db.getColleges();
  res.json(colleges);
});

// GET /api/colleges/interests
router.get('/interests', (req, res) => {
  const interests = db.getInterests();
  res.json(interests);
});

export default router;
