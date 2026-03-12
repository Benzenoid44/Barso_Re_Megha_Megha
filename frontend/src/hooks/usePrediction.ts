import { useState, useCallback } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

export interface PredictionInputs {
  "Daily Rainfall":               number;
  "Rainfall Last 3 Days":         number;
  "Rainfall Intensity":           number;
  "Tide Level":                   number;
  "River Water Level":            number;
  "River Discharge":              number;
  "Elevation":                    number;
  "Slope":                        number;
  "Distance to River":            number;
  "Distance to Coast":            number;
  "Impervious Surface %":         number;
  "Drainage Density":             number;
  "Population Density":           number;
  "Construction Blockage Index":  number;
  "Waste Accumulation Index":     number;
  "Pump Station Status":          number;
  "Region_Dadar":                 number;
  "Region_Ghatkopar":             number;
  "Region_Kurla":                 number;
  "Region_Sion":                  number;
  "Land Use_Mixed":               number;
  "Land Use_Residential":         number;
  "Land Use_Urban":               number;
  "Soil Type_Loam":               number;
  "Soil Type_Sandy":              number;
  "Soil Type_Silty":              number;
}

export interface PredictionResult {
  flood_risk:    boolean;
  probability:   number;   // 0–100 %
  time_seconds:  number;   // seconds until impact
  inputs:        PredictionInputs;
  model_versions: { classifier: string; regressor: string };
}

export interface PredictionState {
  inputs:       PredictionInputs;
  result:       PredictionResult | null;
  loading:      boolean;
  error:        string | null;
  hasRun:       boolean;
}

// ── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_INPUTS: PredictionInputs = {
  "Daily Rainfall":               120,
  "Rainfall Last 3 Days":         250,
  "Rainfall Intensity":           75,
  "Tide Level":                   4.5,
  "River Water Level":            5.2,
  "River Discharge":              1200,
  "Elevation":                    5,
  "Slope":                        2,
  "Distance to River":            500,
  "Distance to Coast":            2000,
  "Impervious Surface %":         85,
  "Drainage Density":             2.5,
  "Population Density":           25000,
  "Construction Blockage Index":  0.3,
  "Waste Accumulation Index":     0.4,
  "Pump Station Status":          1,
  "Region_Dadar":                 0,
  "Region_Ghatkopar":             1,
  "Region_Kurla":                 0,
  "Region_Sion":                  0,
  "Land Use_Mixed":               0,
  "Land Use_Residential":         0,
  "Land Use_Urban":               1,
  "Soil Type_Loam":               0,
  "Soil Type_Sandy":              0,
  "Soil Type_Silty":              1,
};

const API_BASE = "http://localhost:5000";

// ── Hook ────────────────────────────────────────────────────────────────────

export function usePrediction() {
  const [state, setState] = useState<PredictionState>({
    inputs:  DEFAULT_INPUTS,
    result:  null,
    loading: false,
    error:   null,
    hasRun:  false,
  });

  /** Update a single input field */
  const setInput = useCallback(<K extends keyof PredictionInputs>(
    key: K,
    value: PredictionInputs[K]
  ) => {
    setState((prev) => ({
      ...prev,
      inputs: { ...prev.inputs, [key]: value },
    }));
  }, []);

  /** Replace all inputs at once */
  const setAllInputs = useCallback((inputs: Partial<PredictionInputs>) => {
    setState((prev) => ({
      ...prev,
      inputs: { ...prev.inputs, ...inputs },
    }));
  }, []);

  /** Run prediction against the Flask backend */
  const runPrediction = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const resp = await fetch(`${API_BASE}/predict`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(state.inputs),
      });
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody.error ?? `Server error ${resp.status}`);
      }
      const data: PredictionResult = await resp.json();
      setState((prev) => ({
        ...prev,
        result:  data,
        loading: false,
        hasRun:  true,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:   err?.message ?? "Failed to connect to prediction server.",
        hasRun:  true,
      }));
    }
  }, [state.inputs]);

  /** Reset everything back to defaults */
  const reset = useCallback(() => {
    setState({
      inputs:  DEFAULT_INPUTS,
      result:  null,
      loading: false,
      error:   null,
      hasRun:  false,
    });
  }, []);

  return {
    ...state,
    setInput,
    setAllInputs,
    runPrediction,
    reset,
  };
}
