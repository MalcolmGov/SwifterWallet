"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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
      {/* Hero Header Section */}
      <div className="hero-header">
        <div className="hero-header-glow" />
        <div className="top-bar">
          <div className="top-bar-brand">
            <Image src="/icons/swifter-logo.png" alt="Swifter" width={48} height={48} className="brand-logo" />
            <div className="top-bar-text">
              <span className="brand-name">Swifter<span className="brand-name-accent">Wallet</span></span>
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
      </div>

      {/* Hero Balance Card */}
      <div className={`hero-card ${slideUp ? "slide-visible" : ""}`}>
        <div className="hero-bg-orb hero-orb-1" />
        <div className="hero-bg-orb hero-orb-2" />
        <div className="hero-bg-orb hero-orb-3" />
        <div className="hero-content">
          <div className="hero-top">
            <p className="hero-label">Total Balance</p>
            <button onClick={() => setBalanceVisible(!balanceVisible)} className="hero-eye-btn" id="toggle-balance">
              {balanceVisible ? <EyeSvg /> : <EyeOffSvg />}
            </button>
          </div>
          <h2 className="hero-amount">
            {balanceVisible ? formatCurrency(totalBalance) : "R•••••••"}
          </h2>
          <div className="hero-trend">
            <div className="hero-trend-badge">
              <TrendingUpSvg />
              <span>+12.5%</span>
            </div>
            <span className="hero-trend-label">this month</span>
          </div>
        </div>
      </div>

      {/* Quick Actions with 3D Icons */}
      <div className={`quick-actions ${slideUp ? "slide-visible delay-1" : ""}`}>
        {[
          { icon: ICON_MAP.send, label: "Send", action: () => navigate("send"), gradient: "linear-gradient(135deg, #7c3aed, #6366f1)" },
          { icon: ICON_MAP["add-funds"], label: "Add Funds", action: () => navigate("addFunds"), gradient: "linear-gradient(135deg, #059669, #10b981)" },
          { icon: ICON_MAP.transfer, label: "Transfer", action: () => navigate("send"), gradient: "linear-gradient(135deg, #2563eb, #3b82f6)" },
        ].map((a, i) => (
          <button key={i} onClick={a.action} className="quick-action-btn" id={`action-${a.label.toLowerCase().replace(' ', '-')}`}>
            <div className="quick-action-icon" style={{ background: a.gradient }}>
              <Icon3D src={a.icon} alt={a.label} size={36} />
            </div>
            <span className="quick-action-label">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Wallet Cards */}
      <div className={`section ${slideUp ? "slide-visible delay-2" : ""}`}>
        <div className="section-header">
          <h3 className="section-title">My Wallets</h3>
          <button onClick={() => navigate("wallets")} className="section-link" id="see-all-wallets">See All</button>
        </div>
        <div className="wallet-cards-scroll">
          {WALLETS.map((w) => (
            <button key={w.id} onClick={() => { setActiveWallet(w); navigate("wallets"); }} className="wallet-mini-card" style={{ background: w.gradient }} id={`wallet-${w.id}`}>
              <div className="wallet-mini-orb" />
              <div className="wallet-mini-content">
                <div className="wallet-mini-top">
                  <Icon3D src={ICON_MAP.wallet} alt="wallet" size={24} />
                  <span className="wallet-mini-type">{w.type}</span>
                </div>
                <p className="wallet-mini-name">{w.name}</p>
                <p className="wallet-mini-balance">
                  {balanceVisible ? formatCurrency(w.balance) : "R•••••"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`section last-section ${slideUp ? "slide-visible delay-3" : ""}`}>
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

      {/* FAB */}
      <button onClick={() => navigate("send")} className="fab" id="fab-send">
        <Icon3D src={ICON_MAP.send} alt="Send" size={28} />
      </button>
    </div>
  );

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
          { emoji: "🔔", label: "Notifications", desc: "Alerts & preferences" },
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
    </div>
  );

  // ─── Tab Bar ────────────────────────────────────────────────────

  const TabBar = () => {
    const tabs = [
      { id: "dashboard", Icon: HomeIcon, label: "Home" },
      { id: "wallets", Icon: WalletIcon, label: "Wallets" },
      { id: "history", Icon: ClockIcon, label: "History" },
      { id: "settings", Icon: SettingsIcon, label: "Settings" },
    ];
    return (
      <div className="tab-bar" id="main-tab-bar">
        <div className="tab-bar-inner">
          {tabs.map((tab) => {
            const active = screen === tab.id;
            return (
              <button key={tab.id} onClick={() => navigate(tab.id)} className={`tab-item ${active ? "tab-active" : ""}`} id={`tab-${tab.id}`}>
                <tab.Icon active={active} />
                <span className="tab-label">{tab.label}</span>
                {active && <div className="tab-dot" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Loading State ──────────────────────────────────────────────

  if (loading) {
    return (
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
    );
  }

  // ─── Main Render ────────────────────────────────────────────────

  return (
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
    </div>
  );
}

// ─── Send Confirmation ───────────────────────────────────────────────

function SendConfirmation({ wallet, recipient, amount, navigate }) {
  const [sent, setSent] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSend = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSent(true);
    }, 1800);
  };

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
        <button onClick={() => navigate("dashboard")} className="primary-btn primary-violet" style={{ marginTop: "2.5rem", width: "100%" }} id="send-done">
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
