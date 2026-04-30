import numpy as np
from collections import Counter

class KNNClassifier:
    def __init__(self, k=5):
        self.k = k

    def fit(self, X, y):
        self.X_train = X
        self.y_train = y

    def predict(self, X):
        return np.array([self._predict_one(x) for x in X])

    def predict_proba(self, X):
        probs = []
        for x in X:
            dists = np.linalg.norm(self.X_train - x, axis=1)
            k_idx = np.argsort(dists)[:self.k]
            k_labels = self.y_train[k_idx]
            counts = Counter(k_labels)
            total = sum(counts.values())
            probs.append([counts.get(c, 0) / total for c in range(3)])
        return np.array(probs)

    def _predict_one(self, x):
        dists = np.linalg.norm(self.X_train - x, axis=1)
        k_idx = np.argsort(dists)[:self.k]
        return Counter(self.y_train[k_idx]).most_common(1)[0][0]


class NaiveBayesClassifier:
    def fit(self, X, y):
        self.classes = np.unique(y)
        self.priors = {}
        self.means = {}
        self.stds = {}
        for c in self.classes:
            X_c = X[y == c]
            self.priors[c] = len(X_c) / len(y)
            self.means[c] = X_c.mean(axis=0)
            self.stds[c] = X_c.std(axis=0) + 1e-9

    def _gaussian(self, x, mean, std):
        return np.exp(-0.5 * ((x - mean) / std) ** 2) / (std * np.sqrt(2 * np.pi))

    def predict_proba(self, X):
        probs = []
        for x in X:
            row = []
            for c in self.classes:
                log_p = np.log(self.priors[c]) + np.sum(np.log(self._gaussian(x, self.means[c], self.stds[c])))
                row.append(log_p)
            row = np.array(row)
            row = np.exp(row - row.max())
            row /= row.sum()
            probs.append(row)
        return np.array(probs)

    def predict(self, X):
        return np.argmax(self.predict_proba(X), axis=1)


class CandidateElimination:
    """Simplified version: learns most-specific and most-general boundaries."""
    def fit(self, X, y, n_bins=3):
        self.n_features = X.shape[1]
        self.n_bins = n_bins
        self.bins = [np.linspace(X[:, i].min(), X[:, i].max(), n_bins + 1) for i in range(self.n_features)]
        self.rules = {}
        for c in np.unique(y):
            X_c = X[y == c]
            self.rules[c] = {
                "min": X_c.min(axis=0),
                "max": X_c.max(axis=0),
            }

    def predict(self, X):
        preds = []
        for x in X:
            scores = {}
            for c, rule in self.rules.items():
                in_range = np.all((x >= rule["min"]) & (x <= rule["max"]))
                scores[c] = 1 if in_range else 0
            if sum(scores.values()) == 0:
                preds.append(max(self.rules, key=lambda c: np.sum(
                    np.maximum(0, 1 - np.abs(x - (self.rules[c]["min"] + self.rules[c]["max"]) / 2)))))
            else:
                preds.append(max(scores, key=scores.get))
        return np.array(preds)

    def predict_proba(self, X):
        probs = []
        for x in X:
            row = []
            for c in range(3):
                if c in self.rules:
                    rule = self.rules[c]
                    center = (rule["min"] + rule["max"]) / 2
                    span = (rule["max"] - rule["min"]) / 2 + 1e-9
                    score = np.mean(np.maximum(0, 1 - np.abs(x - center) / span))
                    row.append(score)
                else:
                    row.append(0.0)
            total = sum(row) or 1
            probs.append([r / total for r in row])
        return np.array(probs)
