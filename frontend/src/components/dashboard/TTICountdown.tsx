import { useLanguage } from "@/i18n/LanguageContext";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface TTICountdownProps {
  totalSeconds: number;
}

const TTICountdown = ({ totalSeconds }: TTICountdownProps) => {
  const { t } = useLanguage();
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => { setRemaining(totalSeconds); }, [totalSeconds]);
  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  const hrs  = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;

  const urgencyClass = remaining < 1800 ? "neon-text-danger" : remaining < 3600 ? "neon-text-amber" : "neon-text";
  const urgencyBg    = remaining < 1800 ? "hsl(0 90% 60% / 0.1)" : remaining < 3600 ? "hsl(38 100% 55% / 0.1)" : "hsl(199 100% 55% / 0.08)";
  const urgencyBorder= remaining < 1800 ? "hsl(0 90% 60% / 0.25)" : remaining < 3600 ? "hsl(38 100% 55% / 0.25)" : "hsl(199 100% 55% / 0.2)";

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "linear-gradient(hsl(199 100% 55%) 1px, transparent 1px), linear-gradient(90deg, hsl(199 100% 55%) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <Clock className="h-3.5 w-3.5 text-primary" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {t("timeToImpact")}
        </p>
      </div>

      <p className="relative text-xs text-muted-foreground">{t("estimatedImpact")}</p>

      {/* Countdown tiles */}
      <div className="relative flex gap-3 items-center">
        {[
          { val: hrs,  label: t("hours")   },
          { val: mins, label: t("minutes") },
          { val: secs, label: t("seconds") },
        ].map(({ val, label }, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="rounded-xl px-3 py-2 min-w-[52px] text-center"
                style={{ background: urgencyBg, border: `1px solid ${urgencyBorder}` }}>
                <span className={`text-3xl font-extrabold tabular-nums ${urgencyClass}`}>
                  {String(val).padStart(2, "0")}
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1.5 font-semibold">
                {label}
              </span>
            </div>
            {i < 2 && (
              <span className={`text-2xl font-bold mb-5 opacity-60 ${urgencyClass}`}>:</span>
            )}
          </div>
        ))}
      </div>

      {/* Urgency badge */}
      <div className="relative stat-chip"
        style={{ background: urgencyBg, border: `1px solid ${urgencyBorder}`, color: remaining < 1800 ? "#ff3a3a" : remaining < 3600 ? "#ffb020" : "#00c8ff" }}>
        {remaining < 1800 ? "🔴 CRITICAL" : remaining < 3600 ? "🟡 WARNING" : "🟢 MONITORING"}
      </div>
    </div>
  );
};

export default TTICountdown;
