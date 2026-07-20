import { apiFetch } from "./client";

export const getJobStats = (token) => apiFetch("/jobs/stats", { token });
