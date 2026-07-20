import { apiFetch, apiFetchBlob } from "./client";

export const getCvs = (token) => apiFetch("/cv", { token });

export const uploadCv = (file, token) => {
  const formData = new FormData();
  formData.append("cv", file);
  return apiFetch("/cv", { method: "POST", body: formData, token });
};

export const deleteCv = (id, token) =>
  apiFetch(`/cv/${id}`, { method: "DELETE", token });

export const downloadCv = (id, token) =>
  apiFetchBlob(`/cv/${id}/download`, { token });
