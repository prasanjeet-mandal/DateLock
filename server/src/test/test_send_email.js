import dotenv from 'dotenv';
import { sendOtpEmail, getEmailConfig } from '../services/emailService.js';

dotenv.config();

async function main() {
  const targetEmail = process.argv[2] || process.env.GMAIL_USER || 'test@example.com';

  console.log('📬 DateLock Email Delivery Diagnostics Tool');
  console.log('============================================\n');

  const config = getEmailConfig();

  if (!config) {
    console.error('❌ NO EMAIL CONFIGURATION FOUND in server/.env');
    console.error('\nTo send real emails, open "server/.env" and set either:');
    console.error('  OPTION 1 (Gmail):');
    console.error('    GMAIL_USER=your_email@gmail.com');
    console.error('    GMAIL_APP_PASS=xxxx xxxx xxxx xxxx (16-character Google App Password)');
    console.error('\n  OPTION 2 (Resend API):');
    console.error('    RESEND_API_KEY=re_xxxxxxxxx');
    console.error('\n  OPTION 3 (SMTP):');
    console.error('    SMTP_HOST=... SMTP_USER=... SMTP_PASS=...\n');
    process.exit(1);
  }

  console.log(`📡 Detected Provider: ${config.type.toUpperCase()}`);
  console.log(`📤 Sending Test 6-Digit OTP to: ${targetEmail} ...`);

  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();

  const result = await sendOtpEmail({
    to: targetEmail,
    otp: testOtp,
    purpose: 'registration',
    collegeName: 'IIT Roorkee'
  });

  if (result.success) {
    console.log('\n🎉 SUCCESS! Real verification email was dispatched successfully.');
    console.log(`🔑 Verification Code Sent: ${testOtp}`);
    console.log(`📨 Check the inbox (and spam folder) of: ${targetEmail}`);
    if (result.previewUrl) {
      console.log(`🔗 [OPEN LIVE EMAIL IN BROWSER]: ${result.previewUrl}`);
    }
  } else {
    console.error('\n❌ FAILED to deliver email:');
    console.error(result.error);
    if (result.details) {
      console.error('Error Details:', result.details);
    }
  }
}

main();
