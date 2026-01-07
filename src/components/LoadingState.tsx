import { Loader2 } from "lucide-react";
import sharkLogo from "@/assets/shark-logo.png";

export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative mb-6">
        <img 
          src={sharkLogo} 
          alt="Analyzing" 
          className="w-24 h-24 animate-float"
        />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Analyzing Your Network
      </h3>
      <p className="text-muted-foreground text-center max-w-sm">
        Our AI is examining your network data and translating it into simple, actionable insights...
      </p>
      <div className="mt-6 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
};
