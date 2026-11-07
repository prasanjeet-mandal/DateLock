import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const router = express.Router();

// POST /api/profiles/upload
// Receives image (Base64 data URI or URL), saves to server uploads and returns public URL
router.post('/upload', authMiddleware, (req, res) => {
  const { image, type } = req.body;
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Valid image data is required.' });
  }

  // If already an external HTTP(S) URL, return directly
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return res.json({ success: true, url: image });
  }

  // Handle data URI (base64)
  if (image.startsWith('data:image/')) {
    const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid image data format.' });
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      ext = 'jpg';
    }

    const buffer = Buffer.from(matches[2], 'base64');

    // 10MB limit guard
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image exceeds maximum allowed size of 10MB.' });
    }

    const filename = `${type || 'photo'}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${filename}`;

    return res.json({ success: true, url: publicUrl });
  }

  return res.status(400).json({ error: 'Unsupported image format. Please upload JPG, PNG, or WebP.' });
});

// GET /api/profiles/me
router.get('/me', authMiddleware, (req, res) => {
  const profile = db.findProfileByUserId(req.user.id);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json(profile);
});

// GET /api/profiles/:userId
router.get('/:userId', authMiddleware, (req, res) => {
  const profile = db.findProfileByUserId(req.params.userId);
  if (!profile) {
    return res.status(404).json({ error: 'Student profile not found' });
  }
  res.json(profile);
});

// PUT /api/profiles/update
router.put('/update', authMiddleware, (req, res) => {
  const allowedFields = [
    'displayName', 'age', 'gender', 'collegeId', 'course', 'year',
    'bio', 'avatarUrl', 'coverUrl', 'avatar3dSeed', 'connectionPreference',
    'discoveryScope', 'discoveryEnabled', 'interests', 'vibePrompt'
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const updatedProfile = db.upsertProfile(req.user.id, updates);
  res.json(updatedProfile);
});

export default router;
