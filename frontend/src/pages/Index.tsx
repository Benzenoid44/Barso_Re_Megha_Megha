import { useLanguage } from "@/i18n/LanguageContext";
import { Droplets, Wifi, Bell, ChevronRight } from "lucide-react";
import FloodRiskCard from "@/components/dashboard/FloodRiskCard";
import ProbabilityGauge from "@/components/dashboard/ProbabilityGauge";
import TTICountdown from "@/components/dashboard/TTICountdown";
import AIReasoning from "@/components/dashboard/AIReasoning";
import FloodRiskGoogleMap from "@/components/dashboard/FloodRiskGoogleMap";
import ModelHealth from "@/components/dashboard/ModelHealth";
import HyperparamPanel from "@/components/dashboard/HyperparamPanel";
import LanguageSwitcher from "@/components/dashboard/LanguageSwitcher";
import PredictionForm from "@/components/dashboard/PredictionForm";
import { usePrediction } from "@/hooks/usePrediction";

// Live alert ticker items
const TICKER_ALERTS = [
  "🔴 CRITICAL: Kurla waterlogging detected — drainage capacity exceeded",
  "🟡 WARNING: Tide surge +1.2m above baseline — Bandra coastal zone",
  "🟠 ALERT: Ghatkopar east rainfall 72mm/hr — threshold 50mm",
  "📡 MODEL UPDATE: New satellite imagery ingested — confidence 94.2%",
  "🔴 CRITICAL: Sion underpass submerged — road closures imminent",
  "🟢 INFO: Colaba tide receding — 0.4m drop in last 30 minutes",
];

const Index = () => {
  const { t } = useLanguage();

  // ── ML Prediction state ──────────────────────────────────────────────────
  const {
    inputs, result, loading, error, hasRun,
    setInput, runPrediction, reset,
  } = usePrediction();

  // Derive display values: use ML result when available, else defaults
  const displayFloodRisk   = result ? result.flood_risk   : true;
  const displayProbability = result ? result.probability  : 94;
  const displayTimeSeconds = result ? result.time_seconds : 4320;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Full-page subtle scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(199 100% 55%) 2px, hsl(199 100% 55%) 3px)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="relative z-10 sticky top-0"
        style={{
          background: "hsl(222 47% 4% / 0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid hsl(217 25% 16%)",
          boxShadow: "0 1px 0 hsl(199 100% 55% / 0.06), 0 4px 20px hsl(0 0% 0% / 0.4)",
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl animate-pulse-ring"
                style={{ background: "hsl(199 100% 55% / 0.2)", margin: "-2px" }} />
              <div className="relative h-9 w-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(199 100% 30% / 0.6), hsl(220 100% 40% / 0.4))",
                  border: "1px solid hsl(199 100% 55% / 0.4)",
                  boxShadow: "0 0 16px hsl(199 100% 55% / 0.3)",
                }}>
                <Droplets className="h-5 w-5 text-primary" style={{ filter: "drop-shadow(0 0 6px hsl(199 100% 55% / 0.8))" }} />
              </div>
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight"
                style={{
                  background: "linear-gradient(90deg, hsl(199 100% 70%), hsl(220 100% 75%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                NEURO-FLOOD
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest hidden sm:block">
                PREDICTIVE ANALYTICS COMMAND CENTER
              </p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* System status */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: "hsl(152 80% 45% / 0.08)", border: "1px solid hsl(152 80% 45% / 0.2)" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold text-success tracking-wider">SYSTEM ONLINE</span>
            </div>
            {/* Bell */}
            <button className="relative p-2 rounded-lg transition-all"
              style={{ background: "hsl(217 25% 14%)", border: "1px solid hsl(217 25% 22%)" }}>
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-destructive"
                style={{ boxShadow: "0 0 6px hsl(0 90% 60%)" }} />
            </button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* ── Alert ticker ───────────────────────────────────────────────────── */}
      <div className="relative z-10 overflow-hidden"
        style={{
          background: "hsl(222 47% 4% / 0.9)",
          borderBottom: "1px solid hsl(217 25% 14%)",
          height: 32,
        }}>
        <div className="flex items-center h-full">
          <div className="flex-shrink-0 px-3 flex items-center gap-1.5 h-full"
            style={{ background: "hsl(0 90% 60% / 0.15)", borderRight: "1px solid hsl(0 90% 60% / 0.3)" }}>
            <Wifi className="h-3 w-3 text-destructive" />
            <span className="text-[10px] font-extrabold text-destructive tracking-widest">LIVE</span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex gap-16 whitespace-nowrap animate-ticker" style={{ width: "max-content" }}>
              {[...TICKER_ALERTS, ...TICKER_ALERTS].map((alert, i) => (
                <span key={i} className="text-[11px] text-muted-foreground font-medium px-6">
                  {alert}
                  <ChevronRight className="inline h-3 w-3 ml-4 opacity-30" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">

        {/* PREDICTION INPUT PANEL ── full-width new row */}
        <PredictionForm
          inputs={inputs}
          loading={loading}
          error={error}
          hasRun={hasRun}
          floodRisk={result?.flood_risk}
          probability={result?.probability}
          onInputChange={setInput}
          onRunPredict={runPrediction}
          onReset={reset}
        />

        {/* TOP ROW: 3 stat cards — driven by ML result */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FloodRiskCard isFloodRisk={displayFloodRisk} loading={loading} />
          <ProbabilityGauge score={displayProbability} loading={loading} />
          <TTICountdown totalSeconds={displayTimeSeconds} />
        </div>

        {/* MIDDLE ROW: AI Reasoning + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AIReasoning
            rainfall={inputs["Rainfall Intensity"]}
            tide={inputs["Tide Level"]}
            drainage={inputs["Drainage Density"]}
            confidence={result?.probability ?? 94.2}
            hasLiveData={hasRun && !error}
          />
          <FloodRiskGoogleMap />
        </div>

        {/* BOTTOM ROW: Model Health + Hyperparams */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ModelHealth />
          </div>
          <HyperparamPanel />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 pb-4">
          <p className="text-[10px] text-muted-foreground">
            © 2026 NeuroFlood AI · Mumbai Flood Prediction System
          </p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span>
              {result
                ? `Live prediction · ${new Date().toLocaleTimeString()}`
                : "Model v1 · Awaiting prediction"}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
