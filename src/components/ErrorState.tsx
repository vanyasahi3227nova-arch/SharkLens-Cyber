import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 bg-destructive/5 border border-destructive/20 rounded-xl animate-fade-in">
      <div className="p-4 rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Something went wrong
      </h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        {message}
      </p>
      <Button variant="ocean-outline" onClick={onRetry}>
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );
};
