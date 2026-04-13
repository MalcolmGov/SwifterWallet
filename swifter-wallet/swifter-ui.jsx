"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import SwifterAvatar from "./components/SwifterAvatar";

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
  { id: "t1", description: "Spotify Premium", amount: -59.99, type: "PAYMENT", category: "entertainment", date: "2026-04-11T10:30:00", walletId: "w1", icon: "music" },
  { id: "t2", description: "Deposit from Yoco", amount: 2500.0, type: "DEPOSIT", category: "deposit", date: "2026-04-11T09:15:00", walletId: "w1", icon: "deposit" },
  { id: "t3", description: "Transfer to Savings", amount: -1000.0, type: "TRANSFER", category: "transfer", date: "2026-04-10T16:45:00", walletId: "w1", icon: "transfer" },
  { id: "t4", description: "Woolworths", amount: -342.8, type: "PAYMENT", category: "shopping", date: "2026-04-10T14:20:00", walletId: "w1", icon: "shopping" },
  { id: "t5", description: "Vida e Caffè", amount: -48.0, type: "PAYMENT", category: "food", date: "2026-04-10T08:30:00", walletId: "w1", icon: "coffee" },
  { id: "t6", description: "Freelance Payment", amount: 5800.0, type: "DEPOSIT", category: "deposit", date: "2026-04-09T12:00:00", walletId: "w3", icon: "deposit" },
  { id: "t7", description: "Electricity", amount: -850.0, type: "PAYMENT", category: "utilities", date: "2026-04-09T10:00:00", walletId: "w1", icon: "utilities" },
  { id: "t8", description: "Transfer from Business", amount: 2000.0, type: "TRANSFER", category: "transfer", date: "2026-04-08T15:30:00", walletId: "w1", icon: "transfer" },
];

const CONTACTS = [
  { id: "c1", name: "Sarah M.", avatar: "SM", gradient: "linear-gradient(135deg, #ec4899, #f472b6)" },
  { id: "c2", name: "David K.", avatar: "DK", gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)" },
  { id: "c3", name: "Thabo N.", avatar: "TN", gradient: "linear-gradient(135deg, #10b981, #34d399)" },
  { id: "c4", name: "Lisa P.", avatar: "LP", gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)" },
  { id: "c5", name: "James R.", avatar: "JR", gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)" },
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

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
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
  const [voiceVolume, setVoiceVolume] = useState(0);
  const [pgScanning, setPgScanning] = useState(false);
  const [pgResult, setPgResult] = useState(null);
  const [notifChannel, setNotifChannel] = useState("whatsapp");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

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
              <span className="brand-name">Swifter<span className="brand-dot">.</span></span>
              <p className="header-greeting">Good morning, <strong>Malcolm</strong> 👋</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={() => setDark(!dark)} className="header-btn" id="theme-toggle">
              {dark ? "☀️" : "🌙"}
            </button>
            <button className="header-btn notification-btn" id="notifications-btn">
              🔔
              <span className="notification-dot" />
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
            { label: "Chat Bank", action: () => window.open("https://wa.me/27600000000?text=Hi%2C%20I'd%20like%20to%20manage%20my%20SwifterWallet", "_blank"), glow: "#25D366",
              svg: <svg width="30" height="30" viewBox="0 0 24 24" fill="#4ade80"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
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

      {/* Quick Pay Contacts */}
      <div className={`section ${slideUp ? "slide-visible delay-2" : ""}`}>
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
      <div className={`section ${slideUp ? "slide-visible delay-3" : ""}`}>
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
      <div className={`section ${slideUp ? "slide-visible delay-4" : ""}`}>
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
      <div className={`section ${slideUp ? "slide-visible delay-5" : ""}`}>
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
      <div className={`section last-section ${slideUp ? "slide-visible delay-6" : ""}`}>
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
      <button onClick={() => { setVoiceOpen(true); setVoiceText(""); setVoiceListening(true); }} className="fab voice-fab" id="voice-fab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </button>
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

  const handleRealtimeEvent = useCallback((event) => {
    switch (event.type) {
      case "input_audio_buffer.speech_started":
        setVoiceStatus("listening");
        break;
      case "input_audio_buffer.speech_stopped":
        setVoiceStatus("thinking");
        break;
      case "conversation.item.input_audio_transcription.completed":
        setTranscript(event.transcript || "");
        break;
      case "response.audio_transcript.delta":
        setAiResponse(prev => prev + (event.delta || ""));
        setVoiceStatus("speaking");
        break;
      case "response.audio_transcript.done":
        setVoiceStatus("listening");
        break;
      case "response.done":
        if (event.response?.output) {
          event.response.output.forEach(item => {
            if (item.type === "function_call") {
              voiceExecuteFunction(item.name, JSON.parse(item.arguments || "{}"), item.call_id);
            }
          });
        }
        setVoiceStatus("listening");
        break;
      case "error":
        console.error("Realtime error:", event.error);
        setVoiceStatus("error");
        setAiResponse(`Error: ${event.error?.message || "Unknown error"}`);
        break;
    }
  }, []);

  const voiceExecuteFunction = useCallback((name, args, callId) => {
    let result = {};
    switch (name) {
      case "send_money":
        result = { success: true, message: `Sent R${args.amount?.toFixed(2)} to ${args.recipient}` };
        setActionLog(prev => [...prev, `💸 Sent R${args.amount} to ${args.recipient}`]);
        setToastMsg(`R${args.amount?.toFixed(2)} sent to ${args.recipient}`);
        break;
      case "transfer_funds":
        result = { success: true, message: `Transferred R${args.amount?.toFixed(2)} from ${args.from_wallet} to ${args.to_wallet}` };
        setActionLog(prev => [...prev, `🔄 R${args.amount} ${args.from_wallet} → ${args.to_wallet}`]);
        setToastMsg(`R${args.amount?.toFixed(2)} transferred`);
        break;
      case "add_funds":
        result = { success: true, message: `Added R${args.amount?.toFixed(2)}` };
        setActionLog(prev => [...prev, `➕ Added R${args.amount}`]);
        navigate("addFunds");
        break;
      case "buy_airtime":
        result = { success: true, message: `R${args.amount} airtime for ${args.phone_number}` };
        setActionLog(prev => [...prev, `📱 R${args.amount} airtime → ${args.phone_number}`]);
        setToastMsg(`R${args.amount} airtime sent`);
        break;
      case "pay_bill":
        result = { success: true, message: `${args.bill_name} paid` };
        setActionLog(prev => [...prev, `📄 Paid ${args.bill_name}`]);
        setToastMsg(`${args.bill_name} paid`);
        break;
      case "check_balance":
        const balances = { main: 24850, savings: 12420.5, business: 8390.75, all: 45661.25 };
        const w = args.wallet || "all";
        result = { balance: balances[w], wallet: w, formatted: `R${balances[w]?.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` };
        break;
      case "navigate_screen":
        navigate(args.screen);
        result = { success: true, message: `Navigated to ${args.screen}` };
        setActionLog(prev => [...prev, `📱 Opened ${args.screen}`]);
        break;
      default:
        result = { error: "Unknown function" };
    }
    if (dcRef.current?.readyState === "open") {
      dcRef.current.send(JSON.stringify({
        type: "conversation.item.create",
        item: { type: "function_call_output", call_id: callId, output: JSON.stringify(result) },
      }));
      dcRef.current.send(JSON.stringify({ type: "response.create" }));
    }
  }, []);

  const stopVoiceSession = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    analyserRef.current = null;
    setVoiceVolume(0);
    if (peerRef.current) {
      peerRef.current.getSenders().forEach(s => { if (s.track) s.track.stop(); });
      peerRef.current.close();
      peerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.srcObject = null;
      audioRef.current.remove();
      audioRef.current = null;
    }
    dcRef.current = null;
    setVoiceStatus("idle");
    setVoiceListening(false);
  }, []);

  const startVoiceSession = useCallback(async () => {
    try {
      setVoiceStatus("connecting");
      setTranscript("");
      setAiResponse("");
      setActionLog([]);

      const tokenRes = await fetch("/api/voice-session", { method: "POST" });
      if (!tokenRes.ok) throw new Error(`API ${tokenRes.status}: ${await tokenRes.text()}`);
      const sessionData = await tokenRes.json();
      const ephemeralKey = sessionData.client_secret?.value;
      if (!ephemeralKey) throw new Error("No ephemeral key");

      const pc = new RTCPeerConnection();
      peerRef.current = pc;

      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioEl.playsInline = true;
      document.body.appendChild(audioEl);
      audioRef.current = audioEl;
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
        audioEl.play().catch(() => {});
        // Set up audio analyser for volume detection
        try {
          const actx = new (window.AudioContext || window.webkitAudioContext)();
          const source = actx.createMediaStreamSource(e.streams[0]);
          const analyser = actx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyserRef.current = analyser;
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const tick = () => {
            analyser.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            setVoiceVolume(Math.min(1, avg / 80));
            animFrameRef.current = requestAnimationFrame(tick);
          };
          tick();
        } catch (e) { console.warn("Audio analyser failed:", e); }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      pc.addTrack(stream.getTracks()[0], stream);

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
          setVoiceStatus("error");
          setAiResponse("Connection lost.");
        }
      };

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.onopen = () => {
        setVoiceStatus("listening");
        setTimeout(() => {
          if (dc.readyState === "open") {
            dc.send(JSON.stringify({
              type: "conversation.item.create",
              item: { type: "message", role: "user", content: [{ type: "input_text", text: "Hi! Please greet me by name (Malcolm) and briefly tell me what you can help with." }] },
            }));
            dc.send(JSON.stringify({ type: "response.create" }));
          }
        }, 800);
      };

      dc.onmessage = (e) => {
        try { handleRealtimeEvent(JSON.parse(e.data)); } catch (err) { console.error("Parse:", err); }
      };

      dc.onerror = () => { setVoiceStatus("error"); setAiResponse("Data channel error."); };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2025-06-03", {
        method: "POST",
        headers: { "Authorization": `Bearer ${ephemeralKey}`, "Content-Type": "application/sdp" },
        body: offer.sdp,
      });

      if (!sdpRes.ok) throw new Error(`SDP ${sdpRes.status}`);
      await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });

    } catch (err) {
      console.error("Voice error:", err);
      setVoiceStatus("error");
      setAiResponse(err.message || "Failed to connect");
    }
  }, [handleRealtimeEvent]);

  useEffect(() => {
    return () => { if (peerRef.current) stopVoiceSession(); };
  }, [stopVoiceSession]);

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
                  <p className="select-sub">Recent</p>
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
            <p className="amount-to">Sending to <strong>{sendRecipient?.name}</strong></p>
          </div>
          <div className="amount-display">
            <span className="amount-currency">R</span>
            <span className="amount-value">{sendAmount || "0"}</span>
          </div>
          <p className="amount-available">Available: {formatCurrency(sendWallet.balance)}</p>
          {numpad(setSendAmount, sendAmount)}
          <div style={{ padding: "0 1.5rem", marginTop: "1.25rem" }}>
            <button onClick={() => sendAmount && Number(sendAmount) > 0 && setSendStep(3)}
              disabled={!sendAmount || Number(sendAmount) <= 0}
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

    return (
      <div className={`screen-fade ${fadeIn ? "visible" : ""}`} style={{ paddingBottom: "6rem" }}>
        <div className="sub-header">
          <button onClick={() => navigate("dashboard")} className="back-btn" id="history-back"><ChevronLeftSvg /></button>
          <h2 className="sub-title">Transactions</h2>
          <button className="back-btn" id="history-search"><SearchSvg /></button>
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
          <div className="tx-list">
            {filtered.map((tx, i) => (
              <div key={tx.id} className={`tx-row ${i > 0 ? "tx-row-border" : ""}`}>
                <TransactionIcon type={tx.icon} />
                <div className="tx-info">
                  <p className="tx-desc">{tx.description}</p>
                  <p className="tx-time">{formatTime(tx.date)}</p>
                </div>
                <div className="tx-right">
                  <p className={`tx-amount ${tx.amount > 0 ? "tx-positive" : ""}`}>
                    {tx.amount > 0 ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                  <p className="tx-type">{tx.type.toLowerCase()}</p>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="empty-state">
              <Icon3D src={ICON_MAP.payment} alt="no transactions" size={48} />
              <p>No transactions found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Settings Screen ────────────────────────────────────────────

  const SettingsScreen = () => (
    <div className={`screen-fade ${fadeIn ? "visible" : ""}`} style={{ padding: "0 1.5rem", paddingBottom: "6rem" }}>
      <h2 className="section-title" style={{ paddingTop: "0.5rem", marginBottom: "1.5rem", fontSize: "1.25rem" }}>Settings</h2>
      <div className="settings-list">
        {[
          { emoji: "👤", label: "Profile", desc: "Manage your account" },
          { emoji: "💳", label: "Payment Methods", desc: `${savedCards.length} card${savedCards.length !== 1 ? "s" : ""} saved`, action: () => navigate("manageCards") },
          { emoji: dark ? "☀️" : "🌙", label: "Appearance", desc: dark ? "Switch to light mode" : "Switch to dark mode", action: () => setDark(!dark) },
        ].map((item, i) => (
          <button key={i} onClick={item.action} className={`settings-item ${i > 0 ? "settings-border" : ""}`} id={`setting-${item.label.toLowerCase()}`}>
            <div className="settings-icon">{item.emoji}</div>
            <div className="settings-info">
              <p className="settings-label">{item.label}</p>
              <p className="settings-desc">{item.desc}</p>
            </div>
            <ChevronRightSvg />
          </button>
        ))}
      </div>

      {/* SmartSendr Notification Preferences */}
      <div className="smartsendr-card" style={{ marginTop: "1.5rem" }}>
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
            <div className="loading-logo">
              <Icon3D src={ICON_MAP.wallet} alt="Swifter" size={64} />
            </div>
            <h1 className="loading-title">Swifter</h1>
            <p className="loading-sub">Your money, simplified</p>
            <div className="loading-spinner">
              <div className="spinner-ring" />
            </div>
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
                  {["Send R500 to Sarah", "What's my balance?", "Pay my Netflix bill", "Buy R29 airtime for 082 123 4567"].map((s, i) => (
                    <button key={i} className="voice-suggest-chip" onClick={() => { setTranscript(s); startVoiceSession(); }}>{s}</button>
                  ))}
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
        {toastMsg && <div className="smartsendr-toast">{toastMsg}</div>}
      </div>
    </PhoneFrame>
  );
}

// ─── Send Confirmation ───────────────────────────────────────────────

function SendConfirmation({ wallet, recipient, amount, navigate }) {
  const [sent, setSent] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pgPhase, setPgPhase] = useState(null); // null | "scanning" | "allowed" | "blocked"

  const handleSend = async () => {
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
    }, 1800);
  };

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
