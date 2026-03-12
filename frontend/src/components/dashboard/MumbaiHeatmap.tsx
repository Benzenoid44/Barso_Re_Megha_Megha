import { useLanguage } from "@/i18n/LanguageContext";
import { MapPin } from "lucide-react";

const zones = [
  { id: "dadar", cx: 95, cy: 140, r: 28, risk: "high" as const },
  { id: "kurla", cx: 155, cy: 120, r: 24, risk: "high" as const },
  { id: "andheri", cx: 80, cy: 70, r: 30, risk: "moderate" as const },
  { id: "bandra", cx: 60, cy: 110, r: 20, risk: "moderate" as const },
  { id: "colaba", cx: 110, cy: 220, r: 18, risk: "low" as const },
];

const riskColors = {
  high: { fill: "hsl(0 72% 51%)", opacity: 0.25, stroke: "hsl(0 72% 51%)" },
  moderate: { fill: "hsl(35 92% 52%)", opacity: 0.2, stroke: "hsl(35 92% 52%)" },
  low: { fill: "hsl(220 70% 50%)", opacity: 0.15, stroke: "hsl(220 70% 50%)" },
};

const MumbaiHeatmap = () => {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-card">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{t("riskHeatmap")}</h3>
      </div>

      <div className="relative bg-secondary rounded-lg overflow-hidden">
        <svg viewBox="0 0 240 280" className="w-full h-auto">
          <path
            d="M40,30 Q30,80 50,130 Q40,160 60,190 Q70,210 90,240 Q100,260 120,270 Q140,265 150,240 Q170,200 180,160 Q190,130 175,90 Q165,60 140,40 Q110,20 80,25 Z"
            fill="none" stroke="hsl(220 14% 85%)" strokeWidth="1.5"
          />
          <path
            d="M40,30 Q30,80 50,130 Q40,160 60,190 Q70,210 90,240 Q100,260 120,270 Q140,265 150,240 Q170,200 180,160 Q190,130 175,90 Q165,60 140,40 Q110,20 80,25 Z"
            fill="hsl(220 14% 96%)"
          />
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 40 + 20} x2="240" y2={i * 40 + 20}
              stroke="hsl(220 14% 90%)" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 40 + 20} y1="0" x2={i * 40 + 20} y2="280"
              stroke="hsl(220 14% 90%)" strokeWidth="0.5" />
          ))}
          {zones.map((zone) => {
            const colors = riskColors[zone.risk];
            return (
              <g key={zone.id}>
                <circle cx={zone.cx} cy={zone.cy} r={zone.r}
                  fill={colors.fill} opacity={colors.opacity}
                  stroke={colors.stroke} strokeWidth="1" strokeOpacity={0.4}
                />
                <circle cx={zone.cx} cy={zone.cy} r={zone.r + 8}
                  fill="none" stroke={colors.stroke} strokeWidth="0.5" strokeOpacity={0.15}
                  strokeDasharray="3 3"
                />
                <circle cx={zone.cx} cy={zone.cy} r="2.5" fill={colors.stroke} />
                <text x={zone.cx} y={zone.cy - zone.r - 6}
                  textAnchor="middle" fill={colors.stroke}
                  fontSize="8" fontFamily="Inter" opacity={0.8}
                >
                  {t(zone.id)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex gap-4 justify-center">
        {([["high", "danger"], ["moderate", "amber"], ["low", "neon"]] as const).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs">
            <div className={`w-2.5 h-2.5 rounded-full bg-${color}`} />
            <span className="text-muted-foreground">{t(key)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MumbaiHeatmap;
