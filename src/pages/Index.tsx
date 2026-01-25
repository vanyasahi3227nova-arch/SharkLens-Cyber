import { useState, useMemo } from "react";
import { Waves, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { FileUpload } from "@/components/FileUpload";
import { AnalysisResults } from "@/components/AnalysisResults";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { StepGuide } from "@/components/StepGuide";
import { supabase } from "@/integrations/supabase/client";

interface ThreatData {
  threatType: string;
  sourceIP: string;
  frequency: number;
  likelihood: number;
  impact: number;
  severity: "low" | "medium" | "high";
  explanation: string;
}

interface AnalysisResult {
  whatIsHappening: string;
  whyItMatters: string;
  riskLevel: number;
  riskDescription: string;
  actionToTake: string;
  cybersecurityNews: string;
  forensicAnalysis: string;
  threatMap: ThreatData[];
}

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Determine current step based on state
  const currentStep = useMemo(() => {
    if (result) return 3;
    if (selectedFile) return 2;
    return 1;
  }, [selectedFile, result]);

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Read the file content as text (for .txt and .json files)
      const fileContent = await selectedFile.text();
      
      const { data, error: fnError } = await supabase.functions.invoke('analyze-network', {
        body: { 
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileContent: fileContent,
          fileType: selectedFile.name.endsWith('.json') ? 'json' : 'text'
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Unable to analyze your network data. Please try again.");
      }

      if (data.error && !data.whatIsHappening) {
        throw new Error(data.error);
      }

      const parsedResult: AnalysisResult = {
        whatIsHappening: data.whatIsHappening,
        whyItMatters: data.whyItMatters,
        riskLevel: data.riskLevel,
        riskDescription: data.riskDescription,
        actionToTake: data.actionToTake,
        cybersecurityNews: data.cybersecurityNews,
        forensicAnalysis: data.forensicAnalysis || "",
        threatMap: data.threatMap || [],
      };

      setResult(parsedResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't complete the analysis. Please check your connection and try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleAnalyze();
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Header />
      
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Hero Section */}
        <section className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Translate Network Data Into
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Clear Business Insights
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your Wireshark capture and get plain-English cybersecurity insights. 
            No technical jargon – just actionable recommendations for your business.
          </p>
        </section>

        {/* Features */}
        <section className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Waves, title: "Easy Upload", desc: "Drag & drop your .pcap files" },
            { icon: Shield, title: "AI Analysis", desc: "Secure, private processing" },
            { icon: Zap, title: "Instant Insights", desc: "Results in seconds" },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="flex items-center gap-3 p-4 rounded-xl bg-card/60 border border-border animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="p-2 rounded-lg bg-secondary">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Step Guide */}
        <StepGuide currentStep={currentStep} />

        {/* Upload Section */}
        <section className="bg-card rounded-2xl shadow-card p-8 mb-8 animate-scale-in">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Upload Your Exported Network Data
          </h3>
          <FileUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />
          
          <div className="mt-8 flex justify-center">
            <Button
              variant="ocean"
              size="xl"
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
            >
              {isAnalyzing ? (
                <>Analyzing...</>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Analyze My Network
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Results Section */}
        {isAnalyzing && (
          <section className="bg-card rounded-2xl shadow-card p-8">
            <LoadingState />
          </section>
        )}

        {error && !isAnalyzing && (
          <section className="mb-8">
            <ErrorState message={error} onRetry={handleRetry} />
          </section>
        )}

        {result && !isAnalyzing && !error && (
          <section className="bg-card rounded-2xl shadow-card p-8">
            <AnalysisResults result={result} />
          </section>
        )}

        {/* Footer Info */}
        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>Your network data is processed securely and never stored.</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
