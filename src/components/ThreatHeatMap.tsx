import { useState } from "react";
import { AlertTriangle, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ThreatData {
  threatType: string;
  sourceIP: string;
  frequency: number;
  likelihood: number; // 1-5
  impact: number; // 1-5
  severity: "low" | "medium" | "high";
  explanation: string;
}

interface ThreatHeatMapProps {
  threats: ThreatData[];
}

const getSeverityColor = (severity: "low" | "medium" | "high") => {
  switch (severity) {
    case "low":
      return "bg-success";
    case "medium":
      return "bg-warning";
    case "high":
      return "bg-destructive";
    default:
      return "bg-muted";
  }
};

const getSeverityBadgeClass = (severity: "low" | "medium" | "high") => {
  switch (severity) {
    case "low":
      return "bg-success/10 text-success border-success/20";
    case "medium":
      return "bg-warning/10 text-warning border-warning/20";
    case "high":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const HeatMapGrid = ({ threats }: { threats: ThreatData[] }) => {
  const [hoveredThreat, setHoveredThreat] = useState<ThreatData | null>(null);

  // Create 5x5 grid cells
  const gridCells = [];
  for (let impact = 5; impact >= 1; impact--) {
    for (let likelihood = 1; likelihood <= 5; likelihood++) {
      const threatsInCell = threats.filter(
        (t) => t.likelihood === likelihood && t.impact === impact
      );
      gridCells.push({ likelihood, impact, threats: threatsInCell });
    }
  }

  return (
    <div className="relative">
      {/* Y-axis label */}
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-muted-foreground whitespace-nowrap">
        Impact →
      </div>

      <div className="ml-4">
        {/* Y-axis values */}
        <div className="flex">
          <div className="w-6 flex flex-col justify-between text-xs text-muted-foreground py-1">
            <span>5</span>
            <span>4</span>
            <span>3</span>
            <span>2</span>
            <span>1</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-5 gap-1 flex-1">
            {gridCells.map((cell, index) => {
              const hasThreats = cell.threats.length > 0;
              const highestSeverity = cell.threats.reduce(
                (max, t) => {
                  const order = { low: 1, medium: 2, high: 3 };
                  return order[t.severity] > order[max] ? t.severity : max;
                },
                "low" as "low" | "medium" | "high"
              );

              return (
                <div
                  key={index}
                  className={cn(
                    "aspect-square rounded-md border border-border flex items-center justify-center relative transition-all duration-200",
                    hasThreats
                      ? cn(getSeverityColor(highestSeverity), "cursor-pointer hover:scale-105")
                      : "bg-muted/30"
                  )}
                  onMouseEnter={() => hasThreats && setHoveredThreat(cell.threats[0])}
                  onMouseLeave={() => setHoveredThreat(null)}
                >
                  {hasThreats && (
                    <span className="text-xs font-bold text-white drop-shadow-md">
                      {cell.threats.length}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis values */}
        <div className="flex mt-1 ml-6">
          <div className="flex-1 grid grid-cols-5 gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="text-xs text-muted-foreground text-center">
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* X-axis label */}
        <div className="text-center text-xs font-medium text-muted-foreground mt-2">
          Likelihood →
        </div>
      </div>

      {/* Tooltip */}
      {hoveredThreat && (
        <div className="absolute top-0 right-0 bg-popover border border-border rounded-lg p-3 shadow-lg max-w-[200px] z-10">
          <p className="font-medium text-sm text-foreground">{hoveredThreat.threatType}</p>
          <p className="text-xs text-muted-foreground mt-1">{hoveredThreat.sourceIP}</p>
        </div>
      )}
    </div>
  );
};

const ThreatTable = ({ threats }: { threats: ThreatData[] }) => {
  if (threats.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No significant threats detected in this capture.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Threat Type</TableHead>
            <TableHead>Source IP</TableHead>
            <TableHead className="text-center">Frequency</TableHead>
            <TableHead className="text-center">Likelihood</TableHead>
            <TableHead className="text-center">Impact</TableHead>
            <TableHead className="text-center">Severity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {threats.map((threat, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{threat.threatType}</TableCell>
              <TableCell className="font-mono text-sm">{threat.sourceIP}</TableCell>
              <TableCell className="text-center">{threat.frequency}</TableCell>
              <TableCell className="text-center">{threat.likelihood}/5</TableCell>
              <TableCell className="text-center">{threat.impact}/5</TableCell>
              <TableCell className="text-center">
                <span
                  className={cn(
                    "inline-flex px-2 py-1 rounded-full text-xs font-medium border capitalize",
                    getSeverityBadgeClass(threat.severity)
                  )}
                >
                  {threat.severity}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const ThreatExplanations = ({ threats }: { threats: ThreatData[] }) => {
  if (threats.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-foreground text-sm">Why These Positions?</h4>
      {threats.map((threat, index) => (
        <div key={index} className="flex gap-3 text-sm">
          <div
            className={cn(
              "w-2 h-2 rounded-full mt-1.5 shrink-0",
              getSeverityColor(threat.severity)
            )}
          />
          <div>
            <span className="font-medium text-foreground">{threat.threatType}:</span>{" "}
            <span className="text-muted-foreground">{threat.explanation}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ThreatHeatMap = ({ threats }: ThreatHeatMapProps) => {
  return (
    <div
      className="bg-card rounded-xl p-6 shadow-card border border-border animate-slide-up"
      style={{ animationDelay: "400ms" }}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-lg bg-secondary">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">Threat Heat Map</h3>
          <p className="text-sm text-muted-foreground">
            Visual representation of detected threats by likelihood and potential impact
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 text-xs">
        <span className="text-muted-foreground">Severity:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success" />
          <span className="text-muted-foreground">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-warning" />
          <span className="text-muted-foreground">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-destructive" />
          <span className="text-muted-foreground">High</span>
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="mb-8 max-w-[280px] mx-auto">
        <HeatMapGrid threats={threats} />
      </div>

      {/* Threat Table */}
      <div className="mb-6">
        <h4 className="font-medium text-foreground text-sm mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Detected Threats
        </h4>
        <ThreatTable threats={threats} />
      </div>

      {/* Explanations */}
      <ThreatExplanations threats={threats} />
    </div>
  );
};
