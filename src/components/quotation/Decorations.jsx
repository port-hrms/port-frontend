import React from "react";

export const TopRightDecor = () => (
  <div style={{ position: "absolute", top: 0, right: 0, width: 170, height: 90, overflow: "hidden", pointerEvents: "none" }}>
    <div style={{
      position: "absolute", top: -25, right: -25,
      width: 220, height: 120,
      background: "linear-gradient(135deg, #1a6fc4 0%, #0d4fa0 60%, #083880 100%)",
      transform: "skewY(-12deg) skewX(-6deg)",
      borderRadius: 4,
    }} />
    <div style={{
      position: "absolute", top: 12, right: 12,
      width: 70, height: 45,
      background: "rgba(255,255,255,0.12)",
      transform: "skewY(-12deg)",
      borderRadius: 2,
    }} />
  </div>
);

export const BottomLeftDecor = () => (
  <div style={{ position: "absolute", bottom: 0, left: 0, width: 210, height: 120, overflow: "hidden", pointerEvents: "none" }}>
    <div style={{
      position: "absolute", bottom: -35, left: -35,
      width: 270, height: 140,
      background: "linear-gradient(315deg, #1a6fc4 0%, #0d4fa0 60%, #083880 100%)",
      transform: "skewY(-12deg) skewX(-6deg)",
      borderRadius: 4,
    }} />
  </div>
);
