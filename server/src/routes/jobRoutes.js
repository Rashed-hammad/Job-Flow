import express from "express";
import { body, param } from "express-validator";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobStats,
} from "../controllers/jobController.js";
import { scoreMatch } from "../controllers/matchController.js";
import { JOB_STATUSES } from "../models/JobApplication.js";
import validateRequest from "../middleware/validateRequest.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

const jobIdParam = param("id").isMongoId().withMessage("Invalid job id");

const optionalJobFieldRules = [
  body("company").optional().notEmpty().withMessage("Company cannot be empty"),
  body("role").optional().notEmpty().withMessage("Role cannot be empty"),
  body("status")
    .optional()
    .isIn(JOB_STATUSES)
    .withMessage(`Status must be one of: ${JOB_STATUSES.join(", ")}`),
  body("appliedDate")
    .optional()
    .isISO8601()
    .withMessage("appliedDate must be a valid date"),
];

const createJobRules = [
  body("company").notEmpty().withMessage("Company is required"),
  body("role").notEmpty().withMessage("Role is required"),
  ...optionalJobFieldRules.slice(2),
];

router.post("/", createJobRules, validateRequest, createJob);
router.get("/", getJobs);
router.get("/stats", getJobStats);
router.get("/:id", jobIdParam, validateRequest, getJobById);
router.put(
  "/:id",
  jobIdParam,
  optionalJobFieldRules,
  validateRequest,
  updateJob,
);
router.delete("/:id", jobIdParam, validateRequest, deleteJob);

router.post(
  "/:id/score",
  jobIdParam,
  body("cvId").isMongoId().withMessage("Invalid CV id"),
  validateRequest,
  scoreMatch,
);

export default router;
