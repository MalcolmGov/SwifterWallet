"use client";

import React from "react";
import { XSvg } from "../src/lib/icons";

export default function Numpad({ value, onChange }) {
  return (
    <div className="numpad-grid">
      {[1,2,3,4,5,6,7,8,9,".",0,"del"].map((k) => (
        <button key={k} onClick={() => {
          if (k === "del") onChange(value.slice(0, -1));
          else if (k === "." && value.includes(".")) return;
          else onChange(value + k);
        }} className={`numpad-key ${k === "del" ? "numpad-del" : ""}`}>
          {k === "del" ? <XSvg /> : k}
        </button>
      ))}
    </div>
  );
}
