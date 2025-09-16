const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

export async function sendMessageApi(userId, text) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, text }),
  });
  if (!res.ok) throw new Error("Server error");
  return res.json();
}

export async function uploadImageApi(userId, file) {
  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function predictHealthApi(vitals) {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vitals }),
  });
  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
}

// 👇 NEW Gemini API function
export async function geminiApi(prompt) {
  const res = await fetch(`${API_BASE}/api/gemini`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error("Gemini request failed");
  return res.json();
}
