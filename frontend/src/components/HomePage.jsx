import React, { useEffect, useState } from "react";

const FEATURES = [
  { icon: "⚡", title: "Auto Model Selection", desc: "System picks the best algorithm automatically based on live accuracy scores." },
  { icon: "🔮", title: "What-If Simulation", desc: "Drag sliders for price, discount, rating — see demand change instantly." },
  { icon: "🧠", title: "Explainable AI (XAI)", desc: "Understand exactly why a prediction was made with SHAP-style charts and plain English." },
  { icon: "📊", title: "Model Comparison", desc: "Bar, Radar and Line charts comparing all 4 algorithms side by side." },
  { icon: "📈", title: "Prediction History", desc: "Track every prediction over time with trend charts and CSV/PDF export." },
  { icon: "🌳", title: "Decision Tree Rules", desc: "Visual rule cards with confidence % and support count per demand level." },
];

const ALGORITHMS = [
  { name: "K-Nearest Neighbors", tag: "Similarity", color: "#6366f1", desc: "Finds the 5 most similar products and votes on demand level." },
  { name: "Naive Bayes", tag: "Probabilistic", color: "#22c55e", desc: "Uses Bayes' theorem to calculate demand probability per class." },
  { name: "Decision Tree", tag: "Rule-Based", color: "#f59e0b", desc: "Learns if/else rules from data — fully interpretable." },
  { name: "Candidate Elimination", tag: "Hypothesis", color: "#ef4444", desc: "Learns version-space boundaries for each demand class." },
];

const STATS = [
  { value: "4", label: "ML Algorithms" },
  { value: "6", label: "Input Features" },
  { value: "3", label: "Demand Levels" },
  { value: "100%", label: "Open Source" },
];

const STEPS = [
  { num: "01", title: "Upload or Use Sample Data", desc: "Drag & drop your CSV or click 'Use Sample Data' to train on 300 generated products." },
  { num: "02", title: "Train All Models", desc: "One click trains KNN, Naive Bayes, Decision Tree and Candidate Elimination simultaneously." },
  { num: "03", title: "Predict & Explore", desc: "Use the What-If sliders to simulate any product and get instant demand predictions." },
  { num: "04", title: "Understand & Export", desc: "Explore XAI explanations, compare models, and export history as CSV or PDF." },
];

function AnimatedNumber({ target }) {
  const [val, setVal] = useState(0);
  const isPercent = String(target).includes("%");
  const num = parseInt(target);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(num / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setVal(num); clearInterval(timer); }
      else setVal(start);
    }, 30);
    return () => clearInterval(timer);
  }, [num]);

  return <>{val}{isPercent ? "%" : ""}</>;
}

export default function HomePage({ onGetStarted }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="homepage">

      {/* ── HERO ── */}
      <section className={`hero ${visible ? "hero-visible" : ""}`}>
        <div className="hero-badge">🚀 AI-Powered Demand Intelligence</div>
        <h1 className="hero-title">
          Predict Product Demand<br />
          <span className="hero-gradient">Before It Happens</span>
        </h1>
        <p className="hero-sub">
          A full-stack machine learning platform that forecasts eCommerce demand using 4 algorithms,
          explains every prediction, and lets you simulate any scenario in real time.
        </p>
        <div className="hero-actions">
          <button className="btn btn-hero-primary" onClick={onGetStarted}>
            🔮 Launch Dashboard
          </button>

        </div>

        {/* Floating demand badges */}
        <div className="hero-badges-float">
          <span className="float-badge high">🔼 High Demand</span>
          <span className="float-badge medium">➡ Medium Demand</span>
          <span className="float-badge low">🔽 Low Demand</span>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-strip">
        {STATS.map((s) => (
          <div key={s.label} className="stats-item">
            <div className="stats-value">
              <AnimatedNumber target={s.value} />
            </div>
            <div className="stats-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-tag">Features</div>
          <h2 className="section-title">Everything You Need to Forecast Demand</h2>
          <p className="section-sub">From raw data to explainable predictions — all in one platform.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ALGORITHMS ── */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-tag">Algorithms</div>
          <h2 className="section-title">4 ML Algorithms, One Platform</h2>
          <p className="section-sub">Each algorithm brings a unique perspective — the system auto-selects the best one.</p>
        </div>
        <div className="algo-cards">
          {ALGORITHMS.map((a) => (
            <div key={a.name} className="algo-card" style={{ borderTop: `3px solid ${a.color}` }}>
              <div className="algo-tag" style={{ background: `${a.color}22`, color: a.color }}>{a.tag}</div>
              <div className="algo-name">{a.name}</div>
              <div className="algo-desc">{a.desc}</div>
              <div className="algo-dot" style={{ background: a.color }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-tag">How It Works</div>
          <h2 className="section-title">Up and Running in 4 Steps</h2>
        </div>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div key={s.num} className="step-card">
              <div className="step-num">{s.num}</div>
              {i < STEPS.length - 1 && <div className="step-connector" />}
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CSV FORMAT ── */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-tag">Data Format</div>
          <h2 className="section-title">Simple CSV Input</h2>
          <p className="section-sub">Bring your own data or use the built-in sample dataset.</p>
        </div>
        <div className="csv-block">
          <div className="csv-header">
            <span className="csv-dot red" /><span className="csv-dot yellow" /><span className="csv-dot green" />
            <span style={{ marginLeft: "0.75rem", fontSize: "0.78rem", color: "var(--text2)" }}>products.csv</span>
          </div>
          <pre className="csv-code">{`price,discount,rating,stock,season,category,demand_level
120,20,4.0,150,summer,electronics,high
50,5,2.5,300,winter,clothing,low
200,35,4.8,80,fall,sports,high
15,0,1.8,500,spring,food,low`}</pre>
          <div className="csv-tags">
            {["low / medium / high", "spring / summer / fall / winter", "electronics / clothing / food / sports / home"].map(t => (
              <span key={t} className="csv-tag">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-glow" />
        <h2 className="cta-title">Ready to Predict Demand?</h2>
        <p className="cta-sub">Train models in one click. No setup required.</p>
        <button className="btn btn-hero-primary" style={{ fontSize: "1rem", padding: "0.85rem 2.5rem" }} onClick={onGetStarted}>
          🚀 Get Started — It's Free
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="nav-brand" style={{ justifyContent: "center", marginBottom: "0.5rem" }}>
          <span>📊</span> DemandAI
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text2)" }}>
          Built with React · Flask · scikit-learn · Recharts
        </p>
      </footer>

    </div>
  );
}
