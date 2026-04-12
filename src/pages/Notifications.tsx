import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, GraduationCap, Banknote, FileText, Check, Trophy, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const typeIcons: Record<string, any> = {
  deadline: Calendar,
  recommendation: GraduationCap,
  loan: Banknote,
  info: Info,
  achievement: Trophy,
};

const typeColors: Record<string, string> = {
  deadline: "text-warning",
  recommendation: "text-primary",
  loan: "text-success",
  info: "text-info",
  achievement: "text-primary",
};

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setNotifs(data);
    setLoading(false);
  };

  useEffect(() => { fetchNotifs(); }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notif-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => fetchNotifs())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    fetchNotifs();
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

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

      {notifs.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground shadow-card">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No notifications yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifs.map((n) => {
            const Icon = typeIcons[n.type] || Info;
            return (
              <Card key={n.id} className={`p-4 shadow-card transition-all cursor-pointer hover:shadow-elevated ${!n.read ? "border-l-4 border-l-primary" : "opacity-70"}`}>
                <div className="flex gap-3">
                  <div className={`h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0 ${typeColors[n.type] || "text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{n.title}</h3>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
