import { useLanguage } from "@/i18n/LanguageContext";
import { AlertTriangle, ShieldCheck, Droplets } from "lucide-react";

interface FloodRiskCardProps {
  isFloodRisk: boolean;
  loading?:    boolean;
}

const FloodRiskCard = ({ isFloodRisk, loading = false }: FloodRiskCardProps) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="glass-card relative overflow-hidden rounded-2xl p-6 flex flex-col items-center gap-4 animate-pulse">
        <div className="h-3 w-20 rounded bg-secondary" />
        <div className="h-16 w-16 rounded-full bg-secondary" />
        <div className="h-8 w-12 rounded bg-secondary" />
        <div className="h-5 w-24 rounded bg-secondary" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 flex flex-col items-center gap-4 transition-all duration-500 ${isFloodRisk ? "glass-card-danger animate-glow-pulse" : "glass-card"}`}>
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(hsl(199 100% 55% / 1) 1px, transparent 1px), linear-gradient(90deg, hsl(199 100% 55% / 1) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Corner accent */}
      <div className="absolute top-0 left-0 w-16 h-16 opacity-30"
        style={{
          background: isFloodRisk
            ? "conic-gradient(from 180deg at 0% 0%, hsl(0 90% 60%), transparent 40%)"
            : "conic-gradient(from 180deg at 0% 0%, hsl(199 100% 55%), transparent 40%)",
        }}
      />

      <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {t("floodRisk")}
      </p>

      {/* Icon ring */}
      <div className="relative">
        <div
          className={`absolute inset-0 rounded-full animate-pulse-ring ${isFloodRisk ? "bg-destructive/20" : "bg-primary/10"}`}
          style={{ margin: "-8px" }}
        />
        <div className={`relative rounded-full p-4 ${isFloodRisk ? "bg-destructive/10 border border-destructive/30" : "bg-primary/10 border border-primary/20"}`}>
          {isFloodRisk ? (
            <AlertTriangle className="h-8 w-8 text-destructive" />
          ) : (
            <ShieldCheck className="h-8 w-8 text-primary" />
          )}
        </div>
      </div>

      <span className={`text-5xl font-extrabold tracking-tight animate-count-up ${isFloodRisk ? "neon-text-danger" : "neon-text"}`}>
        {isFloodRisk ? t("yes") : t("no")}
      </span>

      <div className={`stat-chip ${isFloodRisk ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-success/10 text-success border border-success/20"}`}>
        {isFloodRisk ? "⚠ Critical Alert" : "✓ Safe Zone"}
      </div>
    </div>
  );
};

export default FloodRiskCard;
