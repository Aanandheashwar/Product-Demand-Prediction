import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import DataUpload from "./components/DataUpload";
import PredictionPanel from "./components/PredictionPanel";
import ResultCard from "./components/ResultCard";
import ModelComparison from "./components/ModelComparison";
import PredictionHistory from "./components/PredictionHistory";
import ExplainabilityPanel from "./components/ExplainabilityPanel";
import HomePage from "./components/HomePage";

const TABS = ["Dashboard", "Compare Models", "History", "Explainability"];

export default function App() {
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState("Dashboard");
  const [result, setResult] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showHome, setShowHome] = useState(true);

  const handleTrained = () => setRefreshKey((k) => k + 1);
  const handleResult = (r) => { setResult(r); setRefreshKey((k) => k + 1); };

  if (showHome) return (
    <div className={`app ${dark ? "" : "light"}`}>
      <nav className="navbar">
        <div className="nav-brand"><span>📊</span> DemandAI</div>
        <div className="nav-tabs" />
        <div className="nav-actions">
          <button className="btn btn-outline btn-sm" onClick={() => setShowHome(false)}>Dashboard →</button>
          <button className="theme-btn" onClick={() => setDark((d) => !d)}>
            {dark ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </nav>
      <HomePage onGetStarted={() => setShowHome(false)} />
      <ToastContainer position="bottom-right" theme={dark ? "dark" : "light"} autoClose={3000} />
    </div>
  );

  return (
    <div className={`app ${dark ? "" : "light"}`}>
      <nav className="navbar">
        <div className="nav-brand" style={{ cursor: "pointer" }} onClick={() => setShowHome(true)}>
          <span>📊</span> DemandAI
        </div>
        <div className="nav-tabs">
          {TABS.map((t) => (
            <button key={t} className={`nav-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="nav-actions">
          <button className="theme-btn" onClick={() => setDark((d) => !d)}>
            {dark ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </nav>

      <div className="main-content">
        {tab === "Dashboard" && (
          <>
            <DataUpload onTrained={handleTrained} />
            <div className="grid-2">
              <PredictionPanel onResult={handleResult} />
              <ResultCard result={result} />
            </div>
          </>
        )}

        {tab === "Compare Models" && (
          <ModelComparison refreshKey={refreshKey} />
        )}

        {tab === "History" && (
          <PredictionHistory refreshKey={refreshKey} />
        )}

        {tab === "Explainability" && (
          <ExplainabilityPanel refreshKey={refreshKey} lastResult={result} />
        )}
      </div>

      <ToastContainer
        position="bottom-right"
        theme={dark ? "dark" : "light"}
        autoClose={3000}
      />
    </div>
  );
}
