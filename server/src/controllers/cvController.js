import { Readable } from "stream";
import Cv from "../models/Cv.js";
import { getBucket } from "../config/gridfs.js";

export const uploadCv = async (req, res, next) => {
  const bucket = getBucket();
  const uploadStream = bucket.openUploadStream(req.file.originalname, {
    contentType: req.file.mimetype,
  });

  uploadStream.on("error", next);

  uploadStream.on("finish", async () => {
    try {
      const cv = await Cv.create({
        user: req.user._id,
        originalName: req.file.originalname,
        fileId: uploadStream.id,
        size: req.file.size,
      });
      res.status(201).json(cv);
    } catch (error) {
      await bucket.delete(uploadStream.id).catch(() => {});
      next(error);
    }
  });

  Readable.from(req.file.buffer).pipe(uploadStream);
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

    res.set("Content-Type", "application/pdf");
    res.set(
      "Content-Disposition",
      `attachment; filename="${cv.originalName}"`,
    );

    const downloadStream = getBucket().openDownloadStream(cv.fileId);
    downloadStream.on("error", () => {
      res.status(404).json({ message: "CV file not found" });
    });
    downloadStream.pipe(res);
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
    await getBucket()
      .delete(cv.fileId)
      .catch((err) => {
        if (!/File not found/.test(err.message)) throw err;
      });
    res.json({ message: "CV deleted" });
  } catch (error) {
    next(error);
  }
};
