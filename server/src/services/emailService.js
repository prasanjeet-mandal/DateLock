import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Helper to dynamically build active email dispatcher based on .env
export function getEmailConfig() {
  // Option 1: Gmail Service (Direct delivery to user's real personal inbox)
  const gmailUser = (process.env.GMAIL_USER || process.env.EMAIL_USER || '').trim();
  const gmailPass = (process.env.GMAIL_APP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || '').trim();

  if (gmailUser && gmailPass) {
    const cleanPass = gmailPass.replace(/\s+/g, '');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: cleanPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    return {
      type: 'gmail',
      transporter,
      from: process.env.EMAIL_FROM || `"DateLock Campus" <${gmailUser}>`
    };
  }

  // Option 2: Resend API Key
  if (process.env.RESEND_API_KEY) {
    return {
      type: 'resend',
      apiKey: process.env.RESEND_API_KEY.trim(),
      from: process.env.RESEND_FROM || process.env.EMAIL_FROM || 'DateLock <onboarding@resend.dev>'
    };
  }

  // Option 3: Standard SMTP (Brevo, SendGrid, Mailgun, Amazon SES)
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const port = Number(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: (process.env.SMTP_PASS || '').trim()
      }
    });
    return {
      type: 'smtp',
      transporter,
      from: process.env.EMAIL_FROM || process.env.SMTP_FROM || `"DateLock Campus" <${process.env.SMTP_USER.trim()}>`
    };
  }

  return null;
}

// HTML Template with Obsidian Rose Branding
function generateEmailHtml({ otp, purpose, collegeName }) {
  const title = purpose === 'college_verification'
    ? 'Verify Your College Student Status'
    : 'Verify Your DateLock Account';

  const subtitle = purpose === 'college_verification'
    ? `Confirm your institutional affiliation with ${collegeName || 'your Roorkee campus'}`
    : 'Your one-time passcode for secure campus access';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>DateLock Verification Code</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #0e0612;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #fdf2f8;
      }
      .container {
        max-width: 520px;
        margin: 30px auto;
        background: #150a1b;
        border: 1px solid rgba(244, 114, 182, 0.25);
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      }
      .header {
        background: linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #d946ef 100%);
        padding: 28px 20px;
        text-align: center;
      }
      .brand {
        font-size: 26px;
        font-weight: 900;
        letter-spacing: -0.5px;
        color: #ffffff;
        margin: 0;
      }
      .brand span {
        color: #fce7f3;
      }
      .body {
        padding: 32px 28px;
        text-align: center;
      }
      h2 {
        font-size: 20px;
        font-weight: 700;
        margin-top: 0;
        color: #ffffff;
      }
      p {
        font-size: 14px;
        line-height: 1.6;
        color: #fbcfe8;
        margin: 10px 0 24px;
      }
      .otp-box {
        display: inline-block;
        background: rgba(244, 63, 94, 0.12);
        border: 2px dashed #ec4899;
        border-radius: 16px;
        padding: 16px 36px;
        letter-spacing: 12px;
        font-size: 36px;
        font-weight: 800;
        color: #f472b6;
        margin: 12px 0 24px;
        font-family: 'Courier New', Courier, monospace;
      }
      .badge-note {
        display: inline-block;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(244, 114, 182, 0.2);
        border-radius: 12px;
        padding: 8px 16px;
        font-size: 12px;
        color: #f9a8d4;
        margin-bottom: 24px;
      }
      .footer {
        padding: 20px 24px;
        background: rgba(0, 0, 0, 0.35);
        border-top: 1px solid rgba(244, 114, 182, 0.15);
        font-size: 11px;
        color: #9d7b93;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="brand">DateLock <span>Campus</span></h1>
      </div>
      <div class="body">
        <h2>${title}</h2>
        <p>${subtitle}</p>
        
        <div class="otp-box">${otp}</div>
        
        <div>
          <span class="badge-note">⏳ Valid for 10 minutes</span>
        </div>
        
        <p style="font-size: 12px; color: #f472b6; margin-bottom: 0;">
          Never share this code with anyone. DateLock support will never ask for your verification code.
        </p>
      </div>
      <div class="footer">
        DateLock Roorkee Student Dating & Networking Network &bull; Secured with end-to-end authentication
      </div>
    </div>
  </body>
  </html>
  `;
}

export async function sendOtpEmail({ to, otp, purpose = 'registration', collegeName = '' }) {
  const subject = purpose === 'college_verification'
    ? `🎓 DateLock College Verification Code: ${otp}`
    : `🔐 DateLock Email Verification Code: ${otp}`;

  const html = generateEmailHtml({ otp, purpose, collegeName });
  const text = `Your DateLock verification code is: ${otp}. This code is valid for 10 minutes.`;

  const config = getEmailConfig();

  // CASE 1: Real Dispatch via Gmail Service or Standard SMTP
  if (config && (config.type === 'gmail' || config.type === 'smtp')) {
    try {
      const info = await config.transporter.sendMail({
        from: config.from,
        to,
        subject,
        html,
        text
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`✅ [REAL EMAIL DELIVERED] via ${config.type.toUpperCase()} to ${to} (MessageId: ${info.messageId})`);
      if (previewUrl) {
        console.log(`🔗 [LIVE WEBMAIL PREVIEW]: ${previewUrl}`);
      }
      return {
        success: true,
        mode: config.type,
        messageId: info.messageId,
        previewUrl: previewUrl || null,
        to
      };
    } catch (err) {
      console.error(`❌ [EMAIL DISPATCH ERROR] Failed via ${config.type}:`, err.message);
      return {
        success: false,
        error: `Email delivery failed: ${err.message}. Please check your credentials in server/.env`,
        details: err.message
      };
    }
  }

  // CASE 2: Real Dispatch via Resend API
  if (config && config.type === 'resend') {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: config.from,
          to: [to],
          subject,
          html,
          text
        })
      });
      const data = await resendRes.json();
      if (!resendRes.ok) {
        throw new Error(data.message || 'Resend API rejected dispatch');
      }
      console.log(`✅ [REAL EMAIL DELIVERED] via RESEND API to ${to} (Id: ${data.id})`);
      return {
        success: true,
        mode: 'resend',
        id: data.id,
        to
      };
    } catch (err) {
      console.error(`❌ [RESEND API ERROR]:`, err.message);
      return {
        success: false,
        error: `Resend email delivery failed: ${err.message}. Please check your RESEND_API_KEY in server/.env`,
        details: err.message
      };
    }
  }

  // CASE 3: In automated testing environment, simulate dispatch
  if (process.env.NODE_ENV === 'test') {
    return {
      success: true,
      mode: 'test_simulation',
      previewOtp: otp,
      to
    };
  }

  // CASE 4: Not configured in .env
  console.warn(`\n⚠️ [PERSONAL EMAIL DELIVERY MODE: SENDER GMAIL NOT CONFIGURED]`);
  console.warn(`To deliver OTP directly to ${to}'s real personal inbox, set GMAIL_USER & GMAIL_APP_PASS in server/.env`);
  console.warn(`Verification Code for ${to}: >>> ${otp} <<<\n`);

  return {
    success: false,
    notConfigured: true,
    error: `Personal email delivery active, but sender Gmail is not configured in server/.env. Please set GMAIL_USER and GMAIL_APP_PASS (Generated OTP for ${to}: ${otp})`,
    previewOtp: otp // Logged for recovery
  };
}
