import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, FileText, Banknote, TrendingUp, ArrowRight, Compass, MessageCircle,
  Calendar, Sparkles, Target, Lightbulb,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const quickActions = [
  { label: "Explore Careers", icon: Compass, path: "/career", gradient: "gradient-primary" },
  { label: "Check Admission", icon: GraduationCap, path: "/admission", gradient: "gradient-accent" },
  { label: "AI Mentor Chat", icon: MessageCircle, path: "/chat", gradient: "gradient-warm" },
  { label: "Loan Options", icon: Banknote, path: "/loans", gradient: "gradient-primary" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, accepted: 0, pending: 0, rejected: 0 });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [nudges, setNudges] = useState<string[]>([]);
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Load applications
      const { data: apps } = await supabase.from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (apps) {
        setRecentApps(apps.slice(0, 3));
        setStats({
          total: apps.length,
          accepted: apps.filter(a => a.status === "accepted").length,
          pending: apps.filter(a => a.status === "pending").length,
          rejected: apps.filter(a => a.status === "rejected").length,
        });
      }

      // Load profile for nudges
      const { data: prof } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      setProfile(prof);

      // Load recommendations
      const { data: recs } = await supabase.from("recommendations").select("*").eq("user_id", user.id).eq("dismissed", false).order("score", { ascending: false }).limit(5);
      if (recs) setRecommendations(recs);

      // Generate smart nudges based on profile
      const n: string[] = [];
      if (!prof?.gpa && !prof?.interests?.length) n.push("Complete your profile to unlock personalized recommendations →");
      if (prof?.preferred_countries?.length && (apps?.length || 0) === 0) n.push(`You're interested in ${prof.preferred_countries[0]} — try the Career Navigator to find universities!`);
      if (prof?.gpa && prof.gpa >= 3.5) n.push("With your strong GPA, you may have high admission chances — try the Admission Predictor!");
      if ((apps?.length || 0) > 0 && !apps?.some(a => a.status === "accepted")) n.push("You have pending applications — check Loan Assistance to prepare financially.");
      if ((apps?.length || 0) === 0) n.push("Start your journey by exploring universities in the Career Navigator!");
      setNudges(n.slice(0, 3));
    };
    load();
  }, [user]);

  const activityData = [
    { name: "Mon", value: 4 }, { name: "Tue", value: 7 }, { name: "Wed", value: 5 },
    { name: "Thu", value: 8 }, { name: "Fri", value: 6 }, { name: "Sat", value: 3 }, { name: "Sun", value: 2 },
  ];

  const applicationData = [
    { name: "Pending", value: stats.pending || 1, color: "hsl(38, 92%, 50%)" },
    { name: "Accepted", value: stats.accepted || 1, color: "hsl(145, 65%, 42%)" },
    { name: "Rejected", value: stats.rejected || 1, color: "hsl(0, 84%, 60%)" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl gradient-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Welcome back, {displayName}! 👋</h1>
        <p className="mt-1 text-primary-foreground/80 text-sm">
          You have {stats.pending} pending applications and {stats.total} total tracked.
        </p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate("/career")}>
          Explore Recommendations <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* Smart AI Nudges */}
      {nudges.length > 0 && (
        <div className="space-y-2">
          {nudges.map((nudge, i) => (
            <Card key={i} className="p-3 flex items-start gap-3 border-l-4 border-l-primary cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                if (nudge.includes("profile")) navigate("/settings");
                else if (nudge.includes("Career Navigator")) navigate("/career");
                else if (nudge.includes("Admission")) navigate("/admission");
                else if (nudge.includes("Loan")) navigate("/loans");
              }}>
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm">{nudge}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Applications" value={String(stats.total)} change={`${stats.pending} pending`} changeType="neutral" icon={FileText} />
        <StatCard title="Accepted" value={String(stats.accepted)} change={stats.total ? `${Math.round((stats.accepted / stats.total) * 100)}% rate` : "—"} changeType="positive" icon={GraduationCap} gradient="gradient-accent" />
        <StatCard title="Loan Offers" value="4" change="₹45L available" changeType="neutral" icon={Banknote} gradient="gradient-warm" />
        <StatCard title="Profile Score" value={profile?.gpa ? "82%" : "40%"} change={profile?.gpa ? "+5% improvement" : "Complete profile!"} changeType={profile?.gpa ? "positive" : "neutral"} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map(action => (
          <Card key={action.label} className="p-4 cursor-pointer hover:shadow-elevated transition-all group" onClick={() => navigate(action.path)}>
            <div className={`h-10 w-10 rounded-xl ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="text-sm font-semibold">{action.label}</p>
          </Card>
        ))}
      </div>

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Recommended for You</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map(rec => (
              <div key={rec.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => rec.link && navigate(rec.link)}>
                <div className="h-8 w-8 rounded-lg gradient-accent flex items-center justify-center shrink-0">
                  <Lightbulb className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{rec.rec_type}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Next Steps for You</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Generate Timeline", desc: "Plan your study abroad journey", path: "/timeline", icon: Calendar },
            { label: "Generate SOP", desc: "AI-powered statement of purpose", path: "/sop", icon: FileText },
            { label: "Create Content", desc: "Blog posts & study tips", path: "/ai-content", icon: Sparkles },
          ].map(step => (
            <Card key={step.label} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(step.path)}>
              <step.icon className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-semibold">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </Card>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 shadow-card">
          <h3 className="font-semibold mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5 shadow-card">
          <h3 className="font-semibold mb-4">Application Status</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={applicationData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {applicationData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {applicationData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Applications</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate("/applications")}>View All <ArrowRight className="ml-1 h-3 w-3" /></Button>
        </div>
        {recentApps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No applications yet. Start by adding one!</p>
        ) : (
          <div className="space-y-3">
            {recentApps.map(app => (
              <div key={app.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {app.university_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{app.university_name}</p>
                  <p className="text-xs text-muted-foreground">{app.course}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  app.status === "accepted" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                  app.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}>{app.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
