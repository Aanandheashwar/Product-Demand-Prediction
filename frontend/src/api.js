const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const trainModels = (file) => {
  const fd = new FormData();
  if (file) fd.append("file", file);
  return fetch(`${API}/train`, { method: "POST", body: fd }).then(r => r.json());
};

export const predictDemand = (data) =>
  fetch(`${API}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const fetchMetrics = () => fetch(`${API}/metrics`).then(r => r.json());
export const fetchHistory = () => fetch(`${API}/history`).then(r => r.json());
export const fetchRules = () => fetch(`${API}/rules`).then(r => r.json());
export const fetchSampleData = () => fetch(`${API}/sample-data`).then(r => r.json());
export const exportCSV = () => window.open(`${API}/export/csv`);
export const exportPDF = () => window.open(`${API}/export/pdf`);
