import JobApplication, { JOB_STATUSES } from "../models/JobApplication.js";

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

export const getJobStats = async (req, res, next) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [result] = await JobApplication.aggregate([
      { $match: { user: req.user._id } },
      {
        $facet: {
          statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          monthly: [
            { $match: { appliedDate: { $gte: sixMonthsAgo } } },
            {
              $group: {
                _id: {
                  year: { $year: "$appliedDate" },
                  month: { $month: "$appliedDate" },
                },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const byStatus = Object.fromEntries(
      JOB_STATUSES.map((status) => {
        const match = result.statusCounts.find((s) => s._id === status);
        return [status, match ? match.count : 0];
      }),
    );

    const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);

    const monthlyTrend = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const match = result.monthly.find(
        (m) => m._id.year === year && m._id.month === month,
      );
      monthlyTrend.push({
        month: `${year}-${String(month).padStart(2, "0")}`,
        count: match ? match.count : 0,
      });
    }

    const interviewRate = total
      ? Math.round(((byStatus.Interview + byStatus.Offer) / total) * 100)
      : 0;
    const offerRate = total ? Math.round((byStatus.Offer / total) * 100) : 0;

    res.json({ total, byStatus, monthlyTrend, interviewRate, offerRate });
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
