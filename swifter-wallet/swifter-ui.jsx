import { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Send,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Search,
  Bell,
  Moon,
  Sun,
  Wallet,
  ArrowRightLeft,
  ShoppingBag,
  Coffee,
  Zap,
  Check,
  X,
  Filter,
  Eye,
  EyeOff,
  TrendingUp,
  Clock,
  Home,
  Settings,
  User,
  CircleDollarSign,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────

const WALLETS = [
  { id: "w1", name: "Main Wallet", balance: 24850.0, type: "MAIN", color: "from-violet-600 to-indigo-700", accent: "#7c3aed" },
  { id: "w2", name: "Savings", balance: 12420.5, type: "SAVINGS", color: "from-emerald-500 to-teal-600", accent: "#10b981" },
  { id: "w3", name: "Business", balance: 8390.75, type: "BUSINESS", color: "from-amber-500 to-orange-600", accent: "#f59e0b" },
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
  { id: "c1", name: "Sarah M.", avatar: "SM", color: "bg-pink-500" },
  { id: "c2", name: "David K.", avatar: "DK", color: "bg-blue-500" },
  { id: "c3", name: "Thabo N.", avatar: "TN", color: "bg-emerald-500" },
  { id: "c4", name: "Lisa P.", avatar: "LP", color: "bg-amber-500" },
];

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

const TransactionIcon = ({ type, dark }) => {
  const base = `w-10 h-10 rounded-2xl flex items-center justify-center`;
  const iconSize = 18;
  switch (type) {
    case "deposit": return <div className={`${base} ${dark ? "bg-emerald-500/20" : "bg-emerald-50"}`}><ArrowDownLeft size={iconSize} className="text-emerald-500" /></div>;
    case "transfer": return <div className={`${base} ${dark ? "bg-blue-500/20" : "bg-blue-50"}`}><ArrowRightLeft size={iconSize} className="text-blue-500" /></div>;
    case "shopping": return <div className={`${base} ${dark ? "bg-violet-500/20" : "bg-violet-50"}`}><ShoppingBag size={iconSize} className="text-violet-500" /></div>;
    case "coffee": return <div className={`${base} ${dark ? "bg-amber-500/20" : "bg-amber-50"}`}><Coffee size={iconSize} className="text-amber-500" /></div>;
    case "utilities": return <div className={`${base} ${dark ? "bg-orange-500/20" : "bg-orange-50"}`}><Zap size={iconSize} className="text-orange-500" /></div>;
    default: return <div className={`${base} ${dark ? "bg-gray-500/20" : "bg-gray-50"}`}><CreditCard size={iconSize} className={dark ? "text-gray-400" : "text-gray-500"} /></div>;
  }
};

// ─── Skeleton Loader ─────────────────────────────────────────────────

const Skeleton = ({ w = "w-full", h = "h-4", rounded = "rounded-lg", dark }) => (
  <div className={`${w} ${h} ${rounded} ${dark ? "bg-white/5" : "bg-gray-200"} animate-pulse`} />
);

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
  const [txFilter, setTxFilter] = useState("all");
  const [fadeIn, setFadeIn] = useState(false);
  const [slideUp, setSlideUp] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
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
    if (s === "addFunds") { setAddFundsStep(0); setAddFundsAmount(""); }
  };

  const bg = dark ? "bg-[#0a0a0f]" : "bg-gray-50";
  const text = dark ? "text-white" : "text-gray-900";
  const textMuted = dark ? "text-gray-400" : "text-gray-500";
  const textSoft = dark ? "text-gray-500" : "text-gray-400";
  const card = dark ? "bg-white/[0.04] border-white/[0.06]" : "bg-white border-gray-100";
  const cardHover = dark ? "hover:bg-white/[0.07]" : "hover:bg-gray-50";
  const glass = dark
    ? "bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08]"
    : "bg-white/80 backdrop-blur-2xl border border-gray-200/60";
  const divider = dark ? "border-white/[0.06]" : "border-gray-100";

  const totalBalance = WALLETS.reduce((s, w) => s + w.balance, 0);

  // ─── Dashboard ──────────────────────────────────────────────────

  const Dashboard = () => (
    <div className={`transition-all duration-500 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-2 pb-4">
        <div>
          <p className={`text-sm ${textMuted}`}>Good morning</p>
          <h1 className={`text-xl font-semibold ${text} mt-0.5`}>Malcolm</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDark(!dark)} className={`w-10 h-10 rounded-2xl ${glass} flex items-center justify-center transition-all duration-300`}>
            {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-gray-600" />}
          </button>
          <button className={`w-10 h-10 rounded-2xl ${glass} flex items-center justify-center relative`}>
            <Bell size={18} className={dark ? "text-gray-300" : "text-gray-600"} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-violet-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Total Balance */}
      <div className={`mx-6 p-6 rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 relative overflow-hidden transition-all duration-500 ${slideUp ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-indigo-400/30 blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <p className="text-violet-200 text-sm font-medium">Total Balance</p>
            <button onClick={() => setBalanceVisible(!balanceVisible)} className="text-violet-200 hover:text-white transition-colors">
              {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <h2 className="text-4xl font-bold text-white mt-2 tracking-tight transition-all duration-300">
            {balanceVisible ? formatCurrency(totalBalance) : "R•••••••"}
          </h2>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              <TrendingUp size={12} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium">+12.5%</span>
            </div>
            <span className="text-violet-300 text-xs">this month</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`flex gap-3 px-6 mt-5 transition-all duration-500 delay-100 ${slideUp ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        {[
          { icon: <Send size={20} />, label: "Send", action: () => navigate("send"), color: "from-violet-600 to-violet-700" },
          { icon: <Plus size={20} />, label: "Add Funds", action: () => navigate("addFunds"), color: "from-emerald-500 to-emerald-600" },
          { icon: <ArrowRightLeft size={20} />, label: "Transfer", action: () => navigate("send"), color: "from-blue-500 to-blue-600" },
        ].map((a, i) => (
          <button key={i} onClick={a.action} className="flex-1 flex flex-col items-center gap-2 py-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white shadow-lg transition-transform active:scale-95`}>
              {a.icon}
            </div>
            <span className={`text-xs font-medium ${text}`}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Wallet Cards */}
      <div className={`mt-5 transition-all duration-500 delay-200 ${slideUp ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        <div className="flex items-center justify-between px-6 mb-3">
          <h3 className={`font-semibold ${text}`}>My Wallets</h3>
          <button onClick={() => navigate("wallets")} className={`text-sm text-violet-500 font-medium`}>See All</button>
        </div>
        <div className="flex gap-3 px-6 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {WALLETS.map((w) => (
            <button key={w.id} onClick={() => { setActiveWallet(w); navigate("wallets"); }} className={`min-w-[200px] p-4 rounded-2xl bg-gradient-to-br ${w.color} relative overflow-hidden transition-transform active:scale-[0.97] flex-shrink-0`}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/30 blur-xl" />
              </div>
              <div className="relative z-10 text-left">
                <p className="text-white/70 text-xs font-medium">{w.type}</p>
                <p className="text-white font-semibold text-sm mt-1">{w.name}</p>
                <p className="text-white text-lg font-bold mt-2">
                  {balanceVisible ? formatCurrency(w.balance) : "R•••••"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`mt-5 px-6 pb-24 transition-all duration-500 delay-300 ${slideUp ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold ${text}`}>Recent Transactions</h3>
          <button onClick={() => navigate("history")} className="text-sm text-violet-500 font-medium">See All</button>
        </div>
        <div className={`rounded-2xl border ${card} overflow-hidden`}>
          {TRANSACTIONS.slice(0, 5).map((tx, i) => (
            <div key={tx.id} className={`flex items-center gap-3 p-4 ${i > 0 ? `border-t ${divider}` : ""} ${cardHover} transition-colors cursor-pointer`}>
              <TransactionIcon type={tx.icon} dark={dark} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${text} truncate`}>{tx.description}</p>
                <p className={`text-xs ${textMuted} mt-0.5`}>{formatTime(tx.date)}</p>
              </div>
              <p className={`text-sm font-semibold ${tx.amount > 0 ? "text-emerald-500" : text}`}>
                {tx.amount > 0 ? "+" : "-"}{formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Send Button */}
      <button onClick={() => navigate("send")} className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-violet-500/30 transition-transform active:scale-90 z-40">
        <Send size={22} className="text-white" />
      </button>
    </div>
  );

  // ─── Wallets Screen ─────────────────────────────────────────────

  const WalletsScreen = () => (
    <div className={`px-6 pb-24 transition-all duration-500 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
      <div className="flex items-center justify-between pt-2 pb-4">
        <button onClick={() => navigate("dashboard")} className={`w-10 h-10 rounded-2xl ${glass} flex items-center justify-center`}>
          <ChevronLeft size={20} className={dark ? "text-gray-300" : "text-gray-600"} />
        </button>
        <h2 className={`text-lg font-semibold ${text}`}>My Wallets</h2>
        <button className={`w-10 h-10 rounded-2xl ${glass} flex items-center justify-center`}>
          <Plus size={20} className={dark ? "text-gray-300" : "text-gray-600"} />
        </button>
      </div>

      <div className={`flex flex-col gap-4 mt-2 transition-all duration-500 delay-100 ${slideUp ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        {WALLETS.map((w, i) => (
          <div key={w.id} className={`rounded-3xl bg-gradient-to-br ${w.color} p-6 relative overflow-hidden transition-all duration-300`} style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Wallet size={16} className="text-white" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">{w.type}</span>
                </div>
                <ChevronRight size={20} className="text-white/50" />
              </div>
              <h3 className="text-white text-xl font-bold mt-4">{w.name}</h3>
              <p className="text-white text-3xl font-bold mt-1 tracking-tight">
                {balanceVisible ? formatCurrency(w.balance) : "R•••••••"}
              </p>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setSendWallet(w); navigate("send"); }} className="flex-1 py-2.5 rounded-xl bg-white/20 text-white text-sm font-medium text-center backdrop-blur transition-all active:scale-[0.97]">
                  Send
                </button>
                <button onClick={() => navigate("addFunds")} className="flex-1 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-medium text-center transition-all active:scale-[0.97]">
                  Add Funds
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Send Money Flow ────────────────────────────────────────────

  const numpad = (setter, current) => (
    <div className="grid grid-cols-3 gap-3 px-6 mt-4">
      {[1,2,3,4,5,6,7,8,9,".",0,"del"].map((k) => (
        <button key={k} onClick={() => {
          if (k === "del") setter(current.slice(0, -1));
          else if (k === "." && current.includes(".")) return;
          else setter(current + k);
        }} className={`h-14 rounded-2xl ${k === "del" ? "" : glass} flex items-center justify-center text-xl font-medium ${text} transition-all active:scale-95`}>
          {k === "del" ? <X size={20} className={textMuted} /> : k}
        </button>
      ))}
    </div>
  );

  const SendScreen = () => (
    <div className={`pb-8 transition-all duration-500 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-2 pb-4">
        <button onClick={() => sendStep > 0 ? setSendStep(sendStep - 1) : navigate("dashboard")} className={`w-10 h-10 rounded-2xl ${glass} flex items-center justify-center`}>
          <ChevronLeft size={20} className={dark ? "text-gray-300" : "text-gray-600"} />
        </button>
        <h2 className={`text-lg font-semibold ${text}`}>
          {sendStep === 0 ? "Select Wallet" : sendStep === 1 ? "Select Recipient" : sendStep === 2 ? "Enter Amount" : "Confirm"}
        </h2>
        <button onClick={() => navigate("dashboard")} className={`w-10 h-10 rounded-2xl ${glass} flex items-center justify-center`}>
          <X size={20} className={dark ? "text-gray-300" : "text-gray-600"} />
        </button>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 px-6 mb-6">
        {[0,1,2,3].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= sendStep ? "bg-violet-500" : dark ? "bg-white/10" : "bg-gray-200"}`} />
        ))}
      </div>

      {/* Step 0: Select Wallet */}
      {sendStep === 0 && (
        <div className={`px-6 transition-all duration-300 ${slideUp ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <p className={`text-sm ${textMuted} mb-4`}>Choose which wallet to send from</p>
          <div className="flex flex-col gap-3">
            {WALLETS.map((w) => (
              <button key={w.id} onClick={() => { setSendWallet(w); setSendStep(1); }} className={`p-4 rounded-2xl border ${sendWallet.id === w.id ? "border-violet-500 ring-1 ring-violet-500/30" : divider} ${card} flex items-center gap-4 transition-all active:scale-[0.98]`}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${w.color} flex items-center justify-center`}>
                  <Wallet size={20} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${text}`}>{w.name}</p>
                  <p className={`text-sm ${textMuted}`}>{formatCurrency(w.balance)}</p>
                </div>
                <ChevronRight size={18} className={textSoft} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Select Recipient */}
      {sendStep === 1 && (
        <div className={`px-6 transition-all duration-300 ${slideUp ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <div className={`flex items-center gap-3 p-3 rounded-2xl ${glass} mb-5`}>
            <Search size={18} className={textMuted} />
            <input placeholder="Search name or email" className={`flex-1 bg-transparent text-sm ${text} outline-none placeholder:${textMuted}`} />
          </div>
          <p className={`text-xs font-medium ${textMuted} uppercase tracking-wider mb-3`}>Recent</p>
          <div className="flex flex-col gap-2">
            {CONTACTS.map((c) => (
              <button key={c.id} onClick={() => { setSendRecipient(c); setSendStep(2); }} className={`flex items-center gap-4 p-3 rounded-2xl ${cardHover} transition-all active:scale-[0.98]`}>
                <div className={`w-12 h-12 rounded-full ${c.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {c.avatar}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${text}`}>{c.name}</p>
                  <p className={`text-xs ${textMuted}`}>Recent</p>
                </div>
                <ChevronRight size={18} className={textSoft} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Enter Amount */}
      {sendStep === 2 && (
        <div className={`transition-all duration-300 ${slideUp ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <div className="flex flex-col items-center px-6 mb-4">
            <div className={`w-12 h-12 rounded-full ${sendRecipient?.color} flex items-center justify-center text-white font-bold text-sm mb-2`}>
              {sendRecipient?.avatar}
            </div>
            <p className={`text-sm ${textMuted}`}>Sending to <span className={`font-medium ${text}`}>{sendRecipient?.name}</span></p>
          </div>
          <div className="flex items-center justify-center gap-1 px-6 h-20">
            <span className={`text-2xl font-medium ${textMuted}`}>R</span>
            <span className={`text-5xl font-bold ${text} tracking-tight`}>
              {sendAmount || "0"}
            </span>
          </div>
          <p className={`text-center text-sm ${textMuted} mb-2`}>Available: {formatCurrency(sendWallet.balance)}</p>
          {numpad(setSendAmount, sendAmount)}
          <div className="px-6 mt-5">
            <button onClick={() => sendAmount && Number(sendAmount) > 0 && setSendStep(3)} disabled={!sendAmount || Number(sendAmount) <= 0} className={`w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-semibold text-base transition-all active:scale-[0.98] disabled:opacity-40`}>
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
          dark={dark}
          text={text}
          textMuted={textMuted}
          card={card}
          divider={divider}
          glass={glass}
          slideUp={slideUp}
          navigate={navigate}
        />
      )}
    </div>
  );

  // ─── Add Funds Flow ─────────────────────────────────────────────

  const AddFundsScreen = () => (
    <div className={`pb-8 transition-all duration-500 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
      <div className="flex items-center justify-between px-6 pt-2 pb-4">
        <button onClick={() => addFundsStep > 0 ? setAddFundsStep(0) : navigate("dashboard")} className={`w-10 h-10 rounded-2xl ${glass} flex items-center justify-center`}>
          <ChevronLeft size={20} className={dark ? "text-gray-300" : "text-gray-600"} />
        </button>
        <h2 className={`text-lg font-semibold ${text}`}>{addFundsStep === 2 ? "" : "Add Funds"}</h2>
        <button onClick={() => navigate("dashboard")} className={`w-10 h-10 rounded-2xl ${glass} flex items-center justify-center`}>
          <X size={20} className={dark ? "text-gray-300" : "text-gray-600"} />
        </button>
      </div>

      {addFundsStep === 0 && (
        <div className={`transition-all duration-300 ${slideUp ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <div className="flex items-center justify-center gap-1 px-6 mt-8 h-20">
            <span className={`text-2xl font-medium ${textMuted}`}>R</span>
            <span className={`text-5xl font-bold ${text} tracking-tight`}>
              {addFundsAmount || "0"}
            </span>
          </div>
          <div className="flex gap-2 justify-center mt-3 mb-2">
            {[100, 250, 500, 1000].map((q) => (
              <button key={q} onClick={() => setAddFundsAmount(String(q))} className={`px-4 py-2 rounded-xl ${glass} text-sm font-medium ${text} transition-all active:scale-95`}>
                R{q}
              </button>
            ))}
          </div>
          {numpad(setAddFundsAmount, addFundsAmount)}
          <div className="px-6 mt-5">
            <button onClick={() => addFundsAmount && Number(addFundsAmount) > 0 && setAddFundsStep(1)} disabled={!addFundsAmount || Number(addFundsAmount) <= 0} className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-base transition-all active:scale-[0.98] disabled:opacity-40">
              Continue with Yoco
            </button>
          </div>
        </div>
      )}

      {addFundsStep === 1 && <ProcessingAnimation dark={dark} text={text} textMuted={textMuted} onComplete={() => setAddFundsStep(2)} />}

      {addFundsStep === 2 && (
        <div className={`flex flex-col items-center justify-center px-6 mt-12 transition-all duration-700 ${fadeIn ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}>
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 animate-bounce-once">
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check size={32} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <h2 className={`text-2xl font-bold ${text}`}>Funds Added!</h2>
          <p className={`text-lg ${textMuted} mt-2`}>R{Number(addFundsAmount).toFixed(2)} deposited</p>
          <p className={`text-sm ${textMuted} mt-1`}>to {activeWallet.name}</p>
          <button onClick={() => navigate("dashboard")} className="mt-10 w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-semibold transition-all active:scale-[0.98]">
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );

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
      <div className={`pb-24 transition-all duration-500 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center justify-between px-6 pt-2 pb-4">
          <button onClick={() => navigate("dashboard")} className={`w-10 h-10 rounded-2xl ${glass} flex items-center justify-center`}>
            <ChevronLeft size={20} className={dark ? "text-gray-300" : "text-gray-600"} />
          </button>
          <h2 className={`text-lg font-semibold ${text}`}>Transactions</h2>
          <button className={`w-10 h-10 rounded-2xl ${glass} flex items-center justify-center`}>
            <Search size={18} className={dark ? "text-gray-300" : "text-gray-600"} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-6 mb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {filters.map((f) => (
            <button key={f} onClick={() => setTxFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${txFilter === f ? "bg-violet-600 text-white" : `${glass} ${text}`}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className={`px-6 transition-all duration-500 delay-100 ${slideUp ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <div className={`rounded-2xl border ${card} overflow-hidden`}>
            {filtered.map((tx, i) => (
              <div key={tx.id} className={`flex items-center gap-3 p-4 ${i > 0 ? `border-t ${divider}` : ""} ${cardHover} transition-colors cursor-pointer`}>
                <TransactionIcon type={tx.icon} dark={dark} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${text} truncate`}>{tx.description}</p>
                  <p className={`text-xs ${textMuted} mt-0.5`}>{formatTime(tx.date)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.amount > 0 ? "text-emerald-500" : text}`}>
                    {tx.amount > 0 ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                  <p className={`text-xs ${textSoft} mt-0.5`}>{tx.type.toLowerCase()}</p>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Clock size={40} className={textSoft} />
              <p className={`mt-3 ${textMuted}`}>No transactions found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Tab Bar ────────────────────────────────────────────────────

  const TabBar = () => {
    const tabs = [
      { id: "dashboard", icon: Home, label: "Home" },
      { id: "wallets", icon: Wallet, label: "Wallets" },
      { id: "history", icon: Clock, label: "History" },
      { id: "settings", icon: Settings, label: "Settings" },
    ];
    return (
      <div className={`fixed bottom-0 left-0 right-0 z-50 ${glass} safe-bottom`}>
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const active = screen === tab.id;
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => navigate(tab.id)} className="flex flex-col items-center gap-1 py-1 px-4 transition-all">
                <Icon size={22} className={`transition-colors ${active ? "text-violet-500" : textMuted}`} />
                <span className={`text-[10px] font-medium transition-colors ${active ? "text-violet-500" : textMuted}`}>{tab.label}</span>
                {active && <div className="w-1 h-1 rounded-full bg-violet-500 mt-0.5" />}
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
      <div className={`min-h-screen ${bg} flex flex-col max-w-lg mx-auto`}>
        <div className="flex items-center justify-between px-6 pt-14 pb-4">
          <div><Skeleton w="w-24" h="h-3" dark={dark} /><Skeleton w="w-32" h="h-5" dark={dark} /></div>
          <div className="flex gap-2"><Skeleton w="w-10" h="h-10" rounded="rounded-2xl" dark={dark} /><Skeleton w="w-10" h="h-10" rounded="rounded-2xl" dark={dark} /></div>
        </div>
        <div className="px-6"><Skeleton h="h-40" rounded="rounded-3xl" dark={dark} /></div>
        <div className="flex gap-3 px-6 mt-5">{[1,2,3].map(i => <div key={i} className="flex-1 flex flex-col items-center gap-2"><Skeleton w="w-12" h="h-12" rounded="rounded-2xl" dark={dark} /><Skeleton w="w-12" h="h-3" dark={dark} /></div>)}</div>
        <div className="px-6 mt-5"><Skeleton h="h-6" w="w-28" dark={dark} /></div>
        <div className="flex gap-3 px-6 mt-3">{[1,2].map(i => <Skeleton key={i} w="w-48" h="h-28" rounded="rounded-2xl" dark={dark} />)}</div>
        <div className="px-6 mt-6 flex flex-col gap-4">{[1,2,3].map(i => <div key={i} className="flex gap-3 items-center"><Skeleton w="w-10" h="h-10" rounded="rounded-2xl" dark={dark} /><div className="flex-1"><Skeleton w="w-32" h="h-4" dark={dark} /><Skeleton w="w-20" h="h-3" dark={dark} /></div><Skeleton w="w-16" h="h-4" dark={dark} /></div>)}</div>
      </div>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-500 max-w-lg mx-auto relative`}>
      <div className="pt-12">
        {screen === "dashboard" && <Dashboard />}
        {screen === "wallets" && <WalletsScreen />}
        {screen === "send" && <SendScreen />}
        {screen === "addFunds" && <AddFundsScreen />}
        {screen === "history" && <HistoryScreen />}
        {screen === "settings" && (
          <div className={`px-6 pt-2 transition-all duration-500 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
            <h2 className={`text-lg font-semibold ${text} mb-6`}>Settings</h2>
            <div className={`rounded-2xl border ${card} overflow-hidden`}>
              {[
                { icon: User, label: "Profile", desc: "Manage your account" },
                { icon: Bell, label: "Notifications", desc: "Alerts & preferences" },
                { icon: CreditCard, label: "Payment Methods", desc: "Cards & bank accounts" },
                { icon: dark ? Sun : Moon, label: "Appearance", desc: dark ? "Switch to light mode" : "Switch to dark mode", action: () => setDark(!dark) },
              ].map((item, i) => (
                <button key={i} onClick={item.action} className={`w-full flex items-center gap-4 p-4 ${i > 0 ? `border-t ${divider}` : ""} ${cardHover} transition-colors text-left`}>
                  <div className={`w-10 h-10 rounded-2xl ${dark ? "bg-white/[0.06]" : "bg-gray-100"} flex items-center justify-center`}>
                    <item.icon size={18} className={dark ? "text-gray-300" : "text-gray-600"} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${text}`}>{item.label}</p>
                    <p className={`text-xs ${textMuted}`}>{item.desc}</p>
                  </div>
                  <ChevronRight size={18} className={textSoft} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {!["send", "addFunds"].includes(screen) && <TabBar />}
    </div>
  );
}

// ─── Send Confirmation (separate for animation) ──────────────────

function SendConfirmation({ wallet, recipient, amount, dark, text, textMuted, card, divider, glass, slideUp, navigate }) {
  const [sent, setSent] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSend = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSent(true);
    }, 1800);
  };

  if (processing) {
    return (
      <div className="flex flex-col items-center justify-center px-6 mt-20">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
        </div>
        <p className={`mt-6 font-medium ${text}`}>Processing...</p>
        <p className={`text-sm ${textMuted} mt-1`}>This will only take a moment</p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center px-6 mt-12 animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center animate-scale-in">
            <Check size={32} className="text-white" strokeWidth={3} />
          </div>
        </div>
        <h2 className={`text-2xl font-bold ${text}`}>Sent!</h2>
        <p className={`text-lg ${textMuted} mt-2`}>R{Number(amount).toFixed(2)}</p>
        <p className={`text-sm ${textMuted} mt-1`}>to {recipient?.name}</p>
        <button onClick={() => navigate("dashboard")} className="mt-10 w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-semibold transition-all active:scale-[0.98]">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={`px-6 transition-all duration-300 ${slideUp ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
      <div className="flex flex-col items-center mt-4 mb-8">
        <div className={`w-16 h-16 rounded-full ${recipient?.color} flex items-center justify-center text-white font-bold text-xl mb-3`}>
          {recipient?.avatar}
        </div>
        <p className={`text-sm ${textMuted}`}>Sending to</p>
        <p className={`text-lg font-semibold ${text}`}>{recipient?.name}</p>
      </div>

      <div className={`text-center mb-8`}>
        <p className={`text-4xl font-bold ${text}`}>R{Number(amount).toFixed(2)}</p>
      </div>

      <div className={`rounded-2xl border ${card} p-4 mb-8`}>
        <div className={`flex justify-between py-2`}>
          <span className={`text-sm ${textMuted}`}>From</span>
          <span className={`text-sm font-medium ${text}`}>{wallet.name}</span>
        </div>
        <div className={`flex justify-between py-2 border-t ${divider}`}>
          <span className={`text-sm ${textMuted}`}>To</span>
          <span className={`text-sm font-medium ${text}`}>{recipient?.name}</span>
        </div>
        <div className={`flex justify-between py-2 border-t ${divider}`}>
          <span className={`text-sm ${textMuted}`}>Fee</span>
          <span className={`text-sm font-medium text-emerald-500`}>Free</span>
        </div>
      </div>

      <button onClick={handleSend} className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-semibold text-base transition-all active:scale-[0.98]">
        Confirm & Send
      </button>
    </div>
  );
}

// ─── Processing Animation ────────────────────────────────────────

function ProcessingAnimation({ dark, text, textMuted, onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center px-6 mt-20">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
      </div>
      <p className={`mt-6 font-medium ${text}`}>Processing payment...</p>
      <p className={`text-sm ${textMuted} mt-1`}>Connecting to Yoco</p>
    </div>
  );
}
