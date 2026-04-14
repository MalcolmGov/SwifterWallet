"use client";

import { CONTACTS, ICON_MAP } from "../src/lib/data";
import { formatCurrency } from "../src/lib/utils";
import {
  Icon3D,
  ChevronLeftSvg,
  ChevronRightSvg,
  XSvg,
  SearchSvg,
} from "../src/lib/icons";
import Numpad from "./Numpad";
import SendConfirmation from "./SendConfirmation";

export default function SendScreen({ app }) {
  const {
    fadeIn,
    slideUp,
    sendStep,
    setSendStep,
    sendWallet,
    setSendWallet,
    sendRecipient,
    setSendRecipient,
    sendAmount,
    setSendAmount,
    wallets,
    navigate,
    biometricEnabled,
    biometricRegistered,
    txThreshold,
    updateWalletBalance,
    addTransaction,
    setNotifications,
    txCountRef,
    setShowFeedback,
  } = app;

  const numpad = (setter, value) => (
    <Numpad value={value} onChange={setter} />
  );

  return (
    <div
      className={`screen-fade ${fadeIn ? "visible" : ""}`}
      style={{ paddingBottom: "2rem" }}
    >
      <div className="sub-header">
        <button
          onClick={() =>
            sendStep > 0 ? setSendStep(sendStep - 1) : navigate("dashboard")
          }
          className="back-btn"
          id="send-back"
        >
          <ChevronLeftSvg />
        </button>
        <h2 className="sub-title">
          {sendStep === 0
            ? "Select Wallet"
            : sendStep === 1
            ? "Select Recipient"
            : sendStep === 2
            ? "Enter Amount"
            : "Confirm"}
        </h2>
        <button
          onClick={() => navigate("dashboard")}
          className="back-btn"
          id="send-close"
        >
          <XSvg />
        </button>
      </div>

      {/* Progress steps */}
      <div className="progress-bar">
        {[0, 1, 2, 3].map((s) => (
          <div
            key={s}
            className={`progress-step ${s <= sendStep ? "progress-active" : ""}`}
          />
        ))}
      </div>

      {/* Step 0: Select Wallet */}
      {sendStep === 0 && (
        <div className={`step-content ${slideUp ? "slide-visible" : ""}`}>
          <p className="step-hint">Choose which wallet to send from</p>
          <div className="select-list">
            {wallets.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  setSendWallet(w);
                  setSendStep(1);
                }}
                className={`select-item ${
                  sendWallet.id === w.id ? "select-active" : ""
                }`}
                id={`send-wallet-${w.id}`}
              >
                <div className="select-icon" style={{ background: w.gradient }}>
                  <Icon3D src={ICON_MAP.wallet} alt="wallet" size={28} />
                </div>
                <div className="select-info">
                  <p className="select-name">{w.name}</p>
                  <p className="select-sub">{formatCurrency(w.balance)}</p>
                </div>
                <ChevronRightSvg />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Select Recipient */}
      {sendStep === 1 && (
        <div className={`step-content ${slideUp ? "slide-visible" : ""}`}>
          <div className="search-bar">
            <SearchSvg />
            <input
              placeholder="Search name or email"
              className="search-input"
              id="recipient-search"
            />
          </div>
          <p className="step-label">RECENT</p>
          <div className="select-list">
            {CONTACTS.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSendRecipient(c);
                  setSendStep(2);
                }}
                className="select-item"
                id={`contact-${c.id}`}
              >
                <div className="avatar" style={{ background: c.gradient }}>
                  {c.avatar}
                </div>
                <div className="select-info">
                  <p className="select-name">{c.name}</p>
                  <p className="select-sub">{c.phone || "Recent"}</p>
                </div>
                <ChevronRightSvg />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Enter Amount */}
      {sendStep === 2 && (
        <div className={`step-content ${slideUp ? "slide-visible" : ""}`}>
          <div className="amount-recipient">
            <div
              className="avatar avatar-lg"
              style={{ background: sendRecipient?.gradient }}
            >
              {sendRecipient?.avatar}
            </div>
            <div>
              <p className="amount-to">
                Sending to <strong>{sendRecipient?.name}</strong>
              </p>
              {sendRecipient?.phone && (
                <p className="amount-phone">{sendRecipient.phone}</p>
              )}
            </div>
          </div>
          <div className="amount-display">
            <span className="amount-currency">R</span>
            <span
              className={`amount-value ${
                sendAmount && Number(sendAmount) > sendWallet.balance
                  ? "amount-over"
                  : ""
              }`}
            >
              {sendAmount || "0"}
            </span>
          </div>
          <p className="amount-available">
            Available: <strong>{formatCurrency(sendWallet.balance)}</strong>
            {sendAmount && Number(sendAmount) > sendWallet.balance && (
              <span className="amount-warning"> · Insufficient funds</span>
            )}
          </p>
          <div className="quick-amounts">
            {[50, 100, 250, 500].map((q) => (
              <button
                key={q}
                onClick={() => setSendAmount(String(q))}
                className={`quick-amount-btn ${
                  sendAmount === String(q) ? "quick-amount-active" : ""
                }`}
              >
                R{q}
              </button>
            ))}
          </div>
          {numpad(setSendAmount, sendAmount)}
          <div style={{ padding: "0 1.5rem", marginTop: "1.25rem" }}>
            <button
              onClick={() =>
                sendAmount &&
                Number(sendAmount) > 0 &&
                Number(sendAmount) <= sendWallet.balance &&
                setSendStep(3)
              }
              disabled={
                !sendAmount ||
                Number(sendAmount) <= 0 ||
                Number(sendAmount) > sendWallet.balance
              }
              className="primary-btn primary-violet"
              id="send-continue"
            >
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
          navigate={navigate}
          biometricEnabled={biometricEnabled}
          biometricRegistered={biometricRegistered}
          txThreshold={txThreshold}
          onTransactionComplete={() => {
            const amt = parseFloat(sendAmount);
            updateWalletBalance(sendWallet.id, -amt);
            addTransaction({
              id: `t-send-${Date.now()}`,
              description: `Sent to ${sendRecipient?.name}`,
              amount: -amt,
              type: "PAYMENT",
              category: "transfer",
              date: new Date().toISOString(),
              walletId: sendWallet.id,
              icon: "transfer",
            });
            setNotifications((prev) => [
              {
                id: `n-${Date.now()}`,
                icon: "💸",
                title: "Payment sent",
                body: `R${amt.toFixed(2)} sent to ${sendRecipient?.name}`,
                time: "Just now",
                read: false,
                color: "#7c3aed",
              },
              ...prev,
            ]);
            txCountRef.current += 1;
            if (txCountRef.current % 2 === 0) {
              setTimeout(() => setShowFeedback(true), 1600);
            }
          }}
        />
      )}
    </div>
  );
}
