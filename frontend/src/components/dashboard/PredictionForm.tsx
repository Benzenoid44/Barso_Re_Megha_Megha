import { Zap, RotateCcw, Loader2, AlertCircle, CheckCircle2, Droplets, MapPin, Building, Waves, Info } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { PredictionInputs } from "@/hooks/usePrediction";

// ── Feature config for the form ─────────────────────────────────────────────

interface FeatureConf {
  key:     keyof PredictionInputs;
  label:   string;
  unit:    string;
  min:     number;
  max:     number;
  step:    number;
  emoji:   string;
  danger?: number;
  group:   string;
  isBool?: boolean;
}

const FEATURE_CONFIG: FeatureConf[] = [
  // Rainfall
  { key: "Daily Rainfall",             label: "Daily Rainfall",       unit: "mm",      min: 0,    max: 500,  step: 1,   emoji: "🌧️", danger: 150, group: "Rainfall" },
  { key: "Rainfall Last 3 Days",       label: "Last 3 Days",         unit: "mm",      min: 0,    max: 1000, step: 1,   emoji: "⛈️", danger: 300, group: "Rainfall" },
  { key: "Rainfall Intensity",         label: "Intensity",           unit: "mm/hr",   min: 0,    max: 250,  step: 1,   emoji: "🌧️", danger: 50,  group: "Rainfall" },
  
  // Water
  { key: "Tide Level",                 label: "Tide Level",          unit: "m",       min: 0,    max: 6,    step: 0.1, emoji: "🌊", danger: 4.5, group: "Water/Sea" },
  { key: "River Water Level",          label: "River Level",         unit: "m",       min: 0,    max: 10,   step: 0.1, emoji: "📏", danger: 6.0, group: "Water/Sea" },
  { key: "River Discharge",            label: "Discharge",           unit: "m3/s",    min: 0,    max: 5000, step: 10,  emoji: "🚤", danger: 2500,group: "Water/Sea" },
  
  // Geography
  { key: "Elevation",                  label: "Elevation",           unit: "m",       min: -5,   max: 50,   step: 0.5, emoji: "⛰️", danger: 2,   group: "Geography" }, // low is danger
  { key: "Slope",                      label: "Slope",               unit: "deg",     min: 0,    max: 45,   step: 0.5, emoji: "📐", group: "Geography" },
  { key: "Distance to River",          label: "Dist to River",       unit: "m",       min: 0,    max: 10000,step: 50,  emoji: "📍", group: "Geography" },
  { key: "Distance to Coast",          label: "Dist to Coast",       unit: "m",       min: 0,    max: 20000,step: 100, emoji: "🐚", group: "Geography" },
  
  // Urbanization
  { key: "Impervious Surface %",       label: "Impervious %",        unit: "%",       min: 0,    max: 100,  step: 1,   emoji: "🏗️", danger: 80,  group: "Urbanization" },
  { key: "Drainage Density",           label: "Drainage Dens",       unit: "km/km2",  min: 0,    max: 10,   step: 0.1, emoji: "🚰", danger: 1.5, group: "Urbanization" },
  { key: "Population Density",         label: "Pop Density",         unit: "p/km2",   min: 0,    max: 50000,step: 500, emoji: "👥", group: "Urbanization" },
  
  // Infrastructure
  { key: "Construction Blockage Index",label: "Const Blockage",      unit: "idx",     min: 0,    max: 1,    step: 0.01,emoji: "🚧", danger: 0.6, group: "Infrastructure" },
  { key: "Waste Accumulation Index",   label: "Waste Accum",         unit: "idx",     min: 0,    max: 1,    step: 0.01,emoji: "🗑️", danger: 0.7, group: "Infrastructure" },
  { key: "Pump Station Status",        label: "Pump Efficiency",     unit: "%",       min: 0,    max: 100,  step: 1,   emoji: "⚙️", danger: 30,  group: "Infrastructure" }, // low is danger
  
  // Region
  { key: "Region_Dadar",               label: "Dadar",               unit: "bool",    min: 0,    max: 1,    step: 1,   emoji: "📍", isBool: true, group: "Region" },
  { key: "Region_Ghatkopar",           label: "Ghatkopar",           unit: "bool",    min: 0,    max: 1,    step: 1,   emoji: "📍", isBool: true, group: "Region" },
  { key: "Region_Kurla",               label: "Kurla",               unit: "bool",    min: 0,    max: 1,    step: 1,   emoji: "📍", isBool: true, group: "Region" },
  { key: "Region_Sion",                label: "Sion",                unit: "bool",    min: 0,    max: 1,    step: 1,   emoji: "📍", isBool: true, group: "Region" },
  
  // Land Use
  { key: "Land Use_Mixed",             label: "Mixed Use",           unit: "bool",    min: 0,    max: 1,    step: 1,   emoji: "🏠", isBool: true, group: "Land Use" },
  { key: "Land Use_Residential",       label: "Residential",         unit: "bool",    min: 0,    max: 1,    step: 1,   emoji: "🏡", isBool: true, group: "Land Use" },
  { key: "Land Use_Urban",             label: "Urban",               unit: "bool",    min: 0,    max: 1,    step: 1,   emoji: "🏙️", isBool: true, group: "Land Use" },
  
  // Soil
  { key: "Soil Type_Loam",             label: "Loam",                unit: "bool",    min: 0,    max: 1,    step: 1,   emoji: "🌱", isBool: true, group: "Soil" },
  { key: "Soil Type_Sandy",            label: "Sandy",               unit: "bool",    min: 0,    max: 1,    step: 1,   emoji: "🏖️", isBool: true, group: "Soil" },
  { key: "Soil Type_Silty",            label: "Silty",               unit: "bool",    min: 0,    max: 1,    step: 1,   emoji: "🌾", isBool: true, group: "Soil" },
];

const GROUPS = [...new Set(FEATURE_CONFIG.map(f => f.group))];

// ── Helpers ──────────────────────────────────────────────────────────────────

function pct(value: number, min: number, max: number) {
  return Math.round(((value - min) / (max - min)) * 100);
}

interface RowProps {
  conf:     FeatureConf;
  value:    number;
  onChange: (v: number) => void;
}

function SliderRow({ conf, value, onChange }: RowProps) {
  const ratio   = pct(value, conf.min, conf.max);
  // Special cases for danger logic
  let isDanger = false;
  if (conf.key === "Elevation") isDanger = value < 3;
  else if (conf.key === "Pump Station Status") isDanger = value < 30;
  else if (conf.danger) isDanger = value >= conf.danger;

  const color   = isDanger ? "#ff3a3a" : (conf.danger && value >= conf.danger * 0.8) ? "#ffb020" : "#00c8ff";
  const glowColor = isDanger ? "hsl(0 90% 60% / 0.5)" : "hsl(199 100% 55% / 0.4)";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{conf.label}</span>
        </div>
        <span className="text-[10px] font-extrabold tabular-nums" style={{ color }}>
          {value.toFixed(conf.step < 1 ? 1 : 0)} {conf.unit === "status" ? "" : conf.unit}
        </span>
      </div>
      <div className="relative h-4 flex items-center">
        <div className="w-full h-1 rounded-full" style={{ background: "hsl(217 25% 15%)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${ratio}%`, background: color }} />
        </div>
        <input
          type="range" min={conf.min} max={conf.max} step={conf.step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
      </div>
    </div>
  );
}

function ToggleRow({ conf, value, onChange }: RowProps) {
  const active = value === 1;
  return (
    <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-secondary/20 border border-secondary/30">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-xs truncate text-muted-foreground font-medium">{conf.label}</span>
      </div>
      <button
        onClick={() => onChange(active ? 0 : 1)}
        className={`relative w-8 h-4.5 rounded-full transition-all flex items-center shrink-0 ${active ? "bg-primary" : "bg-secondary"}`}
      >
        <span className={`absolute w-3 h-3 bg-white rounded-full transition-all ${active ? "left-[14px]" : "left-[4px]"}`} />
      </button>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

interface PredictionFormProps {
  inputs:        PredictionInputs;
  loading:       boolean;
  error:         string | null;
  hasRun:        boolean;
  floodRisk?:    boolean;
  probability?:  number;
  onInputChange: (key: keyof PredictionInputs, value: number) => void;
  onRunPredict:  () => void;
  onReset:       () => void;
}

const PredictionForm = ({
  inputs,
  loading,
  error,
  hasRun,
  floodRisk,
  probability,
  onInputChange,
  onRunPredict,
  onReset,
}: PredictionFormProps) => {
  return (
    <div className="glass-card p-4 sm:p-6 space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
          <Droplets className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">ML Multi-Feature Input</h3>
          <p className="text-[10px] text-muted-foreground">Adjust 26 parameters · GradientBoosting v1</p>
        </div>
        {hasRun && !loading && (
          <div className={`ml-auto px-2.5 py-1 rounded-lg text-[10px] font-bold border ${floodRisk ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-green-500/10 border-green-500/40 text-green-500"}`}>
            {floodRisk ? `ALERT ${probability}%` : `SAFE ${probability}%`}
          </div>
        )}
      </div>

      {/* Grouped contents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {GROUPS.map(group => {
          const groupFeatures = FEATURE_CONFIG.filter(f => f.group === group);
          const isCategoryWithToggles = groupFeatures.some(f => f.isBool);

          return (
            <div key={group} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{group}</h4>
              </div>
              
              <div className={isCategoryWithToggles ? "grid grid-cols-2 sm:grid-cols-2 gap-2" : "space-y-4"}>
                {groupFeatures.map(f => (
                  f.isBool ? (
                    <ToggleRow key={f.key} conf={f} value={inputs[f.key]} onChange={(v) => onInputChange(f.key, v)} />
                  ) : (
                    <SliderRow key={f.key} conf={f} value={inputs[f.key]} onChange={(v) => onInputChange(f.key, v)} />
                  )
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2 items-start">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={onReset} disabled={loading} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-secondary/50 text-muted-foreground border border-secondary hover:bg-secondary transition-colors disabled:opacity-50">
          <RotateCcw className="h-3.5 w-3.5 inline mr-1.5" /> Reset
        </button>
        <button onClick={onRunPredict} disabled={loading} className="flex-[2] py-2.5 rounded-xl text-xs font-bold bg-primary text-black hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(0,200,255,0.2)]">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Zap className="h-3.5 w-3.5" /> Run ML Analysis</>}
        </button>
      </div>
    </div>
  );
};

export default PredictionForm;
