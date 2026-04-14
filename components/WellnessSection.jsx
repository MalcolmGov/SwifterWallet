"use client";

import React, { useState, useEffect } from "react";
import { computeWellnessScore, computeInsights } from "../src/lib/utils";

export default function WellnessSection({ slideUp, wallets }) {
  const [animated, setAnimated] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const wellness = computeWellnessScore(wallets);
  const insights = computeInsights(wallets);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!animated) return;
    const target = wellness.score;
    let start = null;
    const duration = 1600;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayScore(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated, wellness.score]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = animated ? circumference - (wellness.score / 100) * circumference : circumference;

  return (
    <>
      {/* Wellness Score Card */}
      <div className={`section ${slideUp ? "slide-visible" : ""}`} style={{ transitionDelay: "200ms" }}>
        <div className="section-header">
          <h3 className="section-title">Financial Health</h3>
          <span className="wellness-updated-badge">Updated today</span>
        </div>
        <div className="wellness-card">
          {/* Animated circular gauge */}
          <div className="wellness-gauge-area">
            <svg width="140" height="140" viewBox="0 0 140 140" className="wellness-gauge-svg">
              <defs>
                <linearGradient id="wellnessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={wellness.gradStart} />
                  <stop offset="100%" stopColor={wellness.gradEnd} />
                </linearGradient>
                <filter id="wellnessGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="wellnessGlowStrong">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {/* Outer decorative ring */}
              <circle cx="70" cy="70" r="66" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              {/* Track */}
              <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              {/* Filled arc */}
              <circle
                cx="70" cy="70" r={radius}
                fill="none"
                stroke="url(#wellnessGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 70 70)"
                filter="url(#wellnessGlow)"
                style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              />
              {/* Glow dot at tip */}
              {animated && (
                <circle
                  cx={70 + radius * Math.cos(-Math.PI / 2 + (wellness.score / 100) * 2 * Math.PI)}
                  cy={70 + radius * Math.sin(-Math.PI / 2 + (wellness.score / 100) * 2 * Math.PI)}
                  r="5" fill={wellness.gradEnd}
                  filter="url(#wellnessGlowStrong)"
                  opacity="0.9"
                />
              )}
            </svg>
            <div className="wellness-gauge-center">
              <span className="wellness-score-num">{displayScore}</span>
              <span className="wellness-score-label" style={{ color: wellness.color }}>{wellness.label}</span>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="wellness-breakdown">
            {wellness.breakdown.map((b, i) => (
              <div key={b.label} className="wellness-bar-item">
                <div className="wellness-bar-header">
                  <span className="wellness-bar-label">{b.label}</span>
                  <span className="wellness-bar-score" style={{ color: b.color }}>{b.score}/{b.max}</span>
                </div>
                <div className="wellness-bar-bg">
                  <div
                    className="wellness-bar-fill"
                    style={{
                      width: animated ? `${(b.score / b.max) * 100}%` : "0%",
                      background: b.color,
                      boxShadow: `0 0 8px ${b.color}60`,
                      transition: `width 1.3s cubic-bezier(0.34,1.56,0.64,1) ${i * 120 + 200}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personalised Insights — horizontal scroll */}
      <div className={`section ${slideUp ? "slide-visible" : ""}`} style={{ transitionDelay: "350ms" }}>
        <div className="section-header">
          <h3 className="section-title">Personalised Insights</h3>
          <span className="section-subtitle">For you</span>
        </div>
        <div className="insights-scroll">
          {insights.map((ins, i) => (
            <div
              key={ins.id}
              className="insight-card"
              style={{ "--ins-color": ins.color, "--ins-accent": ins.accent, animationDelay: `${i * 90}ms` }}
            >
              <div className="insight-card-top">
                <div className="insight-icon-wrap" style={{ background: ins.accent }}>
                  <span className="insight-icon">{ins.icon}</span>
                </div>
                <span className={`insight-badge insight-badge-${ins.type}`}>
                  {ins.type === "warning" ? "↑" : ins.type === "positive" ? "✓" : "i"}
                </span>
              </div>
              <p className="insight-title">{ins.title}</p>
              <p className="insight-body">{ins.body}</p>
              <div className="insight-footer">
                <span className="insight-action" style={{ color: ins.color }}>View details →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
