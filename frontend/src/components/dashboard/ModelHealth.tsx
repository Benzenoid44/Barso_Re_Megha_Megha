import { useLanguage } from "@/i18n/LanguageContext";
import { Activity, Cpu, Zap } from "lucide-react";
import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";

const accuracyData = Array.from({ length: 20 }, (_, i) => ({
  epoch: i + 1,
  accuracy: Math.min(98, 60 + i * 2 + Math.random() * 3),
  loss: Math.max(0.02, 0.8 - i * 0.038 + Math.random() * 0.02),
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "hsl(222 40% 8%)",
      border: "1px solid hsl(217 25% 22%)",
      borderRadius: 10,
      padding: "8px 12px",
      fontSize: 12,
      boxShadow: "0 8px 24px hsl(0 0% 0% / 0.5)",
    }}>
      <p style={{ color: "hsl(215 20% 50%)", marginBottom: 4 }}>Epoch {label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(p.name === 'loss' ? 3 : 1) : p.value}
          {p.name === 'accuracy' ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

const ModelHealth = () => {
  const { t } = useLanguage();
  const lastAccuracy = accuracyData[accuracyData.length - 1].accuracy;
  const lastLoss     = accuracyData[accuracyData.length - 1].loss;

  return (
    <div className="glass-card p-5 sm:p-6 space-y-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.04] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(199 100% 55%), transparent)", transform: "translate(20%, -20%)" }}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
          <Activity className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">{t("modelHealth")}</h3>
          <p className="text-[10px] text-muted-foreground">RandomForest Ensemble · v1</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-semibold text-success">RUNNING</span>
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Cpu className="h-3.5 w-3.5" />, label: "Accuracy", value: `${lastAccuracy.toFixed(1)}%`, color: "hsl(199 100% 55%)" },
          { icon: <Zap className="h-3.5 w-3.5" />, label: "Loss",     value: lastLoss.toFixed(3),            color: "hsl(38 100% 55%)" },
          { icon: <Activity className="h-3.5 w-3.5" />, label: "Epoch",  value: "20/50",                    color: "hsl(152 80% 45%)" },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="rounded-xl p-3 text-center space-y-1"
            style={{ background: "hsl(222 40% 6%)", border: "1px solid hsl(217 25% 18%)" }}>
            <div className="flex justify-center" style={{ color }}>{icon}</div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
            <p className="text-sm font-extrabold" style={{ color, textShadow: `0 0 12px ${color}66` }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("modelAccuracy")}</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyData}>
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(199 100% 55%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(199 100% 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 25% 16%)" />
                <XAxis dataKey="epoch" tick={{ fontSize: 9, fill: "hsl(215 20% 45%)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 9, fill: "hsl(215 20% 45%)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="accuracy" name="accuracy"
                  stroke="hsl(199 100% 55%)" strokeWidth={2} fill="url(#accGrad)" dot={false}
                  style={{ filter: "drop-shadow(0 0 4px hsl(199 100% 55% / 0.6))" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("lossCurve")}</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyData}>
                <defs>
                  <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(38 100% 55%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(38 100% 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 25% 16%)" />
                <XAxis dataKey="epoch" tick={{ fontSize: 9, fill: "hsl(215 20% 45%)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 9, fill: "hsl(215 20% 45%)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="loss" name="loss"
                  stroke="hsl(38 100% 55%)" strokeWidth={2} fill="url(#lossGrad)" dot={false}
                  style={{ filter: "drop-shadow(0 0 4px hsl(38 100% 55% / 0.6))" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{t("epochsCompleted")}: <span className="text-primary font-bold">20 / 50</span></span>
          <span className="text-primary font-bold">40%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full w-[40%] rounded-full transition-all duration-700"
            style={{
              background: "linear-gradient(90deg, hsl(199 100% 55%), hsl(220 100% 65%))",
              boxShadow: "0 0 10px hsl(199 100% 55% / 0.5)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ModelHealth;
