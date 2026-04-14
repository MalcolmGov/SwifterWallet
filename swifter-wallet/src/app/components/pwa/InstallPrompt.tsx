"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed (running in standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Don't show if user previously dismissed
    if (sessionStorage.getItem("pwa-prompt-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-prompt-dismissed", "1");
  };

  if (!visible || dismissed) return null;

  return (
    <div
      role="banner"
      aria-label="Install Swifter Wallet"
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "calc(100% - 32px)",
        maxWidth: "380px",
        background:
          "linear-gradient(135deg, rgba(30,11,74,0.97) 0%, rgba(20,13,48,0.97) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(124,58,237,0.35)",
        borderRadius: "20px",
        padding: "16px 20px",
        boxShadow:
          "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* App icon */}
      <img
        src="/icons/icon-192x192.png"
        alt="Swifter Wallet"
        width={48}
        height={48}
        style={{ borderRadius: "12px", flexShrink: 0 }}
      />

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            color: "#f0f0f5",
            fontSize: "14px",
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          Install Swifter Wallet
        </p>
        <p
          style={{
            color: "#a1a1aa",
            fontSize: "12px",
            margin: "2px 0 0",
            lineHeight: 1.4,
          }}
        >
          Add to home screen for the best experience
        </p>
      </div>

      {/* Install button */}
      <button
        onClick={handleInstall}
        style={{
          flexShrink: 0,
          background: "linear-gradient(135deg, #a855f7, #7c3aed)",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 600,
          padding: "8px 16px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 12px rgba(124,58,237,0.45)",
        }}
      >
        Install
      </button>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          flexShrink: 0,
          color: "#71717a",
          fontSize: "20px",
          lineHeight: 1,
          padding: "4px",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
}
