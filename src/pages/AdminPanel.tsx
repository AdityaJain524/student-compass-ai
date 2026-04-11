import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, BarChart3, FileText, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const userGrowth = [
  { month: "Jan", users: 120 }, { month: "Feb", users: 180 }, { month: "Mar", users: 250 },
  { month: "Apr", users: 310 }, { month: "May", users: 420 }, { month: "Jun", users: 560 },
];

const engagementData = [
  { feature: "Career Nav", usage: 340 }, { feature: "Chatbot", usage: 520 },
  { feature: "Loan Calc", usage: 280 }, { feature: "App Tracker", usage: 190 },
  { feature: "ROI Calc", usage: 150 },
];

const recentUsers = [
  { name: "Priya Sharma", email: "priya@email.com", joined: "Apr 10, 2026", status: "active" },
  { name: "Rahul Verma", email: "rahul@email.com", joined: "Apr 9, 2026", status: "active" },
  { name: "Sarah Johnson", email: "sarah@email.com", joined: "Apr 8, 2026", status: "inactive" },
  { name: "Alex Chen", email: "alex@email.com", joined: "Apr 7, 2026", status: "active" },
];

const AdminPanel = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" /> Admin Panel
      </h1>
      <p className="text-muted-foreground text-sm mt-1">Platform overview and user management</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Users" value="560" change="+42 this month" changeType="positive" icon={Users} />
      <StatCard title="Active Sessions" value="128" change="Online now" changeType="neutral" icon={TrendingUp} gradient="gradient-accent" />
      <StatCard title="Applications" value="1,240" change="+180 this month" changeType="positive" icon={FileText} gradient="gradient-warm" />
      <StatCard title="Engagement Rate" value="73%" change="+5% vs last month" changeType="positive" icon={BarChart3} />
    </div>

    <Tabs defaultValue="analytics" className="space-y-4">
      <TabsList>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
      </TabsList>

      <TabsContent value="analytics" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5 shadow-card">
            <h3 className="font-semibold mb-4">User Growth</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={userGrowth}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="hsl(230, 80%, 56%)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5 shadow-card">
            <h3 className="font-semibold mb-4">Feature Usage</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={engagementData} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="feature" axisLine={false} tickLine={false} width={80} className="text-xs" />
                <Tooltip />
                <Bar dataKey="usage" fill="hsl(170, 70%, 42%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="users">
        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Joined</th>
                  <th className="text-left p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.email} className="border-t">
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4 text-muted-foreground">{u.joined}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      }`}>{u.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default AdminPanel;
