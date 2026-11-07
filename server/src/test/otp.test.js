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

async function runOtpTests() {
  console.log('📬 Starting DateLock Email OTP Verification Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  // Spin up ephemeral test server
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  BASE_URL = `http://127.0.0.1:${port}/api`;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  📧  PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    const testEmail = `student_otp_${Date.now()}@iitr.ac.in`;

    // 1. Send OTP for Registration
    const sendRes = await request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, purpose: 'registration' })
    });
    assert(sendRes.status === 200 && sendRes.data.success, 'POST /api/auth/send-otp delivers OTP');
    assert(Boolean(sendRes.data.previewOtp), 'OTP delivery includes 6-digit code in preview mode');
    const deliveredOtp = sendRes.data.previewOtp;

    // 2. Cooldown enforcement on rapid resend
    const rapidResend = await request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, purpose: 'registration' })
    });
    assert(
      rapidResend.status === 400 && rapidResend.data.cooldownSeconds > 0,
      'Cooldown: Rapid resend blocked with cooldown countdown'
    );

    // 3. Incorrect OTP rejection with remaining attempts counter
    const wrongOtpRes = await request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, otp: '000000', purpose: 'registration' })
    });
    assert(
      wrongOtpRes.status === 400 && wrongOtpRes.data.remainingAttempts === 4,
      'Security: Wrong OTP rejected and attempts counter decremented (4 remaining)'
    );

    // 4. Correct OTP verification
    const correctOtpRes = await request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, otp: deliveredOtp, purpose: 'registration' })
    });
    assert(
      correctOtpRes.status === 200 && correctOtpRes.data.verified === true,
      'POST /api/auth/verify-otp verifies valid 6-digit code'
    );

    // 5. Replay attack defense: reused OTP must be rejected
    const replayRes = await request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, otp: deliveredOtp, purpose: 'registration' })
    });
    assert(
      replayRes.status === 400,
      'Replay Attack Defense: Used OTP is invalidated immediately'
    );

    // 6. College Institutional Email Verification
    // Student 2 logs in
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'student2@demo.com', password: 'demo123' })
    });
    const token = loginRes.data.token;

    const collegeMail = `ananya.verma_${Date.now()}@coer.ac.in`;
    const collegeOtpRes = await request('/verification/send-college-otp', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ collegeEmail: collegeMail, collegeId: 'coer' })
    });
    assert(
      collegeOtpRes.status === 200 && collegeOtpRes.data.previewOtp,
      'POST /api/verification/send-college-otp sends institutional verification code'
    );
    const collegeOtp = collegeOtpRes.data.previewOtp;

    // Verify institutional OTP
    const verifyCollegeRes = await request('/verification/verify-college-otp', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ collegeEmail: collegeMail, otp: collegeOtp })
    });
    assert(
      verifyCollegeRes.status === 200 && verifyCollegeRes.data.profile.verificationStatus === 'verified',
      'Instant Approval: College email OTP activates official verified student badge'
    );

    // Check notifications for verification confirmation
    const notifs = await request('/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(
      notifs.status === 200 && notifs.data.notifications.some(n => n.type === 'verification'),
      'Verification confirmation notification received in student feed'
    );

    // 7. Multi-step Registration: Email verified in Step 2 successfully completes Step 3 registration
    const regEmail = `newstudent_${Date.now()}@gmail.com`;
    const regOtpRes = await request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email: regEmail, purpose: 'registration' })
    });
    const regOtp = regOtpRes.data.previewOtp;

    // Step 2: verify OTP
    const step2Verify = await request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email: regEmail, otp: regOtp, purpose: 'registration' })
    });
    assert(step2Verify.status === 200 && step2Verify.data.verified, 'Step 2: Email OTP successfully verified');

    // Step 3: complete profile submission
    const step3Submit = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: regEmail,
        password: 'Password123!',
        displayName: 'Raju Rastogi',
        collegeId: 'iitr',
        course: 'Btech CSE',
        age: 21,
        gender: 'Male',
        connectionPreference: 'both',
        otp: regOtp,
        emailVerified: true
      })
    });
    assert(
      step3Submit.status === 201 && step3Submit.data.user.email === regEmail,
      'Multi-step Registration: Account created smoothly without "No active code" error'
    );

  } catch (err) {
    console.error('OTP test execution error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log(`\n========================================`);
  console.log(`🏁 Email OTP Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runOtpTests();
