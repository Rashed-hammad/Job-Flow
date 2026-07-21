import mongoose from "mongoose";

// A function, not a cached singleton — mongoose.connection.db isn't
// available until connectDB() resolves, so this must be called lazily.
export const getBucket = () =>
  new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "cvs",
  });
