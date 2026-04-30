from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import io, csv, json
from database import init_db, log_prediction, get_prediction_history, log_dataset
from ml_pipeline import train_all, predict, get_metrics, get_dt_rules, load_pipeline
from preprocessing import encode_row, generate_sample_data

app = Flask(__name__)
CORS(app, origins="*")

init_db()

# Auto-train on startup so predict works immediately without a manual train step
try:
    load_pipeline()
except Exception:
    pass

try:
    from ml_pipeline import _trained
    if not _trained:
        train_all()
except Exception:
    pass

@app.route("/api/train", methods=["POST"])
def train():
    df = None
    if "file" in request.files:
        f = request.files["file"]
        df = pd.read_csv(f)
        log_dataset(f.filename, len(df))
    metrics, best = train_all(df)
    return jsonify({"metrics": metrics, "best_model": best})

@app.route("/api/predict", methods=["POST"])
def make_prediction():
    data = request.json
    model_name = data.get("model", "auto")
    features = encode_row(data)
    result = predict(features, model_name)
    log_prediction(data, result)
    return jsonify(result)

@app.route("/api/metrics", methods=["GET"])
def metrics():
    m, best = get_metrics()
    return jsonify({"metrics": m, "best_model": best})

@app.route("/api/history", methods=["GET"])
def history():
    return jsonify(get_prediction_history())

@app.route("/api/rules", methods=["GET"])
def rules():
    return jsonify({"rules": get_dt_rules()})

@app.route("/api/sample-data", methods=["GET"])
def sample_data():
    df = generate_sample_data(20)
    return jsonify(df.to_dict(orient="records"))

@app.route("/api/export/csv", methods=["GET"])
def export_csv():
    history = get_prediction_history(200)
    si = io.StringIO()
    if history:
        writer = csv.DictWriter(si, fieldnames=history[0].keys())
        writer.writeheader()
        writer.writerows(history)
    output = io.BytesIO(si.getvalue().encode())
    output.seek(0)
    return send_file(output, mimetype="text/csv", as_attachment=True, download_name="predictions.csv")

@app.route("/api/export/pdf", methods=["GET"])
def export_pdf():
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    history = get_prediction_history(50)
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, 750, "Prediction History Report")
    c.setFont("Helvetica", 10)
    y = 720
    for row in history:
        line = f"[{row['timestamp'][:19]}] {row['prediction']} ({row['confidence']}%) via {row['model_used']}"
        c.drawString(50, y, line)
        y -= 18
        if y < 50:
            c.showPage()
            y = 750
    c.save()
    buf.seek(0)
    return send_file(buf, mimetype="application/pdf", as_attachment=True, download_name="predictions.pdf")

if __name__ == "__main__":
    app.run(debug=False, port=5000)
