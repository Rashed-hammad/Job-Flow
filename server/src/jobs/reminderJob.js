import JobApplication from "../models/JobApplication.js";
import "../models/User.js"; // registers the "User" schema for .populate("user")
import { getTransporter, emailFrom } from "../config/mailer.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const daysSince = (date) => Math.floor((Date.now() - new Date(date).getTime()) / MS_PER_DAY);

const buildDigestEmail = (jobs) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const boardUrl = `${clientUrl}/board`;

  const rows = jobs
    .map(
      (job) =>
        `<tr><td style="padding:4px 12px 4px 0;">${job.company}</td><td style="padding:4px 12px 4px 0;">${job.role}</td><td style="padding:4px 0;">${daysSince(job.appliedDate)} days</td></tr>`,
    )
    .join("");

  const textLines = jobs
    .map((job) => `- ${job.company} (${job.role}) — ${daysSince(job.appliedDate)} days since applied`)
    .join("\n");

  return {
    subject: `You have ${jobs.length} stale application${jobs.length === 1 ? "" : "s"} — JobFlow`,
    html: `
      <p>These applications haven't been updated in a while — might be worth a follow-up:</p>
      <table>${rows}</table>
      <p><a href="${boardUrl}">View your board</a></p>
    `,
    text: `These applications haven't been updated in a while — might be worth a follow-up:\n\n${textLines}\n\nView your board: ${boardUrl}`,
  };
};

const groupByUser = (jobs) => {
  const groups = new Map();
  for (const job of jobs) {
    if (!job.user?.email || job.user.remindersEnabled === false) continue;
    const key = String(job.user._id);
    if (!groups.has(key)) groups.set(key, { user: job.user, jobs: [] });
    groups.get(key).jobs.push(job);
  }
  return [...groups.values()];
};

export const runReminderSweep = async () => {
  const summary = { usersNotified: 0, jobsFlagged: 0, errors: 0 };

  const transporter = getTransporter();
  if (!transporter) return summary;

  const thresholdDays = Number(process.env.FOLLOW_UP_DAYS) || 7;
  const cutoff = new Date(Date.now() - thresholdDays * MS_PER_DAY);

  const staleJobs = await JobApplication.find({
    status: "Applied",
    appliedDate: { $lte: cutoff },
    $or: [{ lastReminderSentAt: null }, { lastReminderSentAt: { $lte: cutoff } }],
  }).populate("user", "name email remindersEnabled");

  const groups = groupByUser(staleJobs);
  summary.jobsFlagged = groups.reduce((sum, { jobs }) => sum + jobs.length, 0);

  for (const { user, jobs } of groups) {
    try {
      const { subject, html, text } = buildDigestEmail(jobs);
      await transporter.sendMail({ from: emailFrom, to: user.email, subject, html, text });

      await JobApplication.updateMany(
        { _id: { $in: jobs.map((job) => job._id) } },
        { $set: { lastReminderSentAt: new Date() } },
      );

      summary.usersNotified += 1;
    } catch (error) {
      console.error(`[reminderJob] failed to notify user ${user._id}:`, error.message);
      summary.errors += 1;
    }
  }

  return summary;
};
