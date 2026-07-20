import express from "express";
import { param } from "express-validator";
import {
  uploadCv,
  getCvs,
  downloadCv,
  deleteCv,
} from "../controllers/cvController.js";
import { upload, handleUploadError } from "../config/upload.js";
import validateRequest from "../middleware/validateRequest.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

const cvIdParam = param("id").isMongoId().withMessage("Invalid CV id");

router.post("/", upload.single("cv"), handleUploadError, uploadCv);
router.get("/", getCvs);
router.get("/:id/download", cvIdParam, validateRequest, downloadCv);
router.delete("/:id", cvIdParam, validateRequest, deleteCv);

export default router;
