import { ImageResponse } from "next/og";
export const alt =
  "Shiva Sai Thota | Software Engineer — Full-stack SaaS, Agentic AI, Web3";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#0c1020",
        color: "#f5f5fa",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 90,
      }}
    >
      <div style={{ color: "#a78bfa", fontSize: 24, letterSpacing: 5 }}>
        SOFTWARE ENGINEER
      </div>
      <div style={{ fontSize: 88, fontWeight: 700, marginTop: 20 }}>
        Shiva Sai Thota.
      </div>
      <div style={{ fontSize: 30, color: "#a5acc0", marginTop: 25 }}>
        Full-stack SaaS · Agentic AI · Web3
      </div>
      <div style={{ fontSize: 22, color: "#a5acc0", marginTop: 45 }}>
        Hyderabad, India
      </div>
    </div>,
    size,
  );
}
