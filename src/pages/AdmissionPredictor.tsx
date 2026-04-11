import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

const AdmissionPredictor = () => {
  const [result, setResult] = useState<null | { score: number; tips: string[] }>(null);

  const predict = () => {
    // Simulated prediction logic
    const score = Math.floor(Math.random() * 30) + 60;
    const tips = [
      "Consider improving your GRE Verbal score by 5+ points",
      "Add more research experience to strengthen your profile",
      "A strong Statement of Purpose can boost your chances by 10-15%",
      "Get recommendation letters from well-known professors",
    ];
    setResult({ score, tips: tips.slice(0, Math.floor(Math.random() * 2) + 2) });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" /> Admission Probability Predictor
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter your academic profile to predict admission chances.
        </p>
      </div>

      <Card className="p-6 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>GPA (out of 4.0)</Label>
            <Input type="number" placeholder="3.7" step="0.1" />
          </div>
          <div className="space-y-2">
            <Label>GRE Score (out of 340)</Label>
            <Input type="number" placeholder="320" />
          </div>
          <div className="space-y-2">
            <Label>IELTS / TOEFL Score</Label>
            <Input type="number" placeholder="7.5" step="0.5" />
          </div>
          <div className="space-y-2">
            <Label>Work Experience (years)</Label>
            <Input type="number" placeholder="2" />
          </div>
          <div className="space-y-2">
            <Label>Research Papers</Label>
            <Input type="number" placeholder="1" />
          </div>
          <div className="space-y-2">
            <Label>Target University</Label>
            <Input placeholder="e.g., MIT" />
          </div>
        </div>
        <Button className="mt-6 gradient-primary border-0 text-primary-foreground" onClick={predict}>
          <TrendingUp className="mr-2 h-4 w-4" /> Predict My Chances
        </Button>
      </Card>

      {result && (
        <Card className="p-6 shadow-elevated">
          <h2 className="text-lg font-semibold mb-4">Prediction Result</h2>
          <div className="flex items-center gap-6">
            <div className="relative h-28 w-28">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={result.score >= 75 ? "hsl(var(--success))" : result.score >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${result.score * 2.64} 264`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{result.score}%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className={`text-lg font-semibold ${
                result.score >= 75 ? "text-success" : result.score >= 50 ? "text-warning" : "text-destructive"
              }`}>
                {result.score >= 75 ? "Strong Chance" : result.score >= 50 ? "Moderate Chance" : "Needs Improvement"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Based on your academic profile and historical admission data.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-info" /> Improvement Tips
            </h3>
            {result.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 mt-0.5 text-success shrink-0" />
                {tip}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdmissionPredictor;
