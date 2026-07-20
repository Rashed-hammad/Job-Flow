import fs from "fs";
import path from "path";
import Cv from "../models/Cv.js";
import { uploadDir } from "../config/upload.js";

export const uploadCv = async (req, res, next) => {
  try {
    const cv = await Cv.create({
      user: req.user._id,
      originalName: req.file.originalname,
      storedFilename: req.file.filename,
      size: req.file.size,
    });
    res.status(201).json(cv);
  } catch (error) {
    await fs.promises
      .unlink(path.join(uploadDir, req.file.filename))
      .catch(() => {});
    next(error);
  }
};

export const getCvs = async (req, res, next) => {
  try {
    const cvs = await Cv.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(cvs);
  } catch (error) {
    next(error);
  }
};

export const downloadCv = async (req, res, next) => {
  try {
    const cv = await Cv.findOne({ _id: req.params.id, user: req.user._id });
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }
    res.download(path.join(uploadDir, cv.storedFilename), cv.originalName);
  } catch (error) {
    next(error);
  }
};

export const deleteCv = async (req, res, next) => {
  try {
    const cv = await Cv.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }
    await fs.promises
      .unlink(path.join(uploadDir, cv.storedFilename))
      .catch((err) => {
        if (err.code !== "ENOENT") throw err;
      });
    res.json({ message: "CV deleted" });
  } catch (error) {
    next(error);
  }
};
