"use client";

import React, { useEffect } from "react";

export default function ProcessingAnimation({ color = "violet", onComplete, message }) {
  useEffect(() => {
    if (onComplete) {
      const t = setTimeout(onComplete, 2200);
      return () => clearTimeout(t);
    }
  }, [onComplete]);

  return (
    <div className="processing-screen">
      <div className={`processing-ring processing-${color}`}>
        <div className={`processing-track processing-track-${color}`} />
        <div className={`processing-spinner processing-spinner-${color}`} />
      </div>
      <p className="processing-title">{message || "Processing..."}</p>
      <p className="processing-sub">This will only take a moment</p>
    </div>
  );
}
