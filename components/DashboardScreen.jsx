"use client";

import Image from "next/image";
import { CONTACTS, SPENDING, SAVINGS_GOALS, UPCOMING_BILLS, ICON_MAP } from "../src/lib/data";
import { formatCurrency, formatTime, getGreeting } from "../src/lib/utils";
import {
  Icon3D,
  TrendingUpSvg,
  EyeSvg,
  EyeOffSvg,
  TransactionIcon,
} from "../src/lib/icons";
import WellnessSection from "./WellnessSection";
import SmartNotifBanner from "./SmartNotifBanner";

export default function DashboardScreen({ app }) {
  const {
    dark,
    setDark,
    screen,
    balanceVisible,
    setBalanceVisible,
    totalBalance,
    wallets,
    transactions,
    navigate,
    slideUp,
    fadeIn,
    notifOpen,
    setNotifOpen,
    unreadCount,
    notifications,
    activeNotif,
    setDismissedNotifs,
    voiceOpen,
    setVoiceOpen,
    setVoiceText,
    setVoiceListening,
    savingsStreak,
    xpPoints,
    XP_LEVEL,
    handleDismissNotif,
  } = app;

  return (
    <div className={`screen-fade ${fadeIn ? "visible" : ""}`}>
      {/* Integrated Header */}
      <div className="dash-header">
        <div className="dash-header-aurora" />
        {/* Row 1: Brand + Actions */}
        <div className="dash-header-top">
          <div className="dash-header-brand">
            <div className="avatar-ring">
              <Image
                src="/icons/avatar-malcolm.jpg"
                alt="Malcolm"
                width={44}
                height={44}
                className="brand-avatar"
              />
              <span className="avatar-online" />
            </div>
            <div className="dash-header-brand-text">
              <div className="brand-logo-wrap">
                {/* Kinetic plasma orbit arcs */}
                <svg
                  className="brand-orbits"
                  viewBox="0 0 44 44"
                  width="34"
                  height="34"
                >
                  <defs>
                    <linearGradient
                      id="plasmaA"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient
                      id="plasmaB"
                      x1="100%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
                    </linearGradient>
                    <filter id="plasmaGlow">
                      <feGaussianBlur
                        stdDeviation="1.2"
                        result="blur"
                      />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <ellipse
                    cx="22"
                    cy="22"
                    rx="19"
                    ry="6"
                    fill="none"
                    stroke="url(#plasmaA)"
                    strokeWidth="0.8"
                    transform="rotate(-35 22 22)"
                    strokeDasharray="4 8"
                    filter="url(#plasmaGlow)"
                    className="orbit orbit-1"
                  />
                  <ellipse
                    cx="22"
                    cy="22"
                    rx="19"
                    ry="6"
                    fill="none"
                    stroke="url(#plasmaB)"
                    strokeWidth="0.8"
                    transform="rotate(25 22 22)"
                    strokeDasharray="6 10"
                    filter="url(#plasmaGlow)"
                    className="orbit orbit-2"
                  />
                  <ellipse
                    cx="22"
                    cy="22"
                    rx="19"
                    ry="6"
                    fill="none"
                    stroke="url(#plasmaA)"
                    strokeWidth="0.6"
                    transform="rotate(80 22 22)"
                    strokeDasharray="3 12"
                    filter="url(#plasmaGlow)"
                    className="orbit orbit-3"
                  />
                  {/* Energy core */}
                  <circle
                    cx="22"
                    cy="22"
                    r="3"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="0.6"
                    opacity="0.5"
                    className="core-ring"
                  />
                  <circle cx="22" cy="22" r="1.8" fill="#a78bfa" opacity="0.9" />
                  <circle cx="22" cy="22" r="1" fill="#ffffff" opacity="0.7" />
                </svg>
                <span className="brand-name">SWIFTER</span>
              </div>
              <p className="header-greeting">
                {getGreeting()}, <strong>Malcolm</strong> 👋
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button
              onClick={() => setDark(!dark)}
              className="header-btn"
              id="theme-toggle"
            >
              {dark ? "☀️" : "🌙"}
            </button>
            <button
              className="header-btn notification-btn"
              id="notifications-btn"
              onClick={() => setNotifOpen(true)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}
            </button>
          </div>
        </div>
        {/* Row 2: Balance Display */}
        <div className="dash-balance-row">
          <div className="dash-balance-left">
            <div className="dash-balance-label-row">
              <span className="balance-live-dot" />
              <span className="dash-balance-label">Total Balance</span>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="dash-eye-btn"
                id="toggle-balance"
              >
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
                <linearGradient
                  id="sparkG"
                  x1="0"
                  y1="0"
                  x2="64"
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path
                d="M0 16 Q8 14, 12 11 T24 9 T36 12 T48 5 T58 7 T64 3"
                fill="none"
                stroke="url(#sparkG)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Smart Contextual Notification Banner */}
      {activeNotif && (
        <SmartNotifBanner
          notif={activeNotif}
          onDismiss={handleDismissNotif}
          onAction={handleDismissNotif}
        />
      )}

      {/* Streak + XP Banner */}
      <div className={`dash-streak-row ${slideUp ? "slide-visible" : ""}`}>
        <button className="dash-streak-chip" onClick={() => navigate("rewards")}>
          <span className="dash-streak-flame">🔥</span>
          <span className="dash-streak-text">
            <strong>{savingsStreak} day</strong> streak
          </span>
        </button>
        <button className="dash-xp-chip" onClick={() => navigate("rewards")}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="#f59e0b"
            stroke="none"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="dash-xp-text">{xpPoints} XP</span>
          <span className="dash-xp-level">Lv {XP_LEVEL}</span>
        </button>
      </div>

      {/* Quick Actions — 3D Orb Grid */}
      <div className={`action-orbs ${slideUp ? "slide-visible delay-1" : ""}`}>
        <h3 className="action-orbs-title">Quick Actions</h3>
        <div className="action-orbs-grid">
          {[
            {
              label: "Send",
              action: () => navigate("send"),
              glow: "#7c3aed",
              svg: (
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c4b5fd"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              ),
            },
            {
              label: "Add Funds",
              action: () => navigate("addFunds"),
              glow: "#10b981",
              svg: (
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6ee7b7"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                  <line x1="12" y1="14" x2="12" y2="18" />
                  <line x1="10" y1="16" x2="14" y2="16" />
                </svg>
              ),
            },
            {
              label: "Transfer",
              action: () => navigate("transfer"),
              glow: "#3b82f6",
              svg: (
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 1L21 5L17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <path d="M7 23L3 19L7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              ),
            },
            {
              label: "Voice",
              action: () => {
                setVoiceOpen(true);
                setVoiceText("");
                setVoiceListening(true);
              },
              glow: "#7c3aed",
              svg: (
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c4b5fd"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              ),
            },
          ].map((a, i) => (
            <button
              key={i}
              onClick={a.action}
              className="action-orb"
              style={{ "--orb-glow": a.glow }}
              id={`action-${a.label.toLowerCase().replace(" ", "-")}`}
            >
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

      {/* Financial Wellness Score + Personalised Insights */}
      <WellnessSection slideUp={slideUp} wallets={wallets} />

      {/* Wallet Mini-Strip */}
      <div className={`section ${slideUp ? "slide-visible delay-2" : ""}`}>
        <div className="section-header">
          <h3 className="section-title">My Wallets</h3>
          <button
            onClick={() => navigate("wallets")}
            className="section-link"
            id="see-all-wallets"
          >
            Manage
          </button>
        </div>
        <div className="wallet-strip">
          {wallets.map((w) => (
            <button
              key={w.id}
              onClick={() => navigate("wallets")}
              className="wallet-strip-card"
              style={{ background: w.gradient }}
            >
              <div className="wallet-strip-orb" />
              <span className="wallet-strip-type">{w.type}</span>
              <span className="wallet-strip-balance">
                {balanceVisible ? formatCurrency(w.balance) : "•••••"}
              </span>
              <span className="wallet-strip-name">{w.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Pay Contacts */}
      <div className={`section ${slideUp ? "slide-visible delay-3" : ""}`}>
        <div className="section-header">
          <h3 className="section-title">Quick Pay</h3>
          <button className="section-link" id="manage-contacts">
            Manage
          </button>
        </div>
        <div className="quick-pay-row">
          {CONTACTS.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate("send")}
              className="quick-pay-item"
              id={`pay-${c.id}`}
            >
              <div className="quick-pay-avatar" style={{ background: c.gradient }}>
                <span>{c.avatar}</span>
              </div>
              <span className="quick-pay-name">{c.name.split(" ")[0]}</span>
            </button>
          ))}
          <button
            className="quick-pay-item quick-pay-add"
            onClick={() => navigate("send")}
          >
            <div className="quick-pay-avatar quick-pay-add-avatar">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
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
                    <circle
                      key={i}
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray={`${dashLen} ${100 - dashLen}`}
                      strokeDashoffset={-offset}
                      opacity="0.9"
                    />
                  );
                  offset += dashLen;
                  return el;
                });
              })()}
            </svg>
            <div className="spending-donut-center">
              <div className="spending-donut-label">Total</div>
              <div className="spending-donut-amount">
                {formatCurrency(
                  SPENDING.reduce((a, s) => a + s.amount, 0)
                )}
              </div>
            </div>
          </div>
          <div className="spending-legend">
            {SPENDING.map((s) => (
              <div key={s.category} className="spending-legend-item">
                <span
                  className="spending-legend-color"
                  style={{ backgroundColor: s.color }}
                />
                <div>
                  <div className="spending-legend-cat">{s.category}</div>
                  <div className="spending-legend-amt">
                    {formatCurrency(s.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings Goals */}
      <div className={`section ${slideUp ? "slide-visible delay-5" : ""}`}>
        <div className="section-header">
          <h3 className="section-title">Savings Goals</h3>
          <button className="section-link" id="add-goal">
            Add
          </button>
        </div>
        <div className="goals-grid">
          {SAVINGS_GOALS.map((g) => {
            const pct = (g.saved / g.target) * 100;
            return (
              <div key={g.id} className="goal-card">
                <div className="goal-header">
                  <span className="goal-icon">{g.icon}</span>
                  <span className="goal-name">{g.name}</span>
                </div>
                <div className="goal-progress">
                  <div className="goal-bar">
                    <div
                      className="goal-bar-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: g.accent,
                      }}
                    />
                  </div>
                </div>
                <div className="goal-footer">
                  <span className="goal-saved">
                    {formatCurrency(g.saved)}
                  </span>
                  <span className="goal-target">
                    of {formatCurrency(g.target)}
                  </span>
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
          <button className="section-link" id="see-all-bills">
            See All
          </button>
        </div>
        <div className="bills-list">
          {UPCOMING_BILLS.map((b) => (
            <div key={b.id} className="bill-item">
              <div className="bill-icon" style={{ color: b.accent }}>
                {b.icon}
              </div>
              <div className="bill-info">
                <div className="bill-name">{b.name}</div>
                <div className="bill-due">Due {b.due}</div>
              </div>
              <div className="bill-amount">
                {formatCurrency(b.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`section ${slideUp ? "slide-visible delay-7" : ""}`}>
        <div className="section-header">
          <h3 className="section-title">Recent Transactions</h3>
          <button
            onClick={() => navigate("history")}
            className="section-link"
            id="view-all-txs"
          >
            View All
          </button>
        </div>
        <div className="tx-list">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="tx-item">
              <div className="tx-icon">
                <TransactionIcon type={tx.icon} size={32} />
              </div>
              <div className="tx-info">
                <div className="tx-desc">{tx.description}</div>
                <div className="tx-time">{formatTime(tx.date)}</div>
              </div>
              <div
                className={`tx-amount ${
                  tx.amount >= 0 ? "tx-income" : "tx-expense"
                }`}
              >
                {tx.amount >= 0 ? "+" : ""}
                {formatCurrency(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
