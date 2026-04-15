import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Users, TrendingUp, Banknote, AlertTriangle, CheckCircle, ShieldAlert, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const BusinessDashboard = () => {
  const { user } = useAuth();
  const [commission, setCommission] = useState([2]);
  const [stats, setStats] = useState({ users: 0, loanApps: 0, totalLoanAmt: 0, conversionRate: 0 });
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { data: loanData } = await supabase.from("loans").select("*").eq("user_id", user.id);
      const { count: appCount } = await supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      const ls = loanData || [];
      setLoans(ls);
      setStats({
        users: userCount || 0,
        loanApps: ls.length,
        totalLoanAmt: ls.reduce((s, l) => s + Number(l.amount), 0),
        conversionRate: appCount && appCount > 0 ? Math.round((ls.length / appCount) * 100) : 0,
      });
    };
    load();
  }, [user]);

  const estimatedRevenue = stats.totalLoanAmt * (commission[0] / 100);

  const revenueData = [
    { month: "Jan", revenue: estimatedRevenue * 0.6 },
    { month: "Feb", revenue: estimatedRevenue * 0.7 },
    { month: "Mar", revenue: estimatedRevenue * 0.85 },
    { month: "Apr", revenue: estimatedRevenue },
  ];

  const funnelData = [
    { stage: "Visitors", value: stats.users * 10 },
    { stage: "Signups", value: stats.users },
    { stage: "Applications", value: stats.loanApps * 3 },
    { stage: "Loan Apps", value: stats.loanApps },
  ];

  // NBFC Risk scoring
  const getRiskScore = (loan: any) => {
    let score = 50;
    if (Number(loan.amount) > 3000000) score += 20;
    else if (Number(loan.amount) > 1500000) score += 10;
    if (loan.collateral_type === "property") score -= 15;
    else if (loan.collateral_type === "fd") score -= 10;
    if (Number(loan.interest_rate) > 12) score += 10;
    if (Number(loan.tenure_months) > 60) score += 5;
    return Math.max(0, Math.min(100, score));
  };

  const getRiskLabel = (score: number) => {
    if (score < 35) return { label: "Low Risk", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle };
    if (score < 65) return { label: "Medium Risk", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", icon: AlertTriangle };
    return { label: "High Risk", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", icon: ShieldAlert };
  };

  const riskDistribution = [
    { name: "Low", value: loans.filter(l => getRiskScore(l) < 35).length || 1, color: "hsl(145, 65%, 42%)" },
    { name: "Medium", value: loans.filter(l => getRiskScore(l) >= 35 && getRiskScore(l) < 65).length || 1, color: "hsl(38, 92%, 50%)" },
    { name: "High", value: loans.filter(l => getRiskScore(l) >= 65).length || 1, color: "hsl(0, 84%, 60%)" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl gradient-warm p-6 text-primary-foreground">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="h-7 w-7" />
          <h1 className="text-2xl font-bold">Business & Monetization Dashboard</h1>
        </div>
        <p className="text-primary-foreground/80 text-sm">Track revenue, conversions, and NBFC risk insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.users, icon: Users, gradient: "gradient-primary" },
          { label: "Loan Applications", value: stats.loanApps, icon: Banknote, gradient: "gradient-accent" },
          { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, gradient: "gradient-warm" },
          { label: "Est. Revenue", value: `₹${(estimatedRevenue / 100000).toFixed(1)}L`, icon: DollarSign, gradient: "gradient-primary" },
        ].map(kpi => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`h-10 w-10 rounded-xl ${kpi.gradient} flex items-center justify-center`}>
                <kpi.icon className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </Card>
        ))}
      </div>

      {/* Commission Slider */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Revenue Model</h3>
          <Badge variant="outline">Commission: {commission[0]}%</Badge>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Adjust commission rate (1-5%)</p>
            <Slider value={commission} onValueChange={setCommission} min={1} max={5} step={0.5} className="w-full" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold">₹{(stats.totalLoanAmt / 100000).toFixed(1)}L</p>
              <p className="text-xs text-muted-foreground">Total Loan Volume</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{commission[0]}%</p>
              <p className="text-xs text-muted-foreground">Commission Rate</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-primary">₹{(estimatedRevenue / 100000).toFixed(2)}L</p>
              <p className="text-xs text-muted-foreground">Estimated Revenue</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Trend */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip formatter={(v: number) => `₹${(v / 100000).toFixed(2)}L`} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Conversion Funnel */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={funnelData} layout="vertical">
              <XAxis type="number" axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} width={90} className="text-xs" />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* NBFC Risk Panel */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">NBFC Risk Insight Panel</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {loans.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No loan applications yet to assess risk.</p>
            ) : loans.slice(0, 5).map(loan => {
              const score = getRiskScore(loan);
              const risk = getRiskLabel(score);
              return (
                <div key={loan.id} className={`p-4 rounded-xl ${risk.bg} flex items-start gap-3`}>
                  <risk.icon className={`h-5 w-5 mt-0.5 ${risk.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{loan.bank_name} — ₹{(Number(loan.amount) / 100000).toFixed(1)}L</p>
                      <Badge variant="outline" className={risk.color}>{risk.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {score < 35 ? "Low default probability. Strong collateral and manageable loan size." :
                       score < 65 ? "Moderate risk. Consider additional documentation or co-applicant." :
                       "High exposure. Large loan amount with limited collateral backing."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            <p className="text-sm font-medium mb-3 text-center">Risk Distribution</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={4}>
                  {riskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3 mt-2">
              {riskDistribution.map(d => (
                <div key={d.name} className="flex items-center gap-1 text-xs">
                  <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BusinessDashboard;
