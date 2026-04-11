import { create } from "zustand";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

interface GamificationState {
  points: number;
  level: number;
  streak: number;
  badges: Badge[];
  recentActions: { action: string; points: number; time: string }[];
  addPoints: (amount: number, action: string) => void;
  earnBadge: (badgeId: string) => void;
}

const initialBadges: Badge[] = [
  { id: "first-search", name: "Explorer", description: "Searched for universities for the first time", icon: "🔍", earned: false },
  { id: "first-chat", name: "Curious Mind", description: "Had your first AI mentor conversation", icon: "💬", earned: false },
  { id: "five-apps", name: "Go-Getter", description: "Tracked 5 applications", icon: "📋", earned: false },
  { id: "loan-check", name: "Financial Planner", description: "Checked loan eligibility", icon: "💰", earned: false },
  { id: "roi-calc", name: "Smart Investor", description: "Used the ROI calculator", icon: "📊", earned: false },
  { id: "profile-complete", name: "All Set", description: "Completed your profile", icon: "✅", earned: false },
  { id: "streak-3", name: "Consistent", description: "3-day login streak", icon: "🔥", earned: false },
  { id: "streak-7", name: "Dedicated", description: "7-day login streak", icon: "⭐", earned: false },
  { id: "admission-check", name: "Strategist", description: "Used admission predictor", icon: "🎯", earned: false },
  { id: "referral", name: "Connector", description: "Referred a friend", icon: "🤝", earned: false },
];

const getLevel = (points: number) => Math.floor(points / 100) + 1;

export const useGamification = create<GamificationState>((set) => ({
  points: 150,
  level: 2,
  streak: 3,
  badges: initialBadges.map((b, i) => i < 3 ? { ...b, earned: true, earnedAt: "2026-04-10" } : b),
  recentActions: [
    { action: "Searched universities", points: 10, time: "2 hours ago" },
    { action: "Used AI Mentor", points: 15, time: "5 hours ago" },
    { action: "Checked loan eligibility", points: 20, time: "1 day ago" },
  ],
  addPoints: (amount, action) =>
    set((state) => {
      const newPoints = state.points + amount;
      return {
        points: newPoints,
        level: getLevel(newPoints),
        recentActions: [
          { action, points: amount, time: "Just now" },
          ...state.recentActions.slice(0, 9),
        ],
      };
    }),
  earnBadge: (badgeId) =>
    set((state) => ({
      badges: state.badges.map((b) =>
        b.id === badgeId ? { ...b, earned: true, earnedAt: new Date().toISOString().split("T")[0] } : b
      ),
    })),
}));
