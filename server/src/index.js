import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import collegeRoutes from './routes/colleges.js';
import profileRoutes from './routes/profiles.js';
import discoverRoutes from './routes/discover.js';
import likeRoutes from './routes/likes.js';
import matchRoutes from './routes/matches.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import verificationRoutes from './routes/verification.js';
import safetyRoutes from './routes/safety.js';
import adminRoutes from './routes/admin.js';

import { securityHeadersMiddleware } from './middleware/securityHeaders.js';
import { apiLimiter, authLimiter, swipeLimiter, messageLimiter } from './middleware/rateLimiter.js';
import { sanitizeMiddleware } from './middleware/sanitizer.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { setupSocketIO } from './socket/index.js';
import { db } from './db/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Disable fingerprinting header
app.disable('x-powered-by');

// Permitted CORS Whitelist
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, test harnesses, or same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In local development/demo, permit local host variants
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    callback(new Error('Cross-Origin Request Blocked by DateLock CORS Policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-user-id']
};

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Defense-in-depth Security Headers
app.use(securityHeadersMiddleware);

// Hardened CORS
app.use(cors(corsOptions));

// Safe payload size bounds (allows rich profile pictures and cover photos)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded media & platform client downloads statically
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

const DOWNLOADS_DIR = path.join(__dirname, '../downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}
app.use('/downloads', express.static(DOWNLOADS_DIR));

// Deep prototype pollution & XSS sanitizer
app.use(sanitizeMiddleware);

// General API rate limiter
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'DEMO',
    timestamp: new Date().toISOString()
  });
});

// Specialized Rate Limiters for High-Risk Endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/likes', swipeLimiter);
app.use('/api/messages/send', messageLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/admin', adminRoutes);

// Setup Real-time Sockets
setupSocketIO(io);

// Serve static frontend build if available
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return notFoundHandler(req, res);
  }
  const indexPath = path.join(clientBuildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('DateLock API Server is running. Access Vite frontend at http://localhost:5173');
    }
  });
});

// Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Export app and server for tests and modular execution
export { app, server, io };

// Only listen if executed directly, not when imported by test runner
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('src\\index.js') ||
  process.argv[1].endsWith('src/index.js') ||
  process.argv[1].endsWith('server\\src\\index.js') ||
  process.argv[1].endsWith('server/src/index.js')
);

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 DateLock Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO server ready for real-time messaging`);
  });
}
