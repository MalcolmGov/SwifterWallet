"use client";

import { useState } from "react";
import { ACHIEVEMENTS, REFERRALS, XP_EVENTS } from "../src/lib/data";
import { ChevronLeftSvg } from "../src/lib/icons";

export default function RewardsScreen({ app }) {
  const {
    fadeIn,
    navigate,
    savingsStreak,
    xpPoints,
    XP_LEVEL,
    XP_IN_LEVEL = 250,
    XP_TO_NEXT = 500,
    setToastMsg,
  } = app;

  const [rewardsTab, setRewardsTab] = useState("badges");

  return (
    <div
      className={`screen-fade ${fadeIn ? "visible" : ""}`}
      style={{ paddingBottom: "6rem" }}
    >
      {/* Header */}
      <div className="sub-header">
        <div className="sub-header-inner">
          <button
            onClick={() => navigate("dashboard")}
            className="back-btn"
            id="rewards-back"
          >
            <ChevronLeftSvg />
          </button>
          <div className="rewards-header-icon">⭐</div>
          <div>
            <h2 className="sub-header-title">Rewards</h2>
            <p className="sub-header-subtitle">
              Level {XP_LEVEL} · {xpPoints} XP
            </p>
          </div>
        </div>

        {/* XP Level Progress Bar */}
        <div className="xp-level-bar-wrap">
          <div className="xp-level-labels">
            <span className="xp-level-tag">Lv {XP_LEVEL}</span>
            <span className="xp-level-progress-text">
              {XP_IN_LEVEL} / {XP_TO_NEXT} XP to Level {XP_LEVEL + 1}
            </span>
            <span className="xp-level-tag">Lv {XP_LEVEL + 1}</span>
          </div>
          <div className="xp-level-bar-bg">
            <div
              className="xp-level-bar-fill"
              style={{ width: `${(XP_IN_LEVEL / XP_TO_NEXT) * 100}%` }}
            />
            <div
              className="xp-level-bar-glow"
              style={{ left: `${(XP_IN_LEVEL / XP_TO_NEXT) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak banner */}
      <div className="rewards-streak-card">
        <div className="rewards-streak-flame-wrap">
          <span className="rewards-streak-flame">🔥</span>
          <div className="rewards-streak-ring" />
        </div>
        <div className="rewards-streak-info">
          <p className="rewards-streak-count">
            {savingsStreak} day savings streak!
          </p>
          <p className="rewards-streak-sub">
            Keep saving daily to maintain your streak
          </p>
        </div>
        <div className="rewards-streak-pts">+20 XP/day</div>
      </div>

      {/* Tab switcher */}
      <div className="rewards-tabs-row">
        <button
          className={`rewards-tab-btn ${
            rewardsTab === "badges" ? "rewards-tab-active" : ""
          }`}
          onClick={() => setRewardsTab("badges")}
        >
          🏆 Badges
        </button>
        <button
          className={`rewards-tab-btn ${
            rewardsTab === "referral" ? "rewards-tab-active" : ""
          }`}
          onClick={() => setRewardsTab("referral")}
        >
          🎁 Refer & Earn
        </button>
      </div>

      {/* ── Badges Tab ── */}
      {rewardsTab === "badges" && (
        <>
          <div style={{ padding: "0 1.25rem" }}>
            <div className="section-header" style={{ marginBottom: "0.75rem" }}>
              <h3 className="section-title">Achievement Badges</h3>
              <span className="xp-unlocked-count">
                {ACHIEVEMENTS.filter((a) => a.unlocked).length}/{ACHIEVEMENTS.length} unlocked
              </span>
            </div>
            <div className="badges-grid">
              {ACHIEVEMENTS.map((badge) => (
                <div
                  key={badge.id}
                  className={`badge-item ${
                    badge.unlocked ? "badge-unlocked" : "badge-locked"
                  }`}
                  style={{ "--badge-color": badge.color }}
                  onClick={() =>
                    badge.unlocked &&
                    setToastMsg(`${badge.name} — ${badge.desc}`)
                  }
                >
                  <div className="badge-circle-wrap">
                    <div className="badge-circle">
                      {badge.unlocked && <div className="badge-circle-glow" />}
                      <span className="badge-icon">{badge.icon}</span>
                    </div>
                    {badge.unlocked && (
                      <svg className="badge-ring-svg" viewBox="0 0 44 44">
                        <circle
                          cx="22"
                          cy="22"
                          r="20"
                          fill="none"
                          stroke={badge.color}
                          strokeWidth="2"
                          strokeDasharray="126"
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          style={{
                            filter: `drop-shadow(0 0 5px ${badge.color})`,
                          }}
                        />
                      </svg>
                    )}
                    {badge.unlocked && (
                      <div className="badge-check">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="badge-name">{badge.name}</p>
                  {badge.unlocked ? (
                    <p className="badge-date">{badge.unlockedDate}</p>
                  ) : (
                    <p className="badge-pts-locked">+{badge.pts} XP</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* XP Activity Feed */}
          <div style={{ padding: "0 1.25rem", marginTop: "1.5rem" }}>
            <div className="section-header">
              <h3 className="section-title">XP Activity</h3>
              <span className="xp-total-chip">{xpPoints} XP total</span>
            </div>
            <div className="xp-feed">
              {XP_EVENTS.slice()
                .reverse()
                .map((ev, i) => (
                  <div key={i} className="xp-feed-item">
                    <div className="xp-feed-icon">{ev.icon}</div>
                    <div className="xp-feed-info">
                      <p className="xp-feed-action">{ev.action}</p>
                      <p className="xp-feed-date">{ev.date}</p>
                    </div>
                    <div className="xp-feed-pts">+{ev.pts}</div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {/* ── Referral Tab ── */}
      {rewardsTab === "referral" && (
        <div style={{ padding: "0 1.25rem" }}>
          <div className="referral-card">
            <div className="referral-icon">🎁</div>
            <h3 className="referral-title">Earn 100 XP per friend</h3>
            <p className="referral-sub">
              Share your code and earn XP when they sign up
            </p>
            <div className="referral-code-box">
              <span className="referral-code-label">Your Code</span>
              <div className="referral-code-display">
                <span className="referral-code-text">MALCOLM-2026</span>
                <button
                  onClick={() =>
                    setToastMsg("Code copied to clipboard!")
                  }
                  className="referral-code-copy"
                >
                  📋
                </button>
              </div>
            </div>
            <button
              onClick={() => setToastMsg("Share sheet coming soon!")}
              className="primary-btn primary-emerald"
              style={{ marginTop: "1rem", width: "100%" }}
            >
              Share Code
            </button>
          </div>

          <div className="section-header" style={{ marginTop: "1.5rem" }}>
            <h3 className="section-title">Your Referrals</h3>
            <span className="xp-total-chip">3 friends</span>
          </div>

          <div className="referral-list">
            {REFERRALS.map((ref) => (
              <div key={ref.id} className="referral-item">
                <div
                  className="avatar"
                  style={{ background: ref.gradient, width: 44, height: 44 }}
                >
                  {ref.avatar}
                </div>
                <div className="referral-item-info">
                  <p className="referral-item-name">{ref.name}</p>
                  <p className="referral-item-status">
                    {ref.status === "reward_earned"
                      ? "Earned reward"
                      : ref.status === "first_transaction"
                      ? "First transaction done"
                      : "Just signed up"}
                  </p>
                </div>
                <div className="referral-item-date">
                  {ref.reward > 0 && (
                    <span className="referral-item-reward">+{ref.reward} XP</span>
                  )}
                  <span className="referral-item-date-txt">{ref.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
