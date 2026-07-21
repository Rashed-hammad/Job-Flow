import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const handleUploadError = (err, req, res, next) => {
  if (err) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File too large (max 5MB)"
        : err.message || "Upload failed";
    return res.status(400).json({ message });
  }
  next();
};
