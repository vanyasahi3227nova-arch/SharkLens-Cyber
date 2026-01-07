import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Shield, Brain, Users, Target, Eye, BookOpen } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen gradient-hero">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            About Sharklens
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            An AI-powered cybersecurity insight translator designed to bridge the gap between 
            complex security data and executive-level understanding.
          </p>
        </div>

        {/* The Challenge Section */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-primary">
              <AlertTriangle className="w-6 h-6" />
              The Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Organizations generate vast amounts of cybersecurity data through tools like Wireshark, 
              yet this information is often highly technical and inaccessible to non-experts. Small 
              business leaders and C-level executives struggle to understand what network activity 
              means for their organization, why it matters, and what actions to take—without relying 
              heavily on specialized security teams. This gap between technical security data and 
              executive understanding leads to delayed decisions, misjudged risks, and underutilized 
              security insights. This project addresses that challenge by translating complex network 
              data into clear, business-relevant explanations using AI, enabling informed decision-making 
              without requiring deep cybersecurity expertise.
            </p>
          </CardContent>
        </Card>

        {/* Mission Section */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-primary">
              <Target className="w-6 h-6" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Sharklens leverages advanced large language model (LLM) reasoning to transform 
              intricate network and security data into clear, business-friendly explanations. 
              We believe that cybersecurity awareness should not require deep technical expertise.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our platform serves as an intelligent translator, converting the complex language 
              of cybersecurity into actionable insights that empower informed decision-making.
            </p>
          </CardContent>
        </Card>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Shield className="w-5 h-5 text-primary" />
                Improved Awareness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gain a clearer understanding of your organization's cybersecurity posture 
                without needing to interpret raw technical data.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Brain className="w-5 h-5 text-primary" />
                Faster Understanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Quickly grasp the significance of security events and potential risks 
                through AI-powered summarization and explanation.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Users className="w-5 h-5 text-primary" />
                Reduced Dependency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Make informed security decisions without requiring constant access to 
                specialized technical personnel or deep cybersecurity expertise.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scope Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-primary">
              <Eye className="w-6 h-6" />
              Project Scope
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent" />
                  What Sharklens Is
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    An educational platform for cybersecurity understanding
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    A decision-support tool for executive-level stakeholders
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    A visibility enhancement system for network activity
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    An interpretation and explanation engine
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  What Sharklens Is Not
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                    A real-time intrusion detection system
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                    A replacement for security operations centers
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                    An automated threat response platform
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default About;
