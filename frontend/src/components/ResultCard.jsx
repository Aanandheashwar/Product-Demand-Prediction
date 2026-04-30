import React from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";

export default function ResultCard({ result }) {
  if (!result) return (
    <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 220 }}>
      <p style={{ color: "var(--text2)" }}>Run a prediction to see results here</p>
    </div>
  );

  const level = result.prediction.toLowerCase();
  const probs = result.probabilities || {};
  const importance = result.feature_importance || {};

  const radialData = [
    { name: "Confidence", value: result.confidence, fill: "var(--accent)" },
  ];

  return (
    <div className="card">
      <div className="card-title">Prediction Result</div>

      <div className={`result-box ${level}`}>
        <div className={`result-label ${level}`}>{result.prediction}</div>
        <div className="result-sub">
          via <strong>{result.model_used.replace("_", " ").toUpperCase()}</strong>
          {result.is_best_model && <span className="badge badge-best" style={{ marginLeft: 8 }}>★ Best Model</span>}
        </div>
        <div style={{ marginTop: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text2)", marginBottom: 4 }}>
            <span>Confidence</span><span style={{ color: "var(--accent2)", fontWeight: 700 }}>{result.confidence}%</span>
          </div>
          <div className="confidence-bar">
            <div className="confidence-fill" style={{ width: `${result.confidence}%` }} />
          </div>
        </div>
      </div>

      <div className="proba-row">
        {Object.entries(probs).map(([label, pct]) => (
          <div key={label} className="proba-item">
            <div className={`proba-val`} style={{ color: label === "High" ? "var(--high)" : label === "Medium" ? "var(--medium)" : "var(--low)" }}>
              {pct}%
            </div>
            <div className="proba-lbl">{label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        <div className="card-title">Feature Importance (Why?)</div>
        {Object.entries(importance).sort((a, b) => b[1] - a[1]).map(([feat, val]) => (
          <div key={feat} className="feature-bar-row">
            <span className="feature-name">{feat}</span>
            <div className="feature-bar-bg">
              <div className="feature-bar-fill" style={{ width: `${val}%` }} />
            </div>
            <span className="feature-pct">{val}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
