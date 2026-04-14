"use client";

import { formatCurrency } from "../src/lib/utils";
import {
  ChevronLeftSvg,
  ChevronRightSvg,
  XSvg,
} from "../src/lib/icons";
import Numpad from "./Numpad";
import ProcessingAnimation from "./ProcessingAnimation";
import { CheckSvg } from "../src/lib/icons";

export default function AddFundsScreen({ app }) {
  const {
    fadeIn,
    slideUp,
    addFundsStep,
    setAddFundsStep,
    addFundsAmount,
    setAddFundsAmount,
    navigate,
    savedCards,
    selectedCard,
    setSelectedCard,
    cardForm,
    setCardForm,
    handleYocoCheckout,
    yocoLoading,
    yocoError,
    setSavedCards,
    updateWalletBalance,
    addTransaction,
    setNotifications,
    handleFundsBack,
  } = app;

  const numpad = (setter, value) => (
    <Numpad value={value} onChange={setter} />
  );

  const stepTitles = ["", "Payment Method", "Card Details", "", ""];

  const handleAddNewCardAndPay = async () => {
    const num = cardForm.number.replace(/\s/g, "");
    if (num.length >= 13 && cardForm.expiry.length >= 4 && cardForm.cvv.length >= 3) {
      const newCard = {
        id: `card${Date.now()}`,
        brand: detectBrand(cardForm.number),
        last4: num.slice(-4),
        expiry: formatExpiry(cardForm.expiry),
        holder: cardForm.holder || "Cardholder",
        gradient: "linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)",
      };
      const saveCheckbox = document.getElementById("save-card");
      if (saveCheckbox && saveCheckbox.checked) {
        setSavedCards((prev) => [...prev, newCard]);
      }
      setSelectedCard(newCard);
      await handleYocoCheckout();
    }
  };

  const detectBrand = (num) => {
    const n = num.replace(/\D/g, "");
    if (/^4/.test(n)) return "Visa";
    if (/^5[1-5]/.test(n)) return "Mastercard";
    if (/^3[47]/.test(n)) return "Amex";
    return "Card";
  };

  const formatExpiry = (exp) => {
    const e = exp.replace(/\D/g, "");
    if (e.length >= 4) return `${e.slice(0, 2)}/${e.slice(2, 4)}`;
    return exp;
  };

  return (
    <div
      className={`screen-fade ${fadeIn ? "visible" : ""}`}
      style={{ paddingBottom: "2rem" }}
    >
      <div className="sub-header">
        <button
          onClick={handleFundsBack}
          className="back-btn"
          id="funds-back"
        >
          <ChevronLeftSvg />
        </button>
        <h2 className="sub-title">
          {addFundsStep <= 2
            ? addFundsStep === 0
              ? "Add Funds"
              : stepTitles[addFundsStep]
            : ""}
        </h2>
        <button
          onClick={() => navigate("dashboard")}
          className="back-btn"
          id="funds-close"
        >
          <XSvg />
        </button>
      </div>

      {/* Progress */}
      {addFundsStep < 3 && (
        <div className="progress-bar">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`progress-step ${s <= addFundsStep ? "progress-active" : ""}`}
            />
          ))}
        </div>
      )}

      {/* Step 0: Enter Amount */}
      {addFundsStep === 0 && (
        <div className={`step-content ${slideUp ? "slide-visible" : ""}`}>
          <div className="amount-display" style={{ marginTop: "1rem" }}>
            <span className="amount-currency">R</span>
            <span className="amount-value">{addFundsAmount || "0"}</span>
          </div>
          <div className="quick-amounts">
            {[100, 250, 500, 1000].map((q) => (
              <button
                key={q}
                onClick={() => setAddFundsAmount(String(q))}
                className="quick-amount-btn"
              >
                R{q}
              </button>
            ))}
          </div>
          {numpad(setAddFundsAmount, addFundsAmount)}
          <div style={{ padding: "0 1.5rem", marginTop: "1.25rem" }}>
            <button
              onClick={() =>
                addFundsAmount &&
                Number(addFundsAmount) > 0 &&
                setAddFundsStep(1)
              }
              disabled={!addFundsAmount || Number(addFundsAmount) <= 0}
              className="primary-btn primary-emerald"
              id="funds-continue"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Select Payment Method */}
      {addFundsStep === 1 && (
        <div
          className={`step-content ${slideUp ? "slide-visible" : ""}`}
          style={{ padding: "0 1.5rem" }}
        >
          <p className="step-hint" style={{ padding: 0, marginBottom: "1rem" }}>
            Top up R{Number(addFundsAmount).toFixed(2)}
          </p>

          <button
            onClick={handleYocoCheckout}
            disabled={yocoLoading}
            className="yoco-pay-btn"
            id="pay-with-yoco"
          >
            <div className="yoco-pay-left">
              <div className="yoco-pay-icon">💳</div>
              <div>
                <p className="yoco-pay-title">
                  {yocoLoading ? "Redirecting..." : "Pay with Card"}
                </p>
                <p className="yoco-pay-sub">Secure checkout via Yoco</p>
              </div>
            </div>
            <div className="yoco-pay-amount">
              R{Number(addFundsAmount).toFixed(2)}
            </div>
          </button>

          {yocoError && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "0.85rem",
                textAlign: "center",
                marginTop: "0.75rem",
              }}
            >
              {yocoError}
            </p>
          )}

          {yocoLoading && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
              <div className="spinner-ring" />
            </div>
          )}

          <div className="divider-or">
            <span className="divider-line" />
            <span className="divider-text">or use a saved card</span>
            <span className="divider-line" />
          </div>

          {savedCards.length > 0 && (
            <>
              <p className="step-label" style={{ padding: 0 }}>
                SAVED CARDS
              </p>
              <div className="card-list">
                {savedCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => {
                      setSelectedCard(card);
                      handleYocoCheckout();
                    }}
                    className="card-select-item"
                    id={`pay-card-${card.id}`}
                  >
                    <div
                      className="card-mini-visual"
                      style={{ background: card.gradient }}
                    >
                      <span className="card-mini-brand">{card.brand}</span>
                      <span className="card-mini-dots">•••• {card.last4}</span>
                    </div>
                    <div className="select-info">
                      <p className="select-name">
                        {card.brand} •••• {card.last4}
                      </p>
                      <p className="select-sub">Expires {card.expiry}</p>
                    </div>
                    <ChevronRightSvg />
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            onClick={() => setAddFundsStep(2)}
            className="manual-card-btn"
            id="manual-card-entry"
            style={{ marginTop: "0.75rem" }}
          >
            <div className="manual-card-icon">✏️</div>
            <div className="select-info">
              <p className="select-name">Add new card</p>
              <p className="select-sub">Enter card details manually</p>
            </div>
            <ChevronRightSvg />
          </button>
        </div>
      )}

      {/* Step 2: Manual Card Entry */}
      {addFundsStep === 2 && (
        <div
          className={`step-content ${slideUp ? "slide-visible" : ""}`}
          style={{ padding: "0 1.5rem" }}
        >
          <div className="form-group">
            <label className="form-label">Cardholder Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={cardForm.holder}
              onChange={(e) =>
                setCardForm({ ...cardForm, holder: e.target.value })
              }
              className="form-input"
              id="card-holder"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardForm.number}
              onChange={(e) =>
                setCardForm({ ...cardForm, number: e.target.value })
              }
              className="form-input"
              id="card-number"
              maxLength="19"
            />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Expiry</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={cardForm.expiry}
                onChange={(e) =>
                  setCardForm({ ...cardForm, expiry: e.target.value })
                }
                className="form-input"
                id="card-expiry"
                maxLength="5"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">CVV</label>
              <input
                type="text"
                placeholder="123"
                value={cardForm.cvv}
                onChange={(e) =>
                  setCardForm({ ...cardForm, cvv: e.target.value })
                }
                className="form-input"
                id="card-cvv"
                maxLength="4"
              />
            </div>
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              id="save-card"
              defaultChecked
              className="checkbox-input"
            />
            <span className="checkbox-text">Save this card for future use</span>
          </label>
          <button
            onClick={handleAddNewCardAndPay}
            disabled={yocoLoading}
            className="primary-btn primary-emerald"
            id="card-pay"
            style={{ marginTop: "1rem" }}
          >
            {yocoLoading ? "Processing..." : `Pay R${Number(addFundsAmount).toFixed(2)}`}
          </button>
        </div>
      )}

      {/* Step 3: Processing */}
      {addFundsStep === 3 && (
        <ProcessingAnimation
          title="Processing Payment"
          subtitle={`R${Number(addFundsAmount).toFixed(2)}`}
        />
      )}

      {/* Step 4: Success */}
      {addFundsStep === 4 && (
        <div className={`step-content ${slideUp ? "slide-visible" : ""}`}>
          <div style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}>
            <div className="success-circle">
              <CheckSvg />
            </div>
          </div>
          <h3 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
            Funds Added!
          </h3>
          <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "2rem" }}>
            R{Number(addFundsAmount).toFixed(2)} has been credited to your Main
            Wallet
          </p>
          <button
            onClick={() => navigate("dashboard")}
            className="primary-btn primary-emerald"
            id="funds-done"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
