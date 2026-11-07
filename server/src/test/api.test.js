process.env.NODE_ENV = 'test';

import http from 'http';
import { app } from '../index.js';

let server;
let BASE_URL = '';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

let studentToken = null;
let adminToken = null;

async function runTests() {
  console.log('🧪 Starting DateLock Backend Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  // Spin up ephemeral test server
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  BASE_URL = `http://127.0.0.1:${port}/api`;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health returns ok status');

    // 2. Colleges & Interests
    const colleges = await request('/colleges');
    assert(colleges.status === 200 && Array.isArray(colleges.data) && colleges.data.length === 9, 'GET /api/colleges returns 9 Roorkee institutions');

    const interests = await request('/colleges/interests');
    assert(interests.status === 200 && Array.isArray(interests.data) && interests.data.length >= 20, 'GET /api/colleges/interests returns interest categories');

    // 3. Auth Login with Demo Accounts
    const loginStudent = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'student1@demo.com', password: 'demo123' })
    });
    assert(loginStudent.status === 200 && loginStudent.data.token, 'POST /api/auth/login succeeds for student1');
    studentToken = loginStudent.data.token;

    const loginAdmin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@demo.com',
        password: 'demo123',
        adminSecurityKey: 'DL_ADMIN_MASTER_SECURE_2026_ROORKEE'
      })
    });
    assert(loginAdmin.status === 200 && loginAdmin.data.user.role === 'admin', 'POST /api/auth/login succeeds for admin');
    adminToken = loginAdmin.data.token;

    // 4. Fast Persona Switcher (AC-15)
    const personaSwitch = await request('/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ studentIndex: 2 })
    });
    assert(personaSwitch.status === 200 && personaSwitch.data.user.id === 'usr_student_2', 'POST /api/auth/switch-demo switches to Ananya Verma');

    // 5. User Profile
    const meProfile = await request('/profiles/me', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(meProfile.status === 200 && meProfile.data.displayName === 'Aarav Sharma', 'GET /api/profiles/me returns Aarav Sharma profile');

    // 6. Discovery & Smart Compatibility (PRD 5.3 & 5.4)
    const discovery = await request('/discover', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(discovery.status === 200 && discovery.data.candidates.length > 0, 'GET /api/discover returns candidate profiles');
    const firstCandidate = discovery.data.candidates[0];
    assert(
      firstCandidate.compatibilityScore >= 30 && firstCandidate.compatibilityScore <= 99,
      `Smart Compatibility calculated (${firstCandidate.compatibilityScore}%)`
    );

    // 7. Discovery filtering by interest
    const filteredDiscovery = await request('/discover?interest=coding', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(
      filteredDiscovery.status === 200 && filteredDiscovery.data.candidates.every(c => c.interests.includes('coding')),
      'GET /api/discover?interest=coding filters correctly'
    );

    // 8. Like & Mutual Match Trigger (AC-06)
    const likeRes = await request('/likes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ targetUserId: 'usr_student_2', type: 'like' })
    });
    assert(likeRes.status === 200 && likeRes.data.isMatch === true, 'POST /api/likes triggers instant mutual match between student1 & student2');

    // 9. Undo Swipe
    const undoRes = await request('/likes/undo', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(undoRes.status === 200 && undoRes.data.success, 'POST /api/likes/undo rewinds last swipe');

    // Re-like to keep match active
    await request('/likes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ targetUserId: 'usr_student_2', type: 'like' })
    });

    // 10. Messages & Chat (PRD 5.7)
    const matchesRes = await request('/matches', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(matchesRes.status === 200 && matchesRes.data.length > 0, 'GET /api/matches returns active matches');
    const matchId = matchesRes.data[0].id;

    const sendMsg = await request('/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ matchId, content: 'Hey, nice to meet you on DateLock!' })
    });
    assert(sendMsg.status === 201 && sendMsg.data.content.includes('DateLock'), 'POST /api/messages/send sends message');

    // Message search (PRD 5.7)
    const searchMsg = await request(`/messages/${matchId}/search?q=DateLock`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(searchMsg.status === 200 && searchMsg.data.results.length > 0, 'GET /api/messages/:matchId/search finds message by keyword');

    // Message reaction (PRD 5.7)
    const messageId = sendMsg.data.id;
    const reactMsg = await request(`/messages/${messageId}/react`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ emoji: '❤️' })
    });
    assert(reactMsg.status === 200 && reactMsg.data.message.reactions[reactMsg.data.message.senderId] === '❤️', 'POST /api/messages/:id/react adds emoji reaction');

    // 11. Notifications (PRD 5.8)
    const notifs = await request('/notifications', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(notifs.status === 200 && Array.isArray(notifs.data.notifications), 'GET /api/notifications returns user alerts');

    // 12. Safety (Reports & Blocks - PRD 5.10)
    const blockRes = await request('/safety/block', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ targetUserId: 'usr_fictional_10' })
    });
    assert(blockRes.status === 200 && blockRes.data.success, 'POST /api/safety/block blocks user');

    const reportRes = await request('/safety/report', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        targetUserId: 'usr_fictional_10',
        reason: 'Harassment',
        description: 'Automated test report'
      })
    });
    assert(reportRes.status === 201 && reportRes.data.success, 'POST /api/safety/report submits moderation report');

    // 13. Admin Dashboard & Actions Log (PRD 6)
    const adminStats = await request('/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminStats.status === 200 && adminStats.data.totalUsers >= 20, 'GET /api/admin/stats returns platform metrics');

    const adminActions = await request('/admin/actions', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminActions.status === 200 && Array.isArray(adminActions.data), 'GET /api/admin/actions returns audit log');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log(`\n========================================`);
  console.log(`🏁 Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
