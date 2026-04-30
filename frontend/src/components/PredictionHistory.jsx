import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { fetchHistory, exportCSV, exportPDF } from "../api";

const DEMAND_COLORS = { Low: "#ef4444", Medium: "#f59e0b", High: "#22c55e" };

export default function PredictionHistory({ refreshKey }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory().then(setHistory).catch(() => {});
  }, [refreshKey]);

  const pieData = ["Low", "Medium", "High"].map((label) => ({
    name: label,
    value: history.filter((h) => h.prediction === label).length,
  })).filter(d => d.value > 0);

  const lineData = history.slice(0, 20).reverse().map((h, i) => ({
    i: i + 1,
    confidence: h.confidence,
    demand: h.prediction === "High" ? 3 : h.prediction === "Medium" ? 2 : 1,
  }));

  return (
    <div className="card">
      <div className="card-title">Prediction History</div>

      {history.length === 0 ? (
        <p style={{ color: "var(--text2)", padding: "1rem 0" }}>No predictions yet. Run a prediction first.</p>
      ) : (
        <>
          <div className="grid-2" style={{ marginBottom: "1.25rem" }}>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "0.5rem" }}>Confidence Over Time</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="i" tick={{ fill: "var(--text2)", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "var(--text2)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
                  <Line type="monotone" dataKey="confidence" stroke="var(--accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "0.5rem" }}>Demand Distribution</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={DEMAND_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="btn-row" style={{ marginBottom: "1rem" }}>
            <button className="btn btn-outline btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
            <button className="btn btn-outline btn-sm" onClick={exportPDF}>⬇ Export PDF</button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Time</th><th>Prediction</th><th>Confidence</th><th>Model</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 15).map((h) => (
                  <tr key={h.id}>
                    <td>{h.id}</td>
                    <td style={{ fontSize: "0.78rem", color: "var(--text2)" }}>{h.timestamp?.slice(0, 19).replace("T", " ")}</td>
                    <td>
                      <span className={`badge badge-${h.prediction.toLowerCase()}`}>{h.prediction}</span>
                    </td>
                    <td>{h.confidence}%</td>
                    <td style={{ fontSize: "0.8rem" }}>{h.model_used?.replace("_", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
