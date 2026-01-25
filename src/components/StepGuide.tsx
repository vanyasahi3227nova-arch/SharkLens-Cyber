import { FileText, Upload, BarChart3 } from "lucide-react";
import wiresharkExportGuide from "@/assets/wireshark-export-guide.png";

interface StepGuideProps {
  currentStep: number;
}

export const StepGuide = ({ currentStep }: StepGuideProps) => {
  const steps = [
    {
      number: 1,
      title: "Convert Your Capture File",
      description: "Open your .pcap or .pcapng file in Wireshark, then export it as JSON or Plain Text",
      icon: FileText,
      details: (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            In Wireshark, go to <strong>File → Export Packet Dissections</strong> and choose:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li><strong>As JSON...</strong> for structured data</li>
            <li><strong>As Plain Text...</strong> for readable format</li>
          </ul>
          <div className="mt-4 rounded-lg overflow-hidden border border-border">
            <img 
              src={wiresharkExportGuide} 
              alt="Wireshark Export Packet Dissections menu" 
              className="w-full h-auto"
            />
          </div>
        </div>
      ),
    },
    {
      number: 2,
      title: "Upload Your File",
      description: "Upload the exported .txt or .json file for AI-powered analysis",
      icon: Upload,
      details: null,
    },
    {
      number: 3,
      title: "View Your Analysis",
      description: "Get actionable cybersecurity insights in plain English",
      icon: BarChart3,
      details: null,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      {steps.map((step) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const Icon = step.icon;

        return (
          <div
            key={step.number}
            className={`relative p-6 rounded-xl border transition-all duration-300 ${
              isActive
                ? "bg-primary/5 border-primary shadow-lg"
                : isCompleted
                ? "bg-secondary/50 border-primary/30"
                : "bg-card/60 border-border"
            }`}
          >
            {/* Step Number Badge */}
            <div
              className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-sm font-semibold ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isCompleted
                  ? "bg-primary/80 text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              Step {step.number}
            </div>

            <div className={`mt-3 flex items-start gap-4 ${!step.details ? 'min-h-[120px]' : ''}`}>
              <div
                className={`p-3 rounded-lg shrink-0 ${
                  isActive
                    ? "bg-primary/20"
                    : isCompleted
                    ? "bg-primary/10"
                    : "bg-secondary"
                } ${!step.details ? 'p-4' : ''}`}
              >
                <Icon
                  className={`${!step.details ? 'w-8 h-8' : 'w-6 h-6'} ${
                    isActive || isCompleted ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3
                  className={`font-semibold mb-2 ${
                    isActive ? "text-foreground" : "text-foreground/80"
                  } ${!step.details ? 'text-lg' : ''}`}
                >
                  {step.title}
                </h3>
                <p className={`text-muted-foreground ${!step.details ? 'text-base leading-relaxed' : 'text-sm'}`}>
                  {step.description}
                </p>
              </div>
            </div>

            {/* Expanded details for step 1 when active */}
            {step.details && isActive && step.details}
          </div>
        );
      })}
    </div>
  );
};
