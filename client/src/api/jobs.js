import { apiFetch } from "./client";

export const getJobs = (token) => apiFetch("/jobs", { token });

export const updateJobStatus = (id, status, token) =>
  apiFetch(`/jobs/${id}`, { method: "PUT", body: { status }, token });

export const createJob = (job, token) =>
  apiFetch("/jobs", { method: "POST", body: job, token });

export const scoreJobMatch = (jobId, cvId, token) =>
  apiFetch(`/jobs/${jobId}/score`, { method: "POST", body: { cvId }, token });

export const deleteJob = (id, token) =>
  apiFetch(`/jobs/${id}`, { method: "DELETE", token });

export const updateJob = (id, data, token) =>
  apiFetch(`/jobs/${id}`, { method: "PUT", body: data, token });
