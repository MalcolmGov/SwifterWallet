export const WALLETS = [
  { id: "w1", name: "Main Wallet", balance: 24850.0, type: "MAIN", gradient: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6366f1 100%)", accent: "#7c3aed" },
  { id: "w2", name: "Savings", balance: 12420.5, type: "SAVINGS", gradient: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)", accent: "#10b981" },
  { id: "w3", name: "Business", balance: 8390.75, type: "BUSINESS", gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)", accent: "#f59e0b" },
];

export const TRANSACTIONS = [
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

export const CONTACTS = [
  { id: "c1", name: "Sarah Mthembu", avatar: "SM", gradient: "linear-gradient(135deg, #ec4899, #f472b6)", phone: "082 456 7890", lastPayment: "2026-04-08" },
  { id: "c2", name: "David Khumalo", avatar: "DK", gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)", phone: "071 234 5678", lastPayment: "2026-03-25" },
  { id: "c3", name: "Thabo Nkosi", avatar: "TN", gradient: "linear-gradient(135deg, #10b981, #34d399)", phone: "060 987 6543", lastPayment: "2026-04-01" },
  { id: "c4", name: "Lisa Pretorius", avatar: "LP", gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)", phone: "083 321 0987", lastPayment: "2026-03-18" },
  { id: "c5", name: "James Ramaphosa", avatar: "JR", gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)", phone: "073 654 3210", lastPayment: "2026-04-05" },
  { id: "c6", name: "Ayanda Zulu", avatar: "AZ", gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)", phone: "079 128 6673", lastPayment: "2026-04-03" },
  { id: "c7", name: "Priya Sharma", avatar: "PS", gradient: "linear-gradient(135deg, #f43f5e, #fb7185)", phone: "066 451 2234", lastPayment: "2026-03-29" },
];

export const SPENDING = [
  { category: "Food & Dining", amount: 2340, color: "#f59e0b", pct: 32 },
  { category: "Transport", amount: 1450, color: "#3b82f6", pct: 20 },
  { category: "Shopping", amount: 1820, color: "#ec4899", pct: 25 },
  { category: "Bills & Utilities", amount: 1690, color: "#10b981", pct: 23 },
];

export const SAVINGS_GOALS = [
  { id: "g1", name: "Holiday Fund", target: 15000, saved: 9750, accent: "#06b6d4", icon: "✈️" },
  { id: "g2", name: "Emergency", target: 50000, saved: 32500, accent: "#10b981", icon: "🛡️" },
  { id: "g3", name: "New Laptop", target: 25000, saved: 18200, accent: "#7c3aed", icon: "💻" },
];

export const UPCOMING_BILLS = [
  { id: "b1", name: "Netflix", amount: 199, due: "2026-04-15", icon: "🎬", accent: "#e50914" },
  { id: "b2", name: "Rent", amount: 8500, due: "2026-04-25", icon: "🏠", accent: "#3b82f6" },
  { id: "b3", name: "Electricity", amount: 850, due: "2026-04-20", icon: "⚡", accent: "#f59e0b" },
  { id: "b4", name: "Internet", amount: 699, due: "2026-04-18", icon: "📡", accent: "#10b981" },
];

export const DEFAULT_SAVED_CARDS = [
  { id: "card1", brand: "Visa", last4: "4921", expiry: "09/28", holder: "Malcolm Govender", gradient: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)" },
  { id: "card2", brand: "Mastercard", last4: "8834", expiry: "03/27", holder: "Malcolm Govender", gradient: "linear-gradient(135deg, #b91c1c 0%, #ef4444 50%, #f87171 100%)" },
];

export const SMART_NOTIFS = [
  {
    id: "salary",
    icon: "💰",
    title: "Salary received!",
    body: "R42,000 from Accenture SA — auto-split into savings, bills & spending?",
    color: "#10b981",
    action: "Set Up Auto-Split",
    delay: 5000,
  },
  {
    id: "transport-spike",
    icon: "🚗",
    title: "Spending spike detected",
    body: "Transport spending up 45% this week — R739 vs R510 avg",
    color: "#f59e0b",
    action: "View Breakdown",
    delay: 16000,
  },
];

export const NOTIFICATIONS = [
  { id: "n1", type: "payment", title: "Payment Received", body: "R1,500 from Thabo Nkosi", time: "2m ago", read: false, icon: "💸" },
  { id: "n2", type: "promo", title: "5% Cashback at Woolworths", body: "Earn cashback this week at Woolworths. Valid until Sunday.", time: "1h ago", read: false, icon: "🎁" },
  { id: "n3", type: "tip", title: "Did you know?", body: "Pay by voice — just say \"Pay Sarah R100\"", time: "3h ago", read: false, icon: "💡" },
  { id: "n4", type: "system", title: "Biometric Login Available", body: "Secure every transaction with Face ID or fingerprint", time: "Yesterday", read: true, icon: "🔐" },
  { id: "n5", type: "payment", title: "Salary Deposited", body: "R42,000 from Accenture SA credited to Main Wallet", time: "Yesterday", read: true, icon: "💼" },
  { id: "n6", type: "tip", title: "Spending Insight", body: "You spent R2,340 on Food & Dining this month — 32% of your budget", time: "2 days ago", read: true, icon: "📊" },
];

export const ONBOARDING_SLIDES = [
  { emoji: "✨", title: "Welcome to Swifter", desc: "Your smart, secure digital wallet for the modern South African lifestyle." },
  { emoji: "🎙️", title: "Pay by Voice", desc: "Just say \"Pay Sarah R100\" and Swifter handles the rest — in English, Zulu, Afrikaans, and more." },
  { emoji: "🔐", title: "Stay Secure", desc: "Biometric authentication protects every transaction. PayGuard™ monitors for fraud in real time." },
  { emoji: "🚀", title: "You're All Set", desc: "Explore your dashboard, manage your wallets, and experience the future of payments." },
];

export const ACHIEVEMENTS = [
  { id: "first_payment",   name: "First Payment",   icon: "💸", desc: "Sent your first payment",                    unlocked: true,  unlockedDate: "Apr 8",  pts: 50,  color: "#7c3aed" },
  { id: "savings_starter", name: "Savings Starter", icon: "🌱", desc: "Saved R1,000+",                              unlocked: true,  unlockedDate: "Apr 10", pts: 75,  color: "#10b981" },
  { id: "streak_master",   name: "Streak Master",   icon: "🔥", desc: "7 days of consistent saving",               unlocked: true,  unlockedDate: "Apr 14", pts: 100, color: "#f59e0b" },
  { id: "voice_pioneer",   name: "Voice Pioneer",   icon: "🎙️", desc: "Used voice assistant for a transaction",   unlocked: false, pts: 60,  color: "#06b6d4" },
  { id: "biometric_boss",  name: "Biometric Boss",  icon: "🔐", desc: "Enabled biometric authentication",          unlocked: false, pts: 80,  color: "#ec4899" },
  { id: "globe_trotter",   name: "Globe Trotter",   icon: "🌍", desc: "Used multi-currency wallet",               unlocked: false, pts: 90,  color: "#3b82f6" },
  { id: "social_butterfly",name: "Social Butterfly",icon: "🦋", desc: "Referred 3 friends",                        unlocked: false, pts: 150, color: "#f43f5e" },
];

export const REFERRALS = [
  { id: "r1", name: "Sipho Ndlovu",    avatar: "SN", gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)", status: "reward_earned",     date: "Apr 8",  reward: 50 },
  { id: "r2", name: "Kefilwe Dlamini", avatar: "KD", gradient: "linear-gradient(135deg, #10b981, #34d399)", status: "first_transaction", date: "Apr 11", reward: 0  },
  { id: "r3", name: "Ryan Peters",     avatar: "RP", gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)", status: "signed_up",         date: "Apr 13", reward: 0  },
];

export const XP_EVENTS = [
  { action: "Referred Sipho Ndlovu",    pts: 100, icon: "🦋", date: "6 days ago" },
  { action: "Added to Savings Goal",    pts: 20,  icon: "🌱", date: "5 days ago" },
  { action: "Added to Savings Goal",    pts: 20,  icon: "🌱", date: "4 days ago" },
  { action: "Sent payment to Sarah",    pts: 10,  icon: "💸", date: "3 days ago" },
  { action: "Added to Savings Goal",    pts: 20,  icon: "🌱", date: "2 days ago" },
  { action: "Sent payment to David",    pts: 10,  icon: "💸", date: "Yesterday" },
  { action: "Unlocked Streak Master 🔥",pts: 100, icon: "🏆", date: "Today" },
  { action: "Added to Savings Goal",    pts: 20,  icon: "🌱", date: "Today" },
];

export const ICON_MAP = {
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

export const SWIFTER_AGENT_PROMPT = `You are Swifter, a friendly and concise AI banking voice assistant built into the SwifterWallet app — a modern South African fintech platform.

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
- get_financial_health() → returns financial wellness score (0–100), label, and personalised insights
- navigate_screen(screen) → open a screen (dashboard|wallets|send|addFunds|history|settings)

RULES:
1. For any payment by name: call find_payee first. If multiple matches, list them and ask user to confirm.
2. Always confirm amount + recipient before executing send_money.
3. Keep replies short — one or two sentences. No bullet points in speech.
4. Amounts are always in South African Rand (ZAR). Say "R" before numbers.
5. Never reveal internal tool names or JSON to the user.
6. If the user asks about their financial health, wellness score, how they're doing financially, or anything similar → call get_financial_health.`;
