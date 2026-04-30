import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { trainModels } from "../api";
import { toast } from "react-toastify";

export default function DataUpload({ onTrained }) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    onDrop: (files) => setFile(files[0]),
  });

  const handleTrain = async (useFile) => {
    setLoading(true);
    try {
      const result = await trainModels(useFile ? file : null);
      toast.success(`Models trained! Best: ${result.best_model}`);
      onTrained(result);
    } catch {
      toast.error("Training failed. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="card section">
      <div className="card-title">Dataset Upload & Model Training</div>
      <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
        <input {...getInputProps()} />
        <div className="dropzone-icon">📂</div>
        {file ? (
          <p style={{ color: "var(--accent2)", fontWeight: 600 }}>{file.name}</p>
        ) : (
          <>
            <p>Drag & drop a CSV file here, or click to select</p>
            <p style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
              Required columns: price, discount, rating, stock, season, category, demand_level
            </p>
          </>
        )}
      </div>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => handleTrain(true)} disabled={loading}>
          {loading ? <span className="spinner" /> : "🚀 Train on Uploaded CSV"}
        </button>
        <button className="btn btn-outline" onClick={() => handleTrain(false)} disabled={loading}>
          Use Sample Data
        </button>
      </div>
    </div>
  );
}
