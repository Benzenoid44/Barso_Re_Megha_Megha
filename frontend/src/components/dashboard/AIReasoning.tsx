import { useLanguage } from "@/i18n/LanguageContext";
import { Brain, ArrowRight, AlertTriangle, TrendingUp } from "lucide-react";

interface AIReasoningProps {
  rainfall?:    number;  // mm/hr
  tide?:        number;  // meters
  drainage?:    number;  // %
  confidence?:  number;  // 0–100
  hasLiveData?: boolean;
}

const AIReasoning = ({
  rainfall   = 72,
  tide       = 4.8,
  drainage   = 94,
  confidence = 94.2,
  hasLiveData = false,
}: AIReasoningProps) => {
  const { t } = useLanguage();

  // Dynamic thresholds
  const rules = [
    { param: t("rainfall"),     value: `${rainfall.toFixed(0)}mm`,      threshold: "50mm",  pct: rainfall / 250,  status: rainfall  >= 50  ? "exceeded" : "ok" },
    { param: t("tideLevel"),    value: `${tide.toFixed(1)}m`,           threshold: "4.5m",  pct: tide / 6,        status: tide      >= 4.5 ? "exceeded" : "ok" },
    { param: t("drainageLoad"), value: `${drainage.toFixed(0)}%`,       threshold: "80%",   pct: drainage / 100,  status: drainage  >= 80  ? "exceeded" : "ok" },
  ];

  const dangerCount = rules.filter((r) => r.status === "exceeded").length;

  return (
    <div className="glass-card p-5 sm:p-6 space-y-5 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-40 h-40 opacity-5 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(199 100% 55%), transparent)", transform: "translate(30%, -30%)" }}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
          <Brain className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">AI Prediction Insights</h3>
          <p className="text-[10px] text-muted-foreground">
            {hasLiveData ? "Multi-feature GradientBoosting Analysis" : "Historical Baseline Model"}
          </p>
        </div>
        <div className={`ml-auto stat-chip ${dangerCount > 0 ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-success/10 text-success border border-success/20"}`}>
          {dangerCount > 0 ? "ALERT" : "SAFE"}
        </div>
      </div>

      {/* Rule path */}
      <div className="rounded-xl p-4 space-y-3"
        style={{ background: "hsl(222 40% 6%)", border: "1px solid hsl(217 25% 18%)" }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {t("symbolicRulePath")}
        </p>
        <div className="space-y-2">
          <p className="text-primary text-xs font-semibold" style={{ textShadow: "0 0 16px hsl(199 100% 55% / 0.4)" }}>
            {t("ruleCondition")}
          </p>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3.5 w-3.5 text-accent flex-shrink-0" />
            <p className="text-accent text-xs font-bold">{t("ruleResult")}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 pt-2"
          style={{ borderTop: "1px solid hsl(217 25% 18%)" }}>
          <AlertTriangle className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-muted-foreground text-xs leading-relaxed">{t("ruleReason")}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        {rules.map((rule) => {
          const isExceeded = rule.status === "exceeded";
          return (
            <div key={rule.param} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{rule.param}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{rule.value}</span>
                  <span className="text-[10px] text-muted-foreground">/ {rule.threshold}</span>
                  <span className={`stat-chip text-[9px] ${isExceeded ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-success/10 text-success border border-success/20"}`}>
                    {rule.status}
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden bg-secondary">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, rule.pct * 100)}%`,
                    background: isExceeded
                      ? "linear-gradient(90deg, hsl(0 90% 60%), hsl(38 100% 55%))"
                      : "linear-gradient(90deg, hsl(199 100% 55%), hsl(152 80% 45%))",
                    boxShadow: isExceeded ? "0 0 8px hsl(0 90% 60% / 0.5)" : "0 0 8px hsl(199 100% 55% / 0.3)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1"
        style={{ borderTop: "1px solid hsl(217 25% 18%)" }}>
        <TrendingUp className="h-3.5 w-3.5 text-primary" />
        <span>Model confidence:</span>
        <span className="font-bold text-primary">{confidence.toFixed(1)}%</span>
        {hasLiveData && (
          <span className="ml-auto flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] text-success font-semibold">LIVE</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default AIReasoning;

