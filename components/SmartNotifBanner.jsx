"use client";

import React from "react";

export default function SmartNotifBanner({ notif, onDismiss, onAction }) {
  return (
    <div className="smart-notif-banner" style={{ "--notif-color": notif.color }}>
      <div className="smart-notif-glow" />
      <span className="smart-notif-icon">{notif.icon}</span>
      <div className="smart-notif-text">
        <strong className="smart-notif-title">{notif.title}</strong>
        <span className="smart-notif-body">{notif.body}</span>
      </div>
      <div className="smart-notif-actions">
        <button className="smart-notif-action-btn" onClick={onAction} style={{ color: notif.color }}>
          {notif.action}
        </button>
        <button className="smart-notif-dismiss" onClick={onDismiss}>✕</button>
      </div>
    </div>
  );
}
