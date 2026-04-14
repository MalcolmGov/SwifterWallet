"use client";

import Image from "next/image";
import { ChevronRightSvg, ChevronLeftSvg } from "../src/lib/icons";

export default function SettingsScreen({ app }) {
  const {
    fadeIn,
    navigate,
    dark,
    setDark,
    savedCards,
    biometricEnabled,
    setBiometricEnabled,
    notifEnabled,
    setNotifEnabled,
    notifChannel,
    setToastMsg,
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
          id="settings-back"
        >
          <ChevronLeftSvg />
        </button>
        <h2 className="sub-title">Settings</h2>
        <div style={{ width: "2.5rem" }} />
      </div>

      {/* Profile card */}
      <div className="settings-profile-card">
        <div className="settings-profile-aurora" />
        <div className="avatar-ring" style={{ width: 64, height: 64, padding: 3 }}>
          <Image
            src="/icons/avatar-malcolm.jpg"
            alt="Malcolm"
            width={58}
            height={58}
            className="settings-avatar-img"
          />
          <span className="avatar-online" />
        </div>
        <div className="settings-profile-info">
          <p className="settings-profile-name">Malcolm Govender</p>
          <p className="settings-profile-email">malcolm@swifterwallet.co.za</p>
          <div className="settings-profile-badge">
            <span className="settings-profile-badge-dot" />
            Verified Account
          </div>
        </div>
      </div>

      <div style={{ padding: "0 1.5rem" }}>
        {/* Account */}
        <p className="settings-section-label">Account</p>
        <div className="settings-list">
          {[
            {
              emoji: "💳",
              label: "Payment Methods",
              desc: `${savedCards.length} card${savedCards.length !== 1 ? "s" : ""} saved`,
              action: () => navigate("manageCards"),
            },
            {
              emoji: "📊",
              label: "Statement",
              desc: "Download or share your history",
              action: () => setToastMsg("Statement download coming soon"),
              disabled: true,
            },
            {
              emoji: "🔗",
              label: "Linked Accounts",
              desc: "Manage bank connections",
              action: () => setToastMsg("Bank linking coming soon"),
              disabled: true,
            },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.disabled ? undefined : item.action}
              className={`settings-item ${i > 0 ? "settings-border" : ""}`}
              id={`setting-${item.label.toLowerCase().replace(/ /g, "-")}`}
              style={item.disabled ? { opacity: 0.45, cursor: "default" } : {}}
            >
              <div className="settings-icon">{item.emoji}</div>
              <div className="settings-info">
                <p className="settings-label">
                  {item.label}
                  {item.disabled && (
                    <span
                      style={{
                        fontSize: "0.65rem",
                        marginLeft: "0.5rem",
                        color: "#6b7280",
                        fontWeight: 400,
                      }}
                    >
                      Coming Soon
                    </span>
                  )}
                </p>
                <p className="settings-desc">{item.desc}</p>
              </div>
              {!item.disabled && <ChevronRightSvg />}
            </button>
          ))}
        </div>

        {/* Preferences */}
        <p className="settings-section-label">Preferences</p>
        <div className="settings-list">
          {[
            {
              emoji: dark ? "☀️" : "🌙",
              label: "Appearance",
              desc: dark ? "Currently dark mode" : "Currently light mode",
              action: () => {
                const next = !dark;
                setDark(next);
                localStorage.setItem("swifter_dark", String(next));
                setToastMsg(`Switched to ${next ? "dark" : "light"} mode`);
              },
            },
            {
              emoji: "🌍",
              label: "Currency & Region",
              desc: "ZAR · South Africa",
              action: () => {},
              disabled: true,
            },
            {
              emoji: "🔔",
              label: "Notifications",
              desc: notifEnabled ? `Active via ${notifChannel}` : "Disabled",
              action: () => setNotifEnabled(!notifEnabled),
            },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.disabled ? undefined : item.action}
              className={`settings-item ${i > 0 ? "settings-border" : ""}`}
              style={item.disabled ? { opacity: 0.45, cursor: "default" } : {}}
            >
              <div className="settings-icon">{item.emoji}</div>
              <div className="settings-info">
                <p className="settings-label">
                  {item.label}
                  {item.disabled && (
                    <span
                      style={{
                        fontSize: "0.65rem",
                        marginLeft: "0.5rem",
                        color: "#6b7280",
                        fontWeight: 400,
                      }}
                    >
                      Coming Soon
                    </span>
                  )}
                </p>
                <p className="settings-desc">{item.desc}</p>
              </div>
              {!item.disabled && <ChevronRightSvg />}
            </button>
          ))}
        </div>

        {/* Security */}
        <p className="settings-section-label">Security</p>
        <div className="settings-list">
          {[
            {
              emoji: "🛡️",
              label: "PayGuard™",
              desc: "AI fraud protection · Active",
              accent: "#10b981",
              action: () =>
                setToastMsg("PayGuard is active and protecting your account"),
            },
            {
              emoji: "🗝️",
              label: "Change PIN",
              desc: "Update your security PIN",
              action: () => {},
              disabled: true,
            },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.disabled ? undefined : item.action}
              className={`settings-item ${i > 0 ? "settings-border" : ""}`}
              style={item.disabled ? { opacity: 0.45, cursor: "default" } : {}}
            >
              <div className="settings-icon">{item.emoji}</div>
              <div className="settings-info">
                <p className="settings-label">
                  {item.label}
                  {item.disabled && (
                    <span
                      style={{
                        fontSize: "0.65rem",
                        marginLeft: "0.5rem",
                        color: "#6b7280",
                        fontWeight: 400,
                      }}
                    >
                      Coming Soon
                    </span>
                  )}
                </p>
                <p
                  className="settings-desc"
                  style={item.accent ? { color: item.accent } : {}}
                >
                  {item.desc}
                </p>
              </div>
              {!item.disabled && <ChevronRightSvg />}
            </button>
          ))}
        </div>

        {/* Biometric Security */}
        <div className="smartsendr-card" style={{ marginTop: "1rem" }}>
          <div className="smartsendr-header">
            <span className="smartsendr-logo">🔐 Biometric Security</span>
            <button
              className={`toggle-switch ${biometricEnabled ? "toggle-on" : ""}`}
              onClick={async () => {
                if (!biometricEnabled) {
                  const supported = window.PublicKeyCredential
                    ? await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(
                        () => false
                      )
                    : false;
                  if (!supported) {
                    setToastMsg("Biometrics not supported on this device");
                    return;
                  }
                  setBiometricEnabled(true);
                  localStorage.setItem("bioEnabled", "true");
                } else {
                  setBiometricEnabled(false);
                  localStorage.setItem("bioEnabled", "false");
                }
              }}
            />
          </div>
          <p className="smartsendr-desc">
            Unlock with your face or fingerprint · Faster, safer transactions
          </p>
        </div>
      </div>
    </div>
  );
}
