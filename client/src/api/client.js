const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, { method = "GET", body, token } = {}) {
  const isFormData = body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.errors?.[0]?.msg || data?.message || "Request failed";
    throw new Error(message);
  }

  return data;
}

export async function apiFetchBlob(path, { token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "Download failed");
  }

  return res.blob();
}
