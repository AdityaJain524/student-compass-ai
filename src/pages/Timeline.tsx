import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar, CheckCircle, Loader2, Lightbulb, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TimelinePhase {
  phase: string;
  period: string;
  tasks: string[];
  tips: string;
}

const countries = ["USA", "UK", "Canada", "Australia", "Germany", "Ireland", "New Zealand"];
const intakes = ["Fall 2025", "Spring 2026", "Fall 2026", "Spring 2027"];

const Timeline = () => {
  const { user } = useAuth();
  const [country, setCountry] = useState("");
  const [intake, setIntake] = useState("");
  const [timeline, setTimeline] = useState<TimelinePhase[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!country || !intake) { toast.error("Select country and intake"); return; }
    setLoading(true);
    setTimeline([]);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-timeline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ country, intake }),
      });
      if (!res.ok) throw new Error("Failed to generate timeline");
      const data = await res.json();
      setTimeline(data.timeline || []);

      // Track activity
      if (user) {
        await supabase.from("user_activity").insert({
          user_id: user.id,
          activity_type: "timeline_generated",
          page: "/timeline",
          metadata: { country, intake },
        });
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const saveToProfile = async () => {
    if (!user) return;
    try {
      await supabase.from("recommendations").insert({
        user_id: user.id,
        rec_type: "timeline",
        title: `${intake} - ${country} Timeline`,
        description: JSON.stringify(timeline),
        link: "/timeline",
      });
      toast.success("Timeline saved to your recommendations!");
    } catch {
      toast.error("Failed to save");
    }
  };

  const phaseColors = [
    "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-red-500", "bg-teal-500", "bg-pink-500"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Application Timeline Generator</h1>
        <p className="text-muted-foreground text-sm mt-1">Get a personalized study abroad timeline with AI</p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label>Target Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Target Intake</Label>
            <Select value={intake} onValueChange={setIntake}>
              <SelectTrigger><SelectValue placeholder="Select intake" /></SelectTrigger>
              <SelectContent>
                {intakes.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} disabled={loading} className="gradient-primary text-primary-foreground">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Calendar className="h-4 w-4 mr-2" /> Generate Timeline</>}
          </Button>
        </div>
      </Card>

      {timeline.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Your {intake} Timeline for {country}</h2>
            <Button variant="outline" size="sm" onClick={saveToProfile}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {timeline.map((phase, i) => (
                <div key={i} className="relative pl-14">
                  <div className={`absolute left-4 top-2 h-5 w-5 rounded-full ${phaseColors[i % phaseColors.length]} flex items-center justify-center z-10`}>
                    <span className="text-[10px] font-bold text-white">{i + 1}</span>
                  </div>
                  <Card className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-base">{phase.phase}</h3>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{phase.period}</span>
                    </div>
                    <ul className="space-y-1.5 mb-3">
                      {phase.tasks.map((task, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                    {phase.tips && (
                      <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground">{phase.tips}</p>
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Timeline;
