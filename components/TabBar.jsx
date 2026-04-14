"use client";

import Image from "next/image";
import { RewardsNavIcon } from "../src/lib/icons";

export default function TabBar({ app }) {
  const { screen, navigate, menuOpen, setMenuOpen } = app;

  const tabs = [
    {
      id: "dashboard",
      icon: "/icons/nav-home.png",
      label: "Home",
      glow: "#06b6d4",
    },
    {
      id: "wallets",
      icon: "/icons/nav-wallets.png",
      label: "Wallets",
      glow: "#f59e0b",
    },
    {
      id: "rewards",
      svgIcon: <RewardsNavIcon active={screen === "rewards"} />,
      label: "Rewards",
      glow: "#c4b5fd",
    },
    {
      id: "history",
      icon: "/icons/nav-history.png",
      label: "History",
      glow: "#10b981",
    },
    {
      id: "settings",
      icon: "/icons/nav-settings.png",
      label: "Settings",
      glow: "#ec4899",
    },
  ];

  const angles = [-160, -125, -90, -55, -20];
  const radius = 140;

  return (
    <>
      {/* Frosted backdrop */}
      <div
        className={`radial-backdrop ${menuOpen ? "radial-backdrop-open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      <div
        className={`radial-nav ${menuOpen ? "radial-nav-open" : ""}`}
        id="main-tab-bar"
      >
        {/* Ambient base glow */}
        <div
          className={`radial-ambient ${menuOpen ? "radial-ambient-open" : ""}`}
        />

        {tabs.map((tab, i) => {
          const active = screen === tab.id;
          const rad = (angles[i] * Math.PI) / 180;
          const x = menuOpen ? Math.cos(rad) * radius : 0;
          const y = menuOpen ? Math.sin(rad) * radius : 0;
          const z = menuOpen ? 20 + i * 5 : 0;

          return (
            <div
              key={tab.id}
              className={`radial-item ${menuOpen ? "radial-item-open" : ""} ${
                active ? "radial-item-active" : ""
              }`}
              style={{
                transform: `translate3d(${x}px, ${y}px, ${z}px) scale(${
                  menuOpen ? 1 : 0.2
                })`,
                transitionDelay: menuOpen
                  ? `${80 + i * 60}ms`
                  : `${(4 - i) * 45}ms`,
                "--item-glow": tab.glow,
              }}
            >
              <div className="radial-item-glow" />
              <button
                onClick={() => {
                  navigate(tab.id);
                  setMenuOpen(false);
                }}
                className="radial-item-btn"
                id={`tab-${tab.id}`}
              >
                {tab.icon ? (
                  <Image
                    src={tab.icon}
                    alt={tab.label}
                    width={40}
                    height={40}
                    className="radial-item-icon"
                  />
                ) : (
                  <div className="radial-item-svg-icon">{tab.svgIcon}</div>
                )}
              </button>
              <span
                className={`radial-item-label ${
                  menuOpen ? "radial-label-show" : ""
                }`}
              >
                {tab.label}
              </span>
            </div>
          );
        })}

        {/* Center Orb — primary action */}
        <button
          className={`radial-orb ${menuOpen ? "radial-orb-open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          id="radial-menu-btn"
        >
          <div className="radial-orb-shadow" />
          <div className="radial-orb-ring" />
          <div className="radial-orb-ring radial-orb-ring-2" />
          <div className="radial-orb-ring radial-orb-ring-3" />
          <div className="radial-orb-core">
            <div className="radial-orb-sheen" />
            <div className="radial-orb-highlight" />
            <span className="radial-orb-text">{menuOpen ? "✕" : "Menu"}</span>
          </div>
        </button>
      </div>
    </>
  );
}
