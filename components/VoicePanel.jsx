"use client";

import SwifterAvatar from "./SwifterAvatar";
import { XSvg } from "../src/lib/icons";

export default function VoicePanel({
  voiceOpen,
  voiceStatus,
  transcript,
  aiResponse,
  actionLog = [],
  voiceVolume = 0,
  onClose,
  onStartSession,
  onStopSession,
  onSuggestionClick,
}) {
  const voiceStatusLabels = {
    idle: "Tap mic to start",
    connecting: "Connecting...",
    listening: "Listening...",
    thinking: "Processing...",
    speaking: "Speaking...",
    error: "Connection error",
  };

  if (!voiceOpen) return null;

  return (
    <div className="voice-overlay" onClick={() => { onStopSession?.(); onClose?.(); }}>
      <div className="voice-panel" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => { onStopSession?.(); onClose?.(); }} className="voice-close">✕</button>
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
              "What's my financial health?",
              "Send R500 to Sarah",
              "What's my balance?",
              "Show my last 5 transactions",
              "Pay my Netflix bill",
              "Sawubona, thumela u-R200 ku-Thabo", // isiZulu
              "Wat is my saldo?",                    // Afrikaans
            ].map((s, i) => (
              <button key={i} className="voice-suggest-chip" onClick={() => { onSuggestionClick?.(s); onStartSession?.(); }}>{s}</button>
            ))}
            <p className="voice-suggest-lang-note">🌍 Responds in your language — Zulu, Xhosa, Sotho, Afrikaans, English</p>
          </div>
        )}
        {voiceStatus === "idle" ? (
          <button onClick={onStartSession} className="primary-btn primary-violet" style={{ marginTop: "1rem", width: "100%" }}>
            🎙️ Start Conversation
          </button>
        ) : voiceStatus === "connecting" ? (
          <button disabled className="primary-btn" style={{ marginTop: "1rem", width: "100%", opacity: 0.5 }}>
            Connecting...
          </button>
        ) : (
          <button onClick={onStopSession} className="primary-btn primary-red" style={{ marginTop: "1rem", width: "100%" }}>
            ⬛ End Session
          </button>
        )}
      </div>
    </div>
  );
}
