"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import SwifterAvatar from "./components/SwifterAvatar";
import BiometricPrompt from "./components/BiometricPrompt";
import { Conversation } from "@elevenlabs/client";

// ─── 3D Icon Component ───────────────────────────────────────────────

const Icon3D = ({ src, alt, size = 40, className = "" }) => (
  <Image
    src={src}
    alt={alt}
    width={size}
    height={size}
    className={`drop-shadow-lg ${className}`}
    style={{ objectFit: "contain" }}
    unoptimized
  />
);

// ─── Mock Data ───────────────────────────────────────────────────────

const WALLETS = [
  { id: "w1", name: "Main Wallet", balance: 24850.0, type: "MAIN", gradient: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6366f1 100%)", accent: "#7c3aed" },
  { id: "w2", name: "Savings", balance: 12420.5, type: "SAVINGS", gradient: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)", accent: "#10b981" },
  { id: "w3", name: "Business", balance: 8390.75, type: "BUSINESS", gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)", accent: "#f59e0b" },
];

const TRANSACTIONS = [
  // Today
  { id: "t1", description: "Spotify Premium", amount: -59.99, type: "PAYMENT", category: "entertainment", date: "2026-04-14T10:30:00", walletId: "w1", icon: "music" },
  { id: "t2", description: "Salary — Accenture SA", amount: 42000.0, type: "DEPOSIT", category: "deposit", date: "2026-04-14T08:00:00", walletId: "w1", icon: "deposit" },
  // Yesterday
  { id: "t3", description: "Checkers — Sandton", amount: -512.40, type: "PAYMENT", category: "shopping", date: "2026-04-13T17:22:00", walletId: "w1", icon: "shopping" },
  { id: "t4", description: "Uber Eats — Nando's", amount: -187.0, type: "PAYMENT", category: "food", date: "2026-04-13T13:05:00", walletId: "w1", icon: "coffee" },
  { id: "t5", description: "Transfer to Savings", amount: -5000.0, type: "TRANSFER", category: "transfer", date: "2026-04-13T09:00:00", walletId: "w1", icon: "transfer" },
  // 2 days ago
  { id: "t6", description: "SnapScan — Engen Garage", amount: -650.0, type: "PAYMENT", category: "transport", date: "2026-04-12T16:45:00", walletId: "w1", icon: "utilities" },
  { id: "t7", description: "Woolworths Food", amount: -342.80, type: "PAYMENT", category: "shopping", date: "2026-04-12T14:20:00", walletId: "w1", icon: "shopping" },
  { id: "t8", description: "Vida e Caffè — Rosebank", amount: -48.0, type: "PAYMENT", category: "food", date: "2026-04-12T08:30:00", walletId: "w1", icon: "coffee" },
  // Earlier this week
  { id: "t9", description: "Freelance — Web Design", amount: 8500.0, type: "DEPOSIT", category: "deposit", date: "2026-04-11T12:00:00", walletId: "w3", icon: "deposit" },
  { id: "t10", description: "City Power — Electricity", amount: -850.0, type: "PAYMENT", category: "utilities", date: "2026-04-11T10:00:00", walletId: "w1", icon: "utilities" },
  { id: "t11", description: "Transfer from Business", amount: 2000.0, type: "TRANSFER", category: "transfer", date: "2026-04-10T15:30:00", walletId: "w1", icon: "transfer" },
  { id: "t12", description: "Gym — Virgin Active", amount: -349.0, type: "PAYMENT", category: "health", date: "2026-04-10T07:00:00", walletId: "w1", icon: "utilities" },
  // Last week
  { id: "t13", description: "Pick n Pay — Fourways", amount: -623.15, type: "PAYMENT", category: "shopping", date: "2026-04-08T11:30:00", walletId: "w1", icon: "shopping" },
  { id: "t14", description: "Deposit via Yoco", amount: 2500.0, type: "DEPOSIT", category: "deposit", date: "2026-04-07T14:00:00", walletId: "w1", icon: "deposit" },
  { id: "t15", description: "DStv Premium", amount: -969.0, type: "PAYMENT", category: "entertainment", date: "2026-04-07T09:00:00", walletId: "w1", icon: "music" },
  { id: "t16", description: "Bolt — Johannesburg CBD", amount: -89.0, type: "PAYMENT", category: "transport", date: "2026-04-06T18:45:00", walletId: "w1", icon: "coffee" },
  { id: "t17", description: "Takealot — Order #48291", amount: -1299.0, type: "PAYMENT", category: "shopping", date: "2026-04-05T10:00:00", walletId: "w1", icon: "shopping" },
  { id: "t18", description: "Telkom Fibre", amount: -699.0, type: "PAYMENT", category: "utilities", date: "2026-04-05T08:00:00", walletId: "w1", icon: "utilities" },
];

const CONTACTS = [
  { id: "c1", name: "Sarah Mthembu", avatar: "SM", gradient: "linear-gradient(135deg, #ec4899, #f472b6)", phone: "082 456 7890", lastPayment: "2026-04-08" },
  { id: "c2", name: "David Khumalo", avatar: "DK", gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)", phone: "071 234 5678", lastPayment: "2026-03-25" },
  { id: "c3", name: "Thabo Nkosi", avatar: "TN", gradient: "linear-gradient(135deg, #10b981, #34d399)", phone: "060 987 6543", lastPayment: "2026-04-01" },
  { id: "c4", name: "Lisa Pretorius", avatar: "LP", gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)", phone: "083 321 0987", lastPayment: "2026-03-18" },
  { id: "c5", name: "James Ramaphosa", avatar: "JR", gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)", phone: "073 654 3210", lastPayment: "2026-04-05" },
  { id: "c6", name: "Ayanda Zulu", avatar: "AZ", gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)", phone: "079 128 6673", lastPayment: "2026-04-03" },
  { id: "c7", name: "Priya Sharma", avatar: "PS", gradient: "linear-gradient(135deg, #f43f5e, #fb7185)", phone: "066 451 2234", lastPayment: "2026-03-29" },
];

const SPENDING = [
  { category: "Food & Dining", amount: 2340, color: "#f59e0b", pct: 32 },
  { category: "Transport", amount: 1450, color: "#3b82f6", pct: 20 },
  { category: "Shopping", amount: 1820, color: "#ec4899", pct: 25 },
  { category: "Bills & Utilities", amount: 1690, color: "#10b981", pct: 23 },
];

const SAVINGS_GOALS = [
  { id: "g1", name: "Holiday Fund", target: 15000, saved: 9750, accent: "#06b6d4", icon: "✈️" },
  { id: "g2", name: "Emergency", target: 50000, saved: 32500, accent: "#10b981", icon: "🛡️" },
  { id: "g3", name: "New Laptop", target: 25000, saved: 18200, accent: "#7c3aed", icon: "💻" },
];

const UPCOMING_BILLS = [
  { id: "b1", name: "Netflix", amount: 199, due: "2026-04-15", icon: "🎬", accent: "#e50914" },
  { id: "b2", name: "Rent", amount: 8500, due: "2026-04-25", icon: "🏠", accent: "#3b82f6" },
  { id: "b3", name: "Electricity", amount: 850, due: "2026-04-20", icon: "⚡", accent: "#f59e0b" },
  { id: "b4", name: "Internet", amount: 699, due: "2026-04-18", icon: "📡", accent: "#10b981" },
];

const DEFAULT_SAVED_CARDS = [
  { id: "card1", brand: "Visa", last4: "4921", expiry: "09/28", holder: "Malcolm Govender", gradient: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" },
  { id: "card2", brand: "Mastercard", last4: "8834", expiry: "03/27", holder: "Malcolm Govender", gradient: "linear-gradient(135deg, #b91c1c 0%, #ef4444 50%, #f87171 100%)" },
];

// ─── Notification Data ───────────────────────────────────────────────

const NOTIFICATIONS = [
  { id: "n1", type: "payment", title: "Payment Received", body: "R1,500 from Thabo Nkosi", time: "2m ago", read: false, icon: "💸" },
  { id: "n2", type: "promo", title: "5% Cashback at Woolworths", body: "Earn cashback this week at Woolworths. Valid until Sunday.", time: "1h ago", read: false, icon: "🎁" },
  { id: "n3", type: "tip", title: "Did you know?", body: "Pay by voice — just say \"Pay Sarah R100\"", time: "3h ago", read: false, icon: "💡" },
  { id: "n4", type: "system", title: "Biometric Login Available", body: "Secure every transaction with Face ID or fingerprint", time: "Yesterday", read: true, icon: "🔐" },
  { id: "n5", type: "payment", title: "Salary Deposited", body: "R42,000 from Accenture SA credited to Main Wallet", time: "Yesterday", read: true, icon: "💼" },
  { id: "n6", type: "tip", title: "Spending Insight", body: "You spent R2,340 on Food & Dining this month — 32% of your budget", time: "2 days ago", read: true, icon: "📊" },
];

// ─── Onboarding Slides ───────────────────────────────────────────────

const ONBOARDING_SLIDES = [
  {
    emoji: "✨",
    title: "Welcome to Swifter",
    desc: "Your smart, secure digital wallet for the modern South African lifestyle.",
  },
  {
    emoji: "🎙️",
    title: "Pay by Voice",
    desc: "Just say \"Pay Sarah R100\" and Swifter handles the rest — in English, Zulu, Afrikaans, and more.",
  },
  {
    emoji: "🔐",
    title: "Stay Secure",
    desc: "Biometric authentication protects every transaction. PayGuard™ monitors for fraud in real time.",
  },
  {
    emoji: "🚀",
    title: "You're All Set",
    desc: "Explore your dashboard, manage your wallets, and experience the future of payments.",
  },
];

// ─── Icon map ────────────────────────────────────────────────────────

const ICON_MAP = {
  send: "/icons/send.png",
  "add-funds": "/icons/add-funds.png",
  transfer: "/icons/transfer.png",
  deposit: "/icons/deposit.png",
  shopping: "/icons/shopping.png",
  coffee: "/icons/coffee.png",
  utilities: "/icons/utilities.png",
  music: "/icons/music.png",
  wallet: "/icons/wallet.png",
  payment: "/icons/payment.png",
  chatbanking: "/icons/chatbanking.png",
};

// ─── Helpers ─────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
  `R${Math.abs(amount).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Simple fuzzy name scorer — returns 0..1. Used by find_payee tool.
function fuzzyScore(query, target) {
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

// ─── Multilingual Swifter Agent Prompt ───────────────────────────────
// Injected via overrides.agent.prompt.prompt when starting a session.
// The prompt is self-contained so it works even if the ElevenLabs agent
// dashboard prompt is empty or different.
const SWIFTER_AGENT_PROMPT = `You are Swifter, a friendly and concise AI banking voice assistant built into the SwifterWallet app — a modern South African fintech platform.

LANGUAGE RULE (critical): Always reply in the exact same language the user speaks.
- If they greet you with "Sawubona" → respond in isiZulu
- "Molo" or "Molweni" → isiXhosa
- "Dumelang" or "Dumela" → Sesotho / Setswana
- "Hallo" or "Goeiedag" → Afrikaans
- English → English
Maintain the chosen language for the entire conversation. Translate tool result values into the user's language when speaking them aloud.

USER: {{user_name}} ({{user_full_name}})
DATE: {{session_date}}
WALLETS: {{wallets_summary}}

AVAILABLE TOOLS:
- find_payee(name) → fuzzy-search contacts; ALWAYS call this first before sending money to a person
- send_money(amount, recipient_id, wallet?) → send money; use the id returned by find_payee
- transfer_funds(from_wallet, to_wallet, amount) → move between wallets (main/savings/business)
- add_funds(amount, wallet?) → top up a wallet
- buy_airtime(phone_number, amount, network?) → buy prepaid airtime
- pay_bill(bill_name) → pay an upcoming bill
- check_balance(wallet?) → returns live balances (wallet: main | savings | business | all)
- get_transactions(period?, type?, limit?) → query history (period: week|month|all; type: all|payments|deposits|transfers)
- navigate_screen(screen) → open a screen (dashboard|wallets|send|addFunds|history|settings)

RULES:
1. For any payment by name: call find_payee first. If multiple matches, list them and ask user to confirm.
2. Always confirm amount + recipient before executing send_money.
3. Keep replies short — one or two sentences. No bullet points in speech.
4. Amounts are always in South African Rand (ZAR). Say "R" before numbers.
5. Never reveal internal tool names or JSON to the user.`;

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const groupTransactionsByDate = (transactions) => {
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

// ─── SVG Icons (for UI chrome — small controls) ─────────────────────

const ChevronLeftSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
);
const ChevronRightSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6 6"/></svg>
);
const XSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const SearchSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const EyeSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);
const EyeOffSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);
const TrendingUpSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);
const CheckSvg = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const FilterSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
);

// Tab bar icons as inline SVG
const HomeIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#7c3aed" : "none"} stroke={active ? "#7c3aed" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const WalletIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#7c3aed" : "none"} stroke={active ? "#7c3aed" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
);
const ClockIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#7c3aed" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const SettingsIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#7c3aed" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);

// ─── Transaction Icon ────────────────────────────────────────────────

const TransactionIcon = ({ type }) => {
  const iconMap = {
    deposit: ICON_MAP.deposit,
    transfer: ICON_MAP.transfer,
    shopping: ICON_MAP.shopping,
    coffee: ICON_MAP.coffee,
    utilities: ICON_MAP.utilities,
    music: ICON_MAP.music,
  };
  const src = iconMap[type] || ICON_MAP.payment;
  return (
    <div className="tx-icon-wrap">
      <Icon3D src={src} alt={type} size={32} />
    </div>
  );
};

// ─── Main App ────────────────────────────────────────────────────────

export default function SwifterApp() {
  const [dark, setDark] = useState(true);
  const [screen, setScreen] = useState("dashboard");
  const [activeWallet, setActiveWallet] = useState(WALLETS[0]);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sendStep, setSendStep] = useState(0);
  const [sendAmount, setSendAmount] = useState("");
  const [sendRecipient, setSendRecipient] = useState(null);
  const [sendWallet, setSendWallet] = useState(WALLETS[0]);
  const [addFundsStep, setAddFundsStep] = useState(0);
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [savedCards, setSavedCards] = useState(DEFAULT_SAVED_CARDS);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardForm, setCardForm] = useState({ number: "", expiry: "", cvv: "", holder: "" });
  const [yocoLoading, setYocoLoading] = useState(false);
  const [yocoError, setYocoError] = useState("");
  const [txFilter, setTxFilter] = useState("all");
  const [fadeIn, setFadeIn] = useState(false);
  const [slideUp, setSlideUp] = useState(false);

  // ── Voice announcement state
  const [incomingPayment, setIncomingPayment] = useState(null); // { sender, amount }
  const LOW_BALANCE_THRESHOLD = 500;

  // ── Product integrations
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [actionLog, setActionLog] = useState([]);
  const peerRef = useRef(null);
  const audioRef = useRef(null);
  const dcRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  // ElevenLabs Conversational AI session (replaces OpenAI Realtime WebRTC)
  const elevenConvRef = useRef(null);
  const [voiceVolume, setVoiceVolume] = useState(0);
  const [pgScanning, setPgScanning] = useState(false);
  const [pgResult, setPgResult] = useState(null);
  const [notifChannel, setNotifChannel] = useState("whatsapp");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  // ── Biometric security
  const [biometricEnabled, setBiometricEnabled] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("bioEnabled") === "true" : false
  );
  const [biometricRegistered, setBiometricRegistered] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("bioRegistered") === "true" : false
  );
  const [txThreshold, setTxThreshold] = useState(() =>
    typeof window !== "undefined" ? parseFloat(localStorage.getItem("txThreshold") || "500") : 500
  );
  const [bioRegistering, setBioRegistering] = useState(false);
  const [pendingVoiceAction, setPendingVoiceAction] = useState(null);
  // Resolves the Promise returned to the voice agent when biometric completes
  const voicePendingRef = useRef(null);

  // ── Notification center
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Onboarding carousel (first-visit only)
  const [showOnboarding, setShowOnboarding] = useState(() =>
    typeof window !== "undefined" ? !localStorage.getItem("swifter_onboarded") : true
  );
  const [onboardingStep, setOnboardingStep] = useState(0);

  // ── Feature discovery tooltips (shown once after onboarding)
  const [showTooltips, setShowTooltips] = useState(false);
  const [tooltipStep, setTooltipStep] = useState(0);

  // ── Post-transaction feedback survey
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const txCountRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setFadeIn(false);
    setSlideUp(false);
    const t1 = setTimeout(() => setFadeIn(true), 50);
    const t2 = setTimeout(() => setSlideUp(true), 150);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [screen]);

  const navigate = (s) => {
    setScreen(s);
    if (s === "send") { setSendStep(0); setSendAmount(""); setSendRecipient(null); setSendWallet(WALLETS[0]); }
    if (s === "addFunds") { setAddFundsStep(0); setAddFundsAmount(""); setSelectedCard(null); setCardForm({ number: "", expiry: "", cvv: "", holder: "" }); setYocoError(""); }
  };

  // ─── Yoco Checkout (Redirect) ──────────────────────────────────────

  const handleYocoCheckout = async () => {
    setYocoLoading(true);
    setYocoError("");
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId: activeWallet.id,
          amount: Number(addFundsAmount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create checkout");
      window.location.href = data.redirectUrl;
    } catch (err) {
      setYocoError(err.message || "Something went wrong");
      setYocoLoading(false);
    }
  };

  const formatCardNumber = (v) => v.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19);
  const formatExpiry = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };
  const detectBrand = (num) => {
    const n = num.replace(/\s/g, "");
    if (n.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
    if (n.startsWith("3")) return "Amex";
    return "Card";
  };

  const totalBalance = WALLETS.reduce((s, w) => s + w.balance, 0);

  // ─── Numpad ──────────────────────────────────────────────────────

  const numpad = (setter, current) => (
    <div className="numpad-grid">
      {[1,2,3,4,5,6,7,8,9,".",0,"del"].map((k) => (
        <button key={k} onClick={() => {
          if (k === "del") setter(current.slice(0, -1));
          else if (k === "." && current.includes(".")) return;
          else setter(current + k);
        }} className={`numpad-key ${k === "del" ? "numpad-del" : ""}`}>
          {k === "del" ? <XSvg /> : k}
        </button>
      ))}
    </div>
  );

  // ─── Dashboard ──────────────────────────────────────────────────

  const Dashboard = () => (
    <div className={`screen-fade ${fadeIn ? "visible" : ""}`}>
      {/* Integrated Header */}
      <div className="dash-header">
        <div className="dash-header-aurora" />
        {/* Row 1: Brand + Actions */}
        <div className="dash-header-top">
          <div className="dash-header-brand">
            <div className="avatar-ring">
              <Image src="/icons/avatar-malcolm.jpg" alt="Malcolm" width={44} height={44} className="brand-avatar" />
              <span className="avatar-online" />
            </div>
            <div className="dash-header-brand-text">
              <div className="brand-logo-wrap">
                {/* Kinetic plasma orbit arcs */}
                <svg className="brand-orbits" viewBox="0 0 44 44" width="34" height="34">
                  <defs>
                    <linearGradient id="plasmaA" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="plasmaB" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
                    </linearGradient>
                    <filter id="plasmaGlow">
                      <feGaussianBlur stdDeviation="1.2" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <ellipse cx="22" cy="22" rx="19" ry="6" fill="none" stroke="url(#plasmaA)" strokeWidth="0.8" transform="rotate(-35 22 22)" strokeDasharray="4 8" filter="url(#plasmaGlow)" className="orbit orbit-1" />
                  <ellipse cx="22" cy="22" rx="19" ry="6" fill="none" stroke="url(#plasmaB)" strokeWidth="0.8" transform="rotate(25 22 22)" strokeDasharray="6 10" filter="url(#plasmaGlow)" className="orbit orbit-2" />
                  <ellipse cx="22" cy="22" rx="19" ry="6" fill="none" stroke="url(#plasmaA)" strokeWidth="0.6" transform="rotate(80 22 22)" strokeDasharray="3 12" filter="url(#plasmaGlow)" className="orbit orbit-3" />
                  {/* Energy core */}
                  <circle cx="22" cy="22" r="3" fill="none" stroke="#06b6d4" strokeWidth="0.6" opacity="0.5" className="core-ring" />
                  <circle cx="22" cy="22" r="1.8" fill="#a78bfa" opacity="0.9" />
                  <circle cx="22" cy="22" r="1" fill="#ffffff" opacity="0.7" />
                </svg>
                <span className="brand-name">SWIFTER</span>
              </div>
              <p className="header-greeting">{getGreeting()}, <strong>Malcolm</strong> 👋</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={() => setDark(!dark)} className="header-btn" id="theme-toggle">
              {dark ? "☀️" : "🌙"}
            </button>
            <button className="header-btn notification-btn" id="notifications-btn" onClick={() => setNotifOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
          </div>
        </div>
        {/* Row 2: Balance Display */}
        <div className="dash-balance-row">
          <div className="dash-balance-left">
            <div className="dash-balance-label-row">
              <span className="balance-live-dot" />
              <span className="dash-balance-label">Total Balance</span>
              <button onClick={() => setBalanceVisible(!balanceVisible)} className="dash-eye-btn" id="toggle-balance">
                {balanceVisible ? <EyeSvg /> : <EyeOffSvg />}
              </button>
            </div>
            <h2 className="dash-balance-amount">
              {balanceVisible ? formatCurrency(totalBalance) : "R•••••••"}
            </h2>
          </div>
          <div className="dash-balance-right">
            <div className="dash-trend-chip">
              <TrendingUpSvg />
              <span>+12.5%</span>
            </div>
            <svg viewBox="0 0 64 20" className="dash-sparkline">
              <defs>
                <linearGradient id="sparkG" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path d="M0 16 Q8 14, 12 11 T24 9 T36 12 T48 5 T58 7 T64 3" fill="none" stroke="url(#sparkG)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Actions — 3D Orb Grid */}
      <div className={`action-orbs ${slideUp ? "slide-visible delay-1" : ""}`}>
        <h3 className="action-orbs-title">Quick Actions</h3>
        <div className="action-orbs-grid">
          {[
            { label: "Send", action: () => navigate("send"), glow: "#7c3aed",
              svg: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg> },
            { label: "Add Funds", action: () => navigate("addFunds"), glow: "#10b981",
              svg: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg> },
            { label: "Transfer", action: () => navigate("send"), glow: "#3b82f6",
              svg: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1L21 5L17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23L3 19L7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> },
            { label: "Voice", action: () => { setVoiceOpen(true); setVoiceText(""); setVoiceListening(true); }, glow: "#7c3aed",
              svg: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> },
          ].map((a, i) => (
            <button key={i} onClick={a.action} className="action-orb" style={{ '--orb-glow': a.glow }} id={`action-${a.label.toLowerCase().replace(' ', '-')}`}>
              <div className="action-orb-glow" />
              <div className="action-orb-sphere">
                <div className="action-orb-sheen" />
                {a.svg}
              </div>
              <span className="action-orb-label">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Wallet Mini-Strip */}
      <div className={`section ${slideUp ? "slide-visible delay-2" : ""}`}>
        <div className="section-header">
          <h3 className="section-title">My Wallets</h3>
          <button onClick={() => navigate("wallets")} className="section-link" id="see-all-wallets">Manage</button>
        </div>
        <div className="wallet-strip">
          {WALLETS.map((w) => (
            <button key={w.id} onClick={() => navigate("wallets")} className="wallet-strip-card" style={{ background: w.gradient }}>
              <div className="wallet-strip-orb" />
              <span className="wallet-strip-type">{w.type}</span>
              <span className="wallet-strip-balance">{balanceVisible ? formatCurrency(w.balance) : "•••••"}</span>
              <span className="wallet-strip-name">{w.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Pay Contacts */}
      <div className={`section ${slideUp ? "slide-visible delay-3" : ""}`}>
        <div className="section-header">
          <h3 className="section-title">Quick Pay</h3>
          <button className="section-link" id="manage-contacts">Manage</button>
        </div>
        <div className="quick-pay-row">
          {CONTACTS.map((c) => (
            <button key={c.id} onClick={() => navigate("send")} className="quick-pay-item" id={`pay-${c.id}`}>
              <div className="quick-pay-avatar" style={{ background: c.gradient }}>
                <span>{c.avatar}</span>
              </div>
              <span className="quick-pay-name">{c.name.split(" ")[0]}</span>
            </button>
          ))}
          <button className="quick-pay-item quick-pay-add" onClick={() => navigate("send")}>
            <div className="quick-pay-avatar quick-pay-add-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <span className="quick-pay-name">Add</span>
          </button>
        </div>
      </div>

      {/* Spending Insights */}
      <div className={`section ${slideUp ? "slide-visible delay-4" : ""}`}>
        <div className="section-header">
          <h3 className="section-title">Spending Insights</h3>
          <span className="section-subtitle">This month</span>
        </div>
        <div className="spending-card">
          <div className="spending-donut-wrap">
            <svg viewBox="0 0 36 36" className="spending-donut">
              {(() => {
                let offset = 0;
                return SPENDING.map((s, i) => {
                  const dashLen = s.pct;
                  const el = (
                    <circle key={i} cx="18" cy="18" r="15.5" fill="none"
                      stroke={s.color} strokeWidth="3.5" strokeLinecap="round"
                      strokeDasharray={`${dashLen} ${100 - dashLen}`}
                      strokeDashoffset={-offset}
                      style={{ filter: `drop-shadow(0 0 3px ${s.color})` }} />
                  );
                  offset += dashLen;
                  return el;
                });
              })()}
            </svg>
            <div className="spending-donut-center">
              <span className="spending-donut-total">{formatCurrency(SPENDING.reduce((s, c) => s + c.amount, 0))}</span>
              <span className="spending-donut-label">Total</span>
            </div>
          </div>
          <div className="spending-legend">
            {SPENDING.map((s, i) => (
              <div key={i} className="spending-legend-item">
                <span className="spending-dot" style={{ background: s.color }} />
                <span className="spending-cat">{s.category}</span>
                <span className="spending-amt">{formatCurrency(s.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings Goals */}
      <div className={`section ${slideUp ? "slide-visible delay-5" : ""}`}>
        <div className="section-header">
          <h3 className="section-title">Savings Goals</h3>
          <button className="section-link" id="add-goal">+ New</button>
        </div>
        <div className="goals-row">
          {SAVINGS_GOALS.map((g) => {
            const pct = Math.round((g.saved / g.target) * 100);
            return (
              <div key={g.id} className="goal-card" style={{ '--goal-accent': g.accent }}>
                <div className="goal-ring-wrap">
                  <svg viewBox="0 0 36 36" className="goal-ring-svg">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke={g.accent} strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset="25"
                      style={{ filter: `drop-shadow(0 0 4px ${g.accent})`, transition: 'stroke-dasharray 1s ease' }} />
                  </svg>
                  <span className="goal-ring-icon">{g.icon}</span>
                </div>
                <div className="goal-info">
                  <span className="goal-name">{g.name}</span>
                  <div className="goal-bar-wrap">
                    <div className="goal-bar-bg">
                      <div className="goal-bar-fill" style={{ width: `${pct}%`, background: g.accent, boxShadow: `0 0 8px ${g.accent}` }} />
                    </div>
                    <span className="goal-pct" style={{ color: g.accent }}>{pct}%</span>
                  </div>
                  <span className="goal-amounts">{formatCurrency(g.saved)} / {formatCurrency(g.target)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Bills */}
      <div className={`section ${slideUp ? "slide-visible delay-6" : ""}`}>
        <div className="section-header">
          <h3 className="section-title">Upcoming Bills</h3>
          <button className="section-link" id="all-bills">See All</button>
        </div>
        <div className="bills-list">
          {UPCOMING_BILLS.map((b) => {
            const dueDate = new Date(b.due);
            const today = new Date();
            const daysLeft = Math.max(0, Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)));
            return (
              <div key={b.id} className="bill-row" style={{ '--bill-accent': b.accent }}>
                <div className="bill-icon-wrap">
                  <span className="bill-emoji">{b.icon}</span>
                </div>
                <div className="bill-info">
                  <span className="bill-name">{b.name}</span>
                  <span className="bill-due">{daysLeft === 0 ? "Due today" : `Due in ${daysLeft} days`}</span>
                </div>
                <div className="bill-right">
                  <span className="bill-amount">{formatCurrency(b.amount)}</span>
                  <button className="bill-pay-btn" style={{ background: b.accent }}>Pay</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`section last-section ${slideUp ? "slide-visible" : ""}`} style={{ transitionDelay: "700ms" }}>
        <div className="section-header">
          <h3 className="section-title">Recent Transactions</h3>
          <button onClick={() => navigate("history")} className="section-link" id="see-all-tx">See All</button>
        </div>
        <div className="tx-list">
          {TRANSACTIONS.slice(0, 5).map((tx, i) => (
            <div key={tx.id} className={`tx-row ${i > 0 ? "tx-row-border" : ""}`} id={`tx-${tx.id}`}>
              <TransactionIcon type={tx.icon} />
              <div className="tx-info">
                <p className="tx-desc">{tx.description}</p>
                <p className="tx-time">{formatTime(tx.date)}</p>
              </div>
              <p className={`tx-amount ${tx.amount > 0 ? "tx-positive" : ""}`}>
                {tx.amount > 0 ? "+" : "-"}{formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Co-Pilot FAB */}
      <div className="voice-fab-container">
        <span className="voice-fab-ring" />
        <span className="voice-fab-ring voice-fab-ring-2" />
        <button onClick={() => { setVoiceOpen(true); setVoiceText(""); setVoiceListening(true); }} className="fab voice-fab" id="voice-fab">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
      </div>
    </div>
  );

  // ─── Voice Co-Pilot Logic (parent scope) ─────────────────────────

  const voiceStatusLabels = {
    idle: "Tap mic to start",
    connecting: "Connecting...",
    listening: "Listening...",
    thinking: "Processing...",
    speaking: "Speaking...",
    error: "Connection error",
  };

  // ElevenLabs message handler — keeps the UI in sync with the
  // conversation. ElevenLabs emits { message, source } where source is
  // "user" or "ai".
  const handleElevenLabsMessage = useCallback((msg) => {
    if (!msg) return;
    if (msg.source === "user") {
      setTranscript(msg.message || "");
    } else if (msg.source === "ai") {
      setAiResponse(msg.message || "");
    }
  }, []);

  // Inner executor — runs the action immediately. Called directly and by the
  // biometric modal's onSuccess handler.
  const executeVoiceAction = useCallback((name, args = {}) => {
    let result = {};
    switch (name) {

      // ── find_payee: fuzzy contact lookup ──────────────────────────
      case "find_payee": {
        const query = (args.name || "").trim();
        if (!query) {
          result = { matches: [], message: "Please provide a name to search." };
          break;
        }
        const scored = CONTACTS
          .map((c) => ({ contact: c, score: fuzzyScore(query, c.name) }))
          .filter((x) => x.score > 0.25)
          .sort((a, b) => b.score - a.score);

        if (scored.length === 0) {
          result = { matches: [], message: `No contacts found matching "${query}". Please ask the user to confirm the name.` };
        } else if (scored.length === 1) {
          const c = scored[0].contact;
          result = {
            matches: [{ id: c.id, name: c.name, phone: c.phone, lastPayment: c.lastPayment }],
            message: `Found ${c.name} (${c.phone}). Last payment: ${c.lastPayment}.`,
            exact: true,
          };
        } else {
          result = {
            matches: scored.slice(0, 3).map((x) => ({
              id: x.contact.id,
              name: x.contact.name,
              phone: x.contact.phone,
              lastPayment: x.contact.lastPayment,
            })),
            message: `Found ${scored.length} possible matches: ${scored.slice(0, 3).map((x) => x.contact.name).join(", ")}. Ask the user which one they meant.`,
            exact: false,
          };
        }
        setActionLog((prev) => [...prev, `🔍 Searched contacts for "${query}"`]);
        break;
      }

      // ── get_transactions: history query ───────────────────────────
      case "get_transactions": {
        const limit = Math.min(Number(args.limit) || 5, 20);
        const period = (args.period || "week").toLowerCase();
        const txType = (args.type || "all").toLowerCase();

        const now = new Date();
        const cutoff =
          period === "week"  ? new Date(now - 7 * 86400000)
          : period === "month" ? new Date(now.getFullYear(), now.getMonth(), 1)
          : new Date(0);

        const filtered = TRANSACTIONS.filter((tx) => {
          if (new Date(tx.date) < cutoff) return false;
          if (txType === "payments")  return tx.type === "PAYMENT";
          if (txType === "deposits")  return tx.type === "DEPOSIT";
          if (txType === "transfers") return tx.type === "TRANSFER";
          return true;
        }).slice(0, limit);

        const totalSpent    = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
        const totalReceived = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
        const txCount = filtered.length;

        result = {
          transactions: filtered.map((tx) => ({
            description: tx.description,
            amount: tx.amount,
            formatted: `${tx.amount > 0 ? "+" : "-"}R${Math.abs(tx.amount).toFixed(2)}`,
            date: tx.date,
            type: tx.type.toLowerCase(),
          })),
          count: txCount,
          totalSpent,
          totalReceived,
          period,
          summary: txCount === 0
            ? `No ${txType === "all" ? "" : txType + " "}transactions found this ${period}.`
            : `This ${period}: ${txCount} transaction${txCount !== 1 ? "s" : ""}, spent R${totalSpent.toFixed(2)}, received R${totalReceived.toFixed(2)}.`,
        };
        setActionLog((prev) => [...prev, `📊 Fetched ${txCount} transaction${txCount !== 1 ? "s" : ""} (${period})`]);
        break;
      }

      // ── send_money ─────────────────────────────────────────────────
      case "send_money": {
        const amt = args.amount ?? 0;
        const fmtAmt = typeof amt === "number" ? amt.toFixed(2) : amt;
        const recipientName = args.recipient || "recipient";
        const mainWallet = WALLETS.find((w) => w.type === "MAIN");
        const newBalance = mainWallet ? mainWallet.balance - amt : null;
        result = {
          success: true,
          message: `R${fmtAmt} sent to ${recipientName}.${newBalance !== null ? ` Your Main Wallet balance is now R${newBalance.toFixed(2)}.` : ""}`,
          new_balance: newBalance,
          amount: amt,
          recipient: recipientName,
        };
        setActionLog((prev) => [...prev, `💸 Sent R${fmtAmt} to ${recipientName}`]);
        setToastMsg(`R${fmtAmt} sent to ${recipientName}`);
        break;
      }

      // ── transfer_funds ─────────────────────────────────────────────
      case "transfer_funds":
        result = { success: true, message: `Transferred R${args.amount?.toFixed?.(2) ?? args.amount} from ${args.from_wallet} to ${args.to_wallet}.` };
        setActionLog((prev) => [...prev, `🔄 R${args.amount} ${args.from_wallet} → ${args.to_wallet}`]);
        setToastMsg(`R${args.amount?.toFixed?.(2) ?? args.amount} transferred`);
        break;

      // ── add_funds ──────────────────────────────────────────────────
      case "add_funds":
        result = { success: true, message: `Added R${args.amount?.toFixed?.(2) ?? args.amount} to your wallet.` };
        setActionLog((prev) => [...prev, `➕ Added R${args.amount}`]);
        navigate("addFunds");
        break;

      // ── buy_airtime ────────────────────────────────────────────────
      case "buy_airtime":
        result = { success: true, message: `R${args.amount} airtime sent to ${args.phone_number}.` };
        setActionLog((prev) => [...prev, `📱 R${args.amount} airtime → ${args.phone_number}`]);
        setToastMsg(`R${args.amount} airtime sent`);
        break;

      // ── pay_bill ───────────────────────────────────────────────────
      case "pay_bill":
        result = { success: true, message: `${args.bill_name} has been paid.` };
        setActionLog((prev) => [...prev, `📄 Paid ${args.bill_name}`]);
        setToastMsg(`${args.bill_name} paid`);
        break;

      // ── check_balance ──────────────────────────────────────────────
      case "check_balance": {
        const w = (args.wallet || "all").toLowerCase();
        const walletByType = {
          main:     WALLETS.find((x) => x.type === "MAIN"),
          savings:  WALLETS.find((x) => x.type === "SAVINGS"),
          business: WALLETS.find((x) => x.type === "BUSINESS"),
        };
        if (w === "all") {
          const total = WALLETS.reduce((s, ww) => s + ww.balance, 0);
          result = {
            balances: WALLETS.map((ww) => ({
              name: ww.name,
              balance: ww.balance,
              formatted: `R${ww.balance.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`,
            })),
            total,
            formatted_total: `R${total.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`,
            message: `Total balance: R${total.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}. Main: R${walletByType.main?.balance.toFixed(2)}, Savings: R${walletByType.savings?.balance.toFixed(2)}, Business: R${walletByType.business?.balance.toFixed(2)}.`,
          };
        } else {
          const wallet = walletByType[w];
          result = wallet
            ? {
                wallet: wallet.name,
                balance: wallet.balance,
                formatted: `R${wallet.balance.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`,
                message: `Your ${wallet.name} balance is R${wallet.balance.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}.`,
              }
            : { error: `Wallet "${args.wallet}" not found. Valid options: main, savings, business, all.` };
        }
        setActionLog((prev) => [...prev, `💰 Checked ${w === "all" ? "all wallets" : w + " wallet"}`]);
        break;
      }

      // ── navigate_screen ────────────────────────────────────────────
      case "navigate_screen":
        navigate(args.screen);
        result = { success: true, message: `Opened ${args.screen}.` };
        setActionLog((prev) => [...prev, `📱 Opened ${args.screen}`]);
        break;

      default:
        result = { error: "Unknown function" };
    }
    return result;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Async wrapper exposed to ElevenLabs client tools. High-value send/transfer
  // commands show a biometric modal and return a Promise that resolves after
  // the user authenticates.
  const voiceExecuteFunction = useCallback(async (name, args = {}) => {
    const amount = parseFloat(args.amount ?? 0);
    const isHighValue = ["send_money", "transfer_funds"].includes(name) && amount > txThreshold;

    if (isHighValue && biometricEnabled && biometricRegistered) {
      setPendingVoiceAction({ name, args });
      return new Promise((resolve) => {
        voicePendingRef.current = resolve;
      });
    }

    return executeVoiceAction(name, args);
  }, [executeVoiceAction, txThreshold, biometricEnabled, biometricRegistered]);

  const stopVoiceSession = useCallback(async () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = null;
    analyserRef.current = null;
    setVoiceVolume(0);

    // End the ElevenLabs WebSocket session if one is live
    if (elevenConvRef.current) {
      try { await elevenConvRef.current.endSession(); } catch { /* ignore */ }
      elevenConvRef.current = null;
    }

    setVoiceStatus("idle");
    setVoiceListening(false);
  }, []);

  /**
   * Start an ElevenLabs Conversational AI session.
   * Expressive v3 voice + server-side LLM/STT/TTS over WebSocket.
   */
  const startVoiceSession = useCallback(async () => {
    try {
      setVoiceStatus("connecting");
      setTranscript("");
      setAiResponse("");
      setActionLog([]);

      // Mic permission up-front (SDK will re-use this stream internally)
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Wallet summary built from live WALLETS data
      const walletSummary = WALLETS.map((w) =>
        `${w.name}: R${w.balance.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`
      ).join("; ");
      const totalBalance = WALLETS.reduce((s, w) => s + w.balance, 0);

      // Public vs private agent: if NEXT_PUBLIC_ELEVENLABS_AGENT_ID is
      // defined the browser connects directly; otherwise we fall back
      // to the signed-url route (keeps API key server-side).
      const publicAgentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      const sessionArgs = {
        dynamicVariables: {
          user_name: "Malcolm",
          user_full_name: "Malcolm Govender",
          is_authenticated: "true",
          wallet_count: String(WALLETS.length),
          balance_currency: "ZAR",
          balance_total: totalBalance.toLocaleString("en-ZA", { minimumFractionDigits: 2 }),
          wallets_summary: walletSummary,
          session_date: new Date().toISOString().slice(0, 10),
        },
        // Override the agent's system prompt so language auto-detection and
        // all new tools are available regardless of what's configured in the
        // ElevenLabs dashboard.
        overrides: {
          agent: {
            prompt: { prompt: SWIFTER_AGENT_PROMPT },
          },
        },
        clientTools: {
          // Contact resolution
          find_payee:      (args) => voiceExecuteFunction("find_payee", args),
          // Payments
          send_money:      (args) => voiceExecuteFunction("send_money", args),
          transfer_funds:  (args) => voiceExecuteFunction("transfer_funds", args),
          add_funds:       (args) => voiceExecuteFunction("add_funds", args),
          buy_airtime:     (args) => voiceExecuteFunction("buy_airtime", args),
          pay_bill:        (args) => voiceExecuteFunction("pay_bill", args),
          // Queries
          check_balance:   (args) => voiceExecuteFunction("check_balance", args),
          get_transactions:(args) => voiceExecuteFunction("get_transactions", args),
          // Navigation
          navigate_screen: (args) => voiceExecuteFunction("navigate_screen", args),
        },
        onConnect: () => setVoiceStatus("listening"),
        onDisconnect: () => setVoiceStatus("idle"),
        onError: (err) => {
          console.error("[ElevenLabs]", err);
          setVoiceStatus("error");
          setAiResponse(err?.message || "Voice connection error");
        },
        onMessage: handleElevenLabsMessage,
        onModeChange: ({ mode }) => {
          // mode is "listening" | "speaking"
          setVoiceStatus(mode === "speaking" ? "speaking" : "listening");
        },
      };

      let conv;
      if (publicAgentId) {
        conv = await Conversation.startSession({
          agentId: publicAgentId,
          ...sessionArgs,
        });
      } else {
        const r = await fetch("/api/elevenlabs/signed-url");
        if (!r.ok) throw new Error(`signed-url ${r.status}`);
        const { signedUrl } = await r.json();
        conv = await Conversation.startSession({ signedUrl, ...sessionArgs });
      }
      elevenConvRef.current = conv;

      // Drive the volume pulse animation from the agent's output
      try {
        const tick = () => {
          try {
            const data = conv.getOutputByteFrequencyData?.();
            if (data && data.length) {
              let sum = 0;
              for (let i = 0; i < data.length; i++) sum += data[i];
              setVoiceVolume(Math.min(1, sum / data.length / 80));
            }
          } catch { /* no-op */ }
          animFrameRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) {
        console.warn("Volume meter failed:", e);
      }
    } catch (err) {
      console.error("Voice error:", err);
      setVoiceStatus("error");
      setAiResponse(err?.message || "Failed to connect");
    }
  }, [handleElevenLabsMessage, voiceExecuteFunction]);

  useEffect(() => {
    return () => { if (peerRef.current) stopVoiceSession(); };
  }, [stopVoiceSession]);

  // ─── announceVoice — Web Speech API fallback for proactive alerts ──
  // Fires only when no ElevenLabs session is active so the two audio
  // streams never overlap. Uses South-African English by default.
  const announceVoice = useCallback((text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (elevenConvRef.current) return; // let active session handle speech
    window.speechSynthesis.cancel(); // clear any queued utterances
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-ZA";
    utt.rate = 0.95;
    utt.pitch = 1.0;
    window.speechSynthesis.speak(utt);
  }, []);

  // ─── Low-balance warning — fires once on load ─────────────────────
  useEffect(() => {
    const low = WALLETS.filter((w) => w.balance < LOW_BALANCE_THRESHOLD);
    if (low.length === 0) return;
    const wallet = low[0];
    const msg = `Heads up — your ${wallet.name} is below R${LOW_BALANCE_THRESHOLD}`;
    const t = setTimeout(() => {
      setToastMsg(`⚠️ ${msg}`);
      announceVoice(msg);
    }, 3000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Simulated incoming payment (demo) ────────────────────────────
  // In production this would be driven by a real-time webhook / push.
  useEffect(() => {
    const t = setTimeout(() => {
      const sender = CONTACTS[Math.floor(Math.random() * CONTACTS.length)];
      const amount = [100, 250, 500, 750, 1000][Math.floor(Math.random() * 5)];
      const firstName = sender.name.split(" ")[0];
      const msg = `You just received R${amount} from ${firstName}`;
      setIncomingPayment({ sender: firstName, amount });
      setToastMsg(`💸 ${msg}`);
      announceVoice(msg);
      setTimeout(() => setIncomingPayment(null), 6000);
    }, 18000); // fire 18 s after load — visible in a short demo session
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Toast Notification (SmartSendr) ──────────────────────────────

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(""), 3500);
    return () => clearTimeout(t);
  }, [toastMsg]);

  // ─── Wallets Screen ─────────────────────────────────────────────

  const WalletsScreen = () => (
    <div className={`screen-fade ${fadeIn ? "visible" : ""}`} style={{ paddingBottom: "6rem" }}>
      <div className="sub-header">
        <button onClick={() => navigate("dashboard")} className="back-btn" id="wallets-back"><ChevronLeftSvg /></button>
        <h2 className="sub-title">My Wallets</h2>
        <button className="back-btn" id="add-wallet-btn">+</button>
      </div>
      <div className={`wallet-list ${slideUp ? "slide-visible delay-1" : ""}`}>
        {WALLETS.map((w, i) => (
          <div key={w.id} className="wallet-full-card" style={{ background: w.gradient, transitionDelay: `${i * 80}ms` }}>
            <div className="wallet-full-orb-1" />
            <div className="wallet-full-orb-2" />
            <div className="wallet-full-content">
              <div className="wallet-full-top">
                <div className="wallet-full-badge">
                  <Icon3D src={ICON_MAP.wallet} alt="wallet" size={28} />
                  <span>{w.type}</span>
                </div>
                <ChevronRightSvg />
              </div>
              <h3 className="wallet-full-name">{w.name}</h3>
              <p className="wallet-full-balance">
                {balanceVisible ? formatCurrency(w.balance) : "R•••••••"}
              </p>
              <div className="wallet-full-actions">
                <button onClick={() => { setSendWallet(w); navigate("send"); }} className="wallet-action-btn wallet-action-ghost">Send</button>
                <button onClick={() => navigate("addFunds")} className="wallet-action-btn wallet-action-solid">Add Funds</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Send Money Flow ────────────────────────────────────────────

  const SendScreen = () => (
    <div className={`screen-fade ${fadeIn ? "visible" : ""}`} style={{ paddingBottom: "2rem" }}>
      <div className="sub-header">
        <button onClick={() => sendStep > 0 ? setSendStep(sendStep - 1) : navigate("dashboard")} className="back-btn" id="send-back"><ChevronLeftSvg /></button>
        <h2 className="sub-title">
          {sendStep === 0 ? "Select Wallet" : sendStep === 1 ? "Select Recipient" : sendStep === 2 ? "Enter Amount" : "Confirm"}
        </h2>
        <button onClick={() => navigate("dashboard")} className="back-btn" id="send-close"><XSvg /></button>
      </div>

      {/* Progress steps */}
      <div className="progress-bar">
        {[0,1,2,3].map((s) => (
          <div key={s} className={`progress-step ${s <= sendStep ? "progress-active" : ""}`} />
        ))}
      </div>

      {/* Step 0: Select Wallet */}
      {sendStep === 0 && (
        <div className={`step-content ${slideUp ? "slide-visible" : ""}`}>
          <p className="step-hint">Choose which wallet to send from</p>
          <div className="select-list">
            {WALLETS.map((w) => (
              <button key={w.id} onClick={() => { setSendWallet(w); setSendStep(1); }}
                className={`select-item ${sendWallet.id === w.id ? "select-active" : ""}`} id={`send-wallet-${w.id}`}>
                <div className="select-icon" style={{ background: w.gradient }}>
                  <Icon3D src={ICON_MAP.wallet} alt="wallet" size={28} />
                </div>
                <div className="select-info">
                  <p className="select-name">{w.name}</p>
                  <p className="select-sub">{formatCurrency(w.balance)}</p>
                </div>
                <ChevronRightSvg />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Select Recipient */}
      {sendStep === 1 && (
        <div className={`step-content ${slideUp ? "slide-visible" : ""}`}>
          <div className="search-bar">
            <SearchSvg />
            <input placeholder="Search name or email" className="search-input" id="recipient-search" />
          </div>
          <p className="step-label">RECENT</p>
          <div className="select-list">
            {CONTACTS.map((c) => (
              <button key={c.id} onClick={() => { setSendRecipient(c); setSendStep(2); }}
                className="select-item" id={`contact-${c.id}`}>
                <div className="avatar" style={{ background: c.gradient }}>{c.avatar}</div>
                <div className="select-info">
                  <p className="select-name">{c.name}</p>
                  <p className="select-sub">{c.phone || "Recent"}</p>
                </div>
                <ChevronRightSvg />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Enter Amount */}
      {sendStep === 2 && (
        <div className={`step-content ${slideUp ? "slide-visible" : ""}`}>
          <div className="amount-recipient">
            <div className="avatar avatar-lg" style={{ background: sendRecipient?.gradient }}>{sendRecipient?.avatar}</div>
            <div>
              <p className="amount-to">Sending to <strong>{sendRecipient?.name}</strong></p>
              {sendRecipient?.phone && <p className="amount-phone">{sendRecipient.phone}</p>}
            </div>
          </div>
          <div className="amount-display">
            <span className="amount-currency">R</span>
            <span className={`amount-value ${sendAmount && Number(sendAmount) > sendWallet.balance ? "amount-over" : ""}`}>
              {sendAmount || "0"}
            </span>
          </div>
          <p className="amount-available">
            Available: <strong>{formatCurrency(sendWallet.balance)}</strong>
            {sendAmount && Number(sendAmount) > sendWallet.balance && (
              <span className="amount-warning"> · Insufficient funds</span>
            )}
          </p>
          <div className="quick-amounts">
            {[50, 100, 250, 500].map((q) => (
              <button key={q} onClick={() => setSendAmount(String(q))} className={`quick-amount-btn ${sendAmount === String(q) ? "quick-amount-active" : ""}`}>R{q}</button>
            ))}
          </div>
          {numpad(setSendAmount, sendAmount)}
          <div style={{ padding: "0 1.5rem", marginTop: "1.25rem" }}>
            <button onClick={() => sendAmount && Number(sendAmount) > 0 && Number(sendAmount) <= sendWallet.balance && setSendStep(3)}
              disabled={!sendAmount || Number(sendAmount) <= 0 || Number(sendAmount) > sendWallet.balance}
              className="primary-btn primary-violet" id="send-continue">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {sendStep === 3 && (
        <SendConfirmation
          wallet={sendWallet}
          recipient={sendRecipient}
          amount={sendAmount}
          navigate={navigate}
          biometricEnabled={biometricEnabled}
          biometricRegistered={biometricRegistered}
          txThreshold={txThreshold}
          onTransactionComplete={() => {
            txCountRef.current += 1;
            // Show feedback survey every other transaction (realistic cadence)
            if (txCountRef.current % 2 === 0) {
              setTimeout(() => setShowFeedback(true), 1600);
            }
          }}
        />
      )}
    </div>
  );

  // ─── Add Funds Flow (with card selection) ───────────────────────
  // Steps: 0=amount, 1=select payment method, 2=manual card entry, 3=processing, 4=success

  const handleFundsBack = () => {
    if (addFundsStep === 2) setAddFundsStep(1);
    else if (addFundsStep === 1) setAddFundsStep(0);
    else navigate("dashboard");
  };

  const handleAddNewCardAndPay = async () => {
    const num = cardForm.number.replace(/\s/g, "");
    console.log("handleAddNewCardAndPay called", { numLen: num.length, expiryLen: cardForm.expiry.length, cvvLen: cardForm.cvv.length });
    if (num.length >= 13 && cardForm.expiry.length >= 4 && cardForm.cvv.length >= 3) {
      // Save card locally for future quick access
      const newCard = {
        id: `card${Date.now()}`,
        brand: detectBrand(cardForm.number),
        last4: num.slice(-4),
        expiry: formatExpiry(cardForm.expiry),
        holder: cardForm.holder || "Cardholder",
        gradient: "linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)",
      };
      const saveCheckbox = document.getElementById("save-card");
      if (saveCheckbox && saveCheckbox.checked) {
        setSavedCards((prev) => [...prev, newCard]);
      }
      setSelectedCard(newCard);
      // Initiate real Yoco checkout
      try {
        await handleYocoCheckout();
      } catch (err) {
        console.error("Yoco checkout error:", err);
        setYocoError(err.message || "Payment failed");
      }
    } else {
      console.warn("Card validation failed", { numLen: num.length, expiryLen: cardForm.expiry.length, cvvLen: cardForm.cvv.length });
    }
  };

  const stepTitles = ["", "Payment Method", "Card Details", "", ""];

  const AddFundsScreen = () => (
    <div className={`screen-fade ${fadeIn ? "visible" : ""}`} style={{ paddingBottom: "2rem" }}>
      <div className="sub-header">
        <button onClick={handleFundsBack} className="back-btn" id="funds-back"><ChevronLeftSvg /></button>
        <h2 className="sub-title">{addFundsStep <= 2 ? (addFundsStep === 0 ? "Add Funds" : stepTitles[addFundsStep]) : ""}</h2>
        <button onClick={() => navigate("dashboard")} className="back-btn" id="funds-close"><XSvg /></button>
      </div>

      {/* Progress */}
      {addFundsStep < 3 && (
        <div className="progress-bar">
          {[0,1,2].map((s) => (
            <div key={s} className={`progress-step ${s <= addFundsStep ? "progress-active" : ""}`} />
          ))}
        </div>
      )}

      {/* Step 0: Enter Amount */}
      {addFundsStep === 0 && (
        <div className={`step-content ${slideUp ? "slide-visible" : ""}`}>
          <div className="amount-display" style={{ marginTop: "1rem" }}>
            <span className="amount-currency">R</span>
            <span className="amount-value">{addFundsAmount || "0"}</span>
          </div>
          <div className="quick-amounts">
            {[100, 250, 500, 1000].map((q) => (
              <button key={q} onClick={() => setAddFundsAmount(String(q))} className="quick-amount-btn">R{q}</button>
            ))}
          </div>
          {numpad(setAddFundsAmount, addFundsAmount)}
          <div style={{ padding: "0 1.5rem", marginTop: "1.25rem" }}>
            <button onClick={() => addFundsAmount && Number(addFundsAmount) > 0 && setAddFundsStep(1)}
              disabled={!addFundsAmount || Number(addFundsAmount) <= 0}
              className="primary-btn primary-emerald" id="funds-continue">Continue</button>
          </div>
        </div>
      )}

      {/* Step 1: Select Payment Method */}
      {addFundsStep === 1 && (
        <div className={`step-content ${slideUp ? "slide-visible" : ""}`} style={{ padding: "0 1.5rem" }}>
          <p className="step-hint" style={{ padding: 0, marginBottom: "1rem" }}>Top up R{Number(addFundsAmount).toFixed(2)}</p>

          {/* Primary: Yoco Checkout (real card payment) */}
          <button onClick={handleYocoCheckout} disabled={yocoLoading}
            className="yoco-pay-btn" id="pay-with-yoco">
            <div className="yoco-pay-left">
              <div className="yoco-pay-icon">💳</div>
              <div>
                <p className="yoco-pay-title">{yocoLoading ? "Redirecting..." : "Pay with Card"}</p>
                <p className="yoco-pay-sub">Secure checkout via Yoco</p>
              </div>
            </div>
            <div className="yoco-pay-amount">R{Number(addFundsAmount).toFixed(2)}</div>
          </button>

          {yocoError && (
            <p style={{ color: "#ef4444", fontSize: "0.85rem", textAlign: "center", marginTop: "0.75rem" }}>
              {yocoError}
            </p>
          )}

          {yocoLoading && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
              <div className="spinner-ring" />
            </div>
          )}

          <div className="divider-or">
            <span className="divider-line" />
            <span className="divider-text">or use a saved card</span>
            <span className="divider-line" />
          </div>

          {savedCards.length > 0 && (
            <>
              <p className="step-label" style={{ padding: 0 }}>SAVED CARDS</p>
              <div className="card-list">
                {savedCards.map((card) => (
                  <button key={card.id} onClick={() => { setSelectedCard(card); handleYocoCheckout(); }}
                    className="card-select-item" id={`pay-card-${card.id}`}>
                    <div className="card-mini-visual" style={{ background: card.gradient }}>
                      <span className="card-mini-brand">{card.brand}</span>
                      <span className="card-mini-dots">•••• {card.last4}</span>
                    </div>
                    <div className="select-info">
                      <p className="select-name">{card.brand} •••• {card.last4}</p>
                      <p className="select-sub">Expires {card.expiry}</p>
                    </div>
                    <ChevronRightSvg />
                  </button>
                ))}
              </div>
            </>
          )}

          <button onClick={() => setAddFundsStep(2)} className="manual-card-btn" id="manual-card-entry" style={{ marginTop: "0.75rem" }}>
            <div className="manual-card-icon">✏️</div>
            <div className="select-info">
              <p className="select-name">Add new card</p>
              <p className="select-sub">Enter your debit or credit card</p>
            </div>
            <ChevronRightSvg />
          </button>
        </div>
      )}

      {/* Step 2: Manual Card Entry */}
      {addFundsStep === 2 && (
        <div className={`step-content ${slideUp ? "slide-visible" : ""}`} style={{ padding: "0 1.5rem" }}>
          <div className="card-preview" style={{ background: detectBrand(cardForm.number) === "Visa" ? "linear-gradient(135deg, #1e3a5f, #2563eb)" : detectBrand(cardForm.number) === "Mastercard" ? "linear-gradient(135deg, #b91c1c, #ef4444)" : "linear-gradient(135deg, #4338ca, #6366f1)" }}>
            <div className="card-preview-orb" />
            <div className="card-preview-content">
              <div className="card-preview-top">
                <div className="card-chip">💳</div>
                <span className="card-brand-label">{detectBrand(cardForm.number)}</span>
              </div>
              <p className="card-preview-number">{cardForm.number || "•••• •••• •••• ••••"}</p>
              <div className="card-preview-bottom">
                <div>
                  <p className="card-preview-label">CARDHOLDER</p>
                  <p className="card-preview-value">{cardForm.holder || "Your Name"}</p>
                </div>
                <div>
                  <p className="card-preview-label">EXPIRES</p>
                  <p className="card-preview-value">{cardForm.expiry || "MM/YY"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-form">
            <div className="form-field">
              <label className="form-label">Card Number</label>
              <input
                type="text" inputMode="numeric" placeholder="1234 5678 9012 3456"
                className="form-input" id="card-number"
                value={cardForm.number}
                onChange={(e) => setCardForm({ ...cardForm, number: formatCardNumber(e.target.value) })}
              />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Expiry</label>
                <input
                  type="text" inputMode="numeric" placeholder="MM/YY"
                  className="form-input" id="card-expiry"
                  value={cardForm.expiry}
                  onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                />
              </div>
              <div className="form-field">
                <label className="form-label">CVV</label>
                <input
                  type="text" inputMode="numeric" placeholder="123" maxLength={4}
                  className="form-input" id="card-cvv"
                  value={cardForm.cvv}
                  onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Cardholder Name</label>
              <input
                type="text" placeholder="Malcolm Govender"
                className="form-input" id="card-holder"
                value={cardForm.holder}
                onChange={(e) => setCardForm({ ...cardForm, holder: e.target.value })}
              />
            </div>
            <div className="form-checkbox">
              <input type="checkbox" id="save-card" defaultChecked className="form-check" />
              <label htmlFor="save-card" className="form-check-label">Save this card for future top-ups</label>
            </div>
          </div>

          <button onClick={handleAddNewCardAndPay}
            disabled={yocoLoading || cardForm.number.replace(/\s/g, "").length < 13 || cardForm.expiry.length < 4 || cardForm.cvv.length < 3}
            className="primary-btn primary-emerald" id="pay-with-card">
            {yocoLoading ? "Processing..." : `Pay R${Number(addFundsAmount).toFixed(2)}`}
          </button>

          {yocoLoading && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
              <div className="spinner-ring" />
            </div>
          )}

          {yocoError && (
            <p style={{ color: "#ef4444", fontSize: "0.85rem", textAlign: "center", marginTop: "0.75rem" }}>
              {yocoError}
            </p>
          )}
        </div>
      )}

      {/* Step 3: Processing */}
      {addFundsStep === 3 && <ProcessingAnimation color="emerald" onComplete={() => setAddFundsStep(4)} />}

      {/* Step 4: Success */}
      {addFundsStep === 4 && (
        <div className={`success-screen ${fadeIn ? "visible" : ""}`}>
          <div className="success-ring">
            <div className="success-circle"><CheckSvg /></div>
          </div>
          <h2 className="success-title">Funds Added!</h2>
          <p className="success-amount">R{Number(addFundsAmount).toFixed(2)} deposited</p>
          <p className="success-sub">to {activeWallet.name}{selectedCard ? ` via •••• ${selectedCard.last4}` : ""}</p>
          <button onClick={() => navigate("dashboard")} className="primary-btn primary-violet" style={{ marginTop: "2.5rem", width: "100%" }} id="funds-done">
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );

  // ─── Manage Cards Screen ────────────────────────────────────────

  const ManageCardsScreen = () => {
    const [showForm, setShowForm] = useState(false);
    const [newCard, setNewCard] = useState({ number: "", expiry: "", cvv: "", holder: "" });

    const handleSaveCard = () => {
      const num = newCard.number.replace(/\s/g, "");
      if (num.length >= 13 && newCard.expiry.length >= 4 && newCard.cvv.length >= 3) {
        const card = {
          id: `card${Date.now()}`,
          brand: detectBrand(newCard.number),
          last4: num.slice(-4),
          expiry: formatExpiry(newCard.expiry),
          holder: newCard.holder || "Cardholder",
          gradient: ["linear-gradient(135deg, #1e3a5f, #2563eb)", "linear-gradient(135deg, #065f46, #10b981)", "linear-gradient(135deg, #7c2d12, #f59e0b)", "linear-gradient(135deg, #4338ca, #818cf8)"][savedCards.length % 4],
        };
        setSavedCards((prev) => [...prev, card]);
        setShowForm(false);
        setNewCard({ number: "", expiry: "", cvv: "", holder: "" });
      }
    };

    const removeCard = (id) => setSavedCards((prev) => prev.filter((c) => c.id !== id));

    return (
      <div className={`screen-fade ${fadeIn ? "visible" : ""}`} style={{ paddingBottom: "6rem" }}>
        <div className="sub-header">
          <button onClick={() => navigate("settings")} className="back-btn" id="cards-back"><ChevronLeftSvg /></button>
          <h2 className="sub-title">Payment Methods</h2>
          <button onClick={() => setShowForm(!showForm)} className="back-btn" id="add-card-btn">{showForm ? <XSvg /> : "+"}</button>
        </div>

        <div style={{ padding: "0 1.5rem" }}>
          {/* Saved Cards */}
          {savedCards.length > 0 ? (
            <div className="card-list">
              {savedCards.map((card) => (
                <div key={card.id} className="card-manage-item">
                  <div className="card-mini-visual" style={{ background: card.gradient }}>
                    <span className="card-mini-brand">{card.brand}</span>
                    <span className="card-mini-dots">•••• {card.last4}</span>
                  </div>
                  <div className="select-info" style={{ flex: 1 }}>
                    <p className="select-name">{card.brand} •••• {card.last4}</p>
                    <p className="select-sub">{card.holder} · Exp {card.expiry}</p>
                  </div>
                  <button onClick={() => removeCard(card.id)} className="card-remove-btn" title="Remove card">🗑️</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ paddingTop: "2rem" }}>
              <span style={{ fontSize: "3rem" }}>💳</span>
              <p>No saved cards yet</p>
              <p style={{ fontSize: "0.8rem" }}>Add a card to make top-ups faster</p>
            </div>
          )}

          {/* Add Card Form */}
          {showForm && (
            <div className="card-form" style={{ marginTop: "1.5rem" }}>
              <h3 className="section-title" style={{ marginBottom: "1rem", fontSize: "1rem" }}>Add New Card</h3>
              <div className="form-field">
                <label className="form-label">Card Number</label>
                <input type="text" inputMode="numeric" placeholder="1234 5678 9012 3456"
                  className="form-input" value={newCard.number}
                  onChange={(e) => setNewCard({ ...newCard, number: formatCardNumber(e.target.value) })} />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Expiry</label>
                  <input type="text" inputMode="numeric" placeholder="MM/YY"
                    className="form-input" value={newCard.expiry}
                    onChange={(e) => setNewCard({ ...newCard, expiry: formatExpiry(e.target.value) })} />
                </div>
                <div className="form-field">
                  <label className="form-label">CVV</label>
                  <input type="text" inputMode="numeric" placeholder="123" maxLength={4}
                    className="form-input" value={newCard.cvv}
                    onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Cardholder Name</label>
                <input type="text" placeholder="Malcolm Govender"
                  className="form-input" value={newCard.holder}
                  onChange={(e) => setNewCard({ ...newCard, holder: e.target.value })} />
              </div>
              <button onClick={handleSaveCard}
                disabled={newCard.number.replace(/\s/g, "").length < 13 || newCard.expiry.length < 4 || newCard.cvv.length < 3}
                className="primary-btn primary-violet" id="save-card-btn" style={{ marginTop: "0.5rem" }}>
                Save Card
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Transaction History ────────────────────────────────────────

  const HistoryScreen = () => {
    const filters = ["all", "deposits", "payments", "transfers"];
    const filtered = TRANSACTIONS.filter((tx) => {
      if (txFilter === "all") return true;
      if (txFilter === "deposits") return tx.type === "DEPOSIT";
      if (txFilter === "payments") return tx.type === "PAYMENT";
      if (txFilter === "transfers") return tx.type === "TRANSFER";
      return true;
    });

    const grouped = groupTransactionsByDate(filtered);
    const totalIn = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalOut = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

    return (
      <div className={`screen-fade ${fadeIn ? "visible" : ""}`} style={{ paddingBottom: "6rem" }}>
        <div className="sub-header">
          <button onClick={() => navigate("dashboard")} className="back-btn" id="history-back"><ChevronLeftSvg /></button>
          <h2 className="sub-title">Transactions</h2>
          <button className="back-btn" id="history-search"><SearchSvg /></button>
        </div>

        {/* Monthly summary */}
        <div className={`history-summary ${slideUp ? "slide-visible" : ""}`}>
          <div className="history-summary-item">
            <span className="history-summary-label">Money In</span>
            <span className="history-summary-in">+{formatCurrency(totalIn)}</span>
          </div>
          <div className="history-summary-divider" />
          <div className="history-summary-item">
            <span className="history-summary-label">Money Out</span>
            <span className="history-summary-out">-{formatCurrency(totalOut)}</span>
          </div>
        </div>

        <div className="filter-bar">
          {filters.map((f) => (
            <button key={f} onClick={() => setTxFilter(f)}
              className={`filter-btn ${txFilter === f ? "filter-active" : ""}`} id={`filter-${f}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className={`tx-history ${slideUp ? "slide-visible delay-1" : ""}`}>
          {filtered.length === 0 ? (
            <div className="empty-state-premium">
              <div className="empty-state-icon">
                <Icon3D src={ICON_MAP.payment} alt="no transactions" size={52} />
              </div>
              <h3 className="empty-state-title">No transactions yet</h3>
              <p className="empty-state-desc">Your transactions will appear here once you start sending or receiving money.</p>
              <button onClick={() => navigate("send")} className="primary-btn primary-violet" style={{ marginTop: "1.5rem", width: "80%" }}>
                Send Money
              </button>
            </div>
          ) : (
            Object.entries(grouped).map(([label, txs]) => (
              <div key={label} className="tx-group">
                <div className="tx-group-header">
                  <span className="tx-group-label">{label}</span>
                  <span className="tx-group-count">{txs.length} transaction{txs.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="tx-list">
                  {txs.map((tx, i) => (
                    <div key={tx.id} className={`tx-row ${i > 0 ? "tx-row-border" : ""}`}>
                      <TransactionIcon type={tx.icon} />
                      <div className="tx-info">
                        <p className="tx-desc">{tx.description}</p>
                        <p className="tx-time">{formatTime(tx.date)}</p>
                      </div>
                      <div className="tx-right">
                        <p className={`tx-amount ${tx.amount > 0 ? "tx-positive" : "tx-negative"}`}>
                          {tx.amount > 0 ? "+" : "-"}{formatCurrency(tx.amount)}
                        </p>
                        <p className="tx-type">{tx.type.toLowerCase()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ─── Settings Screen ────────────────────────────────────────────

  const SettingsScreen = () => (
    <div className={`screen-fade ${fadeIn ? "visible" : ""}`} style={{ paddingBottom: "6rem" }}>
      {/* Profile card */}
      <div className="settings-profile-card">
        <div className="settings-profile-aurora" />
        <div className="avatar-ring" style={{ width: 64, height: 64, padding: 3 }}>
          <Image src="/icons/avatar-malcolm.jpg" alt="Malcolm" width={58} height={58} className="settings-avatar-img" />
          <span className="avatar-online" />
        </div>
        <div className="settings-profile-info">
          <p className="settings-profile-name">Malcolm Govender</p>
          <p className="settings-profile-email">malcolm@swifterwallet.co.za</p>
          <div className="settings-profile-badge">
            <span className="settings-profile-badge-dot" />
            Verified Account
          </div>
        </div>
        <button className="settings-edit-btn" onClick={() => setToastMsg("Profile editor coming soon")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>

      <div style={{ padding: "0 1.5rem" }}>
        {/* Account */}
        <p className="settings-section-label">Account</p>
        <div className="settings-list">
          {[
            { emoji: "💳", label: "Payment Methods", desc: `${savedCards.length} card${savedCards.length !== 1 ? "s" : ""} saved`, action: () => navigate("manageCards") },
            { emoji: "📊", label: "Statement", desc: "Download or share your history", action: () => setToastMsg("Statement download coming soon") },
            { emoji: "🔗", label: "Linked Accounts", desc: "Manage bank connections", action: () => setToastMsg("Bank linking coming soon") },
          ].map((item, i) => (
            <button key={i} onClick={item.action} className={`settings-item ${i > 0 ? "settings-border" : ""}`} id={`setting-${item.label.toLowerCase().replace(/ /g, "-")}`}>
              <div className="settings-icon">{item.emoji}</div>
              <div className="settings-info">
                <p className="settings-label">{item.label}</p>
                <p className="settings-desc">{item.desc}</p>
              </div>
              <ChevronRightSvg />
            </button>
          ))}
        </div>

        {/* Preferences */}
        <p className="settings-section-label">Preferences</p>
        <div className="settings-list">
          {[
            { emoji: dark ? "☀️" : "🌙", label: "Appearance", desc: dark ? "Currently dark mode" : "Currently light mode", action: () => { setDark(!dark); setToastMsg(`Switched to ${dark ? "light" : "dark"} mode`); } },
            { emoji: "🌍", label: "Currency & Region", desc: "ZAR · South Africa", action: () => setToastMsg("Region settings coming soon") },
            { emoji: "🔔", label: "Notifications", desc: notifEnabled ? `Active via ${notifChannel}` : "Disabled", action: () => setNotifEnabled(!notifEnabled) },
          ].map((item, i) => (
            <button key={i} onClick={item.action} className={`settings-item ${i > 0 ? "settings-border" : ""}`}>
              <div className="settings-icon">{item.emoji}</div>
              <div className="settings-info">
                <p className="settings-label">{item.label}</p>
                <p className="settings-desc">{item.desc}</p>
              </div>
              <ChevronRightSvg />
            </button>
          ))}
        </div>

        {/* Security */}
        <p className="settings-section-label">Security</p>
        <div className="settings-list">
          {[
            { emoji: "🛡️", label: "PayGuard™", desc: "AI fraud protection · Active", accent: "#10b981", action: () => setToastMsg("PayGuard is active and protecting your account") },
            { emoji: "🗝️", label: "Change PIN", desc: "Update your security PIN", action: () => setToastMsg("PIN change coming soon") },
          ].map((item, i) => (
            <button key={i} onClick={item.action} className={`settings-item ${i > 0 ? "settings-border" : ""}`}>
              <div className="settings-icon">{item.emoji}</div>
              <div className="settings-info">
                <p className="settings-label">{item.label}</p>
                <p className="settings-desc" style={item.accent ? { color: item.accent } : {}}>{item.desc}</p>
              </div>
              <ChevronRightSvg />
            </button>
          ))}
        </div>

        {/* ── Biometric Security ─────────────────────────────────── */}
        <div className="smartsendr-card" style={{ marginTop: "1rem" }}>
          <div className="smartsendr-header">
            <span className="smartsendr-logo">🔐 Biometric Security</span>
            <button
              className={`toggle-switch ${biometricEnabled ? "toggle-on" : ""}`}
              onClick={async () => {
                if (!biometricEnabled) {
                  const supported = window.PublicKeyCredential
                    ? await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false)
                    : false;
                  if (!supported) { setToastMsg("Biometrics not supported on this device"); return; }
                  setBiometricEnabled(true);
                  localStorage.setItem("bioEnabled", "true");
                } else {
                  setBiometricEnabled(false);
                  localStorage.setItem("bioEnabled", "false");
                }
              }}
            >
              <div className="toggle-thumb" />
            </button>
          </div>
          <p className="smartsendr-desc">Use Face ID or fingerprint to confirm high-value transactions</p>
          {biometricEnabled && (
            <div style={{ marginTop: "0.75rem" }}>
              {biometricRegistered ? (
                <div className="bio-status-row">
                  <span className="bio-status-ok">✓ Biometric registered</span>
                  <button className="bio-reregister-btn" onClick={async () => {
                    try {
                      const optRes = await fetch("/api/webauthn/register/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
                      const optionsJSON = await optRes.json();
                      const { startRegistration } = await import("@simplewebauthn/browser");
                      const attResp = await startRegistration({ optionsJSON });
                      const verRes = await fetch("/api/webauthn/register/finish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(attResp) });
                      const result = await verRes.json();
                      if (result.verified) setToastMsg("Biometric updated");
                    } catch (err) { if (err?.name !== "NotAllowedError") setToastMsg("Update cancelled"); }
                  }}>Update</button>
                </div>
              ) : (
                <button className="primary-btn primary-violet bio-register-btn" disabled={bioRegistering} onClick={async () => {
                  setBioRegistering(true);
                  try {
                    const optRes = await fetch("/api/webauthn/register/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
                    if (!optRes.ok) throw new Error((await optRes.json()).error);
                    const optionsJSON = await optRes.json();
                    const { startRegistration } = await import("@simplewebauthn/browser");
                    const attResp = await startRegistration({ optionsJSON });
                    const verRes = await fetch("/api/webauthn/register/finish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(attResp) });
                    const result = await verRes.json();
                    if (result.verified) { setBiometricRegistered(true); localStorage.setItem("bioRegistered", "true"); setToastMsg("Biometric registered!"); }
                  } catch (err) { if (err?.name !== "NotAllowedError") setToastMsg("Registration failed. Try again."); }
                  finally { setBioRegistering(false); }
                }}>{bioRegistering ? "Setting up…" : "Set Up Biometric"}</button>
              )}
              {biometricRegistered && (
                <div style={{ marginTop: "1rem" }}>
                  <p className="smartsendr-desc" style={{ marginBottom: "0.5rem" }}>Require biometric above:</p>
                  <div className="smartsendr-channels" style={{ flexWrap: "wrap", gap: "0.4rem" }}>
                    {[100, 250, 500, 1000, 2000].map((val) => (
                      <button key={val} className={`channel-chip ${txThreshold === val ? "channel-active" : ""}`}
                        style={{ "--ch-color": "#7c3aed", flex: "none" }}
                        onClick={() => { setTxThreshold(val); localStorage.setItem("txThreshold", String(val)); setToastMsg(`Threshold set to R${val}`); }}>
                        R{val}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SmartSendr */}
        <p className="settings-section-label">Notifications</p>
        <div className="smartsendr-card">
          <div className="smartsendr-header">
            <span className="smartsendr-logo">📲 SmartSendr</span>
            <button
              className={`toggle-switch ${notifEnabled ? "toggle-on" : ""}`}
              onClick={() => setNotifEnabled(!notifEnabled)}
              id="notif-toggle"
            >
              <div className="toggle-thumb" />
            </button>
          </div>
          <p className="smartsendr-desc">Get instant receipts for every transaction</p>
          {notifEnabled && (
            <div className="smartsendr-channels">
              {[
                { id: "whatsapp", label: "WhatsApp", icon: "💬", color: "#25D366" },
                { id: "sms", label: "SMS", icon: "📱", color: "#3b82f6" },
                { id: "email", label: "Email", icon: "📧", color: "#8b5cf6" },
              ].map((ch) => (
                <button
                  key={ch.id}
                  className={`channel-chip ${notifChannel === ch.id ? "channel-active" : ""}`}
                  style={{ '--ch-color': ch.color }}
                  onClick={() => { setNotifChannel(ch.id); setToastMsg(`Notifications set to ${ch.label}`); }}
                  id={`channel-${ch.id}`}
                >
                  <span>{ch.icon}</span>
                  <span>{ch.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Help & Support */}
        <p className="settings-section-label">Help</p>
        <div className="settings-list" style={{ marginBottom: 0 }}>
          {[
            { emoji: "💬", label: "Support Chat", desc: "Chat with our team", action: () => setToastMsg("Support chat coming soon") },
            { emoji: "📋", label: "Terms & Privacy", desc: "Legal documents", action: () => setToastMsg("Opening privacy policy...") },
            { emoji: "🚪", label: "Sign Out", desc: "End your session", action: () => setToastMsg("Sign out coming soon") },
          ].map((item, i) => (
            <button key={i} onClick={item.action} className={`settings-item ${i > 0 ? "settings-border" : ""}`}>
              <div className="settings-icon">{item.emoji}</div>
              <div className="settings-info">
                <p className="settings-label">{item.label}</p>
                <p className="settings-desc">{item.desc}</p>
              </div>
              <ChevronRightSvg />
            </button>
          ))}
        </div>

        <p className="settings-version">Swifter v1.0 · Built with 💜 in South Africa</p>
      </div>
    </div>
  );

  // ─── Tab Bar ────────────────────────────────────────────────────

  const [menuOpen, setMenuOpen] = useState(false);

  const TabBar = () => {
    const tabs = [
      { id: "dashboard", icon: "/icons/nav-home.png", label: "Home", glow: "#06b6d4" },
      { id: "wallets", icon: "/icons/nav-wallets.png", label: "Wallets", glow: "#f59e0b" },
      { id: "history", icon: "/icons/nav-history.png", label: "History", glow: "#10b981" },
      { id: "settings", icon: "/icons/nav-settings.png", label: "Settings", glow: "#ec4899" },
    ];
    const angles = [-150, -110, -70, -30];
    const radius = 140;
    return (
      <>
        {/* Frosted backdrop */}
        <div className={`radial-backdrop ${menuOpen ? "radial-backdrop-open" : ""}`} onClick={() => setMenuOpen(false)} />

        <div className={`radial-nav ${menuOpen ? "radial-nav-open" : ""}`} id="main-tab-bar">
          {/* Ambient base glow */}
          <div className={`radial-ambient ${menuOpen ? "radial-ambient-open" : ""}`} />

          {tabs.map((tab, i) => {
            const active = screen === tab.id;
            const rad = (angles[i] * Math.PI) / 180;
            const x = menuOpen ? Math.cos(rad) * radius : 0;
            const y = menuOpen ? Math.sin(rad) * radius : 0;
            const z = menuOpen ? 20 + i * 5 : 0; // depth layer
            return (
              <div
                key={tab.id}
                className={`radial-item ${menuOpen ? "radial-item-open" : ""} ${active ? "radial-item-active" : ""}`}
                style={{
                  transform: `translate3d(${x}px, ${y}px, ${z}px) scale(${menuOpen ? 1 : 0.2})`,
                  transitionDelay: menuOpen ? `${80 + i * 70}ms` : `${(3 - i) * 50}ms`,
                  '--item-glow': tab.glow,
                }}
              >
                {/* Ambient glow behind icon */}
                <div className="radial-item-glow" />
                <button
                  onClick={() => { navigate(tab.id); setMenuOpen(false); }}
                  className="radial-item-btn"
                  id={`tab-${tab.id}`}
                >
                  <Image src={tab.icon} alt={tab.label} width={40} height={40} className="radial-item-icon" />
                </button>
                <span className={`radial-item-label ${menuOpen ? "radial-label-show" : ""}`}>{tab.label}</span>
              </div>
            );
          })}

          {/* Center Orb — primary action */}
          <button
            className={`radial-orb ${menuOpen ? "radial-orb-open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            id="radial-menu-btn"
          >
            <div className="radial-orb-shadow" />
            <div className="radial-orb-ring" />
            <div className="radial-orb-ring radial-orb-ring-2" />
            <div className="radial-orb-ring radial-orb-ring-3" />
            <div className="radial-orb-core">
              <div className="radial-orb-sheen" />
              <div className="radial-orb-highlight" />
              <span className="radial-orb-text">{menuOpen ? "✕" : "Menu"}</span>
            </div>
          </button>
        </div>
      </>
    );
  };

  // ─── Loading State ──────────────────────────────────────────────
  // ─── Phone Frame Wrapper ────────────────────────────────────────

  const PhoneFrame = ({ children }) => (
    <div className="phone-stage">
      <div className="phone-frame">
        {/* Top bezel with camera */}
        <div className="phone-bezel-top">
          <div className="phone-speaker" />
          <div className="phone-camera" />
        </div>
        {/* Status bar */}
        <div className="phone-status-bar">
          <span className="status-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="status-icons">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.7"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.7"><path d="M2 22h20V2z"/></svg>
            <div className="status-battery">
              <div className="battery-body"><div className="battery-fill" /></div>
              <div className="battery-tip" />
            </div>
          </div>
        </div>
        {/* Screen content */}
        <div className="phone-screen">
          {children}
        </div>
        {/* Bottom nav indicator */}
        <div className="phone-bezel-bottom">
          <div className="phone-home-bar" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <PhoneFrame>
        <div className={`app-shell ${dark ? "dark" : "light"}`}>
          <div className="loading-screen">
            <div className="loading-orb-wrap">
              <div className="loading-orb-ring loading-orb-ring-1" />
              <div className="loading-orb-ring loading-orb-ring-2" />
              <div className="loading-orb-ring loading-orb-ring-3" />
              <div className="loading-orb-core">
                {/* Inline plasma logo */}
                <svg className="brand-orbits" viewBox="0 0 44 44" width="52" height="52">
                  <defs>
                    <linearGradient id="lplasmaA" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.5" />
                    </linearGradient>
                    <filter id="lplasmaGlow">
                      <feGaussianBlur stdDeviation="1.2" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <ellipse cx="22" cy="22" rx="19" ry="6" fill="none" stroke="url(#lplasmaA)" strokeWidth="1" transform="rotate(-35 22 22)" strokeDasharray="4 8" filter="url(#lplasmaGlow)" className="orbit orbit-1" />
                  <ellipse cx="22" cy="22" rx="19" ry="6" fill="none" stroke="url(#lplasmaA)" strokeWidth="1" transform="rotate(25 22 22)" strokeDasharray="6 10" filter="url(#lplasmaGlow)" className="orbit orbit-2" />
                  <ellipse cx="22" cy="22" rx="19" ry="6" fill="none" stroke="url(#lplasmaA)" strokeWidth="0.8" transform="rotate(80 22 22)" strokeDasharray="3 12" filter="url(#lplasmaGlow)" className="orbit orbit-3" />
                  <circle cx="22" cy="22" r="3.5" fill="none" stroke="#06b6d4" strokeWidth="0.8" opacity="0.6" className="core-ring" />
                  <circle cx="22" cy="22" r="2" fill="#a78bfa" opacity="0.95" />
                  <circle cx="22" cy="22" r="1.1" fill="#ffffff" opacity="0.8" />
                </svg>
              </div>
            </div>
            <h1 className="loading-title">SWIFTER</h1>
            <p className="loading-sub">Your money, simplified</p>
            <div className="loading-dots">
              <span className="loading-dot-1" />
              <span className="loading-dot-2" />
              <span className="loading-dot-3" />
            </div>
            <p className="loading-hint">Secured by PayGuard™</p>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────

  return (
    <PhoneFrame>
      <div className={`app-shell ${dark ? "dark" : "light"}`}>
        <div className="app-container">
          {screen === "dashboard" && Dashboard()}
          {screen === "wallets" && WalletsScreen()}
          {screen === "send" && SendScreen()}
          {screen === "addFunds" && AddFundsScreen()}
          {screen === "history" && HistoryScreen()}
          {screen === "settings" && SettingsScreen()}
          {screen === "manageCards" && <ManageCardsScreen />}
        </div>
        {!["send", "addFunds", "manageCards"].includes(screen) && <TabBar />}
        {/* Incoming Payment Banner */}
        {incomingPayment && (
          <div className="incoming-payment-banner" onClick={() => setIncomingPayment(null)}>
            <span className="incoming-payment-icon">💸</span>
            <div className="incoming-payment-text">
              <strong>Payment received</strong>
              <span>R{incomingPayment.amount} from {incomingPayment.sender}</span>
            </div>
          </div>
        )}
        {/* Voice Co-Pilot Overlay */}
        {voiceOpen && (
          <div className="voice-overlay" onClick={() => { stopVoiceSession(); setVoiceOpen(false); }}>
            <div className="voice-panel" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { stopVoiceSession(); setVoiceOpen(false); }} className="voice-close">✕</button>
              {/* 60fps Canvas Avatar */}
              <div className="voice-avatar-wrap">
                <SwifterAvatar status={voiceStatus} volume={voiceVolume} size={150} />
              </div>
              <h3 className="voice-title">Swifter</h3>
              <p className="voice-status-badge" data-status={voiceStatus}>{voiceStatusLabels[voiceStatus]}</p>
              {/* Waveform */}
              <div className="voice-waveform">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className={`voice-bar ${voiceStatus === "speaking" ? "voice-bar-active" : voiceStatus === "listening" ? "voice-bar-listen" : ""}`}
                    style={{ animationDelay: `${i * 0.06}s`, height: voiceStatus === "speaking" ? `${6 + voiceVolume * 22 * Math.sin(i * 0.8)}px` : undefined }} />
                ))}
              </div>
              {transcript && (
                <div className="voice-transcript">
                  <span className="voice-transcript-label">You said:</span>
                  <p className="voice-transcript-text">{transcript}</p>
                </div>
              )}
              {aiResponse && (
                <div className="voice-ai-response">
                  <span className="voice-transcript-label">Swifter:</span>
                  <p className="voice-transcript-text">{aiResponse}</p>
                </div>
              )}
              {actionLog.length > 0 && (
                <div className="voice-action-log">
                  {actionLog.map((log, i) => (
                    <div key={i} className="voice-action-item">{log}</div>
                  ))}
                </div>
              )}
              {voiceStatus === "idle" && (
                <div className="voice-suggestions">
                  <p className="voice-suggest-label">Try saying:</p>
                  {[
                    "Send R500 to Sarah",
                    "What's my balance?",
                    "Show my last 5 transactions",
                    "Pay my Netflix bill",
                    "Sawubona, thumela u-R200 ku-Thabo", // isiZulu
                    "Wat is my saldo?",                    // Afrikaans
                  ].map((s, i) => (
                    <button key={i} className="voice-suggest-chip" onClick={() => { setTranscript(s); startVoiceSession(); }}>{s}</button>
                  ))}
                  <p className="voice-suggest-lang-note">🌍 Responds in your language — Zulu, Xhosa, Sotho, Afrikaans, English</p>
                </div>
              )}
              {voiceStatus === "idle" ? (
                <button onClick={startVoiceSession} className="primary-btn primary-violet" style={{ marginTop: "1rem", width: "100%" }}>
                  🎙️ Start Conversation
                </button>
              ) : voiceStatus === "connecting" ? (
                <button disabled className="primary-btn" style={{ marginTop: "1rem", width: "100%", opacity: 0.5 }}>
                  Connecting...
                </button>
              ) : (
                <button onClick={stopVoiceSession} className="primary-btn primary-red" style={{ marginTop: "1rem", width: "100%" }}>
                  ⬛ End Session
                </button>
              )}
            </div>
          </div>
        )}
        {/* ── Voice biometric confirmation modal ──────────────── */}
        {pendingVoiceAction && (
          <div className="bio-modal-overlay">
            <div className="bio-modal-panel">
              <div className="bio-modal-header">
                <p className="bio-modal-label">Biometric required</p>
                <p className="bio-modal-amount">
                  R{Number(pendingVoiceAction.args.amount).toFixed(2)}
                  {pendingVoiceAction.args.recipient && (
                    <span className="bio-modal-to"> → {pendingVoiceAction.args.recipient}</span>
                  )}
                </p>
              </div>
              <BiometricPrompt
                amount={pendingVoiceAction.args.amount}
                mode="transaction"
                onSuccess={() => {
                  const result = executeVoiceAction(pendingVoiceAction.name, pendingVoiceAction.args);
                  voicePendingRef.current?.(result);
                  voicePendingRef.current = null;
                  setPendingVoiceAction(null);
                }}
                onCancel={() => {
                  voicePendingRef.current?.({ success: false, message: "Transaction cancelled — biometric verification declined" });
                  voicePendingRef.current = null;
                  setPendingVoiceAction(null);
                }}
              />
            </div>
          </div>
        )}
        {toastMsg && (
          <div className="premium-toast" role="alert">
            <div className="premium-toast-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className="premium-toast-msg">{toastMsg}</span>
            <div className="premium-toast-bar" />
          </div>
        )}

        {/* ── Notification Center ──────────────────────────────────── */}
        {notifOpen && (
          <div className="notif-overlay" onClick={() => setNotifOpen(false)}>
            <div className="notif-panel" onClick={(e) => e.stopPropagation()}>
              <div className="notif-panel-header">
                <h3 className="notif-panel-title">Notifications</h3>
                <div className="notif-panel-actions">
                  {unreadCount > 0 && (
                    <button
                      className="notif-mark-all"
                      onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                    >
                      Mark all read
                    </button>
                  )}
                  <button className="voice-close" onClick={() => setNotifOpen(false)}>✕</button>
                </div>
              </div>
              <div className="notif-list">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notif-item ${notif.read ? "notif-read" : "notif-unread"}`}
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.map((n) => n.id === notif.id ? { ...n, read: true } : n)
                      )
                    }
                  >
                    <div className={`notif-icon-wrap notif-icon-${notif.type}`}>{notif.icon}</div>
                    <div className="notif-content">
                      <p className="notif-title">{notif.title}</p>
                      <p className="notif-body">{notif.body}</p>
                      <p className="notif-time">{notif.time}</p>
                    </div>
                    {!notif.read && <span className="notif-unread-dot" />}
                    <button
                      className="notif-dismiss-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="notif-empty">
                    <span className="notif-empty-icon">🔔</span>
                    <p>All caught up!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Welcome Onboarding Carousel ──────────────────────────── */}
        {showOnboarding && !loading && (
          <div className="onboarding-overlay">
            <div className="onboarding-bg-glow" />
            <button
              className="onboarding-skip"
              onClick={() => {
                setShowOnboarding(false);
                localStorage.setItem("swifter_onboarded", "1");
                if (!localStorage.getItem("swifter_tooltips_seen")) {
                  setTimeout(() => { setShowTooltips(true); setTooltipStep(0); }, 500);
                }
              }}
            >
              Skip
            </button>
            <div className="onboarding-slides-viewport">
              <div
                className="onboarding-slides"
                style={{ transform: `translateX(-${onboardingStep * 100}%)` }}
              >
                {ONBOARDING_SLIDES.map((slide, i) => (
                  <div key={i} className="onboarding-slide">
                    <div className="onboarding-emoji">{slide.emoji}</div>
                    <h2 className="onboarding-title">{slide.title}</h2>
                    <p className="onboarding-body">{slide.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="onboarding-dots">
              {ONBOARDING_SLIDES.map((_, i) => (
                <span
                  key={i}
                  className={`onboarding-dot ${i === onboardingStep ? "onboarding-dot-active" : ""}`}
                  onClick={() => setOnboardingStep(i)}
                />
              ))}
            </div>
            {onboardingStep < ONBOARDING_SLIDES.length - 1 ? (
              <button
                className="primary-btn primary-violet onboarding-next"
                onClick={() => setOnboardingStep((s) => s + 1)}
              >
                Next
              </button>
            ) : (
              <button
                className="primary-btn primary-violet onboarding-next"
                onClick={() => {
                  setShowOnboarding(false);
                  localStorage.setItem("swifter_onboarded", "1");
                  if (!localStorage.getItem("swifter_tooltips_seen")) {
                    setTimeout(() => { setShowTooltips(true); setTooltipStep(0); }, 500);
                  }
                }}
              >
                Get Started →
              </button>
            )}
          </div>
        )}

        {/* ── Feature Discovery Tooltips ───────────────────────────── */}
        {showTooltips && !loading && !showOnboarding && screen === "dashboard" && (
          <div className="tooltip-overlay">
            {tooltipStep === 0 && (
              <div className="tooltip-bubble tooltip-voice">
                <p className="tooltip-text">🎙️ Talk to Swifter — say &ldquo;Pay Sarah R100&rdquo;</p>
                <div className="tooltip-actions">
                  <button
                    className="tooltip-skip"
                    onClick={() => {
                      setShowTooltips(false);
                      localStorage.setItem("swifter_tooltips_seen", "1");
                    }}
                  >
                    Skip tour
                  </button>
                  <button className="tooltip-next" onClick={() => setTooltipStep(1)}>Next →</button>
                </div>
                <div className="tooltip-arrow tooltip-arrow-down" />
              </div>
            )}
            {tooltipStep === 1 && (
              <div className="tooltip-bubble tooltip-quickpay">
                <p className="tooltip-text">⚡ Tap a contact for an instant payment</p>
                <div className="tooltip-actions">
                  <button
                    className="tooltip-skip"
                    onClick={() => {
                      setShowTooltips(false);
                      localStorage.setItem("swifter_tooltips_seen", "1");
                    }}
                  >
                    Skip
                  </button>
                  <button className="tooltip-next" onClick={() => setTooltipStep(2)}>Next →</button>
                </div>
                <div className="tooltip-arrow tooltip-arrow-up" />
              </div>
            )}
            {tooltipStep === 2 && (
              <div className="tooltip-bubble tooltip-insights">
                <p className="tooltip-text">📊 Track where your money goes each month</p>
                <div className="tooltip-actions">
                  <button
                    className="tooltip-next"
                    style={{ marginLeft: "auto" }}
                    onClick={() => {
                      setShowTooltips(false);
                      localStorage.setItem("swifter_tooltips_seen", "1");
                    }}
                  >
                    Got it ✓
                  </button>
                </div>
                <div className="tooltip-arrow tooltip-arrow-up" />
              </div>
            )}
          </div>
        )}

        {/* ── Post-Transaction Feedback Survey ────────────────────── */}
        {showFeedback && (
          <div
            className="feedback-overlay"
            onClick={() => {
              setShowFeedback(false);
              setFeedbackRating(0);
              setFeedbackComment("");
              setFeedbackSent(false);
            }}
          >
            <div className="feedback-panel" onClick={(e) => e.stopPropagation()}>
              {feedbackSent ? (
                <div className="feedback-thanks">
                  <div className="feedback-thanks-icon">🎉</div>
                  <h3>Thank you!</h3>
                  <p>Your feedback helps us make Swifter better</p>
                  <button
                    className="primary-btn primary-violet"
                    style={{ width: "100%", marginTop: "0.5rem" }}
                    onClick={() => {
                      setShowFeedback(false);
                      setFeedbackRating(0);
                      setFeedbackComment("");
                      setFeedbackSent(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="feedback-header">
                    <h3 className="feedback-title">How was your experience?</h3>
                    <button
                      className="voice-close"
                      onClick={() => {
                        setShowFeedback(false);
                        setFeedbackRating(0);
                        setFeedbackComment("");
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <p className="feedback-sub">Rate your last transaction</p>
                  <div className="feedback-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`feedback-star ${feedbackRating >= star ? "feedback-star-active" : ""}`}
                        onClick={() => setFeedbackRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {feedbackRating > 0 && (
                    <textarea
                      className="feedback-textarea"
                      placeholder="Optional: tell us more..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      rows={3}
                    />
                  )}
                  {feedbackRating > 0 && (
                    <button
                      className="primary-btn primary-violet"
                      style={{ width: "100%" }}
                      onClick={() => setFeedbackSent(true)}
                    >
                      Submit Feedback
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}

// ─── Send Confirmation ───────────────────────────────────────────────

function SendConfirmation({ wallet, recipient, amount, navigate, biometricEnabled = false, biometricRegistered = false, txThreshold = 500, onTransactionComplete }) {
  const [sent, setSent] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pgPhase, setPgPhase] = useState(null); // null | "scanning" | "allowed" | "blocked"
  const [bioRequired, setBioRequired] = useState(false);

  const needsBiometric = biometricEnabled && biometricRegistered && parseFloat(amount) > txThreshold;

  const proceedWithSend = async () => {
    // ─── PayGuard SDK Risk Assessment ────────────────────
    setPgPhase("scanning");

    try {
      // Real SDK integration pattern — swap API key via env var
      const apiKey = typeof window !== "undefined" && window.__PAYGUARD_KEY__
        ? window.__PAYGUARD_KEY__
        : "pk_sandbox_swifterwallet_demo";

      const response = await fetch("https://risk-engine-production-18e6.up.railway.app/api/v1/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
        body: JSON.stringify({
          transactionId: `TXN-${Date.now()}`,
          amount: parseFloat(amount),
          currency: "ZAR",
          channel: "mobile_banking",
          paymentMethod: "wallet_transfer",
          customerId: "CUST-MALCOLM-001",
          recipientId: recipient?.id || "RCP-001",
          metadata: { source: "SwifterWallet", version: "1.0" },
        }),
      });

      const result = response.ok ? await response.json() : { decision: "ALLOW", riskScore: 12 };

      if (result.decision === "BLOCK") {
        setPgPhase("blocked");
        return; // Stop — fraud detected
      }

      setPgPhase("allowed");
    } catch {
      // Fail-open: if PayGuard is unreachable, allow the transaction
      setPgPhase("allowed");
    }

    // Brief pause to show the "Secure" badge
    await new Promise((r) => setTimeout(r, 800));

    // ─── Process Transaction ─────────────────────────────
    setProcessing(true);
    setPgPhase(null);
    setTimeout(() => {
      setProcessing(false);
      setSent(true);
      onTransactionComplete?.();
    }, 1800);
  };

  const handleSend = () => {
    if (needsBiometric) {
      setBioRequired(true);
    } else {
      proceedWithSend();
    }
  };

  // ─── Biometric confirmation phase ───────────────────────────────────
  if (bioRequired) {
    return (
      <BiometricPrompt
        amount={amount}
        mode="transaction"
        onSuccess={() => { setBioRequired(false); proceedWithSend(); }}
        onCancel={() => setBioRequired(false)}
      />
    );
  }

  // PayGuard scanning overlay
  if (pgPhase === "scanning") {
    return (
      <div className="processing-screen">
        <div className="pg-shield-ring">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div className="pg-shield-spinner" />
        </div>
        <p className="processing-title" style={{ color: "#a78bfa" }}>PayGuard Scanning...</p>
        <p className="processing-sub">Checking transaction security</p>
      </div>
    );
  }

  if (pgPhase === "allowed") {
    return (
      <div className="processing-screen">
        <div className="pg-shield-ring pg-shield-ok">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <p className="processing-title" style={{ color: "#10b981" }}>✓ Secure</p>
        <p className="processing-sub">Protected by PayGuard</p>
      </div>
    );
  }

  if (pgPhase === "blocked") {
    return (
      <div className="processing-screen">
        <div className="pg-shield-ring pg-shield-blocked">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <p className="processing-title" style={{ color: "#ef4444" }}>Transaction Blocked</p>
        <p className="processing-sub">PayGuard detected suspicious activity</p>
        <button onClick={() => { setPgPhase(null); navigate("dashboard"); }} className="primary-btn" style={{ marginTop: "2rem", width: "80%", background: "#ef4444" }}>Back to Dashboard</button>
      </div>
    );
  }

  if (processing) return <ProcessingAnimation color="violet" />;

  if (sent) {
    return (
      <div className="success-screen visible">
        <div className="success-ring">
          <div className="success-circle">
            <CheckSvg />
          </div>
        </div>
        <h2 className="success-title">Sent!</h2>
        <p className="success-amount">R{Number(amount).toFixed(2)}</p>
        <p className="success-sub">to {recipient?.name}</p>
        <div className="pg-badge">🛡️ Protected by PayGuard</div>
        <button onClick={() => navigate("dashboard")} className="primary-btn primary-violet" style={{ marginTop: "2rem", width: "100%" }} id="send-done">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="step-content slide-visible" style={{ padding: "0 1.5rem" }}>
      <div className="confirm-recipient">
        <div className="avatar avatar-xl" style={{ background: recipient?.gradient }}>{recipient?.avatar}</div>
        <p className="confirm-to-label">Sending to</p>
        <p className="confirm-to-name">{recipient?.name}</p>
      </div>
      <div className="confirm-amount">R{Number(amount).toFixed(2)}</div>
      <div className="confirm-details">
        <div className="confirm-row">
          <span>From</span>
          <span className="confirm-value">{wallet.name}</span>
        </div>
        <div className="confirm-row confirm-row-border">
          <span>To</span>
          <span className="confirm-value">{recipient?.name}</span>
        </div>
        <div className="confirm-row confirm-row-border">
          <span>Fee</span>
          <span className="confirm-fee">Free</span>
        </div>
        <div className="confirm-row confirm-row-border">
          <span>Security</span>
          <span className="confirm-value" style={{ color: "#7c3aed" }}>🛡️ PayGuard</span>
        </div>
      </div>
      <button onClick={handleSend} className="primary-btn primary-violet" id="confirm-send">
        Confirm & Send
      </button>
    </div>
  );
}

// ─── Processing Animation ────────────────────────────────────────────

function ProcessingAnimation({ color = "violet", onComplete }) {
  useEffect(() => {
    if (onComplete) {
      const t = setTimeout(onComplete, 2200);
      return () => clearTimeout(t);
    }
  }, [onComplete]);

  return (
    <div className="processing-screen">
      <div className={`processing-ring processing-${color}`}>
        <div className={`processing-track processing-track-${color}`} />
        <div className={`processing-spinner processing-spinner-${color}`} />
      </div>
      <p className="processing-title">Processing...</p>
      <p className="processing-sub">This will only take a moment</p>
    </div>
  );
}
