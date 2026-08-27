const nodemailer = require("nodemailer");
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, ADMIN_EMAIL } = require("../config/env");
const logger = require("../utils/logger");

let transporter = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
} else {
  logger.warn("SMTP not configured — emails will be logged to console instead of sent.");
}

async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    logger.info(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    logger.info(text || html);
    return { mocked: true };
  }

  const info = await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    html,
    text
  });
  return info;
}

// ---------- Shared wrapper for consistent branding ----------
function wrapTemplate(innerHtml) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9; padding:32px 0; font-family:'Segoe UI', Arial, sans-serif;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 2px 10px rgba(15,23,42,0.08);">
          ${innerHtml}
          <tr>
            <td style="padding:20px 32px; background:#f8fafc; text-align:center;">
              <p style="margin:0; font-size:12px; color:#94a3b8;">© ${new Date().getFullYear()} Travel Era. All rights reserved.</p>
              <p style="margin:4px 0 0; font-size:12px; color:#94a3b8;">This is an automated email, please do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

// ---------- 1. OTP Email ----------
async function sendOtpEmail(to, otp, purpose) {
  const isReset = purpose === "reset_password";
  const subject = isReset ? "Travel Era - Password Reset OTP" : "Travel Era - Verify your account";

  const inner = `
    <tr>
      <td style="background:linear-gradient(135deg,#0ea5e9,#0284c7); padding:28px 32px; text-align:center;">
        <h1 style="margin:0; color:#fff; font-size:20px; letter-spacing:0.5px;">✈️ Travel Era</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <h2 style="margin:0 0 12px; color:#0f172a; font-size:20px;">${isReset ? "Reset your password" : "Verify your account"}</h2>
        <p style="margin:0 0 20px; color:#475569; font-size:14px; line-height:1.6;">
          Use the OTP below to ${isReset ? "reset your password" : "verify your Travel Era account"}. This code is valid for the next 10 minutes.
        </p>
        <div style="background:#f0f9ff; border:1px dashed #0ea5e9; border-radius:10px; text-align:center; padding:20px; margin:0 0 20px;">
          <span style="font-size:32px; font-weight:bold; letter-spacing:10px; color:#0284c7;">${otp}</span>
        </div>
        <p style="margin:0; color:#94a3b8; font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
      </td>
    </tr>`;

  return sendEmail({
    to,
    subject,
    html: wrapTemplate(inner),
    text: `Your Travel Era OTP is ${otp}. Valid for 10 minutes.`
  });
}

// ---------- 2. Booking Confirmation Email ----------
async function sendBookingConfirmationEmail(to, booking) {
  const subject = `Booking Confirmed — ${booking.bookingId}`;

  const inner = `
    <tr>
      <td style="background:linear-gradient(135deg,#22c55e,#16a34a); padding:28px 32px; text-align:center;">
        <h1 style="margin:0; color:#fff; font-size:20px;">🎉 Booking Confirmed</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 16px; color:#475569; font-size:14px;">Your booking with Travel Era is confirmed. Here are the details:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr><td style="padding:8px 0; color:#64748b; font-size:13px; width:150px;">Booking ID</td><td style="padding:8px 0; color:#0f172a; font-size:13px; font-weight:600;">${booking.bookingId}</td></tr>
          <tr><td style="padding:8px 0; color:#64748b; font-size:13px;">Travel Type</td><td style="padding:8px 0; color:#0f172a; font-size:13px; font-weight:600;">${booking.travelType.toUpperCase()}</td></tr>
          <tr><td style="padding:8px 0; color:#64748b; font-size:13px;">Route</td><td style="padding:8px 0; color:#0f172a; font-size:13px; font-weight:600;">${booking.source} → ${booking.destination}</td></tr>
          <tr><td style="padding:8px 0; color:#64748b; font-size:13px;">Journey Date</td><td style="padding:8px 0; color:#0f172a; font-size:13px; font-weight:600;">${new Date(booking.journeyDate).toDateString()}</td></tr>
          <tr><td style="padding:8px 0; color:#64748b; font-size:13px;">Total Fare</td><td style="padding:8px 0; color:#0f172a; font-size:13px; font-weight:600;">₹${booking.fare.totalFare}</td></tr>
          <tr><td style="padding:8px 0; color:#64748b; font-size:13px;">Status</td><td style="padding:8px 0;"><span style="background:#dcfce7; color:#16a34a; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600;">${booking.status}</span></td></tr>
        </table>
        <p style="margin:20px 0 0; color:#475569; font-size:13px;">Thank you for booking with Travel Era. Have a safe journey! 🧳</p>
      </td>
    </tr>`;

  return sendEmail({
    to,
    subject,
    html: wrapTemplate(inner),
    text: `Booking ${booking.bookingId} confirmed.`
  });
}

// ---------- 3. Welcome Email (sent to user after OTP verified) ----------
async function sendWelcomeEmail(to, user) {
  const subject = "Welcome to Travel Era 🎉";

  const inner = `
    <tr>
      <td style="background:linear-gradient(135deg,#0ea5e9,#6366f1); padding:32px; text-align:center;">
        <h1 style="margin:0; color:#fff; font-size:22px;">Welcome aboard, ${user.name || "Traveler"}! ✈️</h1>
        <p style="margin:8px 0 0; color:#e0f2fe; font-size:13px;">Your account is now verified and active.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 16px; color:#475569; font-size:14px; line-height:1.6;">
          Hi <b>${user.name || "there"}</b>, thanks for verifying your account. You're all set to explore flights, trains, and buses — all in one place with Travel Era.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border-radius:8px; padding:4px; border-collapse:collapse;">
          <tr><td style="padding:10px 16px; color:#64748b; font-size:13px;">Registered Email</td><td style="padding:10px 16px; color:#0f172a; font-size:13px; font-weight:600; text-align:right;">${to}</td></tr>
          <tr><td style="padding:10px 16px; color:#64748b; font-size:13px;">Joined On</td><td style="padding:10px 16px; color:#0f172a; font-size:13px; font-weight:600; text-align:right;">${new Date().toLocaleString()}</td></tr>
        </table>
        <div style="text-align:center; margin:28px 0 4px;">
          <a href="#" style="background:#0ea5e9; color:#fff; padding:12px 32px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px; display:inline-block;">Start Exploring</a>
        </div>
      </td>
    </tr>`;

  return sendEmail({
    to,
    subject,
    html: wrapTemplate(inner),
    text: `Welcome to Travel Era, ${user.name || "Traveler"}! Your account (${to}) is now verified and active.`
  });
}

// ---------- 4. Admin Notification (sent to admin after user's OTP verified) ----------
async function sendAdminNewRegistrationEmail(user) {
  if (!ADMIN_EMAIL) {
    logger.warn("ADMIN_EMAIL not configured — skipping admin registration alert.");
    return { skipped: true };
  }

  const subject = `New User Registered — ${user.name || user.email}`;
  const now = new Date();

  const inner = `
    <tr>
      <td style="background:linear-gradient(135deg,#0f172a,#1e293b); padding:28px 32px; text-align:center;">
        <h1 style="margin:0; color:#fff; font-size:20px;">🔔 New User Registration</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 16px; color:#475569; font-size:14px;">A new user just verified their account on <b>Travel Era</b>.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr><td style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#64748b; font-size:13px; width:140px;">Name</td><td style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#0f172a; font-size:13px; font-weight:600;">${user.name || "-"}</td></tr>
          <tr><td style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#64748b; font-size:13px;">Email</td><td style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#0f172a; font-size:13px; font-weight:600;">${user.email}</td></tr>
          <tr><td style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#64748b; font-size:13px;">Phone</td><td style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#0f172a; font-size:13px; font-weight:600;">${user.phone || "-"}</td></tr>
          <tr><td style="padding:10px 0; color:#64748b; font-size:13px;">Date</td><td style="padding:10px 0; color:#0f172a; font-size:13px; font-weight:600;">${now.toDateString()}</td></tr>
          <tr><td style="padding:10px 0; color:#64748b; font-size:13px;">Time</td><td style="padding:10px 0; color:#0f172a; font-size:13px; font-weight:600;">${now.toLocaleTimeString()}</td></tr>
        </table>
      </td>
    </tr>`;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject,
    html: wrapTemplate(inner),
    text: `New user registered: ${user.name || ""} (${user.email}) on ${now.toLocaleString()}`
  });
}

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendBookingConfirmationEmail,
  sendWelcomeEmail,
  sendAdminNewRegistrationEmail
};