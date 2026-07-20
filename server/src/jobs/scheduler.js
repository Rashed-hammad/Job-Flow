import cron from "node-cron";
import { getTransporter } from "../config/mailer.js";
import { runReminderSweep } from "./reminderJob.js";

// Schedules the daily stale-application reminder sweep. No-ops (with a log
// line) if the mailer isn't configured, rather than scheduling a task that
// would fail on every tick.
export const startReminderScheduler = () => {
  if (!getTransporter()) {
    console.log("[scheduler] Mailer not configured — reminder sweep not scheduled");
    return;
  }

  cron.schedule("0 8 * * *", () => {
    runReminderSweep()
      .then((summary) => console.log("[scheduler] Reminder sweep complete:", summary))
      .catch((error) => console.error("[scheduler] Reminder sweep failed:", error));
  });

  console.log("[scheduler] Reminder sweep scheduled daily at 08:00");
};
