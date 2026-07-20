import nodemailer from "nodemailer";

let transporter;
let warned = false;

export const isMailerConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

// Returns a memoized Nodemailer transporter, or null if SMTP env vars are
// missing. Never throws — a background cron sweep has no request to carry
// a startup error back to, so "not configured" must be an inert no-op.
export const getTransporter = () => {
  if (!isMailerConfigured()) {
    if (!warned) {
      console.warn("[mailer] SMTP not configured — email reminders disabled");
      warned = true;
    }
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

export const emailFrom = process.env.EMAIL_FROM || "JobFlow <no-reply@jobflow.app>";
