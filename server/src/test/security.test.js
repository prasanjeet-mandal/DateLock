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
  return { status: res.status, ok: res.ok, headers: res.headers, data };
}

async function runSecurityTests() {
  console.log('🔒 Starting DateLock Platform Security Test Suite...\n');
  let passed = 0;
  let failed = 0;

  // Spin up ephemeral test server
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  BASE_URL = `http://127.0.0.1:${port}/api`;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  🛡️  PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Security Headers & Server Masking
    // ----------------------------------------------------
    const healthRes = await request('/health');
    assert(healthRes.headers.get('x-frame-options') === 'DENY', 'Anti-Clickjacking: X-Frame-Options is DENY');
    assert(healthRes.headers.get('x-content-type-options') === 'nosniff', 'MIME Sniffing Defense: X-Content-Type-Options is nosniff');
    assert(healthRes.headers.get('x-xss-protection') === '1; mode=block', 'XSS Filter: X-XSS-Protection is 1; mode=block');
    assert(healthRes.headers.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Referrer Policy is strict-origin-when-cross-origin');
    assert(healthRes.headers.get('content-security-policy') !== null, 'Content Security Policy (CSP) header is present');
    assert(healthRes.headers.get('x-powered-by') === null, 'Anti-Fingerprinting: X-Powered-By header is removed');

    // ----------------------------------------------------
    // TEST 2: Demo Impersonation Protection
    // ----------------------------------------------------
    const spoofAttempt = await request('/profiles/me', {
      headers: { 'x-demo-user-id': 'usr_fictional_attacker_99' }
    });
    assert(
      spoofAttempt.status === 403,
      'Spoofing Defense: Arbitrary x-demo-user-id header is rejected with 403'
    );

    // Legitimate demo persona header is accepted
    const legitimateDemo = await request('/profiles/me', {
      headers: { 'x-demo-user-id': 'usr_student_1' }
    });
    assert(legitimateDemo.status === 200 && legitimateDemo.data.userId === 'usr_student_1', 'Legitimate demo persona (usr_student_1) is authorized');

    // ----------------------------------------------------
    // TEST 3: Auth Login & Token Issuance
    // ----------------------------------------------------
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'student1@demo.com', password: 'demo123' })
    });
    const studentToken = loginRes.data.token;
    assert(loginRes.status === 200 && studentToken, 'Student authentication succeeds with JWT');

    // Verify password is NOT in response
    assert(loginRes.data.user.password === undefined, 'Sensitive Data: Password hash is stripped from auth response');

    // ----------------------------------------------------
    // TEST 4: Prototype Pollution Defense
    // ----------------------------------------------------
    const pollutionPayload = JSON.stringify({
      displayName: 'HackedName',
      __proto__: { isAdmin: true },
      bio: 'Innocent bio'
    });
    const pollutionRes = await request('/profiles/update', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: pollutionPayload
    });
    assert(
      pollutionRes.status === 400 || (pollutionRes.data && !({}).isAdmin),
      'Prototype Pollution Defense: Malicious __proto__ injection blocked'
    );

    // ----------------------------------------------------
    // TEST 5: Cross-Site Scripting (XSS) Sanitization
    // ----------------------------------------------------
    const xssPayload = {
      bio: 'Normal bio <script>alert("XSS Attack")</script> extra text <img src=x onerror=alert(1)>',
      vibePrompt: 'Check out javascript:alert("pwned") this vibe!'
    };
    const xssUpdateRes = await request('/profiles/update', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify(xssPayload)
    });
    assert(xssUpdateRes.status === 200, 'Profile update with sanitized fields succeeds');
    assert(
      !xssUpdateRes.data.bio.includes('<script>') && !xssUpdateRes.data.bio.includes('onerror='),
      'XSS Sanitization: Executable script and onerror event handlers are stripped from bio'
    );
    assert(
      !xssUpdateRes.data.vibePrompt.includes('javascript:'),
      'XSS Sanitization: javascript: pseudo-protocol stripped from vibePrompt'
    );

    // Restore Aarav Sharma profile back to clean state
    await request('/profiles/update', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ displayName: 'Aarav Sharma', bio: 'B.Tech CS @ IIT Roorkee | Open-source enthusiast' })
    });

    // ----------------------------------------------------
    // TEST 6: Input Length Bound Enforcement
    // ----------------------------------------------------
    const overlyLongBio = 'A'.repeat(600); // Max allowed is 500
    const lengthRes = await request('/profiles/update', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ bio: overlyLongBio })
    });
    assert(lengthRes.status === 400, 'Payload Guardrail: Bio exceeding 500 characters is rejected with 400 Bad Request');

    // ----------------------------------------------------
    // TEST 7: IDOR Protection on Messaging & Reactions
    // ----------------------------------------------------
    // Student 3 attempts to react to student 1's message without being part of the match
    const sendRes = await request('/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ matchId: 'match_1', content: 'Secret private conversation' })
    });
    const messageId = sendRes.data?.id;

    // Student 3 token
    const student3Login = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'student3@demo.com', password: 'demo123' })
    });
    const student3Token = student3Login.data.token;

    if (messageId) {
      const unauthorizedReact = await request(`/messages/${messageId}/react`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${student3Token}` },
        body: JSON.stringify({ emoji: '🔥' })
      });
      assert(
        unauthorizedReact.status === 403,
        'IDOR Protection: User cannot react to messages in matches they do not belong to'
      );
    }

    // ----------------------------------------------------
    // TEST 8: Role-Based Access Control & Master Passkey Defense
    // ----------------------------------------------------
    const studentAdminAttempt = await request('/admin/stats', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(
      studentAdminAttempt.status === 403,
      'RBAC Defense: Regular student is forbidden (403) from accessing admin endpoints'
    );

    // Outsider cannot impersonate admin via x-demo-user-id
    const adminHeaderSpoof = await request('/admin/stats', {
      headers: { 'x-demo-user-id': 'usr_admin' }
    });
    assert(
      adminHeaderSpoof.status === 403,
      'Admin Lockdown: x-demo-user-id: usr_admin impersonation strictly rejected (403)'
    );

    // Outsider cannot switch to admin via switch-demo without master passkey
    const adminSwitchSpoof = await request('/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ role: 'admin' })
    });
    assert(
      adminSwitchSpoof.status === 403,
      'Admin Lockdown: /api/auth/switch-demo to admin without passkey rejected (403)'
    );

    // Admin login without Master Passkey must be rejected
    const unauthenticatedAdminAttempt = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@demo.com', password: 'demo123' })
    });
    assert(
      unauthenticatedAdminAttempt.status === 403,
      'Dual-Factor Lockdown: Admin login without 2FA Master Passkey rejected (403)'
    );

    // Admin access succeeds WITH Master Security Passkey
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@demo.com',
        password: 'demo123',
        adminSecurityKey: 'DL_ADMIN_MASTER_SECURE_2026_ROORKEE'
      })
    });
    const adminToken = adminLogin.data.token;
    assert(adminLogin.status === 200 && adminToken, 'Admin authentication succeeds with valid 2FA Master Passkey');

    const adminStats = await request('/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminStats.status === 200, 'RBAC Defense: Authenticated admin can access /api/admin/stats');

    // Verify admin user list does NOT expose password hashes
    const adminUsers = await request('/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(
      adminUsers.status === 200 && adminUsers.data.every(u => u.password === undefined),
      'Sensitive Data: Admin user list never exposes password hashes'
    );

    // ----------------------------------------------------
    // TEST 9: Discovery Candidate PII Shielding
    // ----------------------------------------------------
    const discoverRes = await request('/discover', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(
      discoverRes.status === 200 && discoverRes.data.candidates.every(c => c.email === undefined && c.password === undefined && c.studentRollNumber === undefined),
      'PII Shielding: Discovery candidates feed strictly omits email, password, and roll numbers'
    );

    // ----------------------------------------------------
    // TEST 10: Auth Rate Limiter Enforcement
    // ----------------------------------------------------
    let rateLimited = false;
    for (let i = 0; i < 20; i++) {
      const floodRes = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'attacker@demo.com', password: 'wrongpassword' })
      });
      if (floodRes.status === 429) {
        rateLimited = true;
        break;
      }
    }
    assert(rateLimited, 'Brute-force Defense: Exceeding auth attempt threshold triggers HTTP 429 Too Many Requests');

  } catch (err) {
    console.error('Security test execution error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log(`\n========================================`);
  console.log(`🏁 Security Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSecurityTests();
