import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split

FEATURE_COLS = ["price", "discount", "rating", "stock", "season", "category"]
TARGET_COL = "demand_level"

SEASON_MAP = {"spring": 0, "summer": 1, "fall": 2, "winter": 3}
CATEGORY_MAP = {"electronics": 0, "clothing": 1, "food": 2, "sports": 3, "home": 4}
DEMAND_MAP = {"low": 0, "medium": 1, "high": 2}
DEMAND_INV = {0: "Low", 1: "Medium", 2: "High"}

def encode_row(row: dict) -> list:
    return [
        float(row["price"]),
        float(row["discount"]),
        float(row["rating"]),
        float(row["stock"]),
        SEASON_MAP.get(str(row["season"]).lower(), 0),
        CATEGORY_MAP.get(str(row["category"]).lower(), 0),
    ]

def preprocess(df: pd.DataFrame):
    df = df.copy()
    df.dropna(inplace=True)
    df.columns = [c.strip().lower() for c in df.columns]

    for col in FEATURE_COLS:
        if col not in df.columns:
            raise ValueError(f"Missing column: {col}")

    df["season"] = df["season"].str.lower().map(SEASON_MAP).fillna(0).astype(int)
    df["category"] = df["category"].str.lower().map(CATEGORY_MAP).fillna(0).astype(int)

    if TARGET_COL in df.columns:
        df[TARGET_COL] = df[TARGET_COL].str.lower().map(DEMAND_MAP).fillna(1).astype(int)

    X = df[FEATURE_COLS].astype(float).values
    y = df[TARGET_COL].values if TARGET_COL in df.columns else None

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return X_scaled, y, scaler

def generate_sample_data(n=300) -> pd.DataFrame:
    np.random.seed(42)
    seasons = list(SEASON_MAP.keys())
    categories = list(CATEGORY_MAP.keys())
    rows = []
    for _ in range(n):
        price = round(np.random.uniform(5, 500), 2)
        discount = round(np.random.uniform(0, 60), 1)
        rating = round(np.random.uniform(1, 5), 1)
        stock = int(np.random.randint(0, 500))
        season = np.random.choice(seasons)
        category = np.random.choice(categories)
        score = (discount * 0.4) + (rating * 10) - (price * 0.05) + (stock * 0.02)
        if score > 18:
            demand = "high"
        elif score > 10:
            demand = "medium"
        else:
            demand = "low"
        rows.append([price, discount, rating, stock, season, category, demand])
    return pd.DataFrame(rows, columns=FEATURE_COLS + [TARGET_COL])
