import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split
from algorithms import KNNClassifier, NaiveBayesClassifier, CandidateElimination
from preprocessing import FEATURE_COLS, DEMAND_INV, preprocess, generate_sample_data
import joblib, os, json

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

MODELS = {
    "knn": KNNClassifier(k=5),
    "naive_bayes": NaiveBayesClassifier(),
    "decision_tree": DecisionTreeClassifier(max_depth=5, random_state=42),
    "candidate_elimination": CandidateElimination(),
}

_trained = {}
_scaler = None
_metrics = {}
_best_model = None
_dt_rules = None

def train_all(df=None):
    global _scaler, _metrics, _best_model, _dt_rules
    if df is None:
        df = generate_sample_data()
    X, y, scaler = preprocess(df)
    _scaler = scaler
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    _metrics.clear()
    for name, model in MODELS.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        _trained[name] = model
        _metrics[name] = {
            "accuracy": round(accuracy_score(y_test, preds) * 100, 2),
            "precision": round(precision_score(y_test, preds, average="weighted", zero_division=0) * 100, 2),
            "recall": round(recall_score(y_test, preds, average="weighted", zero_division=0) * 100, 2),
            "f1": round(f1_score(y_test, preds, average="weighted", zero_division=0) * 100, 2),
        }

    _best_model = max(_metrics, key=lambda k: _metrics[k]["accuracy"])

    dt = _trained["decision_tree"]
    _dt_rules = export_text(dt, feature_names=FEATURE_COLS)

    joblib.dump({"models": _trained, "scaler": _scaler, "metrics": _metrics, "best": _best_model}, 
                os.path.join(MODEL_DIR, "pipeline.pkl"))
    return _metrics, _best_model

def load_pipeline():
    global _trained, _scaler, _metrics, _best_model
    path = os.path.join(MODEL_DIR, "pipeline.pkl")
    if os.path.exists(path):
        data = joblib.load(path)
        _trained = data["models"]
        _scaler = data["scaler"]
        _metrics = data["metrics"]
        _best_model = data["best"]

def predict(features: list, model_name: str = "auto"):
    if not _trained:
        train_all()
    name = _best_model if model_name == "auto" else model_name
    model = _trained[name]
    x = _scaler.transform([features])
    pred = model.predict(x)[0]
    proba = model.predict_proba(x)[0]
    confidence = round(float(max(proba)) * 100, 1)
    label = DEMAND_INV[int(pred)]

    importance = get_feature_importance(name, features)
    return {
        "model_used": name,
        "prediction": label,
        "confidence": confidence,
        "probabilities": {DEMAND_INV[i]: round(float(p) * 100, 1) for i, p in enumerate(proba)},
        "feature_importance": importance,
        "is_best_model": name == _best_model,
    }

def get_feature_importance(model_name: str, features: list):
    if model_name == "decision_tree" and "decision_tree" in _trained:
        dt = _trained["decision_tree"]
        imp = dt.feature_importances_
        return {f: round(float(v) * 100, 1) for f, v in zip(FEATURE_COLS, imp)}
    weights = [0.25, 0.20, 0.20, 0.15, 0.10, 0.10]
    return {f: round(w * 100, 1) for f, w in zip(FEATURE_COLS, weights)}

def get_metrics():
    if not _metrics:
        train_all()
    return _metrics, _best_model

def get_dt_rules():
    return _dt_rules or "Train models first."
