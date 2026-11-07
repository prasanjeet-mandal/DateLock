import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'datelock_super_secret_demo_key_2026';

// STRICT SECURITY: usr_admin is EXCLUDED from demo impersonation.
// Admin privileges can NEVER be obtained via headers.
const ALLOWED_DEMO_USERS = new Set(['usr_student_1', 'usr_student_2', 'usr_student_3']);

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req, res, next) {
  // Demo persona header check: strictly limited to student demo profiles only
  const demoUserId = req.headers['x-demo-user-id'];
  if (demoUserId) {
    if (!ALLOWED_DEMO_USERS.has(demoUserId)) {
      // If someone attempts to pass usr_admin or arbitrary ID, reject with 403
      return res.status(403).json({
        error: 'Security Enforcement: Admin privilege escalation and unauthorized impersonation strictly blocked.'
      });
    }
    const user = db.findUserById(demoUserId);
    if (user) {
      req.user = user;
      return next();
    }
  }

  // Check Bearer Token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended by administration.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    // Record unauthorized admin breach attempt in security audit log
    try {
      db.logAdminAction(
        req.user?.id || 'unauthorized_outsider',
        'admin_access_rejected',
        'security_lockdown',
        req.originalUrl,
        `Blocked unauthorized access from IP: ${req.ip || 'unknown'}`
      );
    } catch (e) {
      // Ignore logging failure
    }

    return res.status(403).json({
      error: 'Access Denied: High-security administrative zone. Unauthorized access strictly prohibited.'
    });
  }
  next();
}
