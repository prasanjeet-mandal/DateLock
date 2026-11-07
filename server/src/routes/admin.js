import express from 'express';
import { db } from '../db/index.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(authMiddleware);
router.use(adminOnly);

// GET /api/admin/stats
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = db.getAdminStats();
  res.json(stats);
}));

// GET /api/admin/users?search=...&college=...
router.get('/users', asyncHandler(async (req, res) => {
  const { search, college } = req.query;
  const users = db.getUsers();
  const profiles = db.getProfiles();
  const colleges = db.getColleges();

  let userList = users.map(u => {
    const prof = profiles.find(p => p.userId === u.id);
    const col = prof ? colleges.find(c => c.id === prof.collegeId) : null;
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      profile: prof ? {
        displayName: prof.displayName,
        age: prof.age,
        gender: prof.gender,
        college: col ? col.name : 'N/A',
        collegeId: prof.collegeId,
        course: prof.course,
        verificationStatus: prof.verificationStatus
      } : null
    };
  });

  // Apply filters
  if (college) {
    userList = userList.filter(u => u.profile?.collegeId === college);
  }

  if (search) {
    const q = search.toLowerCase();
    userList = userList.filter(u =>
      u.email.toLowerCase().includes(q) ||
      (u.profile && u.profile.displayName.toLowerCase().includes(q))
    );
  }

  res.json(userList);
}));

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Status must be active or suspended' });
  }

  const updated = db.updateUser(req.params.id, { status });
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Audit log
  db.logAdminAction(req.user.id, `user_status_${status}`, 'user', req.params.id, `User account ${status}`);

  const { password, ...safeUser } = updated;
  res.json({ success: true, user: safeUser });
}));

// GET /api/admin/verifications
router.get('/verifications', asyncHandler(async (req, res) => {
  const list = db.getVerifications();
  const profiles = db.getProfiles();
  const colleges = db.getColleges();

  const enriched = list.map(v => {
    const prof = profiles.find(p => p.userId === v.userId);
    const col = colleges.find(c => c.id === v.collegeId);
    return {
      ...v,
      studentName: prof ? prof.displayName : 'Student',
      avatarUrl: prof ? prof.avatarUrl : null,
      collegeName: col ? col.name : v.collegeId
    };
  });

  res.json(enriched);
}));

// PUT /api/admin/verifications/:id
router.put('/verifications/:id', asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected' });
  }

  const updated = db.updateVerificationStatus(req.params.id, status, adminNotes, req.user.id);
  if (!updated) {
    return res.status(404).json({ error: 'Verification request not found' });
  }

  res.json({ success: true, verification: updated });
}));

// GET /api/admin/reports
router.get('/reports', asyncHandler(async (req, res) => {
  const list = db.getReports();
  const profiles = db.getProfiles();

  const enriched = list.map(r => {
    const reporter = profiles.find(p => p.userId === r.reportedByUserId);
    const reported = profiles.find(p => p.userId === r.reportedUserId);
    return {
      ...r,
      reporterName: reporter ? reporter.displayName : r.reportedByUserId,
      reportedName: reported ? reported.displayName : r.reportedUserId,
      reportedProfile: reported || null
    };
  });

  res.json(enriched);
}));

// PUT /api/admin/reports/:id
router.put('/reports/:id', asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;
  const updated = db.updateReportStatus(req.params.id, status, adminNotes, req.user.id);
  if (!updated) {
    return res.status(404).json({ error: 'Report not found' });
  }

  res.json({ success: true, report: updated });
}));

// GET /api/admin/actions (Audit Log)
router.get('/actions', asyncHandler(async (req, res) => {
  const actions = db.getAdminActions();
  res.json(actions);
}));

// POST /api/admin/reset-demo
router.post('/reset-demo', asyncHandler(async (req, res) => {
  await db.reset();
  db.logAdminAction(req.user.id, 'reset_demo', 'system', 'all', 'Re-seeded demo environment');
  res.json({ success: true, message: 'All demo datasets re-seeded to initial state.' });
}));

export default router;
