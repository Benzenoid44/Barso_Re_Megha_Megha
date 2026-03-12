import { useLanguage } from "@/i18n/LanguageContext";
import { Settings, Zap, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const HyperparamPanel = () => {
  const { t } = useLanguage();
  const [lr, setLr]             = useState(0.001);
  const [batchSize, setBatchSize] = useState(32);
  const [dropout, setDropout]   = useState(0.3);
  const [optimizer, setOptimizer] = useState("adam");

  const handleApply = () => {
    toast.success("Hyperparameters updated", {
      description: `LR: ${lr} | Batch: ${batchSize} | Dropout: ${dropout} | Opt: ${optimizer}`,
    });
  };

  const handleReset = () => {
    setLr(0.001); setBatchSize(32); setDropout(0.3); setOptimizer("adam");
  };

  const params = [
    { label: t("learningRate"), value: lr.toFixed(4), display: lr.toFixed(4), sliderVal: [lr * 10000], min: 1, max: 100, step: 1, onChange: ([v]: number[]) => setLr(v / 10000) },
    { label: t("batchSize"),    value: batchSize,     display: String(batchSize), sliderVal: [batchSize], min: 8, max: 128, step: 8, onChange: ([v]: number[]) => setBatchSize(v) },
    { label: t("dropout"),      value: dropout,       display: dropout.toFixed(2), sliderVal: [dropout * 100], min: 0, max: 80, step: 5, onChange: ([v]: number[]) => setDropout(v / 100) },
  ];

  return (
    <div className="glass-card p-5 sm:p-6 space-y-5 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.05] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(38 100% 55%), transparent)", transform: "translate(30%, 30%)" }}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
          <Settings className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">{t("hyperparamTuning")}</h3>
          <p className="text-[10px] text-muted-foreground">Live model tuning</p>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        {params.map(({ label, display, sliderVal, min, max, step, onChange }) => (
          <div key={label} className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground">{label}</span>
              <span className="text-xs font-extrabold text-accent tabular-nums"
                style={{ textShadow: "0 0 12px hsl(38 100% 55% / 0.5)" }}>
                {display}
              </span>
            </div>
            <Slider value={sliderVal} min={min} max={max} step={step} onValueChange={onChange} />
          </div>
        ))}

        {/* Optimizer buttons */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-muted-foreground">{t("optimizer")}</p>
          <div className="flex gap-2">
            {["adam", "sgd", "rmsprop"].map((opt) => (
              <button key={opt} onClick={() => setOptimizer(opt)}
                className="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wide capitalize border transition-all duration-200"
                style={optimizer === opt ? {
                  background: "hsl(38 100% 55% / 0.15)",
                  borderColor: "hsl(38 100% 55% / 0.5)",
                  color: "hsl(38 100% 55%)",
                  boxShadow: "0 0 12px hsl(38 100% 55% / 0.2)",
                } : {
                  background: "transparent",
                  borderColor: "hsl(217 25% 22%)",
                  color: "hsl(215 20% 50%)",
                }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button onClick={handleReset}
          className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200"
          style={{ borderColor: "hsl(217 25% 22%)", color: "hsl(215 20% 55%)" }}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        <button onClick={handleApply}
          className="flex items-center justify-center gap-2 flex-[2] py-2.5 rounded-xl text-xs font-bold btn-primary">
          <Zap className="h-3.5 w-3.5" />
          {t("applyChanges")}
        </button>
      </div>
    </div>
  );
};

export default HyperparamPanel;
