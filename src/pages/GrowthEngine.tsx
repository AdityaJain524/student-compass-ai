import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Rocket, Mail, Linkedin, Instagram, Copy, Save, Send, BarChart3, Eye, MousePointer, Target, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const GrowthEngine = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [audience, setAudience] = useState("students");
  const [country, setCountry] = useState("USA");
  const [goal, setGoal] = useState("awareness");
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [generated, setGenerated] = useState<{ email: string; linkedin: string; instagram: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("marketing_campaigns").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setCampaigns(data);
    });
  }, [user]);

  const generateCampaign = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a high-conversion marketing campaign targeting Indian ${audience} planning to study in ${country}.
Goal: ${goal}

Return EXACTLY this JSON format (no markdown):
{
  "email_subject": "...",
  "email_body": "...",
  "linkedin_post": "...",
  "instagram_caption": "..."
}`;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ topic: `${goal} campaign for ${country}`, contentType: "blog", country }),
      });

      let emailContent = "", linkedinContent = "", instagramContent = "";
      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
            try {
              const parsed = JSON.parse(line.slice(6));
              const c = parsed.choices?.[0]?.delta?.content;
              if (c) full += c;
            } catch {}
          }
        }
        const sections = full.split(/#{1,3}\s/);
        emailContent = sections.length > 1 ? sections[1].trim().slice(0, 500) : full.slice(0, 500);
        linkedinContent = sections.length > 2 ? sections[2].trim().slice(0, 300) : full.slice(200, 500);
        instagramContent = sections.length > 3 ? sections[3].trim().slice(0, 200) : full.slice(300, 500);
      }

      setGenerated({ email: emailContent || "AI-generated email campaign content", linkedin: linkedinContent || "AI-generated LinkedIn post", instagram: instagramContent || "AI-generated Instagram caption" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate campaign", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveCampaign = async () => {
    if (!user || !generated) return;
    const { data, error } = await supabase.from("marketing_campaigns").insert({
      user_id: user.id,
      title: `${goal} Campaign - ${country}`,
      target_audience: audience,
      country,
      goal,
      email_content: generated.email,
      linkedin_content: generated.linkedin,
      instagram_content: generated.instagram,
    }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    if (data) setCampaigns(prev => [data, ...prev]);
    toast({ title: "Saved!", description: "Campaign saved successfully" });
  };

  const simulateSend = async (id: string) => {
    const sent = Math.floor(Math.random() * 5000) + 1000;
    const opens = Math.floor(sent * (0.15 + Math.random() * 0.25));
    const clicks = Math.floor(opens * (0.1 + Math.random() * 0.2));
    const conversions = Math.floor(clicks * (0.02 + Math.random() * 0.08));
    await supabase.from("marketing_campaigns").update({
      status: "sent", simulated_sent: sent, simulated_opens: opens, simulated_clicks: clicks, simulated_conversions: conversions,
    }).eq("id", id);
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: "sent", simulated_sent: sent, simulated_opens: opens, simulated_clicks: clicks, simulated_conversions: conversions } : c));
    toast({ title: "Campaign Sent! 🚀", description: `Simulated delivery to ${sent.toLocaleString()} recipients` });
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast({ title: "Copied!" }); };

  const sentCampaigns = campaigns.filter(c => c.status === "sent");
  const chartData = sentCampaigns.slice(0, 5).map(c => ({
    name: c.title?.slice(0, 15) || "Campaign",
    opens: c.simulated_opens,
    clicks: c.simulated_clicks,
    conversions: c.simulated_conversions,
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl gradient-primary p-6 text-primary-foreground">
        <div className="flex items-center gap-3 mb-2">
          <Rocket className="h-7 w-7" />
          <h1 className="text-2xl font-bold">AI Growth Engine</h1>
        </div>
        <p className="text-primary-foreground/80 text-sm">Generate AI-powered marketing campaigns for user acquisition</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1 space-y-4">
          <h3 className="font-semibold">Campaign Settings</h3>
          <div className="space-y-3">
            <div>
              <Label>Target Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="working-professionals">Working Professionals</SelectItem>
                  <SelectItem value="parents">Parents</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["USA", "UK", "Canada", "Australia", "Germany"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Campaign Goal</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                  <SelectItem value="conversion">Lead Conversion</SelectItem>
                  <SelectItem value="retention">User Retention</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={generateCampaign} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</> : "🚀 Generate Campaign"}
            </Button>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          {generated ? (
            <Tabs defaultValue="email">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="email"><Mail className="h-4 w-4 mr-1" /> Email</TabsTrigger>
                  <TabsTrigger value="linkedin"><Linkedin className="h-4 w-4 mr-1" /> LinkedIn</TabsTrigger>
                  <TabsTrigger value="instagram"><Instagram className="h-4 w-4 mr-1" /> Instagram</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={saveCampaign}><Save className="h-4 w-4 mr-1" /> Save</Button>
                </div>
              </div>
              {(["email", "linkedin", "instagram"] as const).map(tab => (
                <TabsContent key={tab} value={tab}>
                  <div className="relative bg-muted/50 rounded-xl p-4 min-h-[200px]">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => copy(generated[tab])}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <p className="text-sm whitespace-pre-wrap pr-8">{generated[tab]}</p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Rocket className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Configure settings and generate your first AI campaign</p>
            </div>
          )}
        </Card>
      </div>

      {/* Campaign Analytics */}
      {sentCampaigns.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Campaign Performance</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Sent", value: sentCampaigns.reduce((s, c) => s + c.simulated_sent, 0), icon: Send, color: "text-blue-500" },
              { label: "Total Opens", value: sentCampaigns.reduce((s, c) => s + c.simulated_opens, 0), icon: Eye, color: "text-green-500" },
              { label: "Total Clicks", value: sentCampaigns.reduce((s, c) => s + c.simulated_clicks, 0), icon: MousePointer, color: "text-orange-500" },
              { label: "Total Conversions", value: sentCampaigns.reduce((s, c) => s + c.simulated_conversions, 0), icon: Target, color: "text-purple-500" },
            ].map(m => (
              <div key={m.label} className="bg-muted/50 rounded-xl p-4 text-center">
                <m.icon className={`h-5 w-5 mx-auto mb-1 ${m.color}`} />
                <p className="text-lg font-bold">{m.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip />
              <Bar dataKey="opens" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Opens" />
              <Bar dataKey="clicks" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Clicks" />
              <Bar dataKey="conversions" fill="hsl(145, 65%, 42%)" radius={[4, 4, 0, 0]} name="Conversions" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Saved Campaigns */}
      {campaigns.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Saved Campaigns</h3>
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.target_audience} • {c.country} • {c.goal}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.status === "sent" ? "default" : "secondary"}>{c.status}</Badge>
                  {c.status === "draft" && (
                    <Button size="sm" variant="outline" onClick={() => simulateSend(c.id)}>
                      <Send className="h-3 w-3 mr-1" /> Simulate Send
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default GrowthEngine;
