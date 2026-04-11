import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useGamification } from "@/stores/gamificationStore";
import { Trophy, Star, Flame, Gift, Zap, Medal, ArrowRight, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Gamification = () => {
  const { points, level, streak, badges, recentActions, addPoints, earnBadge } = useGamification();
  const [copied, setCopied] = useState(false);

  const nextLevelPoints = level * 100;
  const progress = ((points % 100) / 100) * 100;
  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  const handleReferral = () => {
    navigator.clipboard.writeText("https://unipath.app/invite/JOHN2026");
    setCopied(true);
    addPoints(50, "Shared referral link");
    earnBadge("referral");
    toast.success("Referral link copied! +50 points 🎉");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" /> Rewards & Progress
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Earn points and badges as you explore your study abroad journey.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 shadow-card text-center">
          <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
            <Star className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-3xl font-bold">{points}</p>
          <p className="text-sm text-muted-foreground">Total Points</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Level {level}</span>
              <span>Level {level + 1}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{nextLevelPoints - points} pts to next level</p>
          </div>
        </Card>

        <Card className="p-5 shadow-card text-center">
          <div className="h-12 w-12 rounded-xl gradient-warm flex items-center justify-center mx-auto mb-3">
            <Flame className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-3xl font-bold">{streak} days</p>
          <p className="text-sm text-muted-foreground">Login Streak</p>
          <p className="text-xs text-muted-foreground mt-2">Keep it up! 🔥</p>
        </Card>

        <Card className="p-5 shadow-card text-center">
          <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-3">
            <Medal className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-3xl font-bold">{earnedBadges.length}/{badges.length}</p>
          <p className="text-sm text-muted-foreground">Badges Earned</p>
          <p className="text-xs text-muted-foreground mt-2">{lockedBadges.length} more to unlock</p>
        </Card>
      </div>

      {/* Referral Card */}
      <Card className="p-5 shadow-card gradient-primary text-primary-foreground">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold flex items-center gap-2"><Gift className="h-5 w-5" /> Refer a Friend</h3>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Share UniPath and earn 50 points for each friend who signs up!
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleReferral} className="shrink-0">
            {copied ? <><CheckCircle className="mr-1 h-4 w-4" /> Copied!</> : <><Copy className="mr-1 h-4 w-4" /> Copy Referral Link</>}
          </Button>
        </div>
      </Card>

      {/* Badges */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">🏅 Your Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {badges.map((badge) => (
            <Card
              key={badge.id}
              className={`p-4 text-center shadow-card transition-all ${
                badge.earned
                  ? "hover:shadow-elevated"
                  : "opacity-40 grayscale"
              }`}
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <p className="text-sm font-semibold">{badge.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{badge.description}</p>
              {badge.earned && badge.earnedAt && (
                <Badge variant="secondary" className="text-[10px] mt-2">
                  Earned {badge.earnedAt}
                </Badge>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="p-5 shadow-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-warning" /> Recent Activity
        </h3>
        <div className="space-y-2">
          {recentActions.map((action, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center text-success text-xs font-bold">
                  +{action.points}
                </div>
                <div>
                  <p className="text-sm font-medium">{action.action}</p>
                  <p className="text-xs text-muted-foreground">{action.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Gamification;
