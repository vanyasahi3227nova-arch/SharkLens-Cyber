import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { User, Shield, Brain, MessageSquare, Heart } from "lucide-react";

const Innovator = () => {
  return (
    <div className="min-h-screen gradient-hero">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Innovator
          </h1>
          <p className="text-lg text-muted-foreground">
            Meet the creator behind Sharklens
          </p>
        </div>

        {/* Profile Card */}
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-card overflow-hidden">
            <div className="gradient-ocean h-24" />
            <CardContent className="pt-0 relative">
              {/* Profile Image Placeholder */}
              <div className="w-24 h-24 rounded-full bg-card border-4 border-card shadow-lg flex items-center justify-center -mt-12 mb-6">
                <User className="w-12 h-12 text-primary" />
              </div>

              {/* Name and Title */}
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Vanya Sahi
              </h2>
              <p className="text-primary font-medium mb-6">
                Creator of Sharklens
              </p>

              {/* Bio */}
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Vanya Sahi is the innovator behind Sharklens, an academic and exploratory 
                  project focused on improving the accessibility of cybersecurity insights 
                  through artificial intelligence.
                </p>
                <p>
                  With a strong interest in cybersecurity, AI systems, and large language 
                  models (LLMs), Vanya's work centers on addressing one of the most persistent 
                  challenges in security operations: the communication gap between technical 
                  cybersecurity data and executive-level decision-making.
                </p>
                <p>
                  Sharklens was conceptualized to demonstrate how LLM-powered reasoning can 
                  translate complex network activity into clear, business-oriented explanations 
                  that are understandable by non-technical stakeholders, including C-level 
                  executives and small business leaders.
                </p>
              </div>

              {/* Interests */}
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="font-semibold text-foreground mb-4">
                  Areas of Interest
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                    <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        Human-Centered Cybersecurity
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Designing security systems with user accessibility in mind
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                    <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        AI-Assisted Risk Communication
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Leveraging AI to bridge technical and business communication
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                    <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        Decision-Support Systems
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Building tools for non-technical users to make informed decisions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                    <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        Ethical AI in Security
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Responsible and transparent use of AI in security contexts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Innovator;
