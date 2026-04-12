import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Calendar, ExternalLink, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Application {
  id: string;
  university_name: string;
  course: string;
  status: string;
  deadline: string | null;
  notes: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning/10 text-warning border-warning/20" },
  accepted: { label: "Accepted", className: "bg-success/10 text-success border-success/20" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20" },
  waitlisted: { label: "Waitlisted", className: "bg-info/10 text-info border-info/20" },
};

const Applications = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [newUni, setNewUni] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchApps = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setApps(data);
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, [user]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("apps-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications", filter: `user_id=eq.${user.id}` }, () => fetchApps())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const addApp = async () => {
    if (!user || !newUni.trim()) return;
    const { error } = await supabase.from("applications").insert({
      user_id: user.id,
      university_name: newUni,
      course: newCourse,
      deadline: newDeadline || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Application added!");
    setNewUni(""); setNewCourse(""); setNewDeadline("");
    setDialogOpen(false);
  };

  const deleteApp = async (id: string) => {
    await supabase.from("applications").delete().eq("id", id);
    toast.success("Deleted");
    fetchApps();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("applications").update({ status }).eq("id", id);
    fetchApps();
  };

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Application Tracker
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{apps.length} applications tracked</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Application</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>University *</Label><Input value={newUni} onChange={(e) => setNewUni(e.target.value)} placeholder="e.g., MIT" /></div>
              <div className="space-y-2"><Label>Course</Label><Input value={newCourse} onChange={(e) => setNewCourse(e.target.value)} placeholder="e.g., MS Computer Science" /></div>
              <div className="space-y-2"><Label>Deadline</Label><Input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} /></div>
              <Button onClick={addApp} className="w-full gradient-primary border-0 text-primary-foreground">Save Application</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "waitlisted", "accepted", "rejected"].map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">{f}</Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground shadow-card">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No applications yet. Add your first one!</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((app) => (
            <Card key={app.id} className="p-4 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{app.university_name}</h3>
                    <Badge variant="outline" className={statusConfig[app.status]?.className || ""}>
                      {statusConfig[app.status]?.label || app.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{app.course}</p>
                  {app.deadline && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />Deadline: {app.deadline}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="waitlisted">Waitlisted</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => deleteApp(app.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
