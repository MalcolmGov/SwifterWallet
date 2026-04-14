"use client";

import { XSvg } from "../src/lib/icons";

export default function NotificationCenter({ notifications, onClose, onMarkAllRead, onDismiss }) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notif-panel-header">
          <h3 className="notif-panel-title">Notifications</h3>
          <div className="notif-panel-actions">
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={onMarkAllRead}>
                Mark all read
              </button>
            )}
            <button className="voice-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="notif-list">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notif-item ${notif.read ? "notif-read" : "notif-unread"}`}
              onClick={() => {
                // Mark as read when clicked
                if (!notif.read) {
                  onDismiss(notif.id);
                }
              }}
            >
              <div className={`notif-icon-wrap notif-icon-${notif.type}`}>{notif.icon}</div>
              <div className="notif-content">
                <p className="notif-title">{notif.title}</p>
                <p className="notif-body">{notif.body}</p>
                <p className="notif-time">{notif.time}</p>
              </div>
              {!notif.read && <span className="notif-unread-dot" />}
              <button
                className="notif-dismiss-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(notif.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="notif-empty">
              <span className="notif-empty-icon">🔔</span>
              <p>All caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
