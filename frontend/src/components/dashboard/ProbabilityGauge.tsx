import { useLanguage } from "@/i18n/LanguageContext";

interface ProbabilityGaugeProps {
  score:    number;
  loading?: boolean;
}

const ProbabilityGauge = ({ score, loading = false }: ProbabilityGaugeProps) => {
  const { t } = useLanguage();
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  const color       = score > 80 ? "#ff3a3a" : score > 50 ? "#ffb020" : "#00c8ff";
  const glowColor   = score > 80 ? "hsl(0 90% 60% / 0.5)"    : score > 50 ? "hsl(38 100% 55% / 0.5)"  : "hsl(199 100% 55% / 0.5)";
  const trackColor  = score > 80 ? "hsl(0 90% 60% / 0.08)"   : score > 50 ? "hsl(38 100% 55% / 0.08)" : "hsl(199 100% 55% / 0.08)";
  const labelColor  = score > 80 ? "neon-text-danger"         : score > 50 ? "neon-text-amber"          : "neon-text";

  if (loading) {
    return (
      <div className="glass-card p-6 flex flex-col items-center gap-4 relative overflow-hidden animate-pulse">
        <div className="h-3 w-24 rounded bg-secondary" />
        <div className="h-40 w-40 rounded-full bg-secondary" />
        <div className="w-full h-3 rounded bg-secondary" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(199 100% 55%) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {t("predictionScore")}
      </p>

      <div className="relative animate-float">
        {/* Outer decorative ring */}
        <svg width="160" height="160" viewBox="0 0 160 160" className="absolute -inset-[10px]"
          style={{ width: 180, height: 180, top: -10, left: -10 }}>
          <circle cx="90" cy="90" r="82" fill="none"
            stroke="hsl(217 25% 18%)" strokeWidth="1" strokeDasharray="4 8" />
        </svg>

        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* Track */}
          <circle cx="80" cy="80" r={r} fill="none"
            stroke={trackColor} strokeWidth="12" />
          {/* Progress arc */}
          <circle cx="80" cy="80" r={r} fill="none"
            stroke={color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 80 80)"
            style={{
              filter: `drop-shadow(0 0 8px ${glowColor})`,
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
          {/* Inner glow dot at arc tip */}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold tabular-nums ${labelColor}`}>{score}%</span>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">
            {t("accuracy")}
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="w-full space-y-1.5">
        <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          <span>Confidence</span><span>{score}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${score}%`,
              background: `linear-gradient(90deg, ${color}, ${color}88)`,
              boxShadow: `0 0 8px ${glowColor}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProbabilityGauge;
