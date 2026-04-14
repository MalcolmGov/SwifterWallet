"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function FailedContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("id") || searchParams.get("checkoutId");
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          window.location.href = "/";
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#050508",
      color: "#f0f0f5",
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: "2rem",
      textAlign: "center",
    }}>
      <div style={{
        width: 100, height: 100,
        borderRadius: "50%",
        background: "rgba(239, 68, 68, 0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1.5rem",
        animation: "bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}>
        <div style={{
          width: 68, height: 68,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #dc2626, #ef4444)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px -4px rgba(239, 68, 68, 0.5)",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
      </div>

      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
        Payment Failed
      </h1>
      <p style={{ fontSize: "1rem", color: "#71717a", marginTop: "0.5rem" }}>
        Your card was declined or the payment could not be processed.
      </p>
      <p style={{ fontSize: "0.85rem", color: "#52525b", marginTop: "0.5rem" }}>
        Please check your card details and try again.
      </p>
      {checkoutId && (
        <p style={{ fontSize: "0.8rem", color: "#52525b", marginTop: "0.5rem" }}>
          Reference: {checkoutId}
        </p>
      )}
      <p style={{ fontSize: "0.9rem", color: "#71717a", marginTop: "2rem" }}>
        Redirecting to dashboard in {countdown}s...
      </p>
      <button
        onClick={() => window.location.href = "/"}
        style={{
          marginTop: "1.5rem",
          padding: "0.85rem 2rem",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          color: "white",
          border: "none",
          fontSize: "1rem",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 8px 24px -4px rgba(124, 58, 237, 0.4)",
        }}
      >
        Try Again
      </button>

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function DepositFailedPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050508",
        color: "#71717a",
      }}>
        Loading...
      </div>
    }>
      <FailedContent />
    </Suspense>
  );
}
