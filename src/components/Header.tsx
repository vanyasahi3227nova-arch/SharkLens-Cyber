import { Link, useLocation } from "react-router-dom";
import sharkLogo from "@/assets/shark-logo.png";
import { cn } from "@/lib/utils";

export const Header = () => {
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Analyze" },
    { href: "/about", label: "About Sharklens" },
    { href: "/innovator", label: "Innovator" },
  ];

  return (
    <header className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img 
            src={sharkLogo} 
            alt="Cyber Shark" 
            className="w-10 h-10"
          />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Sharklens
            </h1>
            <p className="text-xs text-muted-foreground">
              Network insights, simplified
            </p>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Secure AI Analysis
        </div>
      </div>
    </header>
  );
};
