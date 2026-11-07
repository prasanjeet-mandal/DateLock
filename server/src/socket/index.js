import { db } from '../db/index.js';

export function setupSocketIO(io) {
  const onlineUsers = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit('user:online', { userId, status: 'online' });
    }

    // Join match room
    socket.on('join:match', ({ matchId }) => {
      socket.join(`match_${matchId}`);
    });

    // Leave match room
    socket.on('leave:match', ({ matchId }) => {
      socket.leave(`match_${matchId}`);
    });

    // Typing start
    socket.on('typing:start', ({ matchId, senderId }) => {
      socket.to(`match_${matchId}`).emit('typing:status', { matchId, senderId, isTyping: true });
    });

    // Typing stop
    socket.on('typing:stop', ({ matchId, senderId }) => {
      socket.to(`match_${matchId}`).emit('typing:status', { matchId, senderId, isTyping: false });
    });

    // Send real-time message
    socket.on('message:send', ({ matchId, senderId, receiverId, content }) => {
      if (!matchId || !content || !content.trim()) return;

      const newMsg = db.addMessage(matchId, senderId, receiverId, content.trim());

      // Broadcast to room
      io.to(`match_${matchId}`).emit('message:received', newMsg);

      // Also notify receiver if online outside room
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('notification:new_message', {
          matchId,
          message: newMsg
        });
      }
    });

    // React to message in real-time
    socket.on('message:react', ({ matchId, messageId, userId: reactingUserId, emoji }) => {
      const updated = db.addReactionToMessage(messageId, reactingUserId, emoji);
      if (updated) {
        io.to(`match_${matchId}`).emit('message:reaction_updated', {
          messageId,
          reactions: updated.reactions
        });
      }
    });

    // Delete message in real-time
    socket.on('message:delete', ({ matchId, messageId, userId: deletingUserId }) => {
      const result = db.deleteMessage(messageId, deletingUserId);
      if (result) {
        io.to(`match_${matchId}`).emit('message:deleted', { messageId });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (userId) {
        onlineUsers.delete(userId);
        io.emit('user:offline', { userId, status: 'offline' });
      }
    });
  });
}
