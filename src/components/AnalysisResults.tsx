import { Shield, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisResult {
  whatIsHappening: string;
  whyItMatters: string;
  riskLevel: "Low" | "Medium" | "High";
  actionToTake: string;
}

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const RiskBadge = ({ level }: { level: "Low" | "Medium" | "High" }) => {
  const config = {
    Low: {
      className: "bg-success/10 text-success border-success/20",
      icon: CheckCircle,
    },
    Medium: {
      className: "bg-warning/10 text-warning border-warning/20",
      icon: AlertTriangle,
    },
    High: {
      className: "bg-destructive/10 text-destructive border-destructive/20",
      icon: AlertTriangle,
    },
  };

  const { className, icon: Icon } = config[level];

  return (
    <span className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border", className)}>
      <Icon className="w-4 h-4" />
      {level} Risk
    </span>
  );
};

const InsightCard = ({
  icon: Icon,
  title,
  content,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  content: string;
  delay: string;
}) => (
  <div 
    className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border animate-slide-up"
    style={{ animationDelay: delay }}
  >
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-lg bg-secondary">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{content}</p>
      </div>
    </div>
  </div>
);

export const AnalysisResults = ({ result }: AnalysisResultsProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Analysis Complete</h2>
        <RiskBadge level={result.riskLevel} />
      </div>

      <div className="grid gap-4">
        <InsightCard
          icon={Shield}
          title="What's Happening"
          content={result.whatIsHappening}
          delay="0ms"
        />
        <InsightCard
          icon={AlertTriangle}
          title="Why It Matters to Your Business"
          content={result.whyItMatters}
          delay="100ms"
        />
        <InsightCard
          icon={Lightbulb}
          title="Recommended Action"
          content={result.actionToTake}
          delay="200ms"
        />
      </div>
    </div>
  );
};
