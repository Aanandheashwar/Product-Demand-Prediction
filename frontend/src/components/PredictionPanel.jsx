import React, { useState } from "react";
import { predictDemand } from "../api";
import { toast } from "react-toastify";

const ALGOS = [
  { key: "auto", label: "⚡ Auto (Best)" },
  { key: "knn", label: "K-NN" },
  { key: "naive_bayes", label: "Naive Bayes" },
  { key: "decision_tree", label: "Decision Tree" },
  { key: "candidate_elimination", label: "Candidate Elim." },
];

const DEFAULTS = {
  price: 120,
  discount: 20,
  rating: 4.0,
  stock: 150,
  season: "summer",
  category: "electronics",
};

export default function PredictionPanel({ onResult }) {
  const [form, setForm] = useState(DEFAULTS);
  const [algo, setAlgo] = useState("auto");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handlePredict = async () => {
    setLoading(true);
    try {
      const result = await predictDemand({ ...form, model: algo });
      onResult(result);
    } catch {
      toast.error("Prediction failed. Train models first.");
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-title">What-If Simulation & Prediction</div>

      <div className="algo-grid">
        {ALGOS.map((a) => (
          <button
            key={a.key}
            className={`algo-btn ${algo === a.key ? "selected" : ""}`}
            onClick={() => setAlgo(a.key)}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Price ($)</label>
          <div className="range-row">
            <input type="range" min={1} max={1000} value={form.price}
              onChange={(e) => set("price", +e.target.value)} />
            <span className="range-val">${form.price}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Discount (%)</label>
          <div className="range-row">
            <input type="range" min={0} max={80} value={form.discount}
              onChange={(e) => set("discount", +e.target.value)} />
            <span className="range-val">{form.discount}%</span>
          </div>
        </div>

        <div className="form-group">
          <label>Rating (1–5)</label>
          <div className="range-row">
            <input type="range" min={1} max={5} step={0.1} value={form.rating}
              onChange={(e) => set("rating", +e.target.value)} />
            <span className="range-val">{form.rating}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Stock Units</label>
          <div className="range-row">
            <input type="range" min={0} max={500} value={form.stock}
              onChange={(e) => set("stock", +e.target.value)} />
            <span className="range-val">{form.stock}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Season</label>
          <select value={form.season} onChange={(e) => set("season", e.target.value)}>
            {["spring", "summer", "fall", "winter"].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select value={form.category} onChange={(e) => set("category", e.target.value)}>
            {["electronics", "clothing", "food", "sports", "home"].map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" onClick={handlePredict} disabled={loading}>
          {loading ? <span className="spinner" /> : "🔮 Predict Demand"}
        </button>
      </div>
    </div>
  );
}
