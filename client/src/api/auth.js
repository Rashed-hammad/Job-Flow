import { apiFetch } from "./client";

export const login = (email, password) =>
  apiFetch("/auth/login", { method: "POST", body: { email, password } });

export const register = (name, email, password) =>
  apiFetch("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });

export const updateReminderPreference = (remindersEnabled, token) =>
  apiFetch("/auth/me", {
    method: "PATCH",
    body: { remindersEnabled },
    token,
  });
