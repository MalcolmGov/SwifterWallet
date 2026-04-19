"use client";

import { useState, useEffect, useCallback } from "react";
import { assessSession } from "../src/lib/payguard";

// ─── Animated fingerprint SVG ────────────────────────────────────────────────

function FingerprintIcon({ color = "#7c3aed", size = 80, pulse = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 14px ${color}66)` }}
    >
      {/* Pulse ring — rendered only when active */}
      {pulse && (
        <circle
          cx="40"
          cy="40"
          r="38"
          stroke={color}
          strokeWidth="1.5"
          strokeOpacity="0.25"
          className="bio-pulse-ring"
        />
      )}
      {/* Outer rings */}
      <path
        d="M40 10C23.43 10 10 23.43 10 40c0 9.47 4.34 17.93 11.15 23.51"
        stroke={color} strokeWidth="2.5" strokeLinecap="round"
      />
      <path
        d="M40 10C56.57 10 70 23.43 70 40c0 9.47-4.34 17.93-11.15 23.51"
        stroke={color} strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Mid rings */}
      <path
        d="M40 18C27.85 18 18 27.85 18 40c0 6.38 2.72 12.12 7.07 16.18"
        stroke={color} strokeWidth="2.5" strokeLinecap="round"
      />
      <path
        d="M40 18C52.15 18 62 27.85 62 40c0 6.38-2.72 12.12-7.07 16.18"
        stroke={color} strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Inner rings */}
      <path
        d="M40 26C32.27 26 26 32.27 26 40c0 3.81 1.56 7.26 4.07 9.76"
        stroke={color} strokeWidth="2.5" strokeLinecap="round"
      />
      <path
        d="M40 26C47.73 26 54 32.27 54 40c0 3.81-1.56 7.26-4.07 9.76"
        stroke={color} strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Centre */}
      <circle cx="40" cy="40" r="4" fill={color} opacity="0.9" />
      <circle cx="40" cy="40" r="2" fill="white" opacity="0.6" />
    </svg>
  );
}

// ─── BiometricPrompt ─────────────────────────────────────────────────────────
//
// Renders inside SendConfirmation (mode="transaction") and inside the voice
// biometric modal (mode="transaction"). Auto-triggers the platform biometric
// prompt on mount.
//
// Props:
//   amount     – display amount (string or number), shown in header when set
//   onSuccess  – called after verified === true
//   onCancel   – called when the user dismisses
//   mode       – "transaction" | "login"

export default function BiometricPrompt({ amount, onSuccess, onCancel, mode = "transaction" }) {
  // idle | prompting | verifying | success | failed | unsupported
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState(null);

  const triggerAuth = useCallback(async () => {
    setStatus("prompting");
    setErrorMsg(null);

    try {
      // 1. Get authentication options from server
      const optRes = await fetch("/api/webauthn/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!optRes.ok) {
        const { error } = await optRes.json().catch(() => ({ error: "Server error" }));
        // "No credentials registered" means the user hasn't set up biometric yet
        if (error?.includes("No credentials")) {
          setStatus("unsupported");
          setErrorMsg("No biometric registered. Enable it in Settings first.");
        } else {
          throw new Error(error ?? "Failed to start authentication");
        }
        return;
      }

      const optionsJSON = await optRes.json();

      // 2. Invoke the platform authenticator (Face ID / Touch ID / Windows Hello)
      // Dynamic import keeps @simplewebauthn/browser out of the server bundle.
      const { startAuthentication } = await import("@simplewebauthn/browser");
      const assertion = await startAuthentication({ optionsJSON });

      setStatus("verifying");

      // 3. Verify assertion on server
      const verRes = await fetch("/api/webauthn/auth/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assertion),
      });

      const result = await verRes.json();

      if (result.verified) {
        // Fire-and-forget session-level PayGuard check (doesn't block UX).
        // Only surfaces in dashboard analytics — we don't halt login on it.
        assessSession(result.userId ?? "CUST-MALCOLM-001").catch(() => {});
        setStatus("success");
        setTimeout(() => onSuccess?.(), 650);
      } else {
        setStatus("failed");
        setErrorMsg("Biometric verification failed. Please try again.");
      }
    } catch (err) {
      if (err?.name === "NotAllowedError") {
        // User cancelled or dismissed the system prompt
        setStatus("idle");
        setErrorMsg("Cancelled. Tap Authenticate to try again.");
      } else {
        setStatus("failed");
        setErrorMsg(err?.message ?? "Authentication failed");
      }
    }
  }, [onSuccess]);

  // Auto-trigger on mount
  useEffect(() => {
    triggerAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconColor =
    status === "success"
      ? "#10b981"
      : status === "failed" || status === "unsupported"
        ? "#ef4444"
        : "#7c3aed";

  const isPulsing = status === "prompting" || status === "verifying";

  return (
    <div className="biometric-screen">
      {/* Amount badge (transaction mode) */}
      {mode === "transaction" && amount != null && (
        <div className="biometric-amount-badge">
          R{Number(amount).toFixed(2)}
        </div>
      )}

      {/* Icon */}
      <div className="biometric-icon-wrap">
        <FingerprintIcon color={iconColor} size={80} pulse={isPulsing} />

        {status === "success" && (
          <div className="biometric-check-overlay">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>

      {/* Status text */}
      <p className="biometric-title">
        {status === "idle" && "Biometric Required"}
        {status === "prompting" && "Waiting for biometric…"}
        {status === "verifying" && "Verifying…"}
        {status === "success" && "Identity Confirmed"}
        {status === "failed" && "Verification Failed"}
        {status === "unsupported" && "Not Set Up"}
      </p>

      <p className="biometric-subtitle">
        {status === "idle" &&
          (mode === "transaction"
            ? "This transaction requires biometric confirmation"
            : "Authenticate to continue")}
        {status === "prompting" && "Use Face ID or Touch ID when prompted"}
        {status === "verifying" && "Checking your identity…"}
        {status === "success" && "Proceeding with your transaction"}
        {(status === "failed" || status === "unsupported" || (status === "idle" && errorMsg)) &&
          errorMsg}
      </p>

      {/* Retry button */}
      {(status === "idle" || status === "failed") && (
        <button
          onClick={triggerAuth}
          className="primary-btn primary-violet"
          style={{ marginTop: "1.5rem", width: "80%" }}
        >
          {status === "idle" ? "Authenticate" : "Try Again"}
        </button>
      )}

      {/* Cancel */}
      {status !== "success" && status !== "verifying" && status !== "prompting" && (
        <button onClick={onCancel} className="bio-cancel-btn">
          Cancel
        </button>
      )}
    </div>
  );
}
