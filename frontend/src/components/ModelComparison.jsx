import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import { fetchMetrics } from "../api";

const METRIC_KEYS = ["accuracy", "precision", "recall", "f1"];
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

export default function ModelComparison({ refreshKey }) {
  const [metrics, setMetrics] = useState(null);
  const [best, setBest] = useState("");

  useEffect(() => {
    fetchMetrics()
      .then((d) => { setMetrics(d.metrics); setBest(d.best_model); })
      .catch(() => {});
  }, [refreshKey]);

  if (!metrics) return (
    <div className="card"><div className="card-title">Model Comparison</div>
      <p style={{ color: "var(--text2)", padding: "1rem 0" }}>Train models to see comparison</p>
    </div>
  );

  const radarData = METRIC_KEYS.map((key) => {
    const row = { metric: key.toUpperCase() };
    Object.entries(metrics).forEach(([name, m]) => {
      row[name.replace("_", " ")] = m[key];
    });
    return row;
  });

  const modelNames = Object.keys(metrics).map(n => n.replace("_", " "));
  const modelLabels = Object.keys(metrics).map(n =>
    n.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
  );

  // Per-algorithm grouped bar: each model is one group, metrics are bars
  const perAlgoData = Object.entries(metrics).map(([name, m]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()).replace("Candidate Elimination", "Cand. Elim."),
    ...m,
  }));

  // Line chart: metric on X, each model is a line
  const lineData = METRIC_KEYS.map((key) => {
    const row = { metric: key.toUpperCase() };
    Object.entries(metrics).forEach(([name, m]) => {
      row[name.replace(/_/g, " ")] = m[key];
    });
    return row;
  });

  // Accuracy-only bar per model
  const accuracyData = Object.entries(metrics).map(([name, m]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()).replace("Candidate Elimination", "Cand. Elim."),
    accuracy: m.accuracy,
    f1: m.f1,
  }));

  return (
    <div className="card">
      <div className="card-title">
        Algorithm Comparison
        {best && <span className="badge badge-best" style={{ marginLeft: 8 }}>Best: {best.replace("_", " ")}</span>}
      </div>

      {/* Score cards */}
      <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
        {Object.entries(metrics).map(([name, m], i) => (
          <div key={name} className="stat-card" style={{ borderTop: `3px solid ${COLORS[i]}` }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text2)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {name.replace(/_/g, " ")}
              {name === best && <span className="badge badge-best" style={{ marginLeft: 6 }}>★</span>}
            </div>
            <div className="stat-value" style={{ color: COLORS[i], fontSize: "1.5rem" }}>{m.accuracy}%</div>
            <div className="stat-label">Accuracy</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.72rem", color: "var(--text2)" }}>
              <span>F1 {m.f1}%</span>
              <span>P {m.precision}%</span>
              <span>R {m.recall}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Grouped bar + Radar */}
      <div className="grid-2" style={{ gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div>
          <p style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "0.75rem" }}>All Metrics per Algorithm</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perAlgoData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text2)", fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--text2)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {METRIC_KEYS.map((k, i) => (
                <Bar key={k} dataKey={k} fill={COLORS[i]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "0.75rem" }}>Radar — All Algorithms</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--text2)", fontSize: 11 }} />
              {modelNames.map((name, i) => (
                <Radar key={name} name={name} dataKey={name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Line chart + Accuracy vs F1 bar */}
      <div className="grid-2" style={{ gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div>
          <p style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "0.75rem" }}>Metric Trend Across Algorithms</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="metric" tick={{ fill: "var(--text2)", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--text2)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {modelNames.map((name, i) => (
                <Line key={name} type="monotone" dataKey={name} stroke={COLORS[i]} strokeWidth={2} dot={{ r: 4, fill: COLORS[i] }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "0.75rem" }}>Accuracy vs F1 Score</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={accuracyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--text2)", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "var(--text2)", fontSize: 10 }} width={90} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="accuracy" fill="#6366f1" radius={[0, 3, 3, 0]} />
              <Bar dataKey="f1" fill="#22c55e" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-wrap" style={{ marginTop: "1rem" }}>
        <table>
          <thead>
            <tr>
              <th>Model</th>
              {METRIC_KEYS.map(k => <th key={k}>{k.toUpperCase()}</th>)}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(metrics).map(([name, m]) => (
              <tr key={name}>
                <td style={{ fontWeight: 600 }}>{name.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</td>
                {METRIC_KEYS.map(k => <td key={k}>{m[k]}%</td>)}
                <td>{name === best ? <span className="badge badge-best">★ Best</span> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
