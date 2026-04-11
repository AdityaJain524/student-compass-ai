import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Calendar, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface Application {
  id: number;
  university: string;
  course: string;
  country: string;
  status: "pending" | "accepted" | "rejected" | "interview";
  deadline: string;
  progress: number;
  flag: string;
}

const initialApps: Application[] = [
  { id: 1, university: "MIT", course: "MS Computer Science", country: "USA", status: "pending", deadline: "2026-06-15", progress: 60, flag: "🇺🇸" },
  { id: 2, university: "Stanford", course: "MBA", country: "USA", status: "accepted", deadline: "2026-05-01", progress: 100, flag: "🇺🇸" },
  { id: 3, university: "Oxford", course: "MS Data Science", country: "UK", status: "interview", deadline: "2026-07-01", progress: 75, flag: "🇬🇧" },
  { id: 4, university: "TU Munich", course: "MS Informatics", country: "Germany", status: "pending", deadline: "2026-08-15", progress: 40, flag: "🇩🇪" },
  { id: 5, university: "McGill", course: "MS AI", country: "Canada", status: "rejected", deadline: "2026-04-01", progress: 100, flag: "🇨🇦" },
];

const statusConfig = {
  pending: { label: "Pending", className: "bg-warning/10 text-warning border-warning/20" },
  accepted: { label: "Accepted", className: "bg-success/10 text-success border-success/20" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20" },
  interview: { label: "Interview", className: "bg-info/10 text-info border-info/20" },
};

const Applications = () => {
  const [apps] = useState<Application[]>(initialApps);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Application Tracker
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{apps.length} applications tracked</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Application</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>University</Label><Input placeholder="e.g., MIT" /></div>
              <div className="space-y-2"><Label>Course</Label><Input placeholder="e.g., MS Computer Science" /></div>
              <div className="space-y-2"><Label>Deadline</Label><Input type="date" /></div>
              <Button className="w-full gradient-primary border-0 text-primary-foreground">Save Application</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "interview", "accepted", "rejected"].map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">
            {f}
          </Button>
        ))}
      </div>

      {/* List */}
      <div className="grid gap-3">
        {filtered.map((app) => (
          <Card key={app.id} className="p-4 shadow-card hover:shadow-elevated transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-3xl">{app.flag}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{app.university}</h3>
                  <Badge variant="outline" className={statusConfig[app.status].className}>
                    {statusConfig[app.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{app.course}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Deadline: {app.deadline}</span>
                </div>
                <Progress value={app.progress} className="h-1.5 mt-2 max-w-xs" />
              </div>
              <Button size="sm" variant="ghost"><ExternalLink className="h-4 w-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Applications;
