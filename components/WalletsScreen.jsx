"use client";

import { ICON_MAP } from "../src/lib/data";
import { formatCurrency } from "../src/lib/utils";
import { Icon3D, ChevronRightSvg, ChevronLeftSvg } from "../src/lib/icons";

export default function WalletsScreen({ app }) {
  const {
    wallets,
    balanceVisible,
    navigate,
    slideUp,
    fadeIn,
    setSendWallet,
  } = app;

  return (
    <div
      className={`screen-fade ${fadeIn ? "visible" : ""}`}
      style={{ paddingBottom: "6rem" }}
    >
      <div className="sub-header">
        <button
          onClick={() => navigate("dashboard")}
          className="back-btn"
          id="wallets-back"
        >
          <ChevronLeftSvg />
        </button>
        <h2 className="sub-title">My Wallets</h2>
        <button className="back-btn" id="add-wallet-btn">
          +
        </button>
      </div>
      <div className={`wallet-list ${slideUp ? "slide-visible delay-1" : ""}`}>
        {wallets.map((w, i) => (
          <div
            key={w.id}
            className="wallet-full-card"
            style={{
              background: w.gradient,
              transitionDelay: `${i * 80}ms`,
            }}
          >
            <div className="wallet-full-orb-1" />
            <div className="wallet-full-orb-2" />
            <div className="wallet-full-content">
              <div className="wallet-full-top">
                <div className="wallet-full-badge">
                  <Icon3D src={ICON_MAP.wallet} alt="wallet" size={28} />
                  <span>{w.type}</span>
                </div>
                <ChevronRightSvg />
              </div>
              <h3 className="wallet-full-name">{w.name}</h3>
              <p className="wallet-full-balance">
                {balanceVisible ? formatCurrency(w.balance) : "R•••••••"}
              </p>
              <div className="wallet-full-actions">
                <button
                  onClick={() => {
                    setSendWallet(w);
                    navigate("send");
                  }}
                  className="wallet-action-btn wallet-action-ghost"
                >
                  Send
                </button>
                <button
                  onClick={() => navigate("addFunds")}
                  className="wallet-action-btn wallet-action-solid"
                >
                  Add Funds
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
