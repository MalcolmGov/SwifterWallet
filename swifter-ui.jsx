"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Conversation } from "@elevenlabs/client";

// ── Imported Components ──────────────────────────────────────────────
import SwifterAvatar from "./components/SwifterAvatar";
import BiometricPrompt from "./components/BiometricPrompt";
import DashboardScreen from "./components/DashboardScreen";
import WalletsScreen from "./components/WalletsScreen";
import SendScreen from "./components/SendScreen";
import SendConfirmation from "./components/SendConfirmation";
import AddFundsScreen from "./components/AddFundsScreen";
import TransferScreen from "./components/TransferScreen";
import HistoryScreen from "./components/HistoryScreen";
import SettingsScreen from "./components/SettingsScreen";
import RewardsScreen from "./components/RewardsScreen";
import ManageCardsScreen from "./components/ManageCardsScreen";
import SmartNotifBanner from "./components/SmartNotifBanner";
import WellnessSection from "./components/WellnessSection";
import NotificationCenter from "./components/NotificationCenter";
import OnboardingCarousel from "./components/OnboardingCarousel";
import VoicePanel from "./components/VoicePanel";
import FeedbackSurvey from "./components/FeedbackSurvey";
import Numpad from "./components/Numpad";
import ProcessingAnimation from "./components/ProcessingAnimation";
import TabBar from "./components/TabBar";

// ── Imported Data, Utils, Icons ──────────────────────────────────────
import {
  WALLETS,
  TRANSACTIONS,
  CONTACTS,
  SMART_NOTIFS,
  NOTIFICATIONS,
  ONBOARDING_SLIDES,
  DEFAULT_SAVED_CARDS,
  SWIFTER_AGENT_PROMPT,
  ICON_MAP,
  SPENDING,
  UPCOMING_BILLS,
  SAVINGS_GOALS,
  REFERRALS,
  ACHIEVEMENTS,
  XP_EVENTS,
} from "./src/lib/data";
import {
  formatCurrency,
  formatTime,
  getGreeting,
  groupTransactionsByDate,
  fuzzyScore,
  computeWellnessScore,
  computeInsights,
} from "./src/lib/utils";
import { Icon3D, TransactionIcon, RewardsNavIcon } from "./src/lib/icons.jsx";

// ─── useAnimatedNumber Hook ────────────────────────────────────────────

function useAnimatedNumber(target, duration = 600) {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    const start = display;
    const delta = target - start;
    const frameCount = Math.floor(duration / 16);
    let frame = 0;

    const timer = setInterval(() => {
      frame += 1;
      const progress = frame / frameCount;
      const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      setDisplay(start + delta * eased);

      if (frame >= frameCount) {
        clearInterval(timer);
        setDisplay(target);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, display]);

  return display;
}

// ─── Main SwifterApp Component ──────────────────────────────────────────

export default function SwifterApp() {
  // ── Theme & UI ───────────────────────────────────────────────────
  const [dark, setDark] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("swifter_dark") !== "false" : true
  );
  const [screen, setScreen] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [slideUp, setSlideUp] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Wallets ──────────────────────────────────────────────────────
  const [wallets, setWallets] = useState(WALLETS);
  const [activeWallet, setActiveWallet] = useState(WALLETS[0]);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const animatedBalance = useAnimatedNumber(totalBalance);

  // ── Transactions ─────────────────────────────────────────────────
  const [transactions, setTransactions] = useState(TRANSACTIONS);
  const [txFilter, setTxFilter] = useState("all");

  // ── Send Flow ────────────────────────────────────────────────────
  const [sendStep, setSendStep] = useState(0);
  const [sendAmount, setSendAmount] = useState("");
  const [sendRecipient, setSendRecipient] = useState(null);
  const [sendWallet, setSendWallet] = useState(WALLETS[0]);

  // ── Transfer Flow ────────────────────────────────────────────────
  const [transferStep, setTransferStep] = useState(0);
  const [transferFrom, setTransferFrom] = useState(null);
  const [transferTo, setTransferTo] = useState(null);
  const [transferAmount, setTransferAmount] = useState("");

  // ── Add Funds Flow ───────────────────────────────────────────────
  const [addFundsStep, setAddFundsStep] = useState(0);
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [savedCards, setSavedCards] = useState(DEFAULT_SAVED_CARDS);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardForm, setCardForm] = useState({ number: "", expiry: "", cvv: "", holder: "" });
  const [yocoLoading, setYocoLoading] = useState(false);
  const [yocoError, setYocoError] = useState("");

  // ── Notifications & Smart Notifs ─────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [activeNotif, setActiveNotif] = useState(null);
  const [dismissedNotifs, setDismissedNotifs] = useState(new Set());
  const [toastMsg, setToastMsg] = useState("");
  const [incomingPayment, setIncomingPayment] = useState(null);
  const LOW_BALANCE_THRESHOLD = 500;

  // ── Voice Agent ──────────────────────────────────────────────────
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [actionLog, setActionLog] = useState([]);
  const [voiceVolume, setVoiceVolume] = useState(0);
  const [pendingVoiceAction, setPendingVoiceAction] = useState(null);

  // Voice refs
  const peerRef = useRef(null);
  const audioRef = useRef(null);
  const dcRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const elevenConvRef = useRef(null);
  const voicePendingRef = useRef(null);

  // ── Biometric Security ───────────────────────────────────────────
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

  // ── Gamification ─────────────────────────────────────────────────
  const [xpPoints] = useState(1240);
  const savingsStreak = 12;
  const [rewardsTab, setRewardsTab] = useState("badges");
  const [newlyUnlocked, setNewlyUnlocked] = useState(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const REFERRAL_CODE = "SWIFTER-MG42";
  const XP_LEVEL = Math.floor(xpPoints / 500) + 1;
  const XP_IN_LEVEL = xpPoints % 500;
  const XP_TO_NEXT = 500;

  // ── Misc ─────────────────────────────────────────────────────────
  const [pgScanning, setPgScanning] = useState(false);
  const [pgResult, setPgResult] = useState(null);
  const [notifChannel, setNotifChannel] = useState("whatsapp");
  const [notifEnabled, setNotifEnabled] = useState(true);

  // ── Onboarding & Tooltips ────────────────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(() =>
    typeof window !== "undefined" ? !localStorage.getItem("swifter_onboarded") : true
  );
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showTooltips, setShowTooltips] = useState(false);
  const [tooltipStep, setTooltipStep] = useState(0);

  // ── Feedback ─────────────────────────────────────────────────────
  const [showFeedback, setShowFeedback] = useState(false);
  const txCountRef = useRef(0);

  // ─── useEffect Hooks ─────────────────────────────────────────────

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

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(""), 3500);
    return () => clearTimeout(t);
  }, [toastMsg]);

  useEffect(() => {
    const timers = [];
    SMART_NOTIFS.forEach((notif) => {
      timers.push(
        setTimeout(() => {
          setActiveNotif((prev) => {
            if (prev) return prev;
            return notif;
          });
        }, notif.delay)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const low = wallets.filter((w) => w.balance < LOW_BALANCE_THRESHOLD);
    if (low.length === 0) return;
    const wallet = low[0];
    const msg = `Heads up — your ${wallet.name} is below R${LOW_BALANCE_THRESHOLD}`;
    const t = setTimeout(() => {
      setToastMsg(`⚠️ ${msg}`);
      announceVoice(msg);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

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
    }, 18000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => { if (peerRef.current) stopVoiceSession(); };
  }, [stopVoiceSession]);

  // ─── Helper Functions ───────────────────────────────────────────

  const navigate = (s) => {
    setScreen(s);
    if (s === "send") { setSendStep(0); setSendAmount(""); setSendRecipient(null); setSendWallet(wallets[0]); }
    if (s === "addFunds") { setAddFundsStep(0); setAddFundsAmount(""); setSelectedCard(null); setCardForm({ number: "", expiry: "", cvv: "", holder: "" }); setYocoError(""); }
    if (s === "transfer") { setTransferStep(0); setTransferFrom(wallets[0]); setTransferTo(null); setTransferAmount(""); }
  };

  const updateWalletBalance = (walletId, delta) => {
    setWallets((prev) =>
      prev.map((w) => w.id === walletId ? { ...w, balance: Math.round((w.balance + delta) * 100) / 100 } : w)
    );
  };

  const addTransaction = (tx) => {
    setTransactions((prev) => [tx, ...prev]);
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

  const handleYocoCheckout = async () => {
    setYocoLoading(true);
    setYocoError("");
    await new Promise((r) => setTimeout(r, 1200));
    setYocoLoading(false);
    setAddFundsStep(3);
    setTimeout(() => {
      const amt = Number(addFundsAmount);
      updateWalletBalance(activeWallet.id, amt);
      addTransaction({
        id: `t-dep-${Date.now()}`,
        description: `Deposit via ${selectedCard ? `•••• ${selectedCard.last4}` : "Card"}`,
        amount: amt,
        type: "DEPOSIT",
        category: "deposit",
        date: new Date().toISOString(),
        walletId: activeWallet.id,
        icon: "deposit",
      });
      setNotifications((prev) => [
        { id: `n-${Date.now()}`, icon: "💰", title: "Funds added", body: `R${amt.toFixed(2)} deposited to ${activeWallet.name}`, time: "Just now", read: false, color: "#10b981" },
        ...prev,
      ]);
      setAddFundsStep(4);
    }, 2200);
  };

  const handleAddNewCardAndPay = async () => {
    const num = cardForm.number.replace(/\s/g, "");
    if (num.length >= 13 && cardForm.expiry.length >= 4 && cardForm.cvv.length >= 3) {
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
      await handleYocoCheckout();
    }
  };

  const handleFundsBack = () => {
    if (addFundsStep === 2) setAddFundsStep(1);
    else if (addFundsStep === 1) setAddFundsStep(0);
    else navigate("dashboard");
  };

  const handleTransferComplete = () => {
    navigate("dashboard");
  };

  // ─── Voice Agent Logic ──────────────────────────────────────────

  const announceVoice = useCallback((text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (elevenConvRef.current) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-ZA";
    utt.rate = 0.95;
    utt.pitch = 1.0;
    window.speechSynthesis.speak(utt);
  }, []);

  const executeVoiceAction = useCallback(async (name, args = {}) => {
    switch (name) {
      case "find_payee":
        const query = args.query || "";
        return CONTACTS.filter((c) => fuzzyScore(query.toLowerCase(), c.name.toLowerCase()) > 0.5);
      case "check_balance":
        const wallet = args.wallet_id ? wallets.find((w) => w.id === args.wallet_id) : activeWallet;
        return wallet ? { balance: wallet.balance, currency: "ZAR" } : { error: "Wallet not found" };
      case "get_transactions":
        const limit = args.limit || 5;
        return transactions.slice(0, limit);
      case "get_financial_health":
        return computeInsights(wallets);
      case "send_money":
        if (args.recipient && args.amount && args.wallet_id) {
          const w = wallets.find((wal) => wal.id === args.wallet_id);
          if (!w || w.balance < args.amount) return { success: false, message: "Insufficient funds" };
          updateWalletBalance(args.wallet_id, -args.amount);
          addTransaction({
            id: `t-voice-${Date.now()}`,
            description: `Sent to ${args.recipient}`,
            amount: -args.amount,
            type: "PAYMENT",
            category: "transfer",
            date: new Date().toISOString(),
            walletId: args.wallet_id,
            icon: "transfer",
          });
          return { success: true, message: `R${args.amount} sent to ${args.recipient}` };
        }
        return { success: false, message: "Missing required fields" };
      case "transfer_funds":
        if (args.from_wallet && args.to_wallet && args.amount) {
          updateWalletBalance(args.from_wallet, -args.amount);
          updateWalletBalance(args.to_wallet, args.amount);
          addTransaction({
            id: `t-voice-transfer-${Date.now()}`,
            description: "Internal transfer",
            amount: -args.amount,
            type: "TRANSFER",
            category: "transfer",
            date: new Date().toISOString(),
            walletId: args.from_wallet,
            icon: "transfer",
          });
          return { success: true, message: `R${args.amount} transferred` };
        }
        return { success: false, message: "Missing wallet IDs" };
      case "add_funds":
        return { success: false, message: "Use the UI for adding funds" };
      case "navigate_screen":
        navigate(args.screen || "dashboard");
        return { success: true, message: `Navigated to ${args.screen}` };
      default:
        return { success: false, message: `Unknown action: ${name}` };
    }
  }, [wallets, transactions, activeWallet, updateWalletBalance, addTransaction]);

  const handleElevenLabsMessage = useCallback((msg) => {
    if (msg.type === "user_transcript") {
      setTranscript(msg.user_transcript || "");
    }
    if (msg.type === "agent_response") {
      setAiResponse(msg.agent_response || "");
    }
    if (msg.type === "tool_call") {
      setActionLog((prev) => [...prev, { tool: msg.tool_name, args: msg.tool_parameters }]);
    }
  }, []);

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

    if (elevenConvRef.current) {
      try { await elevenConvRef.current.endSession(); } catch { /* ignore */ }
      elevenConvRef.current = null;
    }

    setVoiceStatus("idle");
    setVoiceListening(false);
  }, []);

  const startVoiceSession = useCallback(async () => {
    try {
      setVoiceStatus("connecting");
      setTranscript("");
      setAiResponse("");
      setActionLog([]);

      await navigator.mediaDevices.getUserMedia({ audio: true });

      const walletSummary = wallets.map((w) =>
        `${w.name}: R${w.balance.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`
      ).join("; ");
      const total = wallets.reduce((s, w) => s + w.balance, 0);

      const publicAgentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      const sessionArgs = {
        dynamicVariables: {
          user_name: "Malcolm",
          user_full_name: "Malcolm Govender",
          is_authenticated: "true",
          wallet_count: String(wallets.length),
          balance_currency: "ZAR",
          balance_total: total.toLocaleString("en-ZA", { minimumFractionDigits: 2 }),
          wallets_summary: walletSummary,
          session_date: new Date().toISOString().slice(0, 10),
        },
        overrides: {
          agent: {
            prompt: { prompt: SWIFTER_AGENT_PROMPT },
          },
        },
        clientTools: {
          find_payee: (args) => voiceExecuteFunction("find_payee", args),
          send_money: (args) => voiceExecuteFunction("send_money", args),
          transfer_funds: (args) => voiceExecuteFunction("transfer_funds", args),
          add_funds: (args) => voiceExecuteFunction("add_funds", args),
          buy_airtime: (args) => voiceExecuteFunction("buy_airtime", args),
          pay_bill: (args) => voiceExecuteFunction("pay_bill", args),
          check_balance: (args) => voiceExecuteFunction("check_balance", args),
          get_transactions: (args) => voiceExecuteFunction("get_transactions", args),
          get_financial_health: (args) => voiceExecuteFunction("get_financial_health", args),
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
  }, [handleElevenLabsMessage, voiceExecuteFunction, wallets]);

  const handleDismissNotif = useCallback(() => {
    setDismissedNotifs((prev) => {
      const next = new Set(prev);
      if (activeNotif) next.add(activeNotif.id);
      return next;
    });
    setActiveNotif(null);
  }, [activeNotif]);

  // ─── Build app object passed to all screen components ───────────

  const app = {
    dark, setDark, screen, navigate, fadeIn, slideUp, loading,
    wallets, setWallets, activeWallet, setActiveWallet, balanceVisible, setBalanceVisible,
    totalBalance, animatedBalance, updateWalletBalance,
    transactions, setTransactions, addTransaction, txFilter, setTxFilter,
    sendStep, setSendStep, sendAmount, setSendAmount, sendRecipient, setSendRecipient, sendWallet, setSendWallet,
    transferStep, setTransferStep, transferFrom, setTransferFrom, transferTo, setTransferTo, transferAmount, setTransferAmount, handleTransferComplete,
    addFundsStep, setAddFundsStep, addFundsAmount, setAddFundsAmount, savedCards, setSavedCards, selectedCard, setSelectedCard,
    cardForm, setCardForm, yocoLoading, yocoError, handleYocoCheckout, handleAddNewCardAndPay, handleFundsBack,
    notifications, setNotifications, notifOpen, setNotifOpen, unreadCount,
    activeNotif, setActiveNotif, dismissedNotifs, setDismissedNotifs,
    voiceOpen, setVoiceOpen, voiceText, setVoiceText, voiceListening, setVoiceListening, voiceStatus, setVoiceStatus,
    transcript, setTranscript, aiResponse, setAiResponse, actionLog, setActionLog, voiceVolume, setVoiceVolume,
    startVoiceSession, stopVoiceSession,
    biometricEnabled, setBiometricEnabled, biometricRegistered, setBiometricRegistered,
    txThreshold, setTxThreshold, bioRegistering, setBioRegistering, pendingVoiceAction, setPendingVoiceAction,
    xpPoints, savingsStreak, rewardsTab, setRewardsTab, newlyUnlocked, setNewlyUnlocked, referralCopied, setReferralCopied,
    pgScanning, setPgScanning, pgResult, setPgResult, notifChannel, setNotifChannel, notifEnabled, setNotifEnabled,
    toastMsg, setToastMsg, menuOpen, setMenuOpen,
    showFeedback, setShowFeedback, txCountRef,
    showOnboarding, setShowOnboarding, onboardingStep, setOnboardingStep,
    showTooltips, setShowTooltips, tooltipStep, setTooltipStep,
    elevenConvRef, peerRef, audioRef, dcRef, analyserRef, animFrameRef,
    formatCardNumber, formatExpiry, detectBrand,
    incomingPayment, setIncomingPayment, LOW_BALANCE_THRESHOLD,
  };

  // ─── Render Loading Screen ──────────────────────────────────────

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
                  <ellipse cx="22" cy="22" rx="19" ry="6" fill="none" stroke="url(#lplasmaA)" strokeWidth="0.8" transform="rotate(-35 22 22)" strokeDasharray="4 8" filter="url(#lplasmaGlow)" className="orbit orbit-1" />
                  <ellipse cx="22" cy="22" rx="19" ry="6" fill="none" stroke="url(#lplasmaA)" strokeWidth="0.8" transform="rotate(25 22 22)" strokeDasharray="6 10" filter="url(#lplasmaGlow)" className="orbit orbit-2" />
                  <circle cx="22" cy="22" r="3" fill="none" stroke="#06b6d4" strokeWidth="0.6" opacity="0.5" className="core-ring" />
                  <circle cx="22" cy="22" r="1.8" fill="#a78bfa" opacity="0.9" />
                  <circle cx="22" cy="22" r="1" fill="#ffffff" opacity="0.7" />
                </svg>
              </div>
            </div>
            <p className="loading-text">Loading Swifter...</p>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  // ─── Main Screen Routing ────────────────────────────────────────

  return (
    <PhoneFrame>
      <div className={`app-shell ${dark ? "dark" : "light"}`}>
        {screen === "dashboard" && <DashboardScreen app={app} />}
        {screen === "wallets" && <WalletsScreen app={app} />}
        {screen === "send" && <SendScreen app={app} />}
        {screen === "addFunds" && <AddFundsScreen app={app} />}
        {screen === "transfer" && <TransferScreen app={app} />}
        {screen === "history" && <HistoryScreen app={app} />}
        {screen === "settings" && <SettingsScreen app={app} />}
        {screen === "rewards" && <RewardsScreen app={app} />}
        {screen === "manageCards" && <ManageCardsScreen app={app} />}

        {/* Overlays */}
        {voiceOpen && <VoicePanel app={app} />}
        {notifOpen && <NotificationCenter app={app} />}
        {showOnboarding && !loading && <OnboardingCarousel app={app} />}
        {showFeedback && <FeedbackSurvey app={app} />}

        {/* Toast, Voice pending, Tab bar */}
        {toastMsg && (
          <div className="premium-toast" role="alert">
            <div className="premium-toast-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className="premium-toast-msg">{toastMsg}</span>
            <div className="premium-toast-bar" />
          </div>
        )}

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
                  voicePendingRef.current?.({ success: false, message: "Transaction cancelled" });
                  voicePendingRef.current = null;
                  setPendingVoiceAction(null);
                }}
              />
            </div>
          </div>
        )}

        <TabBar app={app} />
      </div>
    </PhoneFrame>
  );
}

// ─── Phone Frame Component ──────────────────────────────────────────

const PhoneFrame = ({ children }) => (
  <div className="phone-stage">
    <div className="phone-frame">
      <div className="phone-bezel-top">
        <div className="phone-speaker" />
        <div className="phone-camera" />
      </div>
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
      <div className="phone-screen">{children}</div>
      <div className="phone-bezel-bottom">
        <div className="phone-home-bar" />
      </div>
    </div>
  </div>
);
