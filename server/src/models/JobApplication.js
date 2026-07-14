import mongoose from "mongoose";

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

const jobApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    jobDescription: {
      type: String,
      default: "",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "Applied",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const JOB_STATUSES = STATUSES;

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;
