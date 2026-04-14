"use client";

import { useState } from "react";
import { ChevronLeftSvg, XSvg } from "../src/lib/icons";

export default function ManageCardsScreen({ app }) {
  const { fadeIn, navigate, savedCards, setSavedCards } = app;
  const [showForm, setShowForm] = useState(false);
  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    holder: "",
  });

  const formatCardNumber = (val) => {
    const v = val.replace(/\s/g, "");
    return v.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val) => {
    const v = val.replace(/\D/g, "");
    if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    return val;
  };

  const detectBrand = (num) => {
    const n = num.replace(/\D/g, "");
    if (/^4/.test(n)) return "Visa";
    if (/^5[1-5]/.test(n)) return "Mastercard";
    if (/^3[47]/.test(n)) return "Amex";
    return "Card";
  };

  const handleSaveCard = () => {
    const num = newCard.number.replace(/\s/g, "");
    if (
      num.length >= 13 &&
      newCard.expiry.length >= 4 &&
      newCard.cvv.length >= 3
    ) {
      const card = {
        id: `card${Date.now()}`,
        brand: detectBrand(newCard.number),
        last4: num.slice(-4),
        expiry: formatExpiry(newCard.expiry),
        holder: newCard.holder || "Cardholder",
        gradient: [
          "linear-gradient(135deg, #1e3a5f, #2563eb)",
          "linear-gradient(135deg, #065f46, #10b981)",
          "linear-gradient(135deg, #7c2d12, #f59e0b)",
          "linear-gradient(135deg, #4338ca, #818cf8)",
        ][savedCards.length % 4],
      };
      setSavedCards((prev) => [...prev, card]);
      setShowForm(false);
      setNewCard({ number: "", expiry: "", cvv: "", holder: "" });
    }
  };

  const removeCard = (id) =>
    setSavedCards((prev) => prev.filter((c) => c.id !== id));

  return (
    <div
      className={`screen-fade ${fadeIn ? "visible" : ""}`}
      style={{ paddingBottom: "6rem" }}
    >
      <div className="sub-header">
        <button
          onClick={() => navigate("settings")}
          className="back-btn"
          id="cards-back"
        >
          <ChevronLeftSvg />
        </button>
        <h2 className="sub-title">Payment Methods</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="back-btn"
          id="add-card-btn"
        >
          {showForm ? <XSvg /> : "+"}
        </button>
      </div>

      <div style={{ padding: "0 1.5rem" }}>
        {/* Saved Cards */}
        {savedCards.length > 0 ? (
          <div className="card-list">
            {savedCards.map((card) => (
              <div key={card.id} className="card-manage-item">
                <div
                  className="card-mini-visual"
                  style={{ background: card.gradient }}
                >
                  <span className="card-mini-brand">{card.brand}</span>
                  <span className="card-mini-dots">•••• {card.last4}</span>
                </div>
                <div className="select-info" style={{ flex: 1 }}>
                  <p className="select-name">
                    {card.brand} •••• {card.last4}
                  </p>
                  <p className="select-sub">
                    {card.holder} · Exp {card.expiry}
                  </p>
                </div>
                <button
                  onClick={() => removeCard(card.id)}
                  className="card-remove-btn"
                  title="Remove card"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ paddingTop: "2rem" }}>
            <span style={{ fontSize: "3rem" }}>💳</span>
            <p>No saved cards yet</p>
            <p style={{ fontSize: "0.8rem" }}>Add a card to make top-ups faster</p>
          </div>
        )}

        {/* Add Card Form */}
        {showForm && (
          <div className="card-form" style={{ marginTop: "1.5rem" }}>
            <h3
              className="section-title"
              style={{ marginBottom: "1rem", fontSize: "1rem" }}
            >
              Add New Card
            </h3>
            <div className="form-field">
              <label className="form-label">Card Number</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                className="form-input"
                value={newCard.number}
                onChange={(e) =>
                  setNewCard({
                    ...newCard,
                    number: formatCardNumber(e.target.value),
                  })
                }
              />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Expiry</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  className="form-input"
                  value={newCard.expiry}
                  onChange={(e) =>
                    setNewCard({
                      ...newCard,
                      expiry: formatExpiry(e.target.value),
                    })
                  }
                />
              </div>
              <div className="form-field">
                <label className="form-label">CVV</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="123"
                  maxLength={4}
                  className="form-input"
                  value={newCard.cvv}
                  onChange={(e) =>
                    setNewCard({
                      ...newCard,
                      cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                    })
                  }
                />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Cardholder Name</label>
              <input
                type="text"
                placeholder="Malcolm Govender"
                className="form-input"
                value={newCard.holder}
                onChange={(e) =>
                  setNewCard({ ...newCard, holder: e.target.value })
                }
              />
            </div>
            <button
              onClick={handleSaveCard}
              disabled={
                newCard.number.replace(/\s/g, "").length < 13 ||
                newCard.expiry.length < 4 ||
                newCard.cvv.length < 3
              }
              className="primary-btn primary-violet"
              id="save-card-btn"
              style={{ marginTop: "0.5rem" }}
            >
              Save Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
