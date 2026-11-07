import express from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/notifications
router.get('/', asyncHandler(async (req, res) => {
  const list = db.getNotifications(req.user.id);
  const unreadCount = db.getUnreadNotificationCount(req.user.id);
  res.json({
    notifications: list,
    unreadCount
  });
}));

// GET /api/notifications/unread-count
router.get('/unread-count', asyncHandler(async (req, res) => {
  const count = db.getUnreadNotificationCount(req.user.id);
  res.json({ unreadCount: count });
}));

// PUT /api/notifications/:id/read
router.put('/:id/read', asyncHandler(async (req, res) => {
  const updated = db.markNotificationRead(req.params.id, req.user.id);
  if (!updated) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  res.json({ success: true, notification: updated });
}));

// PUT /api/notifications/read-all
router.put('/read-all', asyncHandler(async (req, res) => {
  const result = db.markAllNotificationsRead(req.user.id);
  res.json(result);
}));

export default router;
