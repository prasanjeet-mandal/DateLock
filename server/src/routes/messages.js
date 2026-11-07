import express from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
router.use(authMiddleware);

// GET /api/messages/:matchId
router.get('/:matchId', asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const match = db.getMatches().find(m => m.id === matchId && m.active && m.users.includes(req.user.id));
  if (!match) {
    return res.status(403).json({ error: 'You can only message active mutual matches' });
  }

  const messages = db.getMessagesForMatch(matchId, req.user.id);
  const partnerId = match.users.find(id => id !== req.user.id);
  const partnerProfile = db.findProfileByUserId(partnerId);

  res.json({
    match,
    partner: partnerProfile,
    messages
  });
}));

// POST /api/messages/send
router.post('/send', asyncHandler(async (req, res) => {
  const { matchId, content } = req.body;
  if (!matchId || !content || !content.trim()) {
    return res.status(400).json({ error: 'matchId and message content are required' });
  }

  const match = db.getMatches().find(m => m.id === matchId && m.active && m.users.includes(req.user.id));
  if (!match) {
    return res.status(403).json({ error: 'Cannot send messages to inactive or non-existent match' });
  }

  const receiverId = match.users.find(id => id !== req.user.id);
  const newMsg = db.addMessage(matchId, req.user.id, receiverId, content.trim());

  res.status(201).json(newMsg);
}));

// POST /api/messages/:messageId/react
// Body: { emoji: '❤️' | '😂' | '🔥' | '👏' }
router.post('/:messageId/react', asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;

  if (!emoji) {
    return res.status(400).json({ error: 'Emoji reaction is required' });
  }

  const updatedMsg = db.addReactionToMessage(messageId, req.user.id, emoji);
  if (!updatedMsg) {
    return res.status(404).json({ error: 'Message not found' });
  }
  if (updatedMsg.unauthorized) {
    return res.status(403).json({ error: 'Unauthorized to react to messages outside your matches' });
  }

  res.json({ success: true, message: updatedMsg });
}));

// DELETE /api/messages/:messageId
router.delete('/:messageId', asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const result = db.deleteMessage(messageId, req.user.id);

  if (!result) {
    return res.status(404).json({ error: 'Message not found or you are not authorized to delete it' });
  }

  res.json({ success: true, messageId });
}));

// GET /api/messages/:matchId/search?q=query
router.get('/:matchId/search', asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const { q } = req.query;

  const match = db.getMatches().find(m => m.id === matchId && m.active && m.users.includes(req.user.id));
  if (!match) {
    return res.status(403).json({ error: 'Unauthorized to search messages for this match' });
  }

  const results = db.searchMessages(matchId, q);
  res.json({ query: q, results });
}));

export default router;
