import JobApplication from "../models/JobApplication.js";

export const createJob = async (req, res, next) => {
  try {
    const { company, role, jobDescription, appliedDate, status, notes } =
      req.body;

    const job = await JobApplication.create({
      user: req.user._id,
      company,
      role,
      jobDescription,
      appliedDate,
      status,
      notes,
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const jobs = await JobApplication.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!job) {
      return res.status(404).json({ message: "Job application not found" });
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { company, role, jobDescription, appliedDate, status, notes } =
      req.body;

    const job = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!job) {
      return res.status(404).json({ message: "Job application not found" });
    }

    if (company !== undefined) job.company = company;
    if (role !== undefined) job.role = role;
    if (jobDescription !== undefined) job.jobDescription = jobDescription;
    if (appliedDate !== undefined) job.appliedDate = appliedDate;
    if (status !== undefined) job.status = status;
    if (notes !== undefined) job.notes = notes;

    await job.save();
    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await JobApplication.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!job) {
      return res.status(404).json({ message: "Job application not found" });
    }
    res.json({ message: "Job application deleted" });
  } catch (error) {
    next(error);
  }
};
