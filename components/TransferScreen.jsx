"use client";

import { ICON_MAP } from "../src/lib/data";
import { formatCurrency } from "../src/lib/utils";
import {
  Icon3D,
  ChevronLeftSvg,
  ChevronRightSvg,
  XSvg,
  CheckSvg,
} from "../src/lib/icons";
import Numpad from "./Numpad";
import ProcessingAnimation from "./ProcessingAnimation";

export default function TransferScreen({ app }) {
  const {
    fadeIn,
    slideUp,
    transferStep,
    setTransferStep,
    transferFrom,
    setTransferFrom,
    transferTo,
    setTransferTo,
    transferAmount,
    setTransferAmount,
    wallets,
    navigate,
    updateWalletBalance,
    addTransaction,
  } = app;

  const numpad = (setter, value) => (
    <Numpad value={value} onChange={setter} />
  );

  const handleTransferComplete = () => {
    if (transferAmount && transferFrom && transferTo) {
      const amt = parseFloat(transferAmount);
      updateWalletBalance(transferFrom.id, -amt);
      updateWalletBalance(transferTo.id, amt);
      addTransaction({
        id: `t-transfer-${Date.now()}`,
        description: `Transferred to ${transferTo.name}`,
        amount: -amt,
        type: "TRANSFER",
        category: "transfer",
        date: new Date().toISOString(),
        walletId: transferFrom.id,
        icon: "transfer",
      });
    }
  };

  return (
    <div
      className={`screen-fade ${fadeIn ? "visible" : ""}`}
      style={{ paddingBottom: "2rem" }}
    >
      <div className="sub-header">
        <button
          onClick={() =>
            transferStep > 0
              ? setTransferStep(transferStep - 1)
              : navigate("dashboard")
          }
          className="back-btn"
        >
          <ChevronLeftSvg />
        </button>
        <h2 className="sub-title">
          {transferStep === 0
            ? "Transfer From"
            : transferStep === 1
            ? "Transfer To"
            : transferStep === 2
            ? "Amount"
            : ""}
        </h2>
        <button onClick={() => navigate("dashboard")} className="back-btn">
          <XSvg />
        </button>
      </div>

      {transferStep < 3 && (
        <div className="progress-bar">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`progress-step ${s <= transferStep ? "progress-active" : ""}`}
            />
          ))}
        </div>
      )}

      {/* Step 0: Select source wallet */}
      {transferStep === 0 && (
        <div className={`step-content ${slideUp ? "slide-visible" : ""}`}>
          <p className="step-hint">Choose which wallet to transfer from</p>
          <div className="select-list">
            {wallets.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  setTransferFrom(w);
                  setTransferStep(1);
                }}
                className={`select-item ${
                  transferFrom?.id === w.id ? "select-active" : ""
                }`}
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

      {/* Step 1: Select destination wallet */}
      {transferStep === 1 && (
        <div className={`step-content ${slideUp ? "slide-visible" : ""}`}>
          <p className="step-hint">Choose destination wallet</p>
          <div className="select-list">
            {wallets
              .filter((w) => w.id !== transferFrom?.id)
              .map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setTransferTo(w);
                    setTransferStep(2);
                  }}
                  className="select-item"
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

      {/* Step 2: Enter amount */}
      {transferStep === 2 && (
        <div className={`step-content ${slideUp ? "slide-visible" : ""}`}>
          <div className="amount-recipient">
            <div
              className="select-icon"
              style={{
                background: transferFrom?.gradient,
                borderRadius: "0.75rem",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon3D src={ICON_MAP.wallet} alt="wallet" size={24} />
            </div>
            <div>
              <p className="amount-to">
                {transferFrom?.name} → <strong>{transferTo?.name}</strong>
              </p>
            </div>
          </div>
          <div className="amount-display">
            <span className="amount-currency">R</span>
            <span
              className={`amount-value ${
                transferAmount &&
                Number(transferAmount) > (transferFrom?.balance || 0)
                  ? "amount-over"
                  : ""
              }`}
            >
              {transferAmount || "0"}
            </span>
          </div>
          <p className="amount-available">
            Available: <strong>{formatCurrency(transferFrom?.balance || 0)}</strong>
            {transferAmount &&
              Number(transferAmount) > (transferFrom?.balance || 0) && (
                <span className="amount-warning"> · Insufficient funds</span>
              )}
          </p>
          <div className="quick-amounts">
            {[100, 500, 1000, 2500].map((q) => (
              <button
                key={q}
                onClick={() => setTransferAmount(String(q))}
                className={`quick-amount-btn ${
                  transferAmount === String(q) ? "quick-amount-active" : ""
                }`}
              >
                R{q}
              </button>
            ))}
          </div>
          {numpad(setTransferAmount, transferAmount)}
          <div style={{ padding: "0 1.5rem", marginTop: "1.25rem" }}>
            <button
              onClick={() => {
                if (
                  transferAmount &&
                  Number(transferAmount) > 0 &&
                  Number(transferAmount) <= (transferFrom?.balance || 0)
                ) {
                  setTransferStep(3);
                  handleTransferComplete();
                  setTimeout(() => setTransferStep(4), 2000);
                }
              }}
              disabled={
                !transferAmount ||
                Number(transferAmount) <= 0 ||
                Number(transferAmount) > (transferFrom?.balance || 0)
              }
              className="primary-btn primary-violet"
            >
              Transfer
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {transferStep === 3 && <ProcessingAnimation color="violet" />}

      {/* Step 4: Success */}
      {transferStep === 4 && (
        <div className={`success-screen ${fadeIn ? "visible" : ""}`}>
          <div className="success-ring">
            <div className="success-circle">
              <CheckSvg />
            </div>
          </div>
          <h2 className="success-title">Transferred!</h2>
          <p className="success-amount">R{Number(transferAmount).toFixed(2)}</p>
          <p className="success-sub">
            {transferFrom?.name} → {transferTo?.name}
          </p>
          <button
            onClick={() => navigate("dashboard")}
            className="primary-btn primary-violet"
            style={{ marginTop: "2.5rem", width: "100%" }}
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
