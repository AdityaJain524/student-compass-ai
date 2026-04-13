import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Save, Loader2, User, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const countryOptions = ["USA", "UK", "Canada", "Germany", "Australia", "France", "Netherlands", "Sweden", "Singapore", "Japan"];
const interestOptions = ["Computer Science", "Data Science", "Business/MBA", "Engineering", "Medicine", "Arts", "Law", "Economics"];

const SettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [gpa, setGpa] = useState("");
  const [academicHistory, setAcademicHistory] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [preferredCountries, setPreferredCountries] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [testScores, setTestScores] = useState({ gre: "", ielts: "", toefl: "", gmat: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setDisplayName(data.display_name || "");
        setGpa(data.gpa ? String(data.gpa) : "");
        setAcademicHistory(data.academic_history || "");
        setBudgetMin(data.budget_min ? String(data.budget_min) : "");
        setBudgetMax(data.budget_max ? String(data.budget_max) : "");
        setPreferredCountries(data.preferred_countries || []);
        setInterests(data.interests || []);
        const scores = (data.test_scores as any) || {};
        setTestScores({
          gre: scores.gre ? String(scores.gre) : "",
          ielts: scores.ielts ? String(scores.ielts) : "",
          toefl: scores.toefl ? String(scores.toefl) : "",
          gmat: scores.gmat ? String(scores.gmat) : "",
        });
      }
      setLoading(false);
    });
  }, [user]);

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName,
      gpa: gpa ? parseFloat(gpa) : null,
      academic_history: academicHistory,
      budget_min: budgetMin ? parseFloat(budgetMin) : null,
      budget_max: budgetMax ? parseFloat(budgetMax) : null,
      preferred_countries: preferredCountries,
      interests,
      test_scores: {
        gre: testScores.gre ? parseFloat(testScores.gre) : null,
        ielts: testScores.ielts ? parseFloat(testScores.ielts) : null,
        toefl: testScores.toefl ? parseFloat(testScores.toefl) : null,
        gmat: testScores.gmat ? parseFloat(testScores.gmat) : null,
      },
    }).eq("user_id", user.id);

    if (error) toast.error(error.message);
    else toast.success("Profile updated successfully!");
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" /> Profile & Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete your profile for better AI recommendations.
        </p>
      </div>

      {/* Personal Info */}
      <Card className="p-6 shadow-card space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="bg-muted" />
          </div>
        </div>
      </Card>

      {/* Academic Profile */}
      <Card className="p-6 shadow-card space-y-4">
        <h2 className="font-semibold">📚 Academic Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>GPA (out of 4.0)</Label>
            <Input type="number" step="0.1" value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="3.7" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Academic History</Label>
          <Textarea value={academicHistory} onChange={(e) => setAcademicHistory(e.target.value)} placeholder="Your degree, university, relevant coursework..." rows={3} />
        </div>
      </Card>

      {/* Test Scores */}
      <Card className="p-6 shadow-card space-y-4">
        <h2 className="font-semibold">📝 Test Scores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>GRE</Label>
            <Input type="number" value={testScores.gre} onChange={(e) => setTestScores({ ...testScores, gre: e.target.value })} placeholder="320" />
          </div>
          <div className="space-y-2">
            <Label>IELTS</Label>
            <Input type="number" step="0.5" value={testScores.ielts} onChange={(e) => setTestScores({ ...testScores, ielts: e.target.value })} placeholder="7.5" />
          </div>
          <div className="space-y-2">
            <Label>TOEFL</Label>
            <Input type="number" value={testScores.toefl} onChange={(e) => setTestScores({ ...testScores, toefl: e.target.value })} placeholder="100" />
          </div>
          <div className="space-y-2">
            <Label>GMAT</Label>
            <Input type="number" value={testScores.gmat} onChange={(e) => setTestScores({ ...testScores, gmat: e.target.value })} placeholder="700" />
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6 shadow-card space-y-4">
        <h2 className="font-semibold">🎯 Preferences</h2>
        <div className="space-y-3">
          <Label>Preferred Countries</Label>
          <div className="flex flex-wrap gap-2">
            {countryOptions.map((c) => (
              <Badge
                key={c}
                variant={preferredCountries.includes(c) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleItem(preferredCountries, setPreferredCountries, c)}
              >
                {c}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Label>Fields of Interest</Label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((i) => (
              <Badge
                key={i}
                variant={interests.includes(i) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleItem(interests, setInterests, i)}
              >
                {i}
              </Badge>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Budget Min (USD/yr)</Label>
            <Input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="10000" />
          </div>
          <div className="space-y-2">
            <Label>Budget Max (USD/yr)</Label>
            <Input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="60000" />
          </div>
        </div>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full gradient-primary border-0 text-primary-foreground">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Profile
      </Button>
    </div>
  );
};

export default SettingsPage;
