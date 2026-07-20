import dotenv from "dotenv";
dotenv.config();

import connectDB from "../src/config/db.js";
import { runReminderSweep } from "../src/jobs/reminderJob.js";

(async () => {
  await connectDB();
  console.log("Reminder sweep summary:", await runReminderSweep());
  process.exit(0);
})();
