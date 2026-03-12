import { useLanguage, type Language } from "@/i18n/LanguageContext";
import { Globe } from "lucide-react";

const langs: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
  { code: "mr", label: "मर" },
];

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      <Globe className="h-4 w-4 text-muted-foreground" />
      {langs.map(({ code, label }) => (
        <button key={code} onClick={() => setLanguage(code)}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
            language === code
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
