import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, TrendingUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdmissionPredictor = () => {
  const [gpa, setGpa] = useState("");
  const [gre, setGre] = useState("");
  const [ielts, setIelts] = useState("");
  const [experience, setExperience] = useState("");
  const [papers, setPapers] = useState("");
  const [targetUni, setTargetUni] = useState("");
  const [universities, setUniversities] = useState<{ id: string; name: string; acceptance_rate: number | null; ranking: number | null; requirements: any }[]>([]);
  const [result, setResult] = useState<null | { score: number; label: string; tips: string[] }>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("universities").select("id, name, acceptance_rate, ranking, requirements").order("name").then(({ data }) => {
      if (data) setUniversities(data);
    });
  }, []);

  const predict = () => {
    if (!gpa) return;
    setLoading(true);

    const gpaVal = parseFloat(gpa) || 0;
    const greVal = parseFloat(gre) || 0;
    const ieltsVal = parseFloat(ielts) || 0;
    const expVal = parseFloat(experience) || 0;
    const papersVal = parseFloat(papers) || 0;

    // GPA score (40% weight) - scale 0-4 to 0-100
    const gpaScore = Math.min((gpaVal / 4.0) * 100, 100);

    // Test scores (30% weight) - combine GRE and IELTS
    const greScore = greVal > 0 ? Math.min((greVal / 340) * 100, 100) : 50;
    const ieltsScore = ieltsVal > 0 ? Math.min((ieltsVal / 9.0) * 100, 100) : 50;
    const testScore = (greScore * 0.6 + ieltsScore * 0.4);

    // Experience (20% weight) - years + papers
    const expScore = Math.min((expVal * 15) + (papersVal * 10), 100);

    // University difficulty (10% weight)
    const selectedUni = universities.find(u => u.id === targetUni);
    let difficultyScore = 50; // default for no selection
    if (selectedUni) {
      const acceptance = selectedUni.acceptance_rate || 50;
      // Lower acceptance = harder = lower score
      difficultyScore = Math.min(acceptance * 2, 100);
      // Ranking factor
      if (selectedUni.ranking) {
        difficultyScore = Math.max(difficultyScore - (50 - Math.min(selectedUni.ranking, 50)), 10);
      }
    }

    const rawScore = (gpaScore * 0.4) + (testScore * 0.3) + (expScore * 0.2) + (difficultyScore * 0.1);
    const finalScore = Math.round(Math.max(15, Math.min(98, rawScore)));

    // Generate contextual tips
    const tips: string[] = [];
    if (gpaVal < 3.5) tips.push("Aim to improve your GPA above 3.5 for stronger applications.");
    if (greVal > 0 && greVal < 320) tips.push("A GRE score of 320+ significantly improves chances at top universities.");
    if (ieltsVal > 0 && ieltsVal < 7.5) tips.push("Target IELTS 7.5+ or TOEFL 100+ for competitive programs.");
    if (expVal < 1) tips.push("Gain relevant work experience or internships to strengthen your profile.");
    if (papersVal === 0) tips.push("Publishing research papers can boost your admission probability by 10-15%.");
    tips.push("A compelling Statement of Purpose can significantly improve your chances — try our SOP Generator!");
    if (selectedUni && (selectedUni.acceptance_rate || 0) < 10) {
      tips.push("This is a highly competitive university. Consider applying to 2-3 safety schools as well.");
    }

    const label = finalScore >= 75 ? "Safe" : finalScore >= 50 ? "Moderate" : "Ambitious";

    setResult({ score: finalScore, label, tips: tips.slice(0, 4) });
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" /> Admission Probability Predictor
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter your academic profile to predict admission chances using weighted scoring.
        </p>
      </div>

      <Card className="p-6 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>GPA (out of 4.0) — 40% weight</Label>
            <Input type="number" placeholder="3.7" step="0.1" min="0" max="4" value={gpa} onChange={(e) => setGpa(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>GRE Score (out of 340) — 30% weight</Label>
            <Input type="number" placeholder="320" value={gre} onChange={(e) => setGre(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>IELTS Score (out of 9.0)</Label>
            <Input type="number" placeholder="7.5" step="0.5" value={ielts} onChange={(e) => setIelts(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Work Experience (years) — 20% weight</Label>
            <Input type="number" placeholder="2" value={experience} onChange={(e) => setExperience(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Research Papers</Label>
            <Input type="number" placeholder="1" value={papers} onChange={(e) => setPapers(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Target University — 10% weight</Label>
            <Select value={targetUni} onValueChange={setTargetUni}>
              <SelectTrigger><SelectValue placeholder="Select university" /></SelectTrigger>
              <SelectContent>
                {universities.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="mt-6 gradient-primary border-0 text-primary-foreground" onClick={predict} disabled={loading || !gpa}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
          Predict My Chances
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
                  stroke={result.score >= 75 ? "hsl(var(--success, 145 65% 42%))" : result.score >= 50 ? "hsl(38, 92%, 50%)" : "hsl(var(--destructive))"}
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
                result.label === "Safe" ? "text-success" : result.label === "Moderate" ? "text-warning" : "text-destructive"
              }`}>
                {result.label === "Safe" ? "🟢 Safe" : result.label === "Moderate" ? "🟡 Moderate" : "🔴 Ambitious"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Based on weighted scoring: GPA (40%), Test Scores (30%), Experience (20%), University Difficulty (10%).
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-primary" /> Improvement Tips
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
