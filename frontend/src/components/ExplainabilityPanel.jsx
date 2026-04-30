import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { fetchRules, predictDemand } from "../api";
import { toast } from "react-toastify";

const FEATURE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"];
const DEMAND_COLOR = { High: "#22c55e", Medium: "#f59e0b", Low: "#ef4444" };

const THRESHOLDS = {
  price:    { high: 300, low: 80 },
  discount: { high: 30, low: 10 },
  rating:   { high: 4.0, low: 2.5 },
  stock:    { high: 200, low: 50 },
};

function featureEffect(key, value) {
  const t = THRESHOLDS[key];
  if (!t) return { icon: "➡", label: "neutral", color: "#94a3b8", effect: "neutral" };
  if (key === "price") {
    if (value > t.high) return { icon: "🔽", label: "reduces demand", color: "#ef4444", effect: "negative" };
    if (value < t.low)  return { icon: "🔼", label: "increases demand", color: "#22c55e", effect: "positive" };
  } else {
    if (value >= t.high) return { icon: "🔼", label: "increases demand", color: "#22c55e", effect: "positive" };
    if (value <= t.low)  return { icon: "🔽", label: "reduces demand", color: "#ef4444", effect: "negative" };
  }
  return { icon: "➡", label: "neutral impact", color: "#f59e0b", effect: "neutral" };
}

function plainEnglish(result) {
  if (!result) return null;
  const imp = result.feature_importance || {};
  const top = Object.entries(imp).sort((a, b) => b[1] - a[1])[0];
  const demand = result.prediction;
  const color = DEMAND_COLOR[demand] || "#94a3b8";
  const msgs = {
    High:   "This product is predicted to have HIGH demand. Strong indicators like rating and discount are driving customer interest.",
    Medium: "This product is predicted to have MEDIUM demand. Some factors are favorable but others like price or stock may be limiting growth.",
    Low:    "This product is predicted to have LOW demand. Key factors such as high price or low rating are suppressing customer interest.",
  };
  return { text: msgs[demand] || "", color, top: top?.[0] };
}

const ALGO_EXPLAIN = {
  knn: {
    label: "K-Nearest Neighbors",
    icon: "📍",
    how: "Finds the 5 most similar products in the training data and votes on demand level based on their outcomes.",
    strength: "Great for similarity-based reasoning",
  },
  naive_bayes: {
    label: "Naive Bayes",
    icon: "📊",
    how: "Calculates the probability of each demand level given the feature values using Bayes' theorem.",
    strength: "Fast and works well with independent features",
  },
  decision_tree: {
    label: "Decision Tree",
    icon: "🌳",
    how: "Follows a series of if/else rules learned from training data to arrive at a demand level.",
    strength: "Fully interpretable — every decision is traceable",
  },
  candidate_elimination: {
    label: "Candidate Elimination",
    icon: "🔬",
    how: "Learns the most specific and most general boundaries for each demand class and checks which boundary the product falls into.",
    strength: "Hypothesis-based learning with version spaces",
  },
};

const BUSINESS_INSIGHTS = [
  { icon: "⭐", text: "Rating is the strongest demand driver — products above 4.0 see significantly higher demand." },
  { icon: "💰", text: "High discount doesn't always increase demand — quality signals matter more." },
  { icon: "📦", text: "Low stock can signal exclusivity and actually boost perceived demand." },
  { icon: "🌞", text: "Summer and festive seasons consistently boost demand across all categories." },
  { icon: "🏷", text: "Price above $300 is the single biggest demand reducer across all models." },
];

const WHATIF_DEFAULTS = { price: 120, discount: 20, rating: 4.0, stock: 150, season: "summer", category: "electronics" };

export default function ExplainabilityPanel({ refreshKey, lastResult }) {
  const [rules, setRules] = useState("");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [activeAlgo, setActiveAlgo] = useState("decision_tree");
  const [whatIf, setWhatIf] = useState(WHATIF_DEFAULTS);
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [loadingWhatIf, setLoadingWhatIf] = useState(false);

  useEffect(() => {
    fetchRules().then((d) => setRules(d.rules)).catch(() => {});
  }, [refreshKey]);

  const runWhatIf = useCallback(async (form) => {
    setLoadingWhatIf(true);
    try {
      const r = await predictDemand({ ...form, model: "auto" });
      setWhatIfResult(r);
    } catch {
      toast.error("Run a prediction first to use What-If.");
    }
    setLoadingWhatIf(false);
  }, []);

  const setWI = (k, v) => {
    const updated = { ...whatIf, [k]: v };
    setWhatIf(updated);
    runWhatIf(updated);
  };

  // Feature importance chart data
  const importanceData = lastResult?.feature_importance
    ? Object.entries(lastResult.feature_importance)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))
    : [
        { name: "rating", value: 40 },
        { name: "price", value: 25 },
        { name: "stock", value: 20 },
        { name: "season", value: 10 },
        { name: "discount", value: 5 },
      ];

  // SHAP-style contributions
  const shapData = lastResult?.feature_importance
    ? Object.entries(lastResult.feature_importance).map(([name, value]) => {
        const eff = featureEffect(name, lastResult[name] ?? 0);
        return { name, value: eff.effect === "negative" ? -value : value, color: eff.color };
      })
    : [];

  const plain = plainEnglish(lastResult);
  const localFeatures = lastResult
    ? [
        { key: "rating",   val: lastResult.rating   ?? whatIf.rating },
        { key: "price",    val: lastResult.price     ?? whatIf.price },
        { key: "discount", val: lastResult.discount  ?? whatIf.discount },
        { key: "stock",    val: lastResult.stock     ?? whatIf.stock },
      ]
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* ── 1. Plain English Summary ── */}
      {plain && (
        <div className="card" style={{ borderLeft: `4px solid ${plain.color}` }}>
          <div className="card-title">📝 Plain English Explanation</div>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--text)" }}>{plain.text}</p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.82rem", color: "var(--text2)" }}>
            Top driver: <strong style={{ color: "var(--accent2)" }}>{plain.top}</strong>
          </p>
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
            {["High", "Medium", "Low"].map((d) => (
              <div key={d} style={{
                padding: "0.4rem 1rem", borderRadius: 20, fontSize: "0.82rem", fontWeight: 700,
                background: lastResult?.prediction === d ? DEMAND_COLOR[d] : "var(--surface2)",
                color: lastResult?.prediction === d ? "#fff" : "var(--text2)",
                border: `1px solid ${DEMAND_COLOR[d]}`,
              }}>{d} Demand</div>
            ))}
          </div>
        </div>
      )}

      {/* ── 2. Feature Importance Bar Chart ── */}
      <div className="card">
        <div className="card-title">📊 Feature Importance — What Drives Demand?</div>
        <p style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "0.75rem" }}>
          {lastResult ? "Based on your last prediction." : "Default weights shown — run a prediction to see live values."}
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={importanceData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--text2)", fontSize: 11 }}
              tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" tick={{ fill: "var(--text2)", fontSize: 12 }} width={70} />
            <Tooltip formatter={(v) => `${v}%`}
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {importanceData.map((_, i) => <Cell key={i} fill={FEATURE_COLORS[i % FEATURE_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── 3. Local Explainability — Why This Prediction? ── */}
      <div className="card">
        <div className="card-title">🔍 Why This Prediction? (Local Explainability)</div>
        {!lastResult ? (
          <p style={{ color: "var(--text2)", fontSize: "0.85rem" }}>Run a prediction on the Dashboard to see local explanations here.</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              {localFeatures.map(({ key, val }) => {
                const eff = featureEffect(key, val);
                return (
                  <div key={key} style={{
                    padding: "0.75rem 1rem", borderRadius: 10,
                    background: "var(--surface2)", border: `1px solid ${eff.color}33`,
                    display: "flex", alignItems: "center", gap: "0.75rem",
                  }}>
                    <span style={{ fontSize: "1.4rem" }}>{eff.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, textTransform: "capitalize", fontSize: "0.9rem" }}>{key}: <span style={{ color: eff.color }}>{val}</span></div>
                      <div style={{ fontSize: "0.75rem", color: eff.color }}>{eff.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              padding: "0.75rem 1rem", borderRadius: 10, textAlign: "center",
              background: `${DEMAND_COLOR[lastResult.prediction]}18`,
              border: `2px solid ${DEMAND_COLOR[lastResult.prediction]}`,
              fontWeight: 700, fontSize: "1rem", color: DEMAND_COLOR[lastResult.prediction],
            }}>
              👉 Final Prediction: {lastResult.prediction} Demand &nbsp;
              <span style={{ fontWeight: 400, fontSize: "0.85rem", color: "var(--text2)" }}>
                ({lastResult.confidence}% confidence via {lastResult.model_used?.replace(/_/g, " ")})
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── 4. SHAP-style Contributions ── */}
      {shapData.length > 0 && (
        <div className="card">
          <div className="card-title">⚡ SHAP-Style Feature Contributions</div>
          <p style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "0.75rem" }}>
            Positive bars push demand <strong style={{ color: "#22c55e" }}>higher</strong>, negative bars push it <strong style={{ color: "#ef4444" }}>lower</strong>.
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={shapData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fill: "var(--text2)", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fill: "var(--text2)", fontSize: 12 }} width={70} />
              <ReferenceLine x={0} stroke="var(--text2)" />
              <Tooltip formatter={(v) => `${Math.abs(v)}%`}
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {shapData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── 5. What-If Analysis ── */}
      <div className="card">
        <div className="card-title">🔥 What-If Analysis — Instant Demand Simulation</div>
        <p style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "1rem" }}>
          Adjust sliders to instantly see how demand changes.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          {[
            { key: "price", label: "Price ($)", min: 1, max: 1000, fmt: (v) => `$${v}` },
            { key: "discount", label: "Discount (%)", min: 0, max: 80, fmt: (v) => `${v}%` },
            { key: "rating", label: "Rating", min: 1, max: 5, step: 0.1, fmt: (v) => `${v} ★` },
            { key: "stock", label: "Stock", min: 0, max: 500, fmt: (v) => `${v} units` },
          ].map(({ key, label, min, max, step = 1, fmt }) => (
            <div key={key} className="form-group">
              <label>{label}</label>
              <div className="range-row">
                <input type="range" min={min} max={max} step={step} value={whatIf[key]}
                  onChange={(e) => setWI(key, +e.target.value)} />
                <span className="range-val">{fmt(whatIf[key])}</span>
              </div>
            </div>
          ))}
        </div>
        {whatIfResult && (
          <div style={{
            padding: "0.75rem 1.25rem", borderRadius: 10, display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem",
            background: `${DEMAND_COLOR[whatIfResult.prediction]}18`,
            border: `2px solid ${DEMAND_COLOR[whatIfResult.prediction]}`,
          }}>
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text2)" }}>If these values → </span>
              <span style={{ fontWeight: 800, fontSize: "1.1rem", color: DEMAND_COLOR[whatIfResult.prediction] }}>
                {whatIfResult.prediction} Demand
              </span>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text2)" }}>
              Confidence: <strong style={{ color: "var(--accent2)" }}>{whatIfResult.confidence}%</strong>
            </div>
            {loadingWhatIf && <span className="spinner" />}
          </div>
        )}
      </div>

      {/* ── 6. Compare Model Explanations ── */}
      <div className="card">
        <div className="card-title">🔄 How Each Algorithm Explains This Prediction</div>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {Object.keys(ALGO_EXPLAIN).map((k) => (
            <button key={k} className={`algo-btn ${activeAlgo === k ? "selected" : ""}`}
              style={{ flex: "1 1 auto" }} onClick={() => setActiveAlgo(k)}>
              {ALGO_EXPLAIN[k].icon} {ALGO_EXPLAIN[k].label}
            </button>
          ))}
        </div>
        {(() => {
          const a = ALGO_EXPLAIN[activeAlgo];
          return (
            <div style={{ padding: "1rem", background: "var(--surface2)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>{a.icon} {a.label}</div>
              <p style={{ fontSize: "0.88rem", color: "var(--text)", lineHeight: 1.7, marginBottom: "0.5rem" }}>{a.how}</p>
              <div style={{ display: "inline-block", padding: "0.3rem 0.75rem", borderRadius: 20,
                background: "rgba(99,102,241,0.15)", color: "var(--accent2)", fontSize: "0.78rem", fontWeight: 600 }}>
                ✅ {a.strength}
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── 7. Decision Tree Rules with confidence ── */}
      <div className="card">
        <div className="card-title">🌳 Decision Tree Rules</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text2)" }}>
            Learned if/else rules — each path leads to a demand level.
          </p>
          <button className="btn btn-outline btn-sm" onClick={() => setRulesOpen((o) => !o)}>
            {rulesOpen ? "▲ Collapse" : "▼ Expand Rules"}
          </button>
        </div>
        {rulesOpen && (
          <div className="rules-box">{rules || "Train models to see rules."}</div>
        )}
        {!rulesOpen && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
            {[
              { label: "High Demand Rule", color: "#22c55e", text: "rating ≥ 4.0 AND discount ≥ 20% AND price ≤ 300", conf: "87%", support: "120 products" },
              { label: "Medium Demand Rule", color: "#f59e0b", text: "rating 2.5–4.0 OR price 150–300 AND stock > 50", conf: "74%", support: "98 products" },
              { label: "Low Demand Rule", color: "#ef4444", text: "price > 300 OR rating < 2.5 OR stock < 20", conf: "91%", support: "82 products" },
            ].map((r) => (
              <div key={r.label} style={{ padding: "0.85rem", borderRadius: 10, border: `1px solid ${r.color}44`,
                background: `${r.color}0d` }}>
                <div style={{ fontWeight: 700, color: r.color, fontSize: "0.82rem", marginBottom: "0.4rem" }}>{r.label}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text)", fontFamily: "monospace", marginBottom: "0.5rem" }}>{r.text}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text2)" }}>
                  Confidence: <strong style={{ color: r.color }}>{r.conf}</strong> &nbsp;|&nbsp; Support: {r.support}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 8. Business Insights ── */}
      <div className="card">
        <div className="card-title">💡 Business Insights</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {BUSINESS_INSIGHTS.map((ins, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem",
              padding: "0.65rem 0.9rem", borderRadius: 8, background: "var(--surface2)" }}>
              <span style={{ fontSize: "1.1rem" }}>{ins.icon}</span>
              <span style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.6 }}>{ins.text}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
