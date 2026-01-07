import sharkLogo from "@/assets/shark-logo.png";

export const Header = () => {
  return (
    <header className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={sharkLogo} 
            alt="Cyber Shark" 
            className="w-10 h-10"
          />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              One Personal Cyber Translator
            </h1>
            <p className="text-xs text-muted-foreground">
              Network insights, simplified
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Secure AI Analysis
        </div>
      </div>
    </header>
  );
};
