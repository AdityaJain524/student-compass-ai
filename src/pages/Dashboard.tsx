import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap, FileText, Banknote, TrendingUp, ArrowRight, Compass, MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const activityData = [
  { name: "Mon", value: 4 }, { name: "Tue", value: 7 }, { name: "Wed", value: 5 },
  { name: "Thu", value: 8 }, { name: "Fri", value: 6 }, { name: "Sat", value: 3 }, { name: "Sun", value: 2 },
];

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
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) {
        setRecentApps(data.slice(0, 3));
        setStats({
          total: data.length,
          accepted: data.filter((a) => a.status === "accepted").length,
          pending: data.filter((a) => a.status === "pending").length,
          rejected: data.filter((a) => a.status === "rejected").length,
        });
      }
    };
    load();
  }, [user]);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Applications" value={String(stats.total)} change={`${stats.pending} pending`} changeType="neutral" icon={FileText} />
        <StatCard title="Accepted" value={String(stats.accepted)} change={stats.total ? `${Math.round((stats.accepted / stats.total) * 100)}% rate` : "—"} changeType="positive" icon={GraduationCap} gradient="gradient-accent" />
        <StatCard title="Loan Offers" value="4" change="₹45L available" changeType="neutral" icon={Banknote} gradient="gradient-warm" />
        <StatCard title="Profile Score" value="82%" change="+5% improvement" changeType="positive" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Card key={action.label} className="p-4 cursor-pointer hover:shadow-elevated transition-all group" onClick={() => navigate(action.path)}>
            <div className={`h-10 w-10 rounded-xl ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="text-sm font-semibold">{action.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 shadow-card">
          <h3 className="font-semibold mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(230, 80%, 56%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 shadow-card">
          <h3 className="font-semibold mb-4">Application Status</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={applicationData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {applicationData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {applicationData.map((d) => (
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
          <Button variant="ghost" size="sm" onClick={() => navigate("/applications")}>
            View All <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
        {recentApps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No applications yet. Start by adding one!</p>
        ) : (
          <div className="space-y-3">
            {recentApps.map((app) => (
              <div key={app.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {app.university_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{app.university_name}</p>
                  <p className="text-xs text-muted-foreground">{app.course}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  app.status === "accepted" ? "bg-success/10 text-success" : app.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
