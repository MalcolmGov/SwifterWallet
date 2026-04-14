"use client";

import { ICON_MAP } from "../src/lib/data";
import { formatCurrency, formatTime, groupTransactionsByDate } from "../src/lib/utils";
import { Icon3D, TransactionIcon, ChevronLeftSvg, SearchSvg } from "../src/lib/icons";

export default function HistoryScreen({ app }) {
  const {
    fadeIn,
    slideUp,
    transactions,
    txFilter,
    setTxFilter,
    navigate,
  } = app;

  const filters = ["all", "deposits", "payments", "transfers"];
  const filtered = transactions.filter((tx) => {
    if (txFilter === "all") return true;
    if (txFilter === "deposits") return tx.type === "DEPOSIT";
    if (txFilter === "payments") return tx.type === "PAYMENT";
    if (txFilter === "transfers") return tx.type === "TRANSFER";
    return true;
  });

  const grouped = groupTransactionsByDate(filtered);
  const totalIn = filtered
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div
      className={`screen-fade ${fadeIn ? "visible" : ""}`}
      style={{ paddingBottom: "6rem" }}
    >
      <div className="sub-header">
        <button
          onClick={() => navigate("dashboard")}
          className="back-btn"
          id="history-back"
        >
          <ChevronLeftSvg />
        </button>
        <h2 className="sub-title">Transactions</h2>
        <button className="back-btn" id="history-search">
          <SearchSvg />
        </button>
      </div>

      {/* Monthly summary */}
      <div className={`history-summary ${slideUp ? "slide-visible" : ""}`}>
        <div className="history-summary-item">
          <span className="history-summary-label">Money In</span>
          <span className="history-summary-in">+{formatCurrency(totalIn)}</span>
        </div>
        <div className="history-summary-divider" />
        <div className="history-summary-item">
          <span className="history-summary-label">Money Out</span>
          <span className="history-summary-out">-{formatCurrency(totalOut)}</span>
        </div>
      </div>

      <div className="filter-bar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setTxFilter(f)}
            className={`filter-btn ${txFilter === f ? "filter-active" : ""}`}
            id={`filter-${f}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className={`tx-history ${slideUp ? "slide-visible delay-1" : ""}`}>
        {filtered.length === 0 ? (
          <div className="empty-state-premium">
            <div className="empty-state-icon">
              <Icon3D
                src={ICON_MAP.payment}
                alt="no transactions"
                size={52}
              />
            </div>
            <h3 className="empty-state-title">No transactions yet</h3>
            <p className="empty-state-desc">
              Your transactions will appear here once you start sending or
              receiving money.
            </p>
            <button
              onClick={() => navigate("send")}
              className="primary-btn primary-violet"
              style={{ marginTop: "1.5rem", width: "80%" }}
            >
              Send Money
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([label, txs]) => (
            <div key={label} className="tx-group">
              <div className="tx-group-header">
                <span className="tx-group-label">{label}</span>
                <span className="tx-group-count">
                  {txs.length} transaction{txs.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="tx-list">
                {txs.map((tx, i) => (
                  <div
                    key={tx.id}
                    className={`tx-row ${i > 0 ? "tx-row-border" : ""}`}
                  >
                    <TransactionIcon type={tx.icon} />
                    <div className="tx-info">
                      <p className="tx-desc">{tx.description}</p>
                      <p className="tx-time">{formatTime(tx.date)}</p>
                    </div>
                    <div className="tx-right">
                      <p
                        className={`tx-amount ${
                          tx.amount > 0 ? "tx-positive" : "tx-negative"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </p>
                      <p className="tx-type">{tx.type.toLowerCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
