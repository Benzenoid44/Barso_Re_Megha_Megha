"""
NEURO-FLOOD Backend API
Flask server that serves predictions from two sklearn RandomForest models:
  - urban_flood_classifier.pkl  → flood_risk (0 or 1), probability (0-100%)
  - urban_time_regressor.pkl    → time_seconds (seconds until flood impact)

Input features (all required):
  Rainfall   – Rainfall intensity in mm/hr     (e.g. 0–200)
  Tide       – Tide level in meters            (e.g. 0–6)
  Drainage   – Drainage load %                 (e.g. 0–100)
  Level      – Water level in meters           (e.g. 0–5)
  Water      – Water saturation %              (e.g. 0–100)
  Pump       – Pump operational capacity %     (e.g. 0–100)
  Use_Urban  – Area is urban? (1 = yes, 0 = no)
"""

import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# ── Load models ────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

classifier_path = os.path.join(BASE_DIR, "urban_flood_classifier.pkl")
regressor_path = os.path.join(BASE_DIR, "urban_time_regressor.pkl")

# Use joblib instead of pickle as the binary headers indicate joblib serialization
classifier = joblib.load(classifier_path)
regressor = joblib.load(regressor_path)

print("Models loaded successfully.")

# ── Flask app ──────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for local dev

# Expected feature order (MUST match the 26 features from training)
FEATURES = [
    "Daily Rainfall", "Rainfall Last 3 Days", "Rainfall Intensity", 
    "Tide Level", "River Water Level", "River Discharge", 
    "Elevation", "Slope", "Distance to River", "Distance to Coast", 
    "Impervious Surface %", "Drainage Density", "Population Density", 
    "Construction Blockage Index", "Waste Accumulation Index", "Pump Station Status", 
    "Region_Dadar", "Region_Ghatkopar", "Region_Kurla", "Region_Sion", 
    "Land Use_Mixed", "Land Use_Residential", "Land Use_Urban", 
    "Soil Type_Loam", "Soil Type_Sandy", "Soil Type_Silty"
]

# Feature metadata for the frontend form
FEATURE_META = {
    "Daily Rainfall":             {"min": 0,    "max": 500,  "default": 120, "unit": "mm",      "label": "Daily Rainfall", "group": "Rainfall"},
    "Rainfall Last 3 Days":       {"min": 0,    "max": 1000, "default": 250, "unit": "mm",      "label": "Last 3 Days", "group": "Rainfall"},
    "Rainfall Intensity":         {"min": 0,    "max": 250,  "default": 75,  "unit": "mm/hr",   "label": "Intensity", "group": "Rainfall"},
    "Tide Level":                 {"min": 0,    "max": 6,    "default": 4.5, "unit": "m",       "label": "Tide Level", "group": "Water/Sea"},
    "River Water Level":          {"min": 0,    "max": 10,   "default": 5.2, "unit": "m",       "label": "River Level", "group": "Water/Sea"},
    "River Discharge":            {"min": 0,    "max": 5000, "default": 1200,"unit": "m3/s",    "label": "Discharge", "group": "Water/Sea"},
    "Elevation":                  {"min": -5,   "max": 50,   "default": 5,   "unit": "m",       "label": "Elevation", "group": "Geography"},
    "Slope":                      {"min": 0,    "max": 45,   "default": 2,   "unit": "deg",     "label": "Slope", "group": "Geography"},
    "Distance to River":          {"min": 0,    "max": 10000,"default": 500, "unit": "m",       "label": "Dist to River", "group": "Geography"},
    "Distance to Coast":          {"min": 0,    "max": 20000,"default": 2000,"unit": "m",       "label": "Dist to Coast", "group": "Geography"},
    "Impervious Surface %":       {"min": 0,    "max": 100,  "default": 85,  "unit": "%",       "label": "Impervious %", "group": "Urbanization"},
    "Drainage Density":           {"min": 0,    "max": 10,   "default": 2.5, "unit": "km/km2",  "label": "Drainage Dens", "group": "Urbanization"},
    "Population Density":         {"min": 0,    "max": 50000,"default": 25000,"unit": "p/km2",  "label": "Pop Density", "group": "Urbanization"},
    "Construction Blockage Index":{"min": 0,    "max": 1,    "default": 0.3, "unit": "index",   "label": "Const Blockage", "group": "Infrastructure"},
    "Waste Accumulation Index":   {"min": 0,    "max": 1,    "default": 0.4, "unit": "index",   "label": "Waste Accum", "group": "Infrastructure"},
    "Pump Station Status":        {"min": 0,    "max": 1,    "default": 1,   "unit": "status",  "label": "Pump Status (0-1)", "group": "Infrastructure"},
    "Region_Dadar":               {"min": 0,    "max": 1,    "default": 0,   "unit": "bool",    "label": "Dadar", "group": "Region"},
    "Region_Ghatkopar":           {"min": 0,    "max": 1,    "default": 1,   "unit": "bool",    "label": "Ghatkopar", "group": "Region"},
    "Region_Kurla":               {"min": 0,    "max": 1,    "default": 0,   "unit": "bool",    "label": "Kurla", "group": "Region"},
    "Region_Sion":                {"min": 0,    "max": 1,    "default": 0,   "unit": "bool",    "label": "Sion", "group": "Region"},
    "Land Use_Mixed":             {"min": 0,    "max": 1,    "default": 0,   "unit": "bool",    "label": "Mixed Use", "group": "Land Use"},
    "Land Use_Residential":       {"min": 0,    "max": 1,    "default": 0,   "unit": "bool",    "label": "Residential", "group": "Land Use"},
    "Land Use_Urban":             {"min": 0,    "max": 1,    "default": 1,   "unit": "bool",    "label": "Urban", "group": "Land Use"},
    "Soil Type_Loam":             {"min": 0,    "max": 1,    "default": 0,   "unit": "bool",    "label": "Loam", "group": "Soil"},
    "Soil Type_Sandy":            {"min": 0,    "max": 1,    "default": 0,   "unit": "bool",    "label": "Sandy", "group": "Soil"},
    "Soil Type_Silty":            {"min": 0,    "max": 1,    "default": 1,   "unit": "bool",    "label": "Silty", "group": "Soil"},
}

def extract_features(data: dict):
    values = []
    missing = []
    for feat in FEATURES:
        # Check for both the feature name and the camelCase version sometimes sent by frontend
        val = data.get(feat)
        if val is None:
            # Fallback for old frontend versions or matching errors
            missing.append(feat)
        else:
            values.append(float(val))
    
    if missing:
        raise ValueError(f"Missing required features: {missing}")
    return np.array(values).reshape(1, -1)

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "models_loaded": True})

@app.route("/meta", methods=["GET"])
def meta():
    return jsonify({"features": FEATURE_META, "feature_order": FEATURES})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        body = request.get_json(force=True, silent=True)
        if body is None:
            return jsonify({"error": "Request body must be valid JSON"}), 400

        X = extract_features(body)

        # Classifier
        flood_class = int(classifier.predict(X)[0])
        flood_risk = bool(flood_class == 1)

        # Probability
        if hasattr(classifier, "predict_proba"):
            proba_arr = classifier.predict_proba(X)[0]
            classes = list(classifier.classes_)
            # If 1 is in classes, get its probability
            probability = float(proba_arr[classes.index(1)]) * 100 if 1 in classes else 0.0
        else:
            probability = 100.0 if flood_risk else 0.0

        # Regressor
        raw_time = float(regressor.predict(X)[0])
        time_seconds = max(0.0, min(raw_time, 86400.0))

        return jsonify({
            "flood_risk":    flood_risk,
            "probability":   round(probability, 2),
            "time_seconds":  round(time_seconds, 1),
            "inputs":        {k: float(body[k]) for k in FEATURES},
            "model_versions": {
                "classifier": "urban_flood_classifier_v1",
                "regressor":  "urban_time_regressor_v1",
            },
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("NEURO-FLOOD API starting on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
