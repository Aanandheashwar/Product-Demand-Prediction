import json, os, sqlite3
from datetime import datetime, timezone

# Try Supabase first, fall back to SQLite if credentials missing
_use_supabase = False
_client = None

try:
    from dotenv import load_dotenv
    load_dotenv()
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY", "")
    if url and key and not url.startswith("https://your-project"):
        from supabase import create_client
        _client = create_client(url, key)
        _use_supabase = True
except Exception:
    pass

# ── SQLite fallback ──
DB_PATH = os.path.join(os.path.dirname(__file__), "data", "app.db")

def _sqlite_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    if _use_supabase:
        return
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = _sqlite_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            features TEXT,
            model_used TEXT,
            prediction TEXT,
            confidence REAL
        );
        CREATE TABLE IF NOT EXISTS datasets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            uploaded_at TEXT,
            rows INTEGER
        );
    """)
    conn.commit()
    conn.close()

def log_prediction(features: dict, result: dict):
    ts = datetime.now(timezone.utc).isoformat()
    if _use_supabase:
        try:
            _client.table("predictions").insert({
                "timestamp": ts,
                "features": json.dumps(features),
                "model_used": result["model_used"],
                "prediction": result["prediction"],
                "confidence": result["confidence"],
            }).execute()
            return
        except Exception as e:
            print(f"Supabase insert error (predictions): {e}")
            # Fall back to SQLite if Supabase fails
            pass

    else:
        conn = _sqlite_conn()
        conn.execute(
            "INSERT INTO predictions (timestamp, features, model_used, prediction, confidence) VALUES (?,?,?,?,?)",
            (ts, json.dumps(features), result["model_used"], result["prediction"], result["confidence"])
        )
        conn.commit()
        conn.close()

def get_prediction_history(limit: int = 50):
    if _use_supabase:
        try:
            res = _client.table("predictions").select("*").order("id", desc=True).limit(limit).execute()
            return res.data or []
        except Exception as e:
            print(f"Supabase select error (predictions): {e}")
            # Fall back to SQLite if Supabase fails
            pass
    conn = _sqlite_conn()
    rows = conn.execute("SELECT * FROM predictions ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def log_dataset(name: str, rows: int):
    ts = datetime.now(timezone.utc).isoformat()
    if _use_supabase:
        try:
            _client.table("datasets").insert({"name": name, "uploaded_at": ts, "rows": rows}).execute()
            return
        except Exception as e:
            print(f"Supabase insert error (datasets): {e}")
            # Fall back to SQLite if Supabase fails
            pass
    else:
        conn = _sqlite_conn()
        conn.execute("INSERT INTO datasets (name, uploaded_at, rows) VALUES (?,?,?)", (name, ts, rows))
        conn.commit()
        conn.close()
