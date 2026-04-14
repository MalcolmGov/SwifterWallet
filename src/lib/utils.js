import { WALLETS, SPENDING, UPCOMING_BILLS, SAVINGS_GOALS } from "./data.js";

export const formatCurrency = (amount) =>
  `R${Math.abs(amount).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function fuzzyScore(query, target) {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  if (t === q) return 1.0;
  if (t.includes(q)) return 0.9;
  const qWords = q.split(/\s+/);
  const tWords = t.split(/\s+/);
  let hits = 0;
  for (const qw of qWords) {
    if (tWords.some((tw) => tw.startsWith(qw) || qw.startsWith(tw))) hits++;
  }
  return hits / Math.max(qWords.length, 1);
}

export const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const groupTransactionsByDate = (transactions) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups = {};
  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    d.setHours(0, 0, 0, 0);
    let label;
    if (d.getTime() === today.getTime()) label = "Today";
    else if (d.getTime() === yesterday.getTime()) label = "Yesterday";
    else if (d >= weekAgo) label = "Earlier this week";
    else label = d.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  });
  return groups;
};

export const computeWellnessScore = (walletsData) => {
  if (!walletsData) walletsData = WALLETS;
  // Metric 1: Savings allocation (0–25)
  const totalBal = walletsData.reduce((s, w) => s + w.balance, 0);
  const savingsWalletBal = walletsData.find((w) => w.type === "SAVINGS")?.balance || 0;
  const savingsPct = totalBal > 0 ? (savingsWalletBal / totalBal) * 100 : 0; // ~27%
  const s1 = Math.round(Math.min(25, Math.max(0, (savingsPct / 30) * 25)));  // target 30%

  // Metric 2: Spending discipline (0–25)
  const essentialSpend = SPENDING
    .filter((s) => ["Bills & Utilities", "Food & Dining"].includes(s.category))
    .reduce((a, s) => a + s.amount, 0);
  const totalSpend = SPENDING.reduce((a, s) => a + s.amount, 0);
  const ratio = totalSpend > 0 ? essentialSpend / totalSpend : 0.5; // ~55%
  const s2 = ratio >= 0.4 && ratio <= 0.65 ? 20 : ratio > 0.65 ? Math.round(20 - (ratio - 0.65) * 40) : Math.round((ratio / 0.4) * 20);

  // Metric 3: Bill timeliness (0–25)
  const today = new Date();
  const overdueCount = UPCOMING_BILLS.filter((b) => new Date(b.due) < today).length;
  const s3 = Math.max(0, 25 - overdueCount * 10); // all on time → 25

  // Metric 4: Balance trend (0–25)
  const s4 = 15; // +12.5% trend shown on dashboard

  const total = s1 + s2 + s3 + s4;
  const label = total >= 85 ? "Excellent" : total >= 70 ? "Good" : total >= 50 ? "Fair" : "Needs Attention";
  const color = total >= 85 ? "#10b981" : total >= 70 ? "#06b6d4" : total >= 50 ? "#f59e0b" : "#ef4444";
  const gradStart = total >= 85 ? "#10b981" : total >= 70 ? "#7c3aed" : total >= 50 ? "#f59e0b" : "#ef4444";
  const gradEnd = total >= 85 ? "#34d399" : total >= 70 ? "#06b6d4" : total >= 50 ? "#fbbf24" : "#f87171";

  return {
    score: total,
    label,
    color,
    gradStart,
    gradEnd,
    savingsPct: Math.round(savingsPct),
    breakdown: [
      { label: "Savings", score: s1, max: 25, color: "#10b981" },
      { label: "Spending", score: s2, max: 25, color: "#7c3aed" },
      { label: "Bills", score: s3, max: 25, color: "#06b6d4" },
      { label: "Trend", score: s4, max: 25, color: "#f59e0b" },
    ],
  };
};

export const computeInsights = (walletsData) => {
  if (!walletsData) walletsData = WALLETS;
  const totalBal = walletsData.reduce((s, w) => s + w.balance, 0);
  const savingsWalletBal = walletsData.find((w) => w.type === "SAVINGS")?.balance || 0;
  const savingsPct = Math.round((savingsWalletBal / totalBal) * 100);

  const refDate = new Date("2026-04-14");
  const nextBill = UPCOMING_BILLS
    .map((b) => ({ ...b, daysLeft: Math.ceil((new Date(b.due) - refDate) / 86400000) }))
    .filter((b) => b.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)[0];

  const holidayGoal = SAVINGS_GOALS.find((g) => g.name === "Holiday Fund");
  const holidayPct = holidayGoal ? Math.round((holidayGoal.saved / holidayGoal.target) * 100) : 0;
  const foodSpend = SPENDING.find((s) => s.category === "Food & Dining")?.amount || 0;

  return [
    {
      id: "food-spike",
      icon: "🍽️",
      title: "Food & Dining alert",
      body: `R${foodSpend.toLocaleString()} spent — 30% above your monthly average`,
      color: "#f59e0b",
      accent: "rgba(245,158,11,0.12)",
      type: "warning",
    },
    {
      id: "savings-rate",
      icon: "🏦",
      title: `Savings rate ${savingsPct}%`,
      body: `You're saving above the 20% recommended rate — keep it up!`,
      color: "#10b981",
      accent: "rgba(16,185,129,0.12)",
      type: "positive",
    },
    nextBill && {
      id: "next-bill",
      icon: nextBill.icon,
      title: `${nextBill.name} due ${nextBill.daysLeft <= 1 ? "tomorrow" : `in ${nextBill.daysLeft} days`}`,
      body: `R${nextBill.amount} — funds ready in your Main Wallet`,
      color: nextBill.accent,
      accent: `color-mix(in srgb, ${nextBill.accent} 15%, transparent)`,
      type: "info",
    },
    holidayGoal && {
      id: "holiday-goal",
      icon: holidayGoal.icon,
      title: `Holiday Fund ${holidayPct}% complete`,
      body: `On track to hit R${(holidayGoal.target / 1000).toFixed(0)}k by August`,
      color: "#06b6d4",
      accent: "rgba(6,182,212,0.12)",
      type: "positive",
    },
  ].filter(Boolean);
};
