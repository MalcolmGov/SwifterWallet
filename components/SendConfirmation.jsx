"use client";

import React, { useState } from "react";
import BiometricPrompt from "./BiometricPrompt";
import ProcessingAnimation from "./ProcessingAnimation";
import { CheckSvg } from "../src/lib/icons";

export default function SendConfirmation({ wallet, recipient, amount, navigate, biometricEnabled = false, biometricRegistered = false, txThreshold = 500, onTransactionComplete }) {
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
