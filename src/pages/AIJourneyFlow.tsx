import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  UserPlus, User, Compass, GraduationCap, Calculator, FileText, Banknote, CheckCircle,
  ArrowDown, Brain, Sparkles, Zap,
} from "lucide-react";

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  aiDecision: string;
  icon: any;
  path: string;
  completed: boolean;
  active: boolean;
}

const AIJourneyFlow = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<JourneyStep[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      const { data: apps } = await supabase.from("applications").select("*").eq("user_id", user.id);
      const { data: loans } = await supabase.from("loans").select("*").eq("user_id", user.id);
      const { data: sops } = await supabase.from("sop_drafts").select("id").eq("user_id", user.id).limit(1);

      const hasProfile = !!(profile?.gpa || profile?.interests?.length);
      const hasApps = (apps?.length || 0) > 0;
      const hasAccepted = apps?.some(a => a.status === "accepted");
      const hasLoans = (loans?.length || 0) > 0;
      const hasSop = (sops?.length || 0) > 0;

      setSteps([
        {
          id: "signup", title: "Sign Up", description: "Create your account",
          aiDecision: "✅ Account created. AI begins profiling.",
          icon: UserPlus, path: "/auth", completed: true, active: false,
        },
        {
          id: "profile", title: "Profile Setup", description: "Add GPA, interests, budget, test scores",
          aiDecision: hasProfile ? "✅ Profile complete. AI can now personalize recommendations." : "⚠️ Incomplete. AI nudge: 'Complete your profile for better matches'",
          icon: User, path: "/settings", completed: hasProfile, active: !hasProfile,
        },
        {
          id: "career", title: "Career Navigator", description: "Explore universities filtered by your profile",
          aiDecision: hasProfile ? "🧠 AI filters universities by GPA, budget, and country preference." : "Waiting for profile data to personalize results.",
          icon: Compass, path: "/career", completed: hasProfile, active: hasProfile && !hasApps,
        },
        {
          id: "admission", title: "Admission Predictor", description: "Check probability using weighted scoring",
          aiDecision: hasProfile ? `🎯 AI calculates: GPA(40%) + Test(30%) + Exp(20%) + Difficulty(10%) = probability score.` : "Needs profile data for prediction.",
          icon: GraduationCap, path: "/admission", completed: hasProfile, active: false,
        },
        {
          id: "roi", title: "ROI Calculator", description: "Analyze financial return on education investment",
          aiDecision: "💰 AI generates financial insights comparing cost vs expected salary.",
          icon: Calculator, path: "/roi", completed: false, active: false,
        },
        {
          id: "sop", title: "SOP & Application", description: "Generate SOP and track applications",
          aiDecision: hasSop ? "✅ SOP generated. AI tailored content to university requirements." : (hasApps ? "📝 Applications tracked. Generate SOP for stronger applications." : "Awaiting university selection."),
          icon: FileText, path: "/applications", completed: hasApps, active: hasProfile && !hasApps,
        },
        {
          id: "loan", title: "Loan & Financing", description: "Check eligibility, compare plans, apply",
          aiDecision: hasLoans ? "✅ Loan application submitted. AI assessed eligibility and risk." : (hasApps ? "🏦 AI recommends: Check loan eligibility based on your profile." : "Awaiting application stage."),
          icon: Banknote, path: "/loans", completed: hasLoans, active: hasApps && !hasLoans,
        },
        {
          id: "conversion", title: "Conversion", description: "Accepted + Funded → Success!",
          aiDecision: hasAccepted && hasLoans ? "🎉 Full conversion achieved! User journey complete." : "🔄 AI continues monitoring and nudging toward conversion.",
          icon: CheckCircle, path: "/", completed: !!(hasAccepted && hasLoans), active: false,
        },
      ]);
    };
    load();
  }, [user]);

  const completedCount = steps.filter(s => s.completed).length;
  const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl gradient-accent p-6 text-primary-foreground">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-7 w-7" />
          <h1 className="text-2xl font-bold">AI User Journey Flow</h1>
        </div>
        <p className="text-primary-foreground/80 text-sm">End-to-end visualization of AI decisions at every step</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary-foreground rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm font-bold">{progress}%</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-1">
        {steps.map((step, i) => (
          <div key={step.id}>
            <Card className={`p-5 border-l-4 transition-all ${
              step.completed ? "border-l-green-500 bg-green-50/50 dark:bg-green-900/10" :
              step.active ? "border-l-primary bg-primary/5 shadow-md" :
              "border-l-muted opacity-60"
            }`}>
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                  step.completed ? "bg-green-100 dark:bg-green-900/30" :
                  step.active ? "gradient-primary" : "bg-muted"
                }`}>
                  <step.icon className={`h-6 w-6 ${
                    step.completed ? "text-green-600" :
                    step.active ? "text-primary-foreground" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{step.title}</h3>
                    {step.completed && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Done</Badge>}
                    {step.active && <Badge variant="default">Current</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                  <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs">{step.aiDecision}</p>
                  </div>
                  {step.active && (
                    <Button size="sm" className="mt-3" onClick={() => navigate(step.path)}>
                      <Zap className="h-3 w-3 mr-1" /> Go to {step.title}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className={`h-5 w-5 ${step.completed ? "text-green-500" : "text-muted-foreground/30"}`} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIJourneyFlow;
