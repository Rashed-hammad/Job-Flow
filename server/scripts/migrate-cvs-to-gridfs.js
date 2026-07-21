import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import { getBucket } from "../src/config/gridfs.js";

const uploadDir = path.resolve("uploads/cvs");

(async () => {
  await connectDB();
  const bucket = getBucket();

  const legacyCvs = await mongoose.connection
    .collection("cvs")
    .find({ storedFilename: { $exists: true }, fileId: { $exists: false } })
    .toArray();

  console.log(`Found ${legacyCvs.length} legacy CV(s) to migrate`);

  for (const cv of legacyCvs) {
    const filePath = path.join(uploadDir, cv.storedFilename);
    if (!fs.existsSync(filePath)) {
      console.warn(`Skipping ${cv._id}: file not found at ${filePath}`);
      continue;
    }

    const uploadStream = bucket.openUploadStream(cv.originalName, {
      contentType: "application/pdf",
    });
    fs.createReadStream(filePath).pipe(uploadStream);

    await new Promise((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });

    await mongoose.connection
      .collection("cvs")
      .updateOne(
        { _id: cv._id },
        { $set: { fileId: uploadStream.id }, $unset: { storedFilename: "" } },
      );

    console.log(`Migrated ${cv._id} (${cv.originalName}) -> fileId ${uploadStream.id}`);
  }

  console.log("Migration complete.");
  process.exit(0);
})();
