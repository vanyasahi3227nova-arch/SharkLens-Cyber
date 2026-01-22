import { Shield, AlertTriangle, CheckCircle, Lightbulb, Gauge, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThreatHeatMap, ThreatData } from "./ThreatHeatMap";

interface AnalysisResult {
  whatIsHappening: string;
  whyItMatters: string;
  riskLevel: number;
  riskDescription: string;
  actionToTake: string;
  cybersecurityNews: string;
  threatMap: ThreatData[];
}

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const getRiskConfig = (level: number) => {
  const configs = {
    1: { label: "Minimal Risk", className: "bg-success/10 text-success border-success/20", icon: CheckCircle },
    2: { label: "Low Risk", className: "bg-success/10 text-success border-success/20", icon: CheckCircle },
    3: { label: "Moderate Risk", className: "bg-warning/10 text-warning border-warning/20", icon: AlertTriangle },
    4: { label: "High Risk", className: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
    5: { label: "Critical Risk", className: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  };
  return configs[level as keyof typeof configs] || configs[1];
};

const RiskBadge = ({ level }: { level: number }) => {
  const { label, className, icon: Icon } = getRiskConfig(level);

  return (
    <span className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border", className)}>
      <Icon className="w-4 h-4" />
      {level}/5 - {label}
    </span>
  );
};

const RiskMeter = ({ level, description }: { level: number; description: string }) => {
  const { className } = getRiskConfig(level);
  
  return (
    <div 
      className="bg-card rounded-xl p-6 shadow-card border border-border animate-slide-up"
      style={{ animationDelay: "50ms" }}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-secondary">
          <Gauge className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-3">Risk Assessment</h3>
          
          {/* Risk Level Indicator */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>1 - Minimal</span>
              <span>5 - Critical</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  level <= 2 ? "bg-success" : level === 3 ? "bg-warning" : "bg-destructive"
                )}
                style={{ width: `${(level / 5) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <span 
                  key={n} 
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                    n === level ? className : "bg-muted text-muted-foreground"
                  )}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
          
          {/* Risk Description */}
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
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
        
        <RiskMeter level={result.riskLevel} description={result.riskDescription} />
        
        <InsightCard
          icon={AlertTriangle}
          title="Why It Matters to Your Business"
          content={result.whyItMatters}
          delay="150ms"
        />
        <InsightCard
          icon={Lightbulb}
          title="Recommended Action"
          content={result.actionToTake}
          delay="250ms"
        />
        <InsightCard
          icon={Newspaper}
          title="Interesting Cybersecurity News for Your Capture!"
          content={result.cybersecurityNews}
          delay="350ms"
        />
        
        {/* Threat Heat Map Section */}
        <ThreatHeatMap threats={result.threatMap} />
      </div>
    </div>
  );
};
