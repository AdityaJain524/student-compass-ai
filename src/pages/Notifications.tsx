import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, GraduationCap, Banknote, FileText, Check } from "lucide-react";
import { useState } from "react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "deadline" | "recommendation" | "loan" | "application";
  time: string;
  read: boolean;
}

const initialNotifs: Notification[] = [
  { id: 1, title: "Application Deadline", message: "MIT application deadline is in 5 days", type: "deadline", time: "2 hours ago", read: false },
  { id: 2, title: "New Recommendation", message: "Based on your profile, check out ETH Zurich's MS program", type: "recommendation", time: "5 hours ago", read: false },
  { id: 3, title: "Loan Update", message: "Your SBI Scholar Loan pre-approval is ready", type: "loan", time: "1 day ago", read: false },
  { id: 4, title: "Application Update", message: "Oxford has moved your application to interview stage", type: "application", time: "2 days ago", read: true },
  { id: 5, title: "Deadline Reminder", message: "TU Munich application due in 2 weeks", type: "deadline", time: "3 days ago", read: true },
];

const typeIcons = {
  deadline: Calendar,
  recommendation: GraduationCap,
  loan: Banknote,
  application: FileText,
};

const typeColors = {
  deadline: "text-warning",
  recommendation: "text-primary",
  loan: "text-success",
  application: "text-info",
};

const Notifications = () => {
  const [notifs, setNotifs] = useState(initialNotifs);
  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs(notifs.map((n) => ({ ...n, read: true })));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Notifications
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{unread} unread notifications</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="mr-1 h-3 w-3" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifs.map((n) => {
          const Icon = typeIcons[n.type];
          return (
            <Card key={n.id} className={`p-4 shadow-card transition-all cursor-pointer hover:shadow-elevated ${!n.read ? "border-l-4 border-l-primary" : "opacity-70"}`}>
              <div className="flex gap-3">
                <div className={`h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0 ${typeColors[n.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{n.title}</h3>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
